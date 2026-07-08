const jwt = require('jsonwebtoken')
const config = require('../config')
const User = require('../models/User')

// Auth middleware: verifies JWT and attaches the user document to req.user
// Token can be provided in the `Authorization: Bearer <token>` header or in cookies.
module.exports = async function (req, res, next) {
  try {
    const authHeader = req.headers.authorization
    const token = authHeader && authHeader.split(' ')[1] ? authHeader.split(' ')[1] : req.cookies && req.cookies.token

    if (!token) return res.status(401).json({ message: 'Missing token' })

    const payload = jwt.verify(token, config.jwtSecret)
    const user = await User.findById(payload.id).select('-password')
    if (!user) return res.status(401).json({ message: 'User not found' })

    req.user = user
    next()
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired token' })
  }
}
