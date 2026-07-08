const mongoose = require('mongoose')
const Loan = require('../models/Loan')
const Book = require('../models/Book')
const Member = require('../models/Member')
const { buildOwnerFilter, findOwnedRecord } = require('../utils/ownership')
const LibrarySettings = require('../models/LibrarySettings')

exports.getAll = async (req, res, next) => {
  try {
    const { q, status, member, book, page = 1, limit = 10, sort = 'newest' } = req.query
    const ownerFilter = buildOwnerFilter(req)

    const pageNumber = Math.max(Number(page) || 1, 1)
    const pageSize = Math.min(Math.max(Number(limit) || 10, 1), 100)
    const skip = (pageNumber - 1) * pageSize

    const sortMap = {
      newest: { borrowedAt: -1 },
      oldest: { borrowedAt: 1 },
      dueDate: { dueAt: 1 },
      returnDate: { returnedAt: -1 },
    }
    const sortOrder = sortMap[sort] || sortMap.newest

    const pipeline = [
      { $match: ownerFilter },
      { $lookup: { from: 'books', localField: 'book', foreignField: '_id', as: 'book' } },
      { $unwind: { path: '$book', preserveNullAndEmptyArrays: true } },
      { $lookup: { from: 'members', localField: 'member', foreignField: '_id', as: 'member' } },
      { $unwind: { path: '$member', preserveNullAndEmptyArrays: true } },
    ]

    if (q) {
      const re = { $regex: q, $options: 'i' }
      pipeline.push({ $match: { $or: [{ 'book.title': re }, { 'member.fullName': re }, { 'member.membershipId': re }, { notes: re }] } })
    }

    if (member) {
      try { pipeline.push({ $match: { 'member._id': mongoose.Types.ObjectId(member) } }) } catch (e) {}
    }

    if (book) {
      try { pipeline.push({ $match: { 'book._id': mongoose.Types.ObjectId(book) } }) } catch (e) {}
    }

    const now = new Date()
    if (status === 'overdue') {
      pipeline.push({ $match: { returnedAt: null, dueAt: { $lt: now } } })
    } else if (status === 'returnedToday') {
      const start = new Date()
      start.setHours(0, 0, 0, 0)
      const end = new Date()
      end.setHours(23, 59, 59, 999)
      pipeline.push({ $match: { returnedAt: { $gte: start, $lte: end } } })
    } else if (status === 'returnedWeek') {
      const start = new Date()
      // set to start of current week (Monday)
      const day = start.getDay()
      const diffToMonday = ((day + 6) % 7)
      start.setDate(start.getDate() - diffToMonday)
      start.setHours(0, 0, 0, 0)
      const end = new Date()
      end.setHours(23, 59, 59, 999)
      pipeline.push({ $match: { returnedAt: { $gte: start, $lte: end } } })
    } else if (status === 'returnedMonth') {
      const start = new Date(now.getFullYear(), now.getMonth(), 1)
      start.setHours(0, 0, 0, 0)
      const end = new Date()
      end.setHours(23, 59, 59, 999)
      pipeline.push({ $match: { returnedAt: { $gte: start, $lte: end } } })
    } else if (status) {
      pipeline.push({ $match: { status } })
    }

    pipeline.push({ $sort: sortOrder })

    const facetPipeline = [
      ...pipeline,
      { $facet: { metadata: [{ $count: 'totalCount' }], data: [{ $skip: skip }, { $limit: pageSize }] } },
    ]

    const result = await Loan.aggregate(facetPipeline)
    const meta = result[0]?.metadata?.[0] || { totalCount: 0 }
    const data = result[0]?.data || []

    // fetch library settings for owner to compute fines
    const settings = await LibrarySettings.findOne({ owner: req.user._id }).lean()
    const finePerDay = settings?.finePerDay ?? 5
    const autoFine = settings?.autoFine ?? true

    // shape output: keep only needed fields and compute fine for active loans
    const shaped = data.map((doc) => {
      let fine = 0
      if (doc.returnedAt) {
        fine = doc.fine || 0
      } else if (autoFine && doc.dueAt) {
        const now = new Date()
        const due = new Date(doc.dueAt)
        if (now > due) {
          const diffDays = Math.ceil((now - due) / (1000 * 60 * 60 * 24))
          fine = diffDays * finePerDay
        }
      }
      return {
        _id: doc._id,
        book: doc.book ? { title: doc.book.title, author: doc.book.author } : null,
        member: doc.member ? { fullName: doc.member.fullName, membershipId: doc.member.membershipId } : null,
        borrowedAt: doc.borrowedAt,
        dueAt: doc.dueAt,
        returnedAt: doc.returnedAt || null,
        status: doc.status,
        notes: doc.notes || '',
        fine,
      }
    })

    res.json({ data: shaped, page: pageNumber, limit: pageSize, totalCount: meta.totalCount, totalPages: Math.ceil(meta.totalCount / pageSize) })
  } catch (err) {
    next(err)
  }
}

exports.getOne = async (req, res, next) => {
  try {
    const ownership = await findOwnedRecord(Loan, req.params.id, req)
    if (!ownership.record) {
      if (ownership.forbidden) return res.status(403).json({ message: 'Forbidden' })
      return res.status(404).json({ message: 'Borrow record not found' })
    }
    const loan = await Loan.findOne({ _id: req.params.id, owner: req.user._id })
      .populate('book', 'title author copies')
      .populate('member', 'fullName email membershipId')

    res.json(loan)
  } catch (err) {
    next(err)
  }
}

exports.issue = async (req, res, next) => {
  try {
    const { book: bookId, member: memberId, dueAt, notes } = req.body

    if (!bookId || !memberId) {
      return res.status(400).json({ message: 'Book and member are required' })
    }

    const existingBook = await Book.findById(bookId)
    if (!existingBook) return res.status(404).json({ message: 'Book not found' })
    if (existingBook.owner?.toString() !== req.user._id.toString()) return res.status(403).json({ message: 'Forbidden' })

    const existingMember = await Member.findById(memberId)
    if (!existingMember) return res.status(404).json({ message: 'Member not found' })
    if (existingMember.owner?.toString() !== req.user._id.toString()) return res.status(403).json({ message: 'Forbidden' })

    const activeCount = await Loan.countDocuments({ owner: req.user._id, book: existingBook._id, returnedAt: null })
    if (activeCount >= existingBook.copies) {
      return res.status(400).json({ message: 'No available copies for this book' })
    }

    // compute default due date based on library settings when dueAt not provided
    const settings = await LibrarySettings.findOne({ owner: req.user._id })
    const defaultDays = settings?.defaultBorrowDays ?? 14
    const borrowedAt = new Date()
    const dueDate = dueAt ? new Date(dueAt) : new Date(borrowedAt.getTime() + defaultDays * 24 * 60 * 60 * 1000)

    const loan = new Loan({
      owner: req.user._id,
      book: existingBook._id,
      member: existingMember._id,
      borrowedAt,
      dueAt: dueDate,
      notes: notes ? notes.trim() : '',
    })

    await loan.save()
    const result = await Loan.findById(loan._id).populate('book', 'title author copies').populate('member', 'fullName membershipId email')
    res.status(201).json(result)
  } catch (err) {
    next(err)
  }
}

exports.returnBook = async (req, res, next) => {
  try {
    const ownership = await findOwnedRecord(Loan, req.params.id, req)
    if (!ownership.record) {
      if (ownership.forbidden) return res.status(403).json({ message: 'Forbidden' })
      return res.status(404).json({ message: 'Borrow record not found' })
    }
    const loan = await Loan.findOne({ _id: req.params.id, owner: req.user._id }).populate('book', 'title author copies')
    if (!loan) return res.status(404).json({ message: 'Borrow record not found' })
    if (loan.returnedAt) return res.status(400).json({ message: 'Book already returned' })

    const returnedAt = new Date()
    loan.returnedAt = returnedAt

    // compute fine at return time and store it
    try {
      const settings = await LibrarySettings.findOne({ owner: req.user._id }).lean()
      const finePerDay = settings?.finePerDay ?? 5
      const autoFine = settings?.autoFine ?? true
      let fine = loan.fine || 0
      if (autoFine && loan.dueAt) {
        const due = new Date(loan.dueAt)
        if (returnedAt > due) {
          const diffDays = Math.ceil((returnedAt - due) / (1000 * 60 * 60 * 24))
          fine = diffDays * finePerDay
        }
      }
      loan.fine = fine
    } catch (e) {
      // ignore fine calc error
      console.error('Fine calc error', e)
    }

    loan.status = 'returned'
    await loan.save()
    res.json(loan)
  } catch (err) {
    next(err)
  }
}
