const express = require('express')
const router = express.Router()
const authController = require('../controllers/authController')
const auth = require('../middleware/auth')
const { validateRegister, validateLogin } = require('../validators/authValidators')

// Public
router.post('/register', validateRegister, authController.register)
router.post('/login', validateLogin, authController.login)

// Protected
router.get('/me', auth, authController.me)
router.put('/me', auth, authController.updateProfile)
router.delete('/me', auth, authController.deleteAccount)

module.exports = router
