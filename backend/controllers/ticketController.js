// backend/controllers/ticketController.js
const asyncHandler = require('express-async-handler'); // Если используете эту библиотеку
const Event = require('../models/Event');
const User = require('../models/User'); // Возможно, нужен для populate, но чаще достаточно req.user
const Ticket = require('../models/Ticket'); // <-- Импортируем модель Ticket

// @desc    Получить билеты текущего пользователя
// @route   GET /api/tickets/my
// @access  Private
const getUserTickets = asyncHandler(async (req, res) => {
    // req.user._id доступен благодаря middleware 'protect'
    const tickets = await Ticket.find({ user: req.user._id }) // Ищем билеты по ID пользователя
        .populate('event', 'title date location category organizer price image') // Загружаем данные события
        .sort({ purchaseDate: -1 }); // Сортируем по дате покупки (по желанию)

    res.status(200).json(tickets);
});

// @desc    Купить билеты на событие
// @route   POST /api/events/:id/buy-tickets
// @access  Private
const buyTickets = asyncHandler(async (req, res) => {
    const { id } = req.params; // ID события
    const { numberOfTickets } = req.body;

    // Проверка входных данных
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

    // Уменьшаем количество доступных билетов на событии
    event.availableTickets -= numberOfTickets;
    await event.save();

    // Создаем запись о купленном билете в базе данных Ticket
    const newTicket = await Ticket.create({
        user: req.user._id, // ID пользователя, который покупает билеты (из authMiddleware)
        event: event._id,
        quantity: numberOfTickets,
        price: event.price, // Сохраняем цену события на момент покупки
        purchaseDate: new Date(),
    });

    res.status(200).json({
        message: `Вы успешно купили ${numberOfTickets} билет(ов) на "${event.title}".`,
        event: { // Возвращаем только необходимые обновленные поля события для фронтенда
            _id: event._id,
            availableTickets: event.availableTickets,
            // Добавьте другие поля события, которые могут быть нужны на фронтенде после покупки
        },
        ticket: newTicket // Можете также вернуть созданный объект билета
    });
});

module.exports = {
    getUserTickets,
    buyTickets,
};