const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')

// User schema defines application users. Passwords are hashed before save.
const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  avatar: { type: String, trim: true, default: '' },
  role: { type: String, default: 'admin' },
}, { timestamps: true })

// Hash password if modified before saving. Use async middleware without `next`.
UserSchema.pre('save', async function () {
  if (!this.isModified('password')) return
  const salt = await bcrypt.genSalt(10)
  this.password = await bcrypt.hash(this.password, salt)
})

// Helper to compare candidate password with stored hash
UserSchema.methods.comparePassword = function (candidate) {
  return bcrypt.compare(candidate, this.password)
}

// Hide password field when converting to JSON
UserSchema.methods.toJSON = function () {
  const obj = this.toObject()
  delete obj.password
  return obj
}

module.exports = mongoose.model('User', UserSchema)
