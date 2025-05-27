// backend/models/Ticket.js
const mongoose = require('mongoose');

const ticketSchema = mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'User', // Ссылка на модель User
        },
        event: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'Event', // Ссылка на модель Event
        },
        quantity: {
            type: Number,
            required: true,
            min: 1,
        },
        price: { // Цена билета на момент покупки (важно, т.к. цена события может измениться)
            type: Number,
            required: true,
            min: 0,
        },
        purchaseDate: {
            type: Date,
            default: Date.now,
        },
        // Возможно, дополнительные поля, такие как seatNumber, qrCode, etc.
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('Ticket', ticketSchema);