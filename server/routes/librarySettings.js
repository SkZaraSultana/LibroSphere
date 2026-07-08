const express = require('express')
const router = express.Router()
const librarySettingsController = require('../controllers/librarySettingsController')
const auth = require('../middleware/auth')

router.use(auth)
router.get('/', librarySettingsController.getForUser)
router.put('/', librarySettingsController.updateForUser)

module.exports = router
