const Book = require('../models/Book')
const Loan = require('../models/Loan')
const { buildOwnerFilter } = require('../utils/ownership')

exports.getSummary = async (req, res, next) => {
  try {
    const ownerFilter = buildOwnerFilter(req)
    const totalBooks = await Book.countDocuments(ownerFilter)
    const totalMembers = await require('../models/Member').countDocuments(ownerFilter)
    const totalBorrows = await Loan.countDocuments(ownerFilter)
    const totalReturns = await Loan.countDocuments({ ...ownerFilter, returnedAt: { $ne: null } })
    const activeLoans = await Loan.countDocuments({ ...ownerFilter, returnedAt: null })
    const overdueLoans = await Loan.countDocuments({ ...ownerFilter, returnedAt: null, dueAt: { $lt: new Date() } })

    const returnRate = totalBorrows > 0 ? Math.round((totalReturns / totalBorrows) * 100 * 100) / 100 : 0
    const availableBooks = Math.max(0, totalBooks - activeLoans)

    res.json({ totalBooks, totalMembers, totalBorrows, totalReturns, returnRate, activeLoans, overdueLoans, availableBooks })
  } catch (err) {
    next(err)
  }
}

exports.getActivity = async (req, res, next) => {
  try {
    const ownerFilter = buildOwnerFilter(req)
    const limit = Math.min(Math.max(Number(req.query.limit) || 10, 1), 100)

    const Book = require('../models/Book')
    const Member = require('../models/Member')
    const Loan = require('../models/Loan')

    const [recentLoans, recentMembers, recentBooks] = await Promise.all([
      Loan.find(ownerFilter).sort({ updatedAt: -1 }).limit(limit).populate('book', 'title author').populate('member', 'fullName membershipId').lean(),
      Member.find(ownerFilter).sort({ createdAt: -1 }).limit(limit).lean(),
      Book.find(ownerFilter).sort({ createdAt: -1 }).limit(limit).lean(),
    ])

    const activities = []

    // Loans => Borrowed or Returned
    for (const l of recentLoans) {
      if (l.status === 'borrowed') {
        activities.push({ type: 'borrowed', text: `${l.member?.fullName || 'Member'} borrowed ${l.book?.title || 'a book'}`, date: l.borrowedAt || l.createdAt || l.updatedAt, detail: l })
      } else if (l.status === 'returned') {
        activities.push({ type: 'returned', text: `${l.member?.fullName || 'Member'} returned ${l.book?.title || 'a book'}`, date: l.returnedAt || l.updatedAt, detail: l })
      }
    }

    for (const m of recentMembers) {
      activities.push({ type: 'member_registered', text: `${m.fullName} registered`, date: m.createdAt || m._id.getTimestamp?.(), detail: m })
    }

    for (const b of recentBooks) {
      activities.push({ type: 'book_added', text: `${b.title} added`, date: b.createdAt || b._id.getTimestamp?.(), detail: b })
    }

    // sort by date desc and limit
    const merged = activities
      .filter((a) => a.date)
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, limit)

    res.json({ data: merged })
  } catch (err) {
    next(err)
  }
}

exports.getBorrowHistory = async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query
    const pageNumber = Math.max(Number(page) || 1, 1)
    const pageSize = Math.min(Math.max(Number(limit) || 20, 1), 100)
    const skip = (pageNumber - 1) * pageSize

    const ownerFilter = buildOwnerFilter(req)
    const [totalCount, history] = await Promise.all([
      Loan.countDocuments(ownerFilter),
      Loan.find(ownerFilter)
        .sort({ borrowedAt: -1 })
        .populate('book', 'title author')
        .populate('member', 'fullName membershipId')
        .skip(skip)
        .limit(pageSize),
    ])

    res.json({ data: history, page: pageNumber, limit: pageSize, totalCount, totalPages: Math.ceil(totalCount / pageSize) })
  } catch (err) {
    next(err)
  }
}

exports.getPopularBooks = async (req, res, next) => {
  try {
    const ownerFilter = buildOwnerFilter(req)
    const popular = await Loan.aggregate([
      { $match: ownerFilter },
      { $group: { _id: '$book', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: 'books',
          localField: '_id',
          foreignField: '_id',
          as: 'book',
        },
      },
      { $unwind: '$book' },
      { $project: { count: 1, title: '$book.title', author: '$book.author' } },
    ])
    res.json(popular)
  } catch (err) {
    next(err)
  }
}

exports.getOverdue = async (req, res, next) => {
  try {
    const ownerFilter = buildOwnerFilter(req)
    const overdue = await Loan.find({ ...ownerFilter, returnedAt: null, dueAt: { $lt: new Date() } })
      .populate('book', 'title author')
      .populate('member', 'fullName membershipId')
      .sort({ dueAt: 1 })
    res.json(overdue)
  } catch (err) {
    next(err)
  }
}
