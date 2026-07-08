const path = require('path')
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') })

module.exports = {
  port: process.env.PORT || 5000,
  mongoUri: process.env.MONGO_URI || 'mongodb://localhost:27017/librosphere',
  jwtSecret: process.env.JWT_SECRET || 'change-me-in-prod',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
}
