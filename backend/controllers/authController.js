// backend/controllers/authController.js
const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const generateToken = require('../utils/generateToken');

// @desc    Регистрация пользователя
// @route   POST /api/auth/register
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
    const { name, email, password } = req.body;

    const userExists = await User.findOne({ email });

    if (userExists) {
        res.status(400);
        throw new Error('Пользователь с таким email уже существует');
    }

    const user = await User.create({
        name,
        email,
        password,
    });

    if (user) {
        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            avatar: user.avatar,
            message: 'Регистрация успешна!'
        });
    } else {
        res.status(400);
        throw new Error('Неверные данные пользователя');
    }
});

// @desc    Аутентификация пользователя и получение токена
// @route   POST /api/auth/login
// @access  Public
const authUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');

    if (user && (await user.matchPassword(password))) {
        const token = generateToken(user._id);

        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'Lax',
            maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
        })
            .json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                avatar: user.avatar,
            });
    } else {
        res.status(401);
        throw new Error('Неверный email или пароль');
    }
});


// @desc    Получить профиль пользователя
// @route   GET /api/auth/profile
// @access  Private
const getUserProfile = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);

    if (user) {
        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            avatar: user.avatar,
        });
    } else {
        res.status(404);
        throw new Error('Пользователь не найден');
    }
});

// @desc    Обновить профиль пользователя
// @route   PUT /api/auth/profile
// @access  Private
const updateUserProfile = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);

    if (user) {
        user.name = req.body.name || user.name;
        user.email = req.body.email || user.email;

        if (req.body.password) {
            user.password = req.body.password;
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

// @desc    Обновить пароль пользователя (для авторизованного пользователя)
// @route   PUT /api/auth/update-password
// @access  Private
const updatePassword = asyncHandler(async (req, res) => {
    const { oldPassword, newPassword } = req.body;

    const user = await User.findById(req.user._id).select('+password');

    if (!user) {
        res.status(404);
        throw new Error('Пользователь не найден');
    }

    if (!(await user.matchPassword(oldPassword))) {
        res.status(401);
        throw new Error('Старый пароль неверный');
    }

    user.password = newPassword;
    await user.save();

    res.json({ message: 'Пароль успешно обновлен' });
});

// @desc    Прямой сброс пароля по имени и email
// @route   POST /api/auth/direct-reset-password
// @access  Public
const directPasswordReset = asyncHandler(async (req, res) => {
    const { email, name, newPassword } = req.body;

    if (!email || !name || !newPassword) {
        res.status(400);
        throw new Error('Пожалуйста, укажите email, имя и новый пароль');
    }

    // Ищем пользователя по email И имени
    const user = await User.findOne({ email, name }).select('+password');

    if (!user) {
        res.status(404);
        throw new Error('Неверные имя или email.');
    }

    // Устанавливаем новый пароль (хеширование произойдет в pre-save хуке)
    user.password = newPassword;
    await user.save();

    res.status(200).json({ message: 'Пароль успешно сброшен и обновлен.' });
});

// @desc    Выход пользователя / Очистка куки
// @route   POST /api/auth/logout
// @access  Private (или Public, если хотите, чтобы пользователь мог выйти даже без валидного токена)
const logoutUser = asyncHandler(async (req, res) => {
    res.cookie('token', 'none', { // Устанавливаем куку со значением 'none'
        expires: new Date(Date.now() + 10 * 1000), // Кука истекает через 10 секунд
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'Lax',
    });

    res.status(200).json({ success: true, message: 'Вы успешно вышли из системы' });
});


module.exports = {
    registerUser,
    authUser,
    getUserProfile,
    updateUserProfile,
    updatePassword,
    directPasswordReset,
    logoutUser, // <--- ДОБАВЛЕНО: Экспортируем новую функцию
};