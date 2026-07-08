const Category = require('../models/Category')
const Book = require('../models/Book')

exports.getAll = async (req, res, next) => {
  try {
    const { q, page = 1, limit = 100 } = req.query
    const filter = {}

    if (q) {
      filter.name = { $regex: q, $options: 'i' }
    }

    const pageNumber = Math.max(Number(page) || 1, 1)
    const pageSize = Math.min(Math.max(Number(limit) || 10, 1), 100)
    const skip = (pageNumber - 1) * pageSize

    const [totalCount, categories] = await Promise.all([
      Category.countDocuments(filter),
      Category.find(filter).sort({ name: 1 }).skip(skip).limit(pageSize),
    ])

    res.json({ data: categories, page: pageNumber, limit: pageSize, totalCount, totalPages: Math.ceil(totalCount / pageSize) })
  } catch (err) {
    next(err)
  }
}

exports.getOne = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id)
    if (!category) return res.status(404).json({ message: 'Category not found' })
    res.json(category)
  } catch (err) {
    next(err)
  }
}

exports.create = async (req, res, next) => {
  try {
    const { name, description } = req.body
    const normalizedName = typeof name === 'string' ? name.trim() : ''

    if (!normalizedName) {
      return res.status(400).json({ message: 'Category name is required' })
    }

    const exists = await Category.findOne({ name: { $regex: `^${normalizedName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, $options: 'i' } })
    if (exists) return res.status(400).json({ message: 'Category already exists' })

    const category = new Category({ name: normalizedName, description: typeof description === 'string' ? description.trim() : '' })
    await category.save()
    res.status(201).json(category)
  } catch (err) {
    next(err)
  }
}

exports.update = async (req, res, next) => {
  try {
    const { name, description } = req.body
    const category = await Category.findById(req.params.id)
    if (!category) return res.status(404).json({ message: 'Category not found' })

    const normalizedName = typeof name === 'string' ? name.trim() : ''
    if (name != null && !normalizedName) {
      return res.status(400).json({ message: 'Category name is required' })
    }

    if (name != null) {
      const exists = await Category.findOne({ _id: { $ne: category._id }, name: { $regex: `^${normalizedName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, $options: 'i' } })
      if (exists) return res.status(400).json({ message: 'Category already exists' })
      category.name = normalizedName
    }

    if (description != null) category.description = typeof description === 'string' ? description.trim() : ''
    await category.save()
    res.json(category)
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ message: 'Category already exists' })
    }
    next(err)
  }
}

exports.remove = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id)
    if (!category) return res.status(404).json({ message: 'Category not found' })

    const attachedBook = await Book.exists({ category: category._id })
    if (attachedBook) {
      return res.status(400).json({ message: 'Category cannot be removed while books still reference it' })
    }

    await category.deleteOne()
    res.json({ message: 'Category deleted successfully' })
  } catch (err) {
    next(err)
  }
}
