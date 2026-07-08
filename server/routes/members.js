const express = require('express')
const router = express.Router()
const memberController = require('../controllers/memberController')
const auth = require('../middleware/auth')

router.use(auth)

router.get('/', memberController.getAll)
router.get('/:id', memberController.getOne)
router.post('/', memberController.create)
router.put('/:id', memberController.update)
router.delete('/:id', memberController.remove)

module.exports = router
