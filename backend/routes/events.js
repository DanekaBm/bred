const express = require('express');
const router = express.Router();
const {
    getEvents,
    getEventById,
    createEvent,
    updateEvent,
    deleteEvent,
    likeEvent,
    addComment,
    deleteComment,
} = require('../controllers/eventController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware'); // Импортируем authorizeRoles

// Публичные маршруты (не требуют аутентификации)
router.route('/').get(getEvents);
router.route('/:id').get(getEventById);

// Защищенные маршруты (требуют аутентификации И проверки роли)

// @route   POST /api/events
// @desc    Создать новое событие (ТОЛЬКО АДМИН)
// @access  Private/Admin
router.route('/')
    .post(protect, authorizeRoles('admin'), createEvent); // <-- Добавлена проверка роли 'admin'

router.route('/:id')
    // @route   PUT /api/events/:id
    // @desc    Обновить событие по ID (ТОЛЬКО АДМИН)
    // @access  Private/Admin
    .put(protect, authorizeRoles('admin'), updateEvent) // <-- Добавлена проверка роли 'admin'
    // @route   DELETE /api/events/:id
    // @desc    Удалить событие по ID (ТОЛЬКО АДМИН)
    // @access  Private/Admin
    .delete(protect, authorizeRoles('admin'), deleteEvent); // <-- Добавлена проверка роли 'admin'

// Маршруты для лайков и комментариев (доступны всем авторизованным пользователям)
router.route('/:id/like').post(protect, likeEvent);
router.route('/:id/comment').post(protect, addComment);
router.route('/:eventId/comment/:commentId').delete(protect, deleteComment);

module.exports = router;