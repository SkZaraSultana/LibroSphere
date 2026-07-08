const jwt = require('jsonwebtoken')
const config = require('../config')
const User = require('../models/User')
const Book = require('../models/Book')
const Member = require('../models/Member')
const Loan = require('../models/Loan')

// Helper to generate JWT for a user
function generateToken(user) {
  return jwt.sign({ id: user._id }, config.jwtSecret, { expiresIn: '7d' })
}

// Register a new user
exports.register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body
    // Basic check — validators should have already run
    const existing = await User.findOne({ email })
    if (existing) return res.status(400).json({ message: 'Email already in use' })

    const user = new User({ name, email, password })
    await user.save()

    // create default library settings for this user
    try {
      const LibrarySettings = require('../models/LibrarySettings')
      await LibrarySettings.findOneAndUpdate(
        { owner: user._id },
        { $setOnInsert: { owner: user._id, defaultBorrowDays: 14, finePerDay: 5, maxBooksPerMember: 5, autoFine: true } },
        { upsert: true }
      )
    } catch (e) {
      // non-fatal
      console.error('Failed to create library settings for new user', e)
    }

    const token = generateToken(user)
    res.status(201).json({ user: user.toJSON(), token })
  } catch (err) {
    next(err)
  }
}

// Login existing user
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body
    const user = await User.findOne({ email })
    if (!user) return res.status(400).json({ message: 'Invalid credentials' })

    const match = await user.comparePassword(password)
    if (!match) return res.status(400).json({ message: 'Invalid credentials' })

    const token = generateToken(user)
    res.json({ user: user.toJSON(), token })
  } catch (err) {
    next(err)
  }
}

// Get current authenticated user
exports.me = async (req, res, next) => {
  try {
    // `auth` middleware attaches `req.user`
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' })
    res.json({ user: req.user })
  } catch (err) {
    next(err)
  }
}

// Delete current authenticated user and owned library data
exports.deleteAccount = async (req, res, next) => {
  try {
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' })

    await Promise.all([
      Loan.deleteMany({ owner: req.user._id }),
      Book.deleteMany({ owner: req.user._id }),
      Member.deleteMany({ owner: req.user._id }),
    ])

    await User.deleteOne({ _id: req.user._id })

    res.json({ message: 'Account deleted successfully' })
  } catch (err) {
    next(err)
  }
}

// Update profile for current authenticated user
exports.updateProfile = async (req, res, next) => {
  try {
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' })

    const { name, email, password, currentPassword, avatar } = req.body
    const User = require('../models/User')
    const user = await User.findById(req.user._id)
    if (!user) return res.status(404).json({ message: 'User not found' })

    if (name) user.name = name.trim()
    if (email) user.email = email.trim().toLowerCase()
    if (avatar !== undefined) user.avatar = avatar || ''

    if (password) {
      if (!currentPassword) return res.status(400).json({ message: 'Current password is required' })
      const match = await user.comparePassword(currentPassword)
      if (!match) return res.status(400).json({ message: 'Current password is incorrect' })
      if (password.length < 8) return res.status(400).json({ message: 'New password must be at least 8 characters' })
      user.password = password
    }

    await user.save()
    const updatedUser = await User.findById(user._id).select('-password')
    res.json({ user: updatedUser })
  } catch (err) {
    next(err)
  }
}
