const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const path = require('path'); // ОЧЕНЬ ВАЖНО: Добавляем модуль 'path'

// Убедитесь, что эти пути точно соответствуют именам ваших файлов маршрутов (auth.js, events.js, users.js)
const authRoutes = require('./routes/auth.js');
const eventRoutes = require('./routes/events.js');
const userRoutes = require('./routes/users.js');

dotenv.config(); // Загружает переменные окружения из .env файла

const app = express();

// Middleware
app.use(express.json()); // Парсер тела запроса для JSON
app.use(cookieParser()); // Парсер куки

// Конфигурация CORS
app.use(cors({
  origin: 'http://localhost:3000', // <-- Фронтенд работает на 3000
  credentials: true, // Разрешить отправку куки (необходимо для аутентификации)
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Явно разрешенные HTTP-методы
  allowedHeaders: ['Content-Type', 'Authorization'], // Явно разрешенные заголовки запросов
}));

// ОЧЕНЬ ВАЖНО: Middleware для обслуживания статических файлов (например, аватаров)
// Все файлы в папке 'uploads' будут доступны через URL, начинающийся с '/uploads'
// Например, файл 'backend/uploads/avatars/my_avatar.jpeg' будет доступен по 'http://localhost:5001/uploads/avatars/my_avatar.jpeg'
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Подключение к базе данных MongoDB
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB подключена'))
    .catch(err => console.error('Ошибка подключения к MongoDB:', err));

// Маршруты API
app.use('/api/auth', authRoutes); // Маршруты для аутентификации (регистрация, вход, выход)
app.use('/api/events', eventRoutes); // Маршруты для управления событиями
app.use('/api/users', userRoutes); // Маршруты для управления пользователями (например, для админки)

// Базовый маршрут для проверки работы API
app.get('/', (req, res) => {
  res.send('API запущен и работает...');
});

// Запуск сервера
// Порт будет взят из переменной окружения PORT (если установлена) или по умолчанию 5001
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Сервер запущен на порту ${PORT}`));