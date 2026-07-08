const express = require('express')
const router = express.Router()
const dashboardController = require('../controllers/dashboardController')
const auth = require('../middleware/auth')

router.use(auth)
router.get('/overview', dashboardController.overview)

module.exports = router
