// backend/routes/events.js
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
    deleteComment, // Импортируем новую функцию
} = require('../controllers/eventController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

// Публичные маршруты (не требуют аутентификации)
router.route('/').get(getEvents);
router.route('/:id').get(getEventById);

// Защищенные маршруты (требуют аутентификации)
router.route('/')
    .post(protect, createEvent);

router.route('/:id')
    .put(protect, updateEvent)
    .delete(protect, deleteEvent);

// Маршруты для лайков и комментариев
router.route('/:id/like').post(protect, likeEvent);
router.route('/:id/comment').post(protect, addComment);
// Новый маршрут для удаления комментария
router.route('/:eventId/comment/:commentId').delete(protect, deleteComment);

module.exports = router;