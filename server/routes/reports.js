const express = require('express')
const router = express.Router()
const reportController = require('../controllers/reportController')
const auth = require('../middleware/auth')

router.use(auth)

router.get('/summary', reportController.getSummary)
router.get('/history', reportController.getBorrowHistory)
router.get('/popular-books', reportController.getPopularBooks)
router.get('/overdue', reportController.getOverdue)
router.get('/activity', reportController.getActivity)

module.exports = router
