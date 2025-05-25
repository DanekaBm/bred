const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const bcrypt = require('bcryptjs'); // Нужен, если updatePassword здесь
const multer = require('multer'); // Для загрузки файлов
const path = require('path'); // Для работы с путями файлов
const fs = require('fs'); // Для работы с файловой системой (удаление старых аватаров)

// @desc    Получить профиль текущего аутентифицированного пользователя
// @route   GET /api/users/profile
// @access  Private (требует JWT)
const getUserProfile = asyncHandler(async (req, res) => {
    // req.user уже содержит данные пользователя из middleware 'protect'
    res.json({
        _id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,
        avatar: req.user.avatar,
    });
});

// @desc    Обновить профиль текущего аутентифицированного пользователя
// @route   PUT /api/users/profile
// @access  Private
const updateUserProfile = asyncHandler(async (req, res) => {
    const { name, email } = req.body; // Avatar обновляется через отдельный маршрут

    const user = await User.findById(req.user._id);

    if (user) {
        user.name = name || user.name;
        user.email = email || user.email;

        // Проверка на уникальность email, если он меняется
        if (email && email !== user.email) {
            const emailExists = await User.findOne({ email });
            if (emailExists && emailExists._id.toString() !== user._id.toString()) {
                res.status(400);
                throw new Error('Пользователь с таким email уже существует');
            }
        }

        const updatedUser = await user.save();

        res.json({
            _id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            role: updatedUser.role,
            avatar: updatedUser.avatar,
        });
    } else {
        res.status(404);
        throw new Error('Пользователь не найден');
    }
});

// @desc    Обновить пароль пользователя
// @route   PUT /api/users/update-password
// @access  Private
const updatePassword = asyncHandler(async (req, res) => {
    const { oldPassword, newPassword, confirmNewPassword } = req.body;

    if (!oldPassword || !newPassword || !confirmNewPassword) {
        res.status(400);
        throw new Error('Пожалуйста, заполните все поля.');
    }

    if (newPassword !== confirmNewPassword) {
        res.status(400);
        throw new Error('Новый пароль и подтверждение не совпадают.');
    }

    const user = await User.findById(req.user._id);

    if (user && (await user.matchPassword(oldPassword))) {
        user.password = newPassword; // Mongoose прехеширует пароль при сохранении
        await user.save();
        res.json({ message: 'Пароль успешно обновлен!' });
    } else {
        res.status(401);
        throw new Error('Неверный старый пароль.');
    }
});

// @desc    Получить всех пользователей (только для админа)
// @route   GET /api/users
// @access  Private/Admin
const getAllUsers = asyncHandler(async (req, res) => {
    // Включаем поля для отображения на фронтенде, исключая чувствительные данные
    const users = await User.find({}).select('_id name email role avatar');
    res.json(users);
});

// @desc    Получить пользователя по ID (только для админа)
// @route   GET /api/users/:id
// @access  Private/Admin
const getUserById = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id).select('-password');
    if (user) {
        res.json(user);
    } else {
        res.status(404);
        throw new Error('Пользователь не найден');
    }
});

// @desc    Обновить пользователя (только для админа)
// @route   PUT /api/users/:id
// @access  Private/Admin
const updateUser = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);

    if (user) {
        user.name = req.body.name || user.name;
        user.email = req.body.email || user.email;
        user.role = req.body.role || user.role; // Позволяем админу обновлять роль

        const updatedUser = await user.save();

        res.json({
            _id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            role: updatedUser.role,
            avatar: updatedUser.avatar,
            message: 'Пользователь успешно обновлен'
        });
    } else {
        res.status(404);
        throw new Error('Пользователь не найден');
    }
});

// @desc    Удалить пользователя (только для админа)
// @route   DELETE /api/users/:id
// @access  Private/Admin
const deleteUser = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);

    if (user) {
        // Защита: админ не может удалить сам себя через эту панель
        if (req.user._id.toString() === user._id.toString()) {
            res.status(400);
            throw new Error('Вы не можете удалить свой собственный аккаунт через эту панель.');
        }

        // Если у пользователя был аватар, удаляем старый файл аватара
        if (user.avatar) {
            const avatarPath = path.join(__dirname, '..', 'uploads', 'avatars', path.basename(user.avatar));
            if (fs.existsSync(avatarPath)) {
                fs.unlinkSync(avatarPath);
                console.log(`Old avatar ${avatarPath} deleted.`);
            }
        }

        await user.deleteOne(); // Используйте .deleteOne() для Mongoose 6+
        res.json({ message: 'Пользователь удален' });
    } else {
        res.status(404);
        throw new Error('Пользователь не найден');
    }
});

// === ЛОГИКА ЗАГРУЗКИ АВАТАРА ===
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = path.join(__dirname, '..', 'uploads', 'avatars');
        // Создаем директорию, если она не существует
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
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

// @desc    Загрузить или обновить аватар пользователя
// @route   POST /api/users/upload-avatar
// @access  Private
const uploadAvatar = asyncHandler(async (req, res) => {
    upload(req, res, async (err) => {
        if (err) {
            // Multer ошибки
            if (err instanceof multer.MulterError) {
                return res.status(400).json({ message: `Ошибка загрузки: ${err.message}` });
            }
            // Другие ошибки
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

            // Если у пользователя уже был аватар, удаляем старый файл
            if (user.avatar) {
                const oldAvatarFilename = path.basename(user.avatar);
                const oldAvatarPath = path.join(__dirname, '..', 'uploads', 'avatars', oldAvatarFilename);
                if (fs.existsSync(oldAvatarPath)) {
                    fs.unlinkSync(oldAvatarPath);
                    console.log(`Old avatar ${oldAvatarPath} deleted.`);
                }
            }

            // Формируем ПОЛНЫЙ URL аватара
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


module.exports = {
    getUserProfile,
    updateUserProfile,
    updatePassword, // Возможно, это должно быть в authController, но пока оставим здесь
    getAllUsers,
    getUserById,
    updateUser,
    deleteUser,
    uploadAvatar // <--- ЭКСПОРТИРУЕМ ФУНКЦИЮ ЗАГРУЗКИ АВАТАРА
};