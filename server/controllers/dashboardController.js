const Book = require('../models/Book')
const Member = require('../models/Member')
const Category = require('../models/Category')
const Loan = require('../models/Loan')
const { buildOwnerFilter } = require('../utils/ownership')

function startOfDay(date = new Date()) {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  return d
}

function endOfDay(date = new Date()) {
  const d = new Date(date)
  d.setHours(23, 59, 59, 999)
  return d
}

exports.overview = async (req, res, next) => {
  try {
    const now = new Date()
    const todayStart = startOfDay(now)
    const todayEnd = endOfDay(now)

    const userFilter = buildOwnerFilter(req)
    const [totalBooks, totalMembers, totalCategories, borrowedBooks, overdueBooks, returnedToday, recentBooks, recentMembers, recentLoans, recentReturns, recentCategories] = await Promise.all([
      Book.countDocuments(userFilter),
      Member.countDocuments(userFilter),
      Category.countDocuments(),
      Loan.countDocuments({ ...userFilter, returnedAt: null }),
      Loan.countDocuments({ ...userFilter, returnedAt: null, dueAt: { $lt: now } }),
      Loan.countDocuments({ ...userFilter, returnedAt: { $gte: todayStart, $lte: todayEnd } }),
      Book.find(userFilter).sort({ createdAt: -1 }).limit(5).populate('category', 'name').lean(),
      Member.find(userFilter).sort({ createdAt: -1 }).limit(5).lean(),
      Loan.find({ ...userFilter, returnedAt: null }).sort({ borrowedAt: -1 }).limit(5).populate('book', 'title').populate('member', 'fullName').lean(),
      Loan.find({ ...userFilter, returnedAt: { $ne: null } }).sort({ returnedAt: -1 }).limit(5).populate('book', 'title').populate('member', 'fullName').lean(),
      Category.find().sort({ createdAt: -1 }).limit(5).lean(),
    ])

    const allBooks = await Book.find(userFilter).lean()

    const activeLoans = await Loan.aggregate([
      { $match: { ...userFilter, returnedAt: null } },
      { $group: { _id: '$book', count: { $sum: 1 } } },
    ])
    const activeLoanMap = activeLoans.reduce((acc, item) => {
      acc[item._id.toString()] = item.count
      return acc
    }, {})

    const availableBooks = allBooks.reduce((sum, book) => {
      const active = activeLoanMap[book._id.toString()] || 0
      return sum + Math.max((book.copies || 0) - active, 0)
    }, 0)

    const normalizedRecentBooks = recentBooks.map((book) => {
      const active = activeLoanMap[book._id.toString()] || 0
      return {
        ...book,
        availableCopies: Math.max((book.copies || 0) - active, 0),
      }
    })

    const lowStockBooks = allBooks
      .map((book) => {
        const active = activeLoanMap[book._id.toString()] || 0
        return { ...book, availableCopies: Math.max((book.copies || 0) - active, 0) }
      })
      .filter((book) => book.availableCopies <= 1)
      .slice(0, 5)

    const buildActivity = []

    recentBooks.forEach((book) => {
      buildActivity.push({
        type: 'book-added',
        title: `Book added`,
        description: `${book.title} was added to inventory.`,
        date: book.createdAt,
      })
    })

    recentMembers.forEach((member) => {
      buildActivity.push({
        type: 'member-registered',
        title: `Member registered`,
        description: `${member.fullName} joined the library.`,
        date: member.createdAt,
      })
    })

    recentLoans.forEach((loan) => {
      buildActivity.push({
        type: 'book-borrowed',
        title: `Book borrowed`,
        description: `${loan.member?.fullName || 'Member'} borrowed ${loan.book?.title || 'a book'}.`,
        date: loan.borrowedAt,
      })
    })

    recentReturns.forEach((loan) => {
      buildActivity.push({
        type: 'book-returned',
        title: `Book returned`,
        description: `${loan.member?.fullName || 'Member'} returned ${loan.book?.title || 'a book'}.`,
        date: loan.returnedAt,
      })
    })

    recentCategories.forEach((category) => {
      buildActivity.push({
        type: 'category-created',
        title: `Category created`,
        description: `${category.name} category was added.`,
        date: category.createdAt,
      })
    })

    const recentActivity = buildActivity
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 8)

    const dueToday = await Loan.countDocuments({ ...userFilter, returnedAt: null, dueAt: { $gte: todayStart, $lte: todayEnd } })
    const notifications = []
    if (dueToday > 0) {
      notifications.push({ type: 'due-today', label: 'Books due today', value: dueToday })
    }
    if (overdueBooks > 0) {
      notifications.push({ type: 'overdue', label: 'Overdue books', value: overdueBooks })
    }
    if (lowStockBooks.length > 0) {
      notifications.push({ type: 'low-stock', label: 'Low stock books', value: lowStockBooks.length })
    }

    res.json({
      totalBooks,
      totalMembers,
      totalCategories,
      borrowedBooks,
      returnedToday,
      overdueBooks,
      availableBooks,
      recentBooks: normalizedRecentBooks,
      recentMembers,
      recentActivity,
      notifications,
      lowStockBooks,
      dueToday,
    })
  } catch (err) {
    next(err)
  }
}
