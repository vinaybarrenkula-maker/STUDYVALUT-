const express = require('express');
const router = express.Router();
const { signup, login, getMe, logout, googleLogin, verifyEmail } = require('../controllers/authController');
const verifyToken = require('../middleware/auth');

router.post('/signup', signup);
router.post('/login', login);
router.post('/google', googleLogin);
router.get('/verify/:token', verifyEmail);
router.get('/me', verifyToken, getMe);

router.post('/logout', verifyToken, logout);

module.exports = router;
