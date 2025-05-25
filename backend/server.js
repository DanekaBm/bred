// backend/server.js
const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const path = require('path'); // <--- ДОБАВЛЕНО: Импортируем модуль 'path'

// Corrected: Ensure these paths exactly match your route file names
const authRoutes = require('./routes/auth.js');
const eventRoutes = require('./routes/events.js');
const userRoutes = require('./routes/users.js');

dotenv.config();

const app = express();

// !!! ИСПРАВЛЕННЫЙ ПОРЯДОК MIDDLEWARE !!!
// Middleware должны быть в этом порядке для корректной работы с куками и CORS

// 1. Body parser for JSON - для парсинга тела запросов (почти всегда первым)
app.use(express.json());

// 2. Cookie parser - ДОЛЖЕН БЫТЬ ПЕРЕД CORS, чтобы req.cookies был доступен
app.use(cookieParser());

// 3. CORS configuration - ОЧЕНЬ ВАЖНО для кросс-доменных запросов и куки
app.use(cors({
  origin: 'http://localhost:3001', // <--- Убедитесь, что это ТОЧНЫЙ URL вашего фронтенда
  credentials: true, // Позволяет отправлять и получать куки и заголовки авторизации
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Явно разрешаем все необходимые методы
  allowedHeaders: ['Content-Type', 'Authorization'], // Явно разрешаем эти заголовки
}));

// MIDDLEWARE ДЛЯ ОТДАЧИ СТАТИЧЕСКИХ ФАЙЛОВ (АВАТАРОВ)
// Сделайте папку 'uploads' статической.
// Она будет доступна по URL /uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads'))); // <--- ДОБАВЛЕНО: Для отдачи статических файлов

// Database connection
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error(err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/users', userRoutes); // For admin user management

// Basic route for testing
app.get('/', (req, res) => {
  res.send('API is running...');
});

const PORT = process.env.PORT || 5001; // <--- Убедитесь, что backend runs on 5001
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));