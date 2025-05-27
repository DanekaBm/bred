
const mongoose = require('mongoose');

const notificationSchema = mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: false,
        },
        type: {
            type: String,
            required: true,
            enum: [
                'support_message',
                'new_event_created',
                'ticket_sold',
                'other_notification',
                'new_like',
                'like_removed',
                'new_comment' 
            ],
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
        relatedEntity: {
            id: {
                type: mongoose.Schema.Types.ObjectId,
                required: false,
            },
            type: {
                type: String,
                required: false,
                enum: ['Event', 'Booking', 'User'],
            },
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('Notification', notificationSchema);