// backend/models/Event.js
const mongoose = require('mongoose');

// Отдельная схема для комментариев для лучшей организации
const commentSchema = mongoose.Schema(
    {
        user: { // Кто оставил комментарий
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'User', // Ссылка на модель User
        },
        text: { // Текст комментария
            type: String,
            required: true,
        },
    },
    {
        timestamps: true, // Добавляет createdAt и updatedAt для комментария
    }
);

const eventSchema = mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true, // Обрезает пробелы в начале/конце строки
        },
        description: {
            type: String,
            required: true,
            trim: true,
        },
        date: {
            type: Date,
            required: true,
        },
        location: {
            type: String,
            required: true,
            trim: true,
        },
        category: {
            type: String,
            required: true,
            trim: true,
        },
        createdBy: { // Кто создал событие
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'User',
        },
        likes: [ // Массив ID пользователей, которые лайкнули событие
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
            },
        ],
        comments: [commentSchema], // Массив комментариев, используем вложенную схему
    },
    {
        timestamps: true, // Добавляет createdAt и updatedAt для самого события
    }
);

module.exports = mongoose.model('Event', eventSchema);