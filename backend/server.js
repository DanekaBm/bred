
const path = require('path');
const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const cors = require('cors');

const authRoutes = require('./routes/auth.js');
const userRoutes = require('./routes/users.js');
const eventRoutes = require('./routes/events.js');
const uploadRoutes = require('./routes/uploadRoutes.js');


dotenv.config();

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

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB подключена'))
    .catch(err => console.error('Ошибка подключения к MongoDB:', err));

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/upload', uploadRoutes);

const __dirname_absolute = path.resolve();
app.use('/uploads', express.static(path.join(__dirname_absolute, 'uploads')));

app.get('/', (req, res) => {
  res.send('API запущен и работает...');
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Сервер запущен на порту ${PORT}`));