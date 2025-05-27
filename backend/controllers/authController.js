const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const generateToken = require('../utils/generateToken');

// @desc    Регистрация нового пользователя
// @route   POST /api/auth/register
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
    const { name, email, password } = req.body;

    const userExists = await User.findOne({ email });

    if (userExists) {
        res.status(400);
        throw new Error('User with this email already exists');
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
            message: 'Registration successful!'
        });
    } else {
        res.status(400);
        throw new Error('Invalid user data');
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
            sameSite: 'None', // <-- Это изменение сохранено
            maxAge: 30 * 24 * 60 * 60 * 1000, // 30 дней
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
        throw new Error('Invalid email or password');
    }
});

// @desc    Выход пользователя из системы / Очистка куки
// @route   POST /api/auth/logout
// @access  Private
const logoutUser = asyncHandler(async (req, res) => {
    res.cookie('token', 'none', {
        expires: new Date(Date.now() + 10 * 1000),
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'Lax', // Для logout можно оставить Lax, так как кука удаляется
    });

    res.status(200).json({ success: true, message: 'Successfully logged out' });
});

// @desc    Сброс пароля (по имени и email)
// @route   POST /api/auth/reset-password-direct
// @access  Public
const directPasswordReset = asyncHandler(async (req, res) => {
    const { email, name, newPassword } = req.body;

    if (!email || !name || !newPassword) {
        res.status(400);
        throw new Error('Please provide email, name, and new password');
    }

    const user = await User.findOne({ email, name }).select('+password');

    if (!user) {
        res.status(404);
        throw new Error('Invalid name or email.');
    }

    user.password = newPassword;
    await user.save();

    res.status(200).json({ message: 'Password successfully reset and updated.' });
});

module.exports = {
    registerUser,
    authUser,
    logoutUser,
    directPasswordReset,
};