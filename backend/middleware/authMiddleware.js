const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
    let token;
    if (req.cookies && req.cookies.token) {
        token = req.cookies.token;
    }
    else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        return res.status(401).json({ message: 'Не авторизован, нет токена' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        req.user = await User.findById(decoded.id).select('-password');

        if (!req.user) {
            return res.status(401).json({ message: 'Не авторизован, пользователь не найден или токен недействителен' });
        }
        next();
    } catch (error) {
        console.error("Ошибка верификации токена:", error.message); // Для отладки
        res.status(401).json({ message: 'Не авторизован, токен недействителен' });
    }
};

const authorizeRoles = (...roles) => {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return res.status(403).json({ message: `Доступ запрещен. Пользователь с ролью ${req.user ? req.user.role : 'неизвестно'} не имеет прав.` });
        }
        next();
    };
};

module.exports = { protect, authorizeRoles };