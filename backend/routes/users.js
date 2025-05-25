const express = require('express');
const router = express.Router();
const { protect, authorizeRoles } = require('../middleware/authMiddleware');
const {
    getUserProfile,
    updateUserProfile,
    updatePassword, // Возможно, это должно быть в authController, но пока оставим здесь, если у вас так
    getAllUsers,
    deleteUser,
    uploadAvatar // <--- ДОБАВЛЕНО: Импорт функции для загрузки аватара
} = require('../controllers/userController'); // Все функции контроллера импортируются отсюда

// @route   GET /api/users/profile
// @desc    Получить профиль текущего аутентифицированного пользователя
// @access  Private (требует JWT)
router.get('/profile', protect, getUserProfile); // Используем функцию из контроллера

// @route   PUT /api/users/profile
// @desc    Обновить профиль текущего аутентифицированного пользователя
// @access  Private
router.put('/profile', protect, updateUserProfile); // Используем функцию из контроллера

// @route   POST /api/users/upload-avatar
// @desc    Загрузить или обновить аватар пользователя
// @access  Private
router.post('/upload-avatar', protect, uploadAvatar); // <--- Используем функцию из контроллера

// Примечание: Обычно это относится к аутентификации, но если вы хотите, чтобы это было здесь, ок.
// Если в authController.js есть аналогичная функция, уберите её отсюда.
router.put('/update-password', protect, updatePassword);

// Admin-only routes
// @route   GET /api/users
// @desc    Получить список всех пользователей (доступно только для админов)
// @access  Private/Admin
router.get('/', protect, authorizeRoles('admin'), getAllUsers); // Используем функцию из контроллера

// @route   DELETE /api/users/:id
// @desc    Удалить пользователя по ID (доступно только для админов)
// @access  Private/Admin
router.delete('/:id', protect, authorizeRoles('admin'), deleteUser); // Используем функцию из контроллера

module.exports = router;