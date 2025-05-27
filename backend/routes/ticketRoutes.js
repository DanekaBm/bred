
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { getUserTickets } = require('../controllers/ticketController');

router.get('/my', protect, getUserTickets);

module.exports = router;