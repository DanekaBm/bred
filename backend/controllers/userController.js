const asyncHandler = require('express-async-handler');
const User = require('../models/User');
// const Event = require('../models/Event'); // Возможно, Event model использовался и для уведомлений, но обычно он нужен для событий
// Если Event model используется только для событий, а не для уведомлений, то его можно оставить, если нет - удалить.
// Я оставляю Event, так как в вашем прошлом коде он импортировался и использовался для getUserEvents и getLikedEvents.
const Event = require('../models/Event');
const bcrypt = require('bcryptjs');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// @desc    Получить профиль текущего аутентифицированного пользователя
// @route   GET /api/users/profile
// @access  Private (требует JWT в куках)
const getUserProfile = asyncHandler(async (req, res) => {
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
    const { name, email } = req.body;

    const user = await User.findById(req.user._id);

    if (user) {
        user.name = name || user.name;
        user.email = email || user.email;

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
            message: 'Профиль успешно обновлен'
        });
    } else {
        res.status(404);
        throw new Error('Пользователь не найден');
    }
});

// @desc    Обновить пароль пользователя (уже авторизованного)
// @route   PUT /api/users/update-password
// @access  Private
const updatePassword = asyncHandler(async (req, res) => {
    const { oldPassword, newPassword } = req.body;

    const user = await User.findById(req.user._id).select('+password');

    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }

    if (!(await user.matchPassword(oldPassword))) {
        res.status(401);
        throw new Error('Old password is incorrect');
    }

    user.password = newPassword;
    await user.save();

    res.json({ message: 'Пароль успешно обновлен!' });
});

// @desc    Получить всех пользователей (только для админа)
// @route   GET /api/users
// @access  Private/Admin
const getAllUsers = asyncHandler(async (req, res) => {
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
        user.role = req.body.role || user.role;

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
        if (req.user._id.toString() === user._id.toString()) {
            res.status(400);
            throw new Error('Вы не можете удалить свой собственный аккаунт через эту панель.');
        }

        if (user.avatar) {
            const avatarPath = path.join(__dirname, '..', 'uploads', 'avatars', path.basename(user.avatar));
            if (fs.existsSync(avatarPath)) {
                fs.unlinkSync(avatarPath);
                console.log(`Old avatar ${avatarPath} deleted.`);
            }
        }

        await user.deleteOne();
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
}).single('avatar');

// @desc    Загрузить или обновить аватар пользователя
// @route   POST /api/users/upload-avatar
// @access  Private
const uploadAvatar = asyncHandler(async (req, res) => {
    upload(req, res, async (err) => {
        if (err) {
            if (err instanceof multer.MulterError) {
                return res.status(400).json({ message: `Ошибка загрузки: ${err.message}` });
            }
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

            if (user.avatar) {
                const oldAvatarFilename = path.basename(user.avatar);
                const oldAvatarPath = path.join(__dirname, '..', 'uploads', 'avatars', oldAvatarFilename);
                if (fs.existsSync(oldAvatarPath)) {
                    fs.unlinkSync(oldAvatarPath);
                    console.log(`Old avatar ${oldAvatarPath} deleted.`);
                }
            }

            const backendBaseUrl = `http://localhost:${process.env.PORT || 5001}`;
            user.avatar = `${backendBaseUrl}/uploads/avatars/${req.file.filename}`;

            await user.save();

            res.status(200).json({
                message: 'Аватар успешно загружен и обновлен!',
                avatarUrl: user.avatar
            });

        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Ошибка сервера при загрузке аватара.' });
        }
    });
});

// @desc    Получить события, созданные определенным пользователем
// @route   GET /api/users/:userId/events
// @access  Private (только для авторизованных пользователей)
const getUserEvents = asyncHandler(async (req, res) => {
    if (req.user.id !== req.params.userId && req.user.role !== 'admin') {
        res.status(403);
        throw new Error('Not authorized to view these events');
    }
    const userEvents = await Event.find({ createdBy: req.params.userId }).populate('createdBy', 'name email');
    res.json(userEvents);
});

// @desc    Получить события, которые лайкнул определенный пользователь
// @route   GET /api/users/:userId/liked-events
// @access  Private (только для авторизованных пользователей)
const getLikedEvents = asyncHandler(async (req, res) => {
    if (req.user.id !== req.params.userId && req.user.role !== 'admin') {
        res.status(403);
        throw new Error('Not authorized to view liked events');
    }

    const likedEvents = await Event.find({ likes: req.params.userId }).populate('createdBy', 'name email');
    res.json(likedEvents);
});

module.exports = {
    getUserProfile,
    updateUserProfile,
    updatePassword,
    getAllUsers,
    getUserById,
    updateUser,
    deleteUser,
    uploadAvatar,
    getUserEvents,
    getLikedEvents,
};