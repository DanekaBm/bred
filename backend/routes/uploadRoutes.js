// backend/routes/uploadRoutes.js
const path = require('path');
const express = require('express');
const multer = require('multer');

const router = express.Router();

// Настройка хранилища для multer
const storage = multer.diskStorage({
    destination(req, file, cb) {
        cb(null, 'uploads/'); // Указываем папку 'uploads/' в корне проекта бэкенда
    },
    filename(req, file, cb) {
        // Формируем уникальное имя файла: fieldname-timestamp.расширение
        // ЭТОТ БЛОК ИСПРАВЛЕН: УБЕДИТЕСЬ, ЧТО НЕТ HTML-ТЕГОВ ИЛИ ЭКРАНИРОВАННЫХ СИМВОЛОВ
        cb(
            null,
            `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`
        );
    },
});

// Определение, какие файлы разрешены для загрузки
function checkFileType(file, cb) {
    const filetypes = /jpeg|jpg|png|gif/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);

    if (extname && mimetype) {
        return cb(null, true);
    } else {
        cb('Только изображения!');
    }
}

// Инициализация multer с настройками
const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // Ограничение размера файла (например, 5 МБ)
    fileFilter: function (req, file, cb) {
        checkFileType(file, cb);
    },
});

// Маршрут для загрузки одного файла
router.post('/', upload.single('image'), (req, res) => {
    if (req.file) {
        res.send({
            message: 'Изображение успешно загружено',
            imageUrl: `/uploads/${req.file.filename}`, // Путь, который будет храниться в БД
        });
    } else {
        res.status(400).send('Ошибка загрузки файла');
    }
});

module.exports = router;