// backend/routes/uploadRoutes.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { protect } = require('../middleware/authMiddleware'); // Если загрузка только для авторизованных

// Настройка хранилища для Multer
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        // Убедитесь, что папка 'uploads' существует в корне вашего бэкенда
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});

// Фильтр файлов (опционально)
const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Разрешены только файлы изображений!'), false);
    }
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: { fileSize: 1024 * 1024 * 5 } // 5MB
});

// Маршрут для загрузки изображения
// Здесь, если это отдельный маршрут для загрузки, который вызывается из services/eventService.js
router.post('/', protect, upload.single('image'), (req, res) => {
    if (req.file) {
        // Возвращаем путь к изображению, который будет сохранен в MongoDB
        // Например: /uploads/image-16789012345.jpg
        res.json({ imageUrl: `/uploads/${req.file.filename}` });
    } else {
        res.status(400).json({ message: 'Нет файла для загрузки.' });
    }
});

module.exports = router;