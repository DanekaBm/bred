// backend/models/notificationModel.js
const mongoose = require('mongoose');

const notificationSchema = mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User', // Ссылка на модель User
            required: false, // Может быть null, если сообщение анонимное
        },
        type: {
            type: String,
            required: true,
            enum: [
                'support_message',
                'new_event_created',
                'ticket_sold',
                'other_notification',
                'new_like',     // <-- НОВОЕ: Уведомление о новом лайке
                'like_removed', // <-- НОВОЕ: Уведомление об удалении лайка
                'new_comment'   // <-- НОВОЕ: Уведомление о новом комментарии
            ], // Типы уведомлений
        },
        title: {
            type: String,
            required: true,
        },
        message: {
            type: String,
            required: true,
        },
        read: {
            type: Boolean,
            default: false,
        },
        relatedEntity: { // Опционально: если уведомление относится к конкретному событию, заказу и т.д.
            id: {
                type: mongoose.Schema.Types.ObjectId,
                required: false,
            },
            type: {
                type: String,
                required: false,
                enum: ['Event', 'Booking', 'User'], // Типы сущностей
            },
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('Notification', notificationSchema);