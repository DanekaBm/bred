// backend/server.js
const path = require('path');
const express = require('express');
const mongoose = require('mongoose'); // Используем mongoose напрямую, если connectDB нет
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const cors = require('cors');

// Импорт маршрутов
const authRoutes = require('./routes/auth.js');
const userRoutes = require('./routes/users.js');
const eventRoutes = require('./routes/events.js'); // Используем eventRoutes.js
const uploadRoutes = require('./routes/uploadRoutes.js');
const ticketRoutes = require('./routes/ticketRoutes.js'); // <-- НОВЫЙ ИМПОРТ

dotenv.config(); // Загружаем переменные окружения

const app = express();

app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Подключение к MongoDB (Если у вас connectDB в config/db.js, то используйте его)
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB подключена'))
    .catch(err => console.error('Ошибка подключения к MongoDB:', err));

// Подключение маршрутов
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/tickets', ticketRoutes); // <-- НОВЫЙ МАРШРУТ ДЛЯ БИЛЕТОВ

// Middleware для обработки ошибок (если у вас есть errorMiddleware.js, подключите его)
// app.use(errorHandler); // Если у вас есть такой middleware, раскомментируйте

const __dirname_absolute = path.resolve();
// Обслуживание статических файлов из папки 'uploads'
app.use('/uploads', express.static(path.join(__dirname_absolute, 'uploads')));

app.get('/', (req, res) => {
  res.send('API запущен и работает...');
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Сервер запущен на порту ${PORT}`));