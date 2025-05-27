
const asyncHandler = require('express-async-handler');
const Event = require('../models/Event');
const User = require('../models/User');
const Ticket = require('../models/Ticket');



const getUserTickets = asyncHandler(async (req, res) => {

    const tickets = await Ticket.find({ user: req.user._id })
        .populate('event', 'title date location category organizer price image')
        .sort({ purchaseDate: -1 });

    res.status(200).json(tickets);
});



const buyTickets = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { numberOfTickets } = req.body;

    if (!numberOfTickets || typeof numberOfTickets !== 'number' || numberOfTickets <= 0) {
        res.status(400);
        throw new Error('Пожалуйста, укажите допустимое количество билетов (целое число больше 0).');
    }

    const event = await Event.findById(id);

    if (!event) {
        res.status(404);
        throw new Error('Событие не найдено.');
    }

    if (event.availableTickets < numberOfTickets) {
        res.status(400);
        throw new Error(`Недостаточно билетов в наличии. Доступно: ${event.availableTickets}.`);
    }

    event.availableTickets -= numberOfTickets;
    await event.save();

    const newTicket = await Ticket.create({
        user: req.user._id,
        event: event._id,
        quantity: numberOfTickets,
        price: event.price,
        purchaseDate: new Date(),
    });

    res.status(200).json({
        message: `Вы успешно купили ${numberOfTickets} билет(ов) на "${event.title}".`,
        event: {
            _id: event._id,
            availableTickets: event.availableTickets,

        },
        ticket: newTicket
    });
});

module.exports = {
    getUserTickets,
    buyTickets,
};