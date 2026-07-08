const express = require('express')
const router = express.Router()
const loanController = require('../controllers/loanController')
const auth = require('../middleware/auth')

router.use(auth)

router.get('/', loanController.getAll)
router.get('/:id', loanController.getOne)
router.post('/', loanController.issue)
router.post('/:id/return', loanController.returnBook)

module.exports = router
