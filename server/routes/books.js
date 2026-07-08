const express = require('express')
const router = express.Router()
const bookController = require('../controllers/bookController')
const auth = require('../middleware/auth')

router.use(auth)

router.get('/', bookController.getAll)
router.get('/:id', bookController.getOne)
router.post('/', bookController.create)
router.put('/:id', bookController.update)
router.delete('/:id', bookController.remove)

module.exports = router
