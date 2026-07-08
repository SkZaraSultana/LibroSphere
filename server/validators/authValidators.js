// Lightweight validators for authentication requests.
// Returns 400 with field-specific messages when validation fails.

function isEmail(email) {
  return typeof email === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

function isStrongPassword(pw) {
  return typeof pw === 'string' && pw.length >= 6
}

exports.validateRegister = (req, res, next) => {
  const errors = []
  const { name, email, password } = req.body
  if (!name || typeof name !== 'string' || name.trim().length < 2) errors.push({ field: 'name', message: 'Name must be at least 2 characters' })
  if (!email || !isEmail(email)) errors.push({ field: 'email', message: 'Valid email is required' })
  if (!password || !isStrongPassword(password)) errors.push({ field: 'password', message: 'Password must be at least 6 characters' })

  if (errors.length) return res.status(400).json({ errors })
  next()
}

exports.validateLogin = (req, res, next) => {
  const errors = []
  const { email, password } = req.body
  if (!email || !isEmail(email)) errors.push({ field: 'email', message: 'Valid email is required' })
  if (!password || typeof password !== 'string') errors.push({ field: 'password', message: 'Password is required' })

  if (errors.length) return res.status(400).json({ errors })
  next()
}
