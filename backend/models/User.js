// backend/models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto'); // Модуль Node.js для генерации токенов

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
        select: false // Не возвращаем пароль по умолчанию при запросах
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    },
    avatar: {
        type: String
    },
    // Новые поля для сброса пароля
    resetPasswordToken: String,
    resetPasswordExpire: Date,
}, {
    timestamps: true
});

UserSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

UserSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

// Метод для генерации токена сброса пароля
UserSchema.methods.getResetPasswordToken = function () {
    // Генерируем случайный токен
    const resetToken = crypto.randomBytes(20).toString('hex');

    // Хешируем токен и сохраняем его в схему
    this.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    // Устанавливаем срок действия токена (например, 10 минут)
    this.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 минут

    return resetToken; // Возвращаем нехешированный токен для отправки по email
};

module.exports = mongoose.model('User', UserSchema);