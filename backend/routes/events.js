// backend/routes/events.js
const express = require('express');
const router = express.Router();
const {
    getEvents,
    getEventById,
    createEvent,
    updateEvent,
    deleteEvent,
    toggleLikeEvent,
    toggleDislikeEvent, // <-- ИМПОРТИРУЕМ НОВУЮ ФУНКЦИЮ
    addComment,
    deleteComment,
    getFeaturedEvents,
} = require('../controllers/eventController');
const { protect } = require('../middleware/authMiddleware');

// НОВЫЕ ПЕРСОНАЛИЗИРОВАННЫЕ МАРШРУТЫ ДЛЯ ГЛАВНОЙ СТРАНИЦЫ (Сначала, так как они более специфичны)
router.get('/featured', getFeaturedEvents); // Получить рекомендованные (для карусели)

// Маршруты для событий (ОБЩИЕ МАРШРУТЫ - после специфичных)
router.route('/').get(getEvents).post(protect, createEvent);
router.route('/:id').get(getEventById).put(protect, updateEvent).delete(protect, deleteEvent);

// Лайки и комментарии
router.post('/:id/like', protect, toggleLikeEvent);
router.post('/:id/dislike', protect, toggleDislikeEvent); // <-- НОВЫЙ МАРШРУТ ДЛЯ ДИЗЛАЙКОВ
router.post('/:id/comment', protect, addComment);
router.delete('/:id/comment/:commentId', protect, deleteComment);

module.exports = router;