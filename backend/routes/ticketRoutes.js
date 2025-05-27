// backend/routes/ticketRoutes.js
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware'); // Middleware для защиты маршрута
const { getUserTickets } = require('../controllers/ticketController'); // Импортируем контроллер

// Маршрут для получения всех билетов текущего авторизованного пользователя
router.get('/my', protect, getUserTickets);

module.exports = router;