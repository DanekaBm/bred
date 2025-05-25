// backend/routes/auth.js
const express = require('express');
const router = express.Router();
const {
    registerUser,
    authUser,
    getUserProfile,
    updateUserProfile,
    updatePassword,
    directPasswordReset,
    logoutUser, // <--- ДОБАВЛЕНО: Импортируем logoutUser
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

// Публичные маршруты
router.post('/register', registerUser);
router.post('/login', authUser);
router.post('/direct-reset-password', directPasswordReset);

// Добавьте маршрут для выхода
router.post('/logout', logoutUser); // <--- ДОБАВЛЕНО: Маршрут для выхода

// Защищенные маршруты (требуют аутентификации)
router.route('/profile')
    .get(protect, getUserProfile)
    .put(protect, updateUserProfile);

router.put('/update-password', protect, updatePassword);

module.exports = router;