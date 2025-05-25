// backend/utils/generateToken.js
const jwt = require('jsonwebtoken');

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRATION, // Например, '1d' для 1 дня
    });
};

module.exports = generateToken;