// backend/routes/eventRoutes.js (или events.js)
const express = require('express');
const router = express.Router();
const {
    getEvents,
    getEventById,
    createEvent,
    updateEvent,
    deleteEvent,
    toggleLikeEvent,
    toggleDislikeEvent,
    addComment,
    deleteComment,
    getFeaturedEvents,
    getAdminNotifications,
    sendSupportMessage // <--- Добавлено
} = require('../controllers/eventController'); // Убедитесь, что 'sendSupportMessage' экспортируется из вашего контроллера
const { protect } = require('../middleware/authMiddleware');
const { buyTickets } = require('../controllers/ticketController');
// const upload = require('../middleware/uploadMiddleware'); // <-- Эту строку нужно удалить или закомментировать, если не используется

router.get('/featured', getFeaturedEvents);

// --- ВАЖНОЕ ИЗМЕНЕНИЕ: Этот маршрут должен быть ПЕРЕД router.route('/:id') ---
router.get('/admin-notifications', protect, getAdminNotifications);

// --- НОВЫЙ МАРШРУТ ДЛЯ СООБЩЕНИЙ ПОДДЕРЖКИ ---
// Я разместил его здесь, но для лучшей организации можно вынести в supportRoutes.js
router.post('/support', protect, sendSupportMessage); // <--- Добавлено
// --- КОНЕЦ НОВОГО МАРШРУТА ---


router.route('/').get(getEvents).post(protect, createEvent);
router.route('/:id').get(getEventById).put(protect, updateEvent).delete(protect, deleteEvent);

router.post('/:id/like', protect, toggleLikeEvent);
router.post('/:id/dislike', protect, toggleDislikeEvent);
router.post('/:id/comment', protect, addComment);
router.delete('/:id/comment/:commentId', protect, deleteComment);

router.post('/:id/buy-tickets', protect, buyTickets);

module.exports = router;