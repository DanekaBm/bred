// backend/models/Event.js
const mongoose = require('mongoose');

const eventSchema = mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true,
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
        image: {
            type: String, // Хранит относительный URL (например, /uploads/my_image.jpg)
            default: '',
        },
        organizer: {
            type: String,
            required: true,
            trim: true,
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'User',
        },
        likes: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
            },
        ],
        dislikes: [ // <-- НОВОЕ ПОЛЕ ДЛЯ ДИЗЛАЙКОВ
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
            },
        ],
        comments: [
            {
                user: {
                    type: mongoose.Schema.Types.ObjectId,
                    required: true,
                    ref: 'User',
                },
                name: {
                    type: String,
                    required: true,
                },
                text: {
                    type: String,
                    required: true,
                },
                createdAt: {
                    type: Date,
                    default: Date.now,
                },
            },
        ],
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('Event', eventSchema);