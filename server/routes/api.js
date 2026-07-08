const express = require('express')
const router = express.Router()
const health = require('../controllers/healthController')

// Mount sub-routers
router.use('/auth', require('./auth'))
router.use('/books', require('./books'))
router.use('/categories', require('./categories'))
router.use('/members', require('./members'))
router.use('/loans', require('./loans'))
router.use('/reports', require('./reports'))
router.use('/analytics', require('./analytics'))
router.use('/settings', require('./settings'))
router.use('/library-settings', require('./librarySettings'))
router.use('/dashboard', require('./dashboard'))

// Minimal API surface for now. Expand with members, loans, and analytics.
router.get('/health', health.ping)

module.exports = router
