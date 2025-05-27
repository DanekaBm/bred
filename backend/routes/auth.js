const express = require('express');
const router = express.Router();
const { registerUser, authUser, logoutUser, directPasswordReset } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.post('/register', registerUser);
router.post('/login', authUser);
router.post('/logout', protect, logoutUser);
router.post('/forgot-password', directPasswordReset);

module.exports = router;