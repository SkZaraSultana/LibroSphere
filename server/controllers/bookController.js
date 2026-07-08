const mongoose = require('mongoose')
const Book = require('../models/Book')
const Category = require('../models/Category')
const Loan = require('../models/Loan')
const { buildOwnerFilter, findOwnedRecord } = require('../utils/ownership')

function buildBookResponse(book, activeLoanCountById = {}) {
  const activeLoanCount = activeLoanCountById[book._id?.toString()] ?? book.activeLoanCount ?? 0
  const availableCopies = Math.max((book.copies || 0) - activeLoanCount, 0)
  let status = 'Available'
  if (availableCopies <= 0) status = 'Out of Stock'
  else if (availableCopies <= 1) status = 'Low Stock'

  return {
    ...book,
    category: book.category || null,
    availableCopies,
    status,
  }
}

exports.getAll = async (req, res, next) => {
  try {
    const { q, category, publishedYear, status, sort = 'newest', page = 1, limit = 10 } = req.query
    const filter = buildOwnerFilter(req)

    if (q) {
      filter.$or = [
        { title: { $regex: q, $options: 'i' } },
        { author: { $regex: q, $options: 'i' } },
        { isbn: { $regex: q, $options: 'i' } },
        { publisher: { $regex: q, $options: 'i' } },
      ]
    }

    if (category) {
      filter.category = category
    }

    if (publishedYear) {
      filter.publishedYear = Number(publishedYear)
    }

    const sortMap = {
      newest: { createdAt: -1 },
      oldest: { createdAt: 1 },
      'title-asc': { title: 1 },
      'title-desc': { title: -1 },
    }
    const sortOrder = sortMap[sort] || sortMap.newest
    const pageNumber = Math.max(Number(page) || 1, 1)
    const pageSize = Math.min(Math.max(Number(limit) || 10, 1), 100)
    const skip = (pageNumber - 1) * pageSize

    const pipeline = [
      { $match: filter },
      {
        $lookup: {
          from: 'loans',
          let: { bookId: '$_id' },
          pipeline: [
            { $match: { $expr: { $and: [{ $eq: ['$book', '$$bookId'] }, { $eq: ['$returnedAt', null] }] } } },
            { $count: 'count' },
          ],
          as: 'activeLoanCount',
        },
      },
      {
        $addFields: {
          activeLoanCount: { $ifNull: [{ $arrayElemAt: ['$activeLoanCount.count', 0] }, 0] },
        },
      },
      {
        $addFields: {
          availableCopies: {
            $max: [{ $subtract: ['$copies', '$activeLoanCount'] }, 0],
          },
        },
      },
      {
        $addFields: {
          status: {
            $switch: {
              branches: [
                { case: { $eq: ['$availableCopies', 0] }, then: 'Out of Stock' },
                { case: { $lte: ['$availableCopies', 1] }, then: 'Low Stock' },
              ],
              default: 'Available',
            },
          },
        },
      },
      {
        $lookup: {
          from: 'categories',
          localField: 'category',
          foreignField: '_id',
          as: 'category',
        },
      },
      { $unwind: { path: '$category', preserveNullAndEmptyArrays: true } },
    ]

    if (status) {
      pipeline.push({ $match: { status } })
    }

    pipeline.push({ $sort: sortOrder })

    const facetPipeline = [
      ...pipeline,
      {
        $facet: {
          metadata: [{ $count: 'totalCount' }],
          data: [{ $skip: skip }, { $limit: pageSize }],
        },
      },
    ]

    const result = await Book.aggregate(facetPipeline)
    const meta = result[0]?.metadata?.[0] || { totalCount: 0 }
    const data = result[0]?.data || []

    const allBooks = await Book.find(buildOwnerFilter(req)).lean()
    const allBookIds = allBooks.map((book) => book._id)
    const activeLoans = await Loan.aggregate([
      { $match: { owner: req.user._id, book: { $in: allBookIds }, returnedAt: null } },
      { $group: { _id: '$book', count: { $sum: 1 } } },
    ])
    const activeLoanMap = activeLoans.reduce((acc, item) => {
      acc[item._id.toString()] = item.count
      return acc
    }, {})

    const availableBooks = allBooks.reduce((sum, book) => sum + Math.max((book.copies || 0) - (activeLoanMap[book._id.toString()] || 0), 0), 0)
    const outOfStock = allBooks.filter((book) => Math.max((book.copies || 0) - (activeLoanMap[book._id.toString()] || 0), 0) === 0).length
    const categoriesUsed = await Book.distinct('category', { owner: req.user._id, category: { $ne: null } })
    const publishedYears = await Book.distinct('publishedYear', { owner: req.user._id })

    res.json({
      data: data.map((book) => buildBookResponse(book)),
      page: pageNumber,
      limit: pageSize,
      totalCount: meta.totalCount,
      totalPages: Math.ceil(meta.totalCount / pageSize),
      summary: {
        totalBooks: allBooks.length,
        availableBooks,
        outOfStock,
        categoriesUsed: categoriesUsed.length,
        publishedYears: publishedYears.sort((a, b) => b - a),
      },
    })
  } catch (err) {
    next(err)
  }
}

exports.getOne = async (req, res, next) => {
  try {
    const ownership = await findOwnedRecord(Book, req.params.id, req)
    if (!ownership.record) {
      if (ownership.forbidden) return res.status(403).json({ message: 'Forbidden' })
      return res.status(404).json({ message: 'Book not found' })
    }
    const book = await Book.findOne({ _id: req.params.id, owner: req.user._id }).populate('category', 'name')

    const activeLoanCount = await Loan.countDocuments({ owner: req.user._id, book: book._id, returnedAt: null })
    res.json(buildBookResponse(book, { [book._id.toString()]: activeLoanCount }))
  } catch (err) {
    next(err)
  }
}

exports.create = async (req, res, next) => {
  try {
    const {
      title,
      author,
      isbn,
      category,
      publisher,
      language,
      publishedYear,
      edition,
      shelfLocation,
      copies,
      coverImage,
      description,
    } = req.body

    if (!title || typeof title !== 'string' || !title.trim()) {
      return res.status(400).json({ message: 'Title is required' })
    }
    if (!author || typeof author !== 'string' || !author.trim()) {
      return res.status(400).json({ message: 'Author is required' })
    }
    if (!isbn || typeof isbn !== 'string' || !isbn.trim()) {
      return res.status(400).json({ message: 'ISBN is required' })
    }

    const existingBookByIsbn = await Book.findOne({ owner: req.user._id, isbn: isbn.trim() })
    if (existingBookByIsbn) {
      return res.status(400).json({ message: 'Book ISBN already exists for your library' })
    }
    if (!publisher || typeof publisher !== 'string' || !publisher.trim()) {
      return res.status(400).json({ message: 'Publisher is required' })
    }
    if (!language || typeof language !== 'string' || !language.trim()) {
      return res.status(400).json({ message: 'Language is required' })
    }
    if (!publishedYear || Number(publishedYear) <= 0) {
      return res.status(400).json({ message: 'Published year is required' })
    }
    if (!edition || typeof edition !== 'string' || !edition.trim()) {
      return res.status(400).json({ message: 'Edition is required' })
    }
    if (!shelfLocation || typeof shelfLocation !== 'string' || !shelfLocation.trim()) {
      return res.status(400).json({ message: 'Shelf location is required' })
    }
    if (copies != null && Number(copies) < 0) {
      return res.status(400).json({ message: 'Quantity must be a non-negative number' })
    }

    if (category) {
      const categoryExists = await Category.findById(category)
      if (!categoryExists) return res.status(400).json({ message: 'Selected category does not exist' })
    }

    const newBook = new Book({
      owner: req.user._id,
      title: title.trim(),
      author: author.trim(),
      isbn: isbn.trim(),
      category: category || null,
      publisher: publisher.trim(),
      language: language.trim(),
      publishedYear: Number(publishedYear),
      edition: edition.trim(),
      shelfLocation: shelfLocation.trim(),
      copies: copies != null ? Number(copies) : 1,
      coverImage: coverImage ? coverImage.trim() : '',
      description: description ? description.trim() : '',
    })

    await newBook.save()
    const saved = await Book.findById(newBook._id).populate('category', 'name')
    res.status(201).json(saved)
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ message: 'Book ISBN must be unique' })
    }
    next(err)
  }
}

exports.update = async (req, res, next) => {
  try {
    const {
      title,
      author,
      isbn,
      category,
      publisher,
      language,
      publishedYear,
      edition,
      shelfLocation,
      copies,
      coverImage,
      description,
    } = req.body

    const ownership = await findOwnedRecord(Book, req.params.id, req)
    if (!ownership.record) {
      if (ownership.forbidden) return res.status(403).json({ message: 'Forbidden' })
      return res.status(404).json({ message: 'Book not found' })
    }
    const book = ownership.record

    if (title != null) book.title = title.trim()
    if (author != null) book.author = author.trim()
    if (isbn != null) book.isbn = isbn.trim()
    if (publisher != null) book.publisher = publisher.trim()
    if (language != null) book.language = language.trim()
    if (publishedYear != null) book.publishedYear = Number(publishedYear)
    if (edition != null) book.edition = edition.trim()
    if (shelfLocation != null) book.shelfLocation = shelfLocation.trim()
    if (description != null) book.description = description.trim()
    if (coverImage != null) book.coverImage = coverImage.trim()
    if (isbn != null) {
      const existingBookWithIsbn = await Book.findOne({ _id: { $ne: book._id }, owner: req.user._id, isbn: isbn.trim() })
      if (existingBookWithIsbn) {
        return res.status(400).json({ message: 'Book ISBN already exists for your library' })
      }
    }
    if (copies != null) {
      if (Number(copies) < 0) return res.status(400).json({ message: 'Quantity must be a non-negative number' })
      const activeLoanCount = await Loan.countDocuments({ owner: req.user._id, book: book._id, returnedAt: null })
      if (Number(copies) < activeLoanCount) {
        return res.status(400).json({ message: 'Quantity cannot be less than active borrowed copies' })
      }
      book.copies = Number(copies)
    }

    if (category) {
      const categoryExists = await Category.findById(category)
      if (!categoryExists) return res.status(400).json({ message: 'Selected category does not exist' })
      book.category = category
    } else if (category === null || category === '') {
      book.category = null
    }

    await book.save()
    const updated = await Book.findById(book._id).populate('category', 'name')
    res.json(updated)
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ message: 'Book ISBN must be unique' })
    }
    next(err)
  }
}

exports.remove = async (req, res, next) => {
  try {
    const ownership = await findOwnedRecord(Book, req.params.id, req)
    if (!ownership.record) {
      if (ownership.forbidden) return res.status(403).json({ message: 'Forbidden' })
      return res.status(404).json({ message: 'Book not found' })
    }
    const book = ownership.record

    const activeLoanCount = await Loan.countDocuments({ owner: req.user._id, book: book._id, returnedAt: null })
    if (activeLoanCount > 0) {
      return res.status(400).json({ message: 'Cannot delete a book with active borrow records' })
    }

    await book.deleteOne()
    res.json({ message: 'Book deleted successfully' })
  } catch (err) {
    next(err)
  }
}
