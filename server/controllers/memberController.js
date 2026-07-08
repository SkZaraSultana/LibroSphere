const Member = require('../models/Member')
const { buildOwnerFilter, findOwnedRecord } = require('../utils/ownership')

exports.getAll = async (req, res, next) => {
  try {
    const { q, status, page = 1, limit = 10 } = req.query
    const filter = buildOwnerFilter(req)

    if (q) {
      filter.$or = [
        { fullName: { $regex: q, $options: 'i' } },
        { email: { $regex: q, $options: 'i' } },
        { phone: { $regex: q, $options: 'i' } },
        { membershipId: { $regex: q, $options: 'i' } },
      ]
    }

    if (status) {
      filter.status = status
    }

    const pageNumber = Math.max(Number(page) || 1, 1)
    const pageSize = Math.min(Math.max(Number(limit) || 10, 1), 100)
    const skip = (pageNumber - 1) * pageSize

    const [totalCount, membersDocs] = await Promise.all([
      Member.countDocuments(filter),
      Member.find(filter).sort({ createdAt: -1 }).skip(skip).limit(pageSize).lean(),
    ])

    // Attach loan metrics per member: currentBorrowedBooks (titles, max 3), currentBorrowedCount, totalBorrowedCount, overdueCount
    const memberIds = membersDocs.map((m) => m._id)
    let loanMap = {}
    if (memberIds.length > 0) {
      const now = new Date()
      const Loan = require('../models/Loan')
      const loansAgg = await Loan.aggregate([
        { $match: { owner: req.user._id, member: { $in: memberIds } } },
        { $lookup: { from: 'books', localField: 'book', foreignField: '_id', as: 'bookDoc' } },
        { $unwind: { path: '$bookDoc', preserveNullAndEmptyArrays: true } },
        { $group: {
          _id: '$member',
          totalBorrowedCount: { $sum: 1 },
          currentBorrowedCount: { $sum: { $cond: [{ $eq: ['$returnedAt', null] }, 1, 0] } },
          overdueCount: { $sum: { $cond: [{ $and: [{ $eq: ['$returnedAt', null] }, { $lt: ['$dueAt', now] }] }, 1, 0] } },
          currentBooks: { $push: { borrowedAt: '$borrowedAt', title: '$bookDoc.title', returnedAt: '$returnedAt' } },
        } },
      ])

      loanMap = loansAgg.reduce((acc, item) => {
        const activeTitles = (Array.isArray(item.currentBooks) ? item.currentBooks.filter((c) => c.returnedAt == null) : [])
          .sort((a, b) => new Date(b.borrowedAt) - new Date(a.borrowedAt))
          .map((c) => c.title)
        acc[item._id.toString()] = {
          totalBorrowedCount: item.totalBorrowedCount || 0,
          currentBorrowedCount: item.currentBorrowedCount || 0,
          overdueCount: item.overdueCount || 0,
          currentBorrowedBooks: activeTitles.slice(0, 3),
          currentBorrowedMore: Math.max(0, activeTitles.length - 3),
        }
        return acc
      }, {})
    }

    const members = membersDocs.map((m) => {
      const metrics = loanMap[m._id?.toString()] || { totalBorrowedCount: 0, currentBorrowedCount: 0, overdueCount: 0, currentBorrowedBooks: [], currentBorrowedMore: 0 }
      return {
        ...m,
        totalBorrowedCount: metrics.totalBorrowedCount,
        currentBorrowedCount: metrics.currentBorrowedCount,
        overdueCount: metrics.overdueCount,
        currentBorrowedBooks: metrics.currentBorrowedBooks,
        currentBorrowedMore: metrics.currentBorrowedMore,
      }
    })

    // compute outstanding fine per member by summing returned fines and active calculated fines
    try {
      const LibrarySettings = require('../models/LibrarySettings')
      const settings = await LibrarySettings.findOne({ owner: req.user._id }).lean()
      const finePerDay = settings?.finePerDay ?? 5
      const autoFine = settings?.autoFine ?? true

      if (memberIds.length > 0) {
        const loans = await Loan.find({ owner: req.user._id, member: { $in: memberIds } }).lean()
        const fineMap = {}
        const now = new Date()
        for (const l of loans) {
          let f = 0
          if (l.returnedAt) {
            f = l.fine || 0
          } else if (autoFine && l.dueAt) {
            const due = new Date(l.dueAt)
            if (now > due) {
              const diffDays = Math.ceil((now - due) / (1000 * 60 * 60 * 24))
              f = diffDays * finePerDay
            }
          }
          fineMap[l.member?.toString()] = (fineMap[l.member?.toString()] || 0) + f
        }

        // attach outstandingFine to members
        for (let i = 0; i < members.length; i++) {
          const id = members[i]._id?.toString()
          members[i].outstandingFine = fineMap[id] || 0
        }
      }
    } catch (e) {
      console.error('Failed computing outstanding fines', e)
    }

    res.json({ data: members, page: pageNumber, limit: pageSize, totalCount, totalPages: Math.ceil(totalCount / pageSize) })
  } catch (err) {
    next(err)
  }
}

exports.getOne = async (req, res, next) => {
  try {
    const ownership = await findOwnedRecord(Member, req.params.id, req)
    if (!ownership.record) {
      if (ownership.forbidden) return res.status(403).json({ message: 'Forbidden' })
      return res.status(404).json({ message: 'Member not found' })
    }
    res.json(ownership.record)
  } catch (err) {
    next(err)
  }
}

exports.create = async (req, res, next) => {
  try {
    const { fullName, email, phone, membershipId, status, address, notes } = req.body
    if (!fullName || !fullName.trim()) return res.status(400).json({ message: 'Full name is required' })
    if (!email || !email.trim()) return res.status(400).json({ message: 'Email is required' })
    if (!membershipId || !membershipId.trim()) return res.status(400).json({ message: 'Membership ID is required' })

    const existsEmail = await Member.findOne({ owner: req.user._id, email: email.trim().toLowerCase() })
    if (existsEmail) return res.status(400).json({ message: 'Email already exists' })

    const existsMembership = await Member.findOne({ owner: req.user._id, membershipId: membershipId.trim() })
    if (existsMembership) return res.status(400).json({ message: 'Membership ID already exists' })

    const member = new Member({
      owner: req.user._id,
      fullName: fullName.trim(),
      email: email.trim().toLowerCase(),
      phone: phone ? phone.trim() : '',
      membershipId: membershipId.trim(),
      status: status || 'active',
      address: address ? address.trim() : '',
      notes: notes ? notes.trim() : '',
    })

    await member.save()
    res.status(201).json(member)
  } catch (err) {
    next(err)
  }
}

exports.update = async (req, res, next) => {
  try {
    const { fullName, email, phone, membershipId, status, address, notes } = req.body
    const ownership = await findOwnedRecord(Member, req.params.id, req)
    if (!ownership.record) {
      if (ownership.forbidden) return res.status(403).json({ message: 'Forbidden' })
      return res.status(404).json({ message: 'Member not found' })
    }
    const member = ownership.record

    if (fullName) member.fullName = fullName.trim()
    if (email) {
      const existingEmail = await Member.findOne({ _id: { $ne: member._id }, owner: req.user._id, email: email.trim().toLowerCase() })
      if (existingEmail) return res.status(400).json({ message: 'Email already exists' })
      member.email = email.trim().toLowerCase()
    }
    if (phone != null) member.phone = phone.trim()
    if (membershipId) {
      const existingMembership = await Member.findOne({ _id: { $ne: member._id }, owner: req.user._id, membershipId: membershipId.trim() })
      if (existingMembership) return res.status(400).json({ message: 'Membership ID already exists' })
      member.membershipId = membershipId.trim()
    }
    if (status) member.status = status
    if (address != null) member.address = address.trim()
    if (notes != null) member.notes = notes.trim()

    await member.save()
    res.json(member)
  } catch (err) {
    next(err)
  }
}

exports.remove = async (req, res, next) => {
  try {
    const ownership = await findOwnedRecord(Member, req.params.id, req)
    if (!ownership.record) {
      if (ownership.forbidden) return res.status(403).json({ message: 'Forbidden' })
      return res.status(404).json({ message: 'Member not found' })
    }
    const member = ownership.record

    await member.deleteOne()
    res.json({ message: 'Member deleted successfully' })
  } catch (err) {
    next(err)
  }
}
