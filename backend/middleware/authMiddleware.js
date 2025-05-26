const jwt = require('jsonwebtoken');
const User = require('../models/User'); // Подключаем модель пользователя

// Middleware для защиты маршрутов (проверка JWT)
const protect = async (req, res, next) => {
    let token;

    // 1. ПРИОРИТЕТ: Проверяем токен в HTTP-куках
    // req.cookies будет доступен, если cookieParser() используется в server.js
    if (req.cookies && req.cookies.token) {
        token = req.cookies.token;
    }
    // 2. ВТОРИЧНО: Проверяем токен в заголовке Authorization (для обратной совместимости или других типов запросов)
    else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }

    // Если токена нет нигде
    if (!token) {
        return res.status(401).json({ message: 'Не авторизован, нет токена' });
    }

    try {
        // Верифицируем токен с использованием секретного ключа
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Находим пользователя по ID, извлеченному из токена, и исключаем пароль
        // Примечание: req.user будет содержать только ID и роль, если они были в токене
        // Для получения полной информации о пользователе из БД:
        req.user = await User.findById(decoded.id).select('-password');

        // Если пользователь не найден, токен недействителен (или ID в токене не соответствует пользователю)
        if (!req.user) {
            return res.status(401).json({ message: 'Не авторизован, пользователь не найден или токен недействителен' });
        }
        next(); // Если токен валиден и пользователь найден, передаем управление следующему middleware
    } catch (error) {
        // Ошибка верификации токена (неверный токен, истек срок действия и т.д.)
        console.error("Ошибка верификации токена:", error.message); // Для отладки
        res.status(401).json({ message: 'Не авторизован, токен недействителен' });
    }
};

// Middleware для проверки роли пользователя
const authorizeRoles = (...roles) => {
    return (req, res, next) => {
        // req.user должен быть установлен middleware 'protect'
        if (!req.user || !roles.includes(req.user.role)) {
            // 403 Forbidden - доступ запрещен
            return res.status(403).json({ message: `Доступ запрещен. Пользователь с ролью ${req.user ? req.user.role : 'неизвестно'} не имеет прав.` });
        }
        next(); // Если роль пользователя разрешена, передаем управление дальше
    };
};

module.exports = { protect, authorizeRoles };