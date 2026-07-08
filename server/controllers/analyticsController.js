const Book = require('../models/Book')
const Member = require('../models/Member')
const Category = require('../models/Category')
const Loan = require('../models/Loan')
const { buildOwnerFilter } = require('../utils/ownership')

function buildMonthSeries(months = 6, now = new Date()) {
  const items = []
  for (let index = months - 1; index >= 0; index -= 1) {
    const date = new Date(now.getFullYear(), now.getMonth() - index, 1)
    items.push({
      year: date.getFullYear(),
      month: date.getMonth() + 1,
      label: date.toLocaleString('default', { month: 'short' }),
      key: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`,
      borrowed: 0,
      returned: 0,
    })
  }
  return items
}

exports.getAnalytics = async (req, res, next) => {
  try {
    const ownerFilter = buildOwnerFilter(req)
    const now = new Date()
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1)
    const overdueFilter = { ...ownerFilter, returnedAt: null, dueAt: { $lt: now } }
    const activeFilter = { ...ownerFilter, returnedAt: null, dueAt: { $gte: now } }

    const [totalBooks, totalMembers, totalBorrows, overdueBooks, allBooks, categoryGroups, activeLoans, borrowedGroups, returnedGroups, topAuthors, mostBorrowed] = await Promise.all([
      Book.countDocuments(ownerFilter),
      Member.countDocuments(ownerFilter),
      Loan.countDocuments(ownerFilter),
      Loan.countDocuments(overdueFilter),
      Book.find(ownerFilter).lean(),
      Book.aggregate([
        { $match: ownerFilter },
        { $group: { _id: '$category', count: { $sum: 1 } } },
        {
          $lookup: {
            from: 'categories',
            localField: '_id',
            foreignField: '_id',
            as: 'category',
          },
        },
        {
          $addFields: {
            name: {
              $ifNull: [{ $arrayElemAt: ['$category.name', 0] }, 'Uncategorized'],
            },
          },
        },
        { $project: { _id: 0, name: 1, count: 1 } },
        { $sort: { count: -1 } },
      ]),
      Loan.aggregate([
        { $match: { ...ownerFilter, returnedAt: null } },
        { $group: { _id: '$book', count: { $sum: 1 } } },
      ]),
      Loan.aggregate([
        { $match: { ...ownerFilter, borrowedAt: { $gte: sixMonthsAgo } } },
        {
          $group: {
            _id: {
              year: { $year: '$borrowedAt' },
              month: { $month: '$borrowedAt' },
            },
            count: { $sum: 1 },
          },
        },
        { $project: { _id: 0, year: '$_id.year', month: '$_id.month', count: 1 } },
      ]),
      Loan.aggregate([
        { $match: { ...ownerFilter, returnedAt: { $gte: sixMonthsAgo } } },
        {
          $group: {
            _id: {
              year: { $year: '$returnedAt' },
              month: { $month: '$returnedAt' },
            },
            count: { $sum: 1 },
          },
        },
        { $project: { _id: 0, year: '$_id.year', month: '$_id.month', count: 1 } },
      ]),
      Book.aggregate([
        { $match: ownerFilter },
        { $group: { _id: '$author', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 5 },
        { $project: { _id: 0, author: '$_id', count: 1 } },
      ]),
      Loan.aggregate([
        { $match: ownerFilter },
        { $group: { _id: '$book', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 5 },
        {
          $lookup: {
            from: 'books',
            localField: '_id',
            foreignField: '_id',
            as: 'book',
          },
        },
        { $unwind: { path: '$book', preserveNullAndEmptyArrays: true } },
        {
          $project: {
            _id: 0,
            title: '$book.title',
            author: '$book.author',
            count: 1,
          },
        },
      ]),
    ])

    const categoryData = categoryGroups.map((item) => ({ name: item.name, count: item.count }))
    const activeLoanMap = activeLoans.reduce((acc, item) => {
      acc[item._id?.toString()] = item.count
      return acc
    }, {})

    const availableBooks = allBooks.reduce((sum, book) => {
      const activeCount = activeLoanMap[book._id?.toString()] || 0
      return sum + Math.max((book.copies || 0) - activeCount, 0)
    }, 0)

    const borrowedStatus = await Loan.countDocuments(activeFilter)
    const returnedStatus = await Loan.countDocuments({ ...ownerFilter, returnedAt: { $ne: null } })

    const borrowedSeries = buildMonthSeries(6, now)
    borrowedGroups.forEach((item) => {
      const key = `${item.year}-${String(item.month).padStart(2, '0')}`
      const seriesItem = borrowedSeries.find((row) => row.key === key)
      if (seriesItem) seriesItem.borrowed = item.count
    })

    const returnedSeries = buildMonthSeries(6, now)
    returnedGroups.forEach((item) => {
      const key = `${item.year}-${String(item.month).padStart(2, '0')}`
      const seriesItem = returnedSeries.find((row) => row.key === key)
      if (seriesItem) seriesItem.returned = item.count
    })

    const monthlyActivity = borrowedSeries.map((item, index) => ({
      month: item.label,
      borrowed: item.borrowed,
      returned: returnedSeries[index]?.returned ?? 0,
    }))

    const statusDistribution = [
      { name: 'Borrowed', value: borrowedStatus },
      { name: 'Returned', value: returnedStatus },
      { name: 'Overdue', value: overdueBooks },
    ]

    res.json({
      summary: { totalBooks, totalMembers, totalBorrows, overdueBooks },
      bookByCategory: categoryData,
      statusDistribution,
      monthlyActivity,
      topAuthors,
      mostBorrowed,
      availability: { availableBooks, issuedBooks: borrowedStatus + overdueBooks },
    })
  } catch (err) {
    next(err)
  }
}
