const express = require('express');
const User = require('../models/User'); // Подключаем модель пользователя
const { protect, authorizeRoles } = require('../middleware/authMiddleware'); // Подключаем middleware
const multer = require('multer'); // Для загрузки файлов
const path = require('path'); // Для работы с путями файлов

// !!! ВАЖНО: Эта строка должна быть в самом начале файла, после импортов !!!
const router = express.Router();

// @route   GET /api/users/profile
// @desc    Получить профиль текущего аутентифицированного пользователя
// @access  Private (требует JWT)
router.get('/profile', protect, (req, res) => {
    res.json(req.user); // Объект req.user содержит данные пользователя, установленные middleware 'protect'
});

// @route   PUT /api/users/profile
// @desc    Обновить профиль текущего аутентифицированного пользователя
// @access  Private
router.put('/profile', protect, async (req, res) => {
    // ВНИМАНИЕ: Пароль теперь обновляется через отдельный маршрут /api/auth/update-password
    const { name, email, avatar } = req.body; // Получаем данные для обновления (без пароля здесь)

    try {
        const user = await User.findById(req.user._id); // Находим текущего пользователя по ID из токена

        if (user) {
            // Обновляем поля, только если они предоставлены в запросе
            user.name = name || user.name;
            user.email = email || user.email;
            user.avatar = avatar || user.avatar;

            const updatedUser = await user.save(); // Сохраняем изменения

            res.json({
                _id: updatedUser._id,
                name: updatedUser.name,
                email: updatedUser.email,
                role: updatedUser.role,
                avatar: updatedUser.avatar,
            });
        } else {
            res.status(404).json({ message: 'Пользователь не найден' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Ошибка сервера' });
    }
});

// @route   GET /api/users
// @desc    Получить список всех пользователей (доступно только для админов)
// @access  Private/Admin
router.get('/', protect, authorizeRoles('admin'), async (req, res) => {
    try {
        const users = await User.find({}).select('-password'); // Находим всех пользователей, исключая пароли
        res.json(users);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Ошибка сервера' });
    }
});

// @route   DELETE /api/users/:id
// @desc    Удалить пользователя по ID (доступно только для админов)
// @access  Private/Admin
router.delete('/:id', protect, authorizeRoles('admin'), async (req, res) => {
    try {
        const user = await User.findById(req.params.id); // Находим пользователя по ID из URL

        if (user) {
            await user.deleteOne(); // Удаляем пользователя
            res.json({ message: 'Пользователь удален' });
        } else {
            res.status(404).json({ message: 'Пользователь не найден' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Ошибка сервера' });
    }
});

// Setup Multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        // Убедитесь, что эта директория существует в корне вашего проекта или скорректируйте путь
        cb(null, 'uploads/avatars/');
    },
    filename: function (req, file, cb) {
        // Генерируем уникальное имя файла на основе ID пользователя и временной метки
        cb(null, req.user._id + '-' + Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 1024 * 1024 * 5 }, // Лимит размера файла 5MB
    fileFilter: function (req, file, cb) {
        const filetypes = /jpeg|jpg|png|gif/;
        const mimetype = filetypes.test(file.mimetype);
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

        if (mimetype && extname) {
            return cb(null, true);
        }
        cb(new Error('Только изображения (jpeg, jpg, png, gif) разрешены!'));
    }
}).single('avatar'); // 'avatar' - это имя поля для файла в форме

// @route   POST /api/users/upload-avatar
// @desc    Загрузить или обновить аватар пользователя
// @access  Private
router.post('/upload-avatar', protect, (req, res) => {
    upload(req, res, async (err) => {
        if (err) {
            return res.status(400).json({ message: err.message });
        }
        if (!req.file) {
            return res.status(400).json({ message: 'Файл не выбран.' });
        }

        try {
            const user = await User.findById(req.user._id);
            if (!user) {
                return res.status(404).json({ message: 'Пользователь не найден.' });
            }

            // Формируем ПОЛНЫЙ URL аватара, включая домен и порт бэкенда
            // Это важно, чтобы фронтенд знал, куда обращаться за файлом
            // Используем process.env.PORT для динамического определения порта
            const backendBaseUrl = `http://localhost:${process.env.PORT || 5001}`;
            user.avatar = `${backendBaseUrl}/uploads/avatars/${req.file.filename}`;

            await user.save();

            res.status(200).json({
                message: 'Аватар успешно загружен и обновлен!',
                avatarUrl: user.avatar // Теперь здесь полный URL
            });

        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Ошибка сервера при загрузке аватара.' });
        }
    });
});

module.exports = router;
