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
} = require('../controllers/eventController');
const { protect } = require('../middleware/authMiddleware');

router.get('/featured', getFeaturedEvents);

router.route('/').get(getEvents).post(protect, createEvent);
router.route('/:id').get(getEventById).put(protect, updateEvent).delete(protect, deleteEvent);

router.post('/:id/like', protect, toggleLikeEvent);
router.post('/:id/dislike', protect, toggleDislikeEvent);
router.post('/:id/comment', protect, addComment);
router.delete('/:id/comment/:commentId', protect, deleteComment);

module.exports = router;