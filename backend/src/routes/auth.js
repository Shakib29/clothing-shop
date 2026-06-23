const express = require('express');
const router = express.Router();
const { register, login, getMe, updateProfile, changePassword, forgotPassword, resetPassword } = require('../controllers/authController');
const { auth } = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.get('/me', auth, getMe);
router.put('/profile', auth, updateProfile);
router.put('/change-password', auth, changePassword);
router.post('/forgot-password', forgotPassword);
router.put('/reset-password/:token', resetPassword);

module.exports = router;
