const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const morgan = require('morgan')
const cookieParser = require('cookie-parser')

const apiRoutes = require('./routes/api')
const errorHandler = require('./middleware/errorHandler')

// Express app setup
const app = express()

// Security headers
app.use(helmet())

// HTTP request logger
app.use(morgan('dev'))

// CORS Configuration
// Allow Vite development ports during development.
app.use(
  cors({
    origin: [
      'http://localhost:5173',
      'http://localhost:5174',
      'http://localhost:5175',
    ],
    credentials: true,
  })
)

// Cookie parser
app.use(cookieParser())

// Parse JSON
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// API Routes
app.use('/api', apiRoutes)

// Global Error Handler
app.use(errorHandler)

module.exports = app