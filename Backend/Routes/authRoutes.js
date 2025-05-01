const express = require('express');
const router = express.Router();
const authController = require('../Controllers/AuthController');
const { verifyToken } = require('../Middleware/auth');
const {
  registerValidation,
  loginValidation,
  forgotPasswordValidation,
  resetPasswordValidation,
  changePasswordValidation
} = require('../Middleware/authValidation');

// Public routes
router.post('/register', registerValidation, authController.register);
router.post('/login', loginValidation, authController.login);
router.get('/verify/:token', authController.verifyEmail);
router.post('/forgot-password', forgotPasswordValidation, authController.forgotPassword);
router.post('/reset-password/:token', resetPasswordValidation, authController.resetPassword);

// Protected routes (require authentication)
router.get('/me', verifyToken, authController.getMe);
router.put('/change-password', verifyToken, changePasswordValidation, authController.changePassword);

module.exports = router;