const bcrypt = require('bcryptjs')

module.exports.hash = async function (password) {
  const salt = await bcrypt.genSalt(10)
  return bcrypt.hash(password, salt)
}

module.exports.compare = async function (password, hash) {
  return bcrypt.compare(password, hash)
}
