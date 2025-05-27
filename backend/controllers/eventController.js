// backend/controllers/eventController.js
const asyncHandler = require('express-async-handler');
const Event = require('../models/Event');
const User = require('../models/User');

const getEvents = asyncHandler(async (req, res) => {
    // Получаем параметры фильтрации из req.query
    const { priceRange, ticketsRange, category, search } = req.query;

    let query = {}; // Объект для формирования запроса к базе данных

    // Фильтрация по цене
    if (priceRange) {
        if (priceRange === 'upTo1000') {
            query.price = { $lte: 1000 }; // Цена меньше или равна 1000
        } else if (priceRange === 'over1001') {
            query.price = { $gte: 1001 }; // Цена больше или равна 1001
        }
    }

    // Фильтрация по количеству билетов
    if (ticketsRange) {
        if (ticketsRange === 'upTo50') {
            query.availableTickets = { $lte: 50 }; // Билетов меньше или равно 50
        } else if (ticketsRange === 'over51') {
            query.availableTickets = { $gte: 51 }; // Билетов больше или равно 51
        }
    }

    // Фильтрация по категории (если уже есть или планируется)
    if (category && category !== 'all') {
        query.category = category;
    }

    // Поиск по названию или описанию
    if (search) {
        // Используем $regex для поиска подстроки и $options: 'i' для регистронезависимого поиска
        query.$or = [
            { title: { $regex: search, $options: 'i' } },
            { description: { $regex: search, $options: 'i' } }
        ];
    }


    const events = await Event.find(query) // Используем сформированный query
        .populate('createdBy', 'name email')
        .populate('comments.user', 'name')
        .populate('likes', 'name email')
        .populate('dislikes', 'name email');

    res.json(events);
});

const getEventById = asyncHandler(async (req, res) => {
    const event = await Event.findById(req.params.id)
        .populate('createdBy', 'name email')
        .populate('likes', 'name email')
        .populate('dislikes', 'name email')
        .populate('comments.user', 'name');

    if (event) {
        res.json(event);
    } else {
        res.status(404);
        throw new Error('Event not found');
    }
});

const createEvent = asyncHandler(async (req, res) => {
    const { title, description, date, location, category, image, organizer, price, availableTickets } = req.body;

    const event = new Event({
        title,
        description,
        date,
        location,
        category,
        image,
        organizer,
        price,
        availableTickets,
        createdBy: req.user._id
    });

    const createdEvent = await event.save();
    const populatedEvent = await Event.findById(createdEvent._id)
        .populate('createdBy', 'name email');
    res.status(201).json(populatedEvent);
});

const updateEvent = asyncHandler(async (req, res) => {
    const { title, description, date, location, category, image, organizer, price, availableTickets } = req.body;

    const event = await Event.findById(req.params.id);

    if (event) {
        if (event.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            res.status(403);
            throw new Error('Unauthorized to update this event');
        }

        event.title = title || event.title;
        event.description = description || event.description;
        event.date = date || event.date;
        event.location = location || event.location;
        event.category = category || event.category;
        event.image = image !== undefined ? image : event.image;
        event.organizer = organizer || event.organizer;
        event.price = price !== undefined ? price : event.price;
        event.availableTickets = availableTickets !== undefined ? availableTickets : event.availableTickets;

        const updatedEvent = await event.save();
        const populatedEvent = await Event.findById(updatedEvent._id)
            .populate('createdBy', 'name email')
            .populate('likes', 'name email')
            .populate('dislikes', 'name email')
            .populate('comments.user', 'name');
        res.json(populatedEvent);
    } else {
        res.status(404);
        throw new Error('Event not found');
    }
});

const deleteEvent = asyncHandler(async (req, res) => {
    const event = await Event.findById(req.params.id);

    if (event) {
        if (event.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            res.status(403);
            throw new Error('Unauthorized to delete this event');
        }
        await Event.deleteOne({ _id: req.params.id });
        res.json({ message: 'Event removed' });
    } else {
        res.status(404);
        throw new Error('Event not found');
    }
});

const toggleLikeEvent = asyncHandler(async (req, res) => {
    console.log('toggleLikeEvent: Запрос получен!', 'Event ID:', req.params.id, 'User ID:', req.user?._id);

    const event = await Event.findById(req.params.id);

    if (event) {
        const userId = req.user._id;

        if (event.likes.includes(userId)) {
            event.likes = event.likes.filter(
                (id) => id.toString() !== userId.toString()
            );
        } else {
            event.likes.push(userId);
            event.dislikes = event.dislikes.filter(
                (id) => id.toString() !== userId.toString()
            );
        }
        await event.save();

        const updatedEvent = await Event.findById(req.params.id)
            .populate('createdBy', 'name email')
            .populate('likes', 'name email')
            .populate('dislikes', 'name email')
            .populate('comments.user', 'name');

        res.json({ message: 'Like updated', event: updatedEvent });
    } else {
        res.status(404);
        throw new Error('Event not found');
    }
});

const toggleDislikeEvent = asyncHandler(async (req, res) => {
    console.log('toggleDislikeEvent: Запрос получен!', 'Event ID:', req.params.id, 'User ID:', req.user?._id);

    const event = await Event.findById(req.params.id);

    if (event) {
        const userId = req.user._id;

        if (event.dislikes.includes(userId)) {
            event.dislikes = event.dislikes.filter(
                (id) => id.toString() !== userId.toString()
            );
        } else {
            event.dislikes.push(userId);
            event.likes = event.likes.filter(
                (id) => id.toString() !== userId.toString()
            );
        }
        await event.save();

        const updatedEvent = await Event.findById(req.params.id)
            .populate('createdBy', 'name email')
            .populate('likes', 'name email')
            .populate('dislikes', 'name email')
            .populate('comments.user', 'name');

        res.json({ message: 'Dislike updated', event: updatedEvent });
    } else {
        res.status(404);
        throw new Error('Event not found');
    }
});


const addComment = asyncHandler(async (req, res) => {
    const { text } = req.body;
    const event = await Event.findById(req.params.id);

    if (event) {
        const comment = {
            user: req.user._id,
            name: req.user.name,
            text,
        };
        event.comments.push(comment);
        await event.save();

        const updatedEvent = await Event.findById(req.params.id)
            .populate('createdBy', 'name email')
            .populate('likes', 'name email')
            .populate('dislikes', 'name email')
            .populate('comments.user', 'name');

        res.status(201).json({ message: 'Comment added', event: updatedEvent });
    } else {
        res.status(404);
        throw new Error('Event not found');
    }
});

const deleteComment = asyncHandler(async (req, res) => {
    const event = await Event.findById(req.params.id);

    if (event) {
        const comment = event.comments.id(req.params.commentId);

        if (!comment) {
            res.status(404);
            throw new Error('Comment not found');
        }

        if (comment.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            res.status(403);
            throw new Error('Unauthorized to delete this comment');
        }

        comment.deleteOne();
        await event.save();

        const updatedEvent = await Event.findById(req.params.id)
            .populate('createdBy', 'name email')
            .populate('likes', 'name email')
            .populate('dislikes', 'name email')
            .populate('comments.user', 'name');

        res.json({ message: 'Comment removed', event: updatedEvent });
    } else {
        res.status(404);
        throw new Error('Event not found');
    }
});

const getFeaturedEvents = asyncHandler(async (req, res) => {
    const allEvents = await Event.find({})
        .populate('createdBy', 'name email')
        .populate('likes', 'name email')
        .populate('dislikes', 'name email');
    const featured = allEvents.sort(() => 0.5 - Math.random()).slice(0, 3);
    res.json(featured);
});

const getAdminNotifications = asyncHandler(async (req, res) => {
    if (req.user.role !== 'admin') {
        res.status(403);
        throw new Error('Not authorized to view admin notifications');
    }

    const adminEvents = await Event.find({ createdBy: req.user._id })
        .populate('likes', 'name email')
        .populate('dislikes', 'name email')
        .populate('comments.user', 'name email')
        .select('title likes dislikes comments');

    let notifications = [];

    adminEvents.forEach(event => {
        if (event.likes && Array.isArray(event.likes)) {
            event.likes.forEach(likeUser => {
                if (likeUser && likeUser.name) {
                    notifications.push({
                        type: 'like',
                        eventId: event._id,
                        eventTitle: event.title,
                        user: {
                            _id: likeUser._id,
                            name: likeUser.name,
                            email: likeUser.email
                        },
                        createdAt: event.createdAt || new Date(),
                        message: `${likeUser.name} liked your event "${event.title}"`
                    });
                }
            });
        }


        if (event.dislikes && Array.isArray(event.dislikes)) {
            event.dislikes.forEach(dislikeUser => {
                if (dislikeUser && dislikeUser.name) {
                    notifications.push({
                        type: 'dislike',
                        eventId: event._id,
                        eventTitle: event.title,
                        user: {
                            _id: dislikeUser._id,
                            name: dislikeUser.name,
                            email: dislikeUser.email
                        },
                        createdAt: event.createdAt || new Date(),
                        message: `${dislikeUser.name} disliked your event "${event.title}"`
                    });
                }
            });
        }


        if (event.comments && Array.isArray(event.comments)) {
            event.comments.forEach(comment => {
                if (comment.user && comment.user._id && comment.user._id.toString() !== req.user._id.toString()) {
                    notifications.push({
                        type: 'comment',
                        eventId: event._id,
                        eventTitle: event.title,
                        user: {
                            _id: comment.user._id,
                            name: comment.user.name,
                            email: comment.user.email
                        },
                        text: comment.text,
                        createdAt: comment.createdAt,
                        message: `${comment.user.name} commented on your event "${event.title}": "${comment.text}"`
                    });
                }
            });
        }
    });

    notifications.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.json(notifications);
});


// Новый контроллер для покупки билетов
const buyTickets = asyncHandler(async (req, res) => {
    const { eventId } = req.params;
    const { numberOfTickets } = req.body;
    const userId = req.user._id;

    if (!numberOfTickets || numberOfTickets <= 0) {
        res.status(400);
        throw new Error('Количество билетов должно быть больше 0');
    }

    const event = await Event.findById(eventId);

    if (!event) {
        res.status(404);
        throw new Error('Событие не найдено');
    }

    if (event.availableTickets < numberOfTickets) {
        res.status(400);
        throw new Error('Недостаточно билетов в наличии');
    }

    // Уменьшаем количество доступных билетов
    event.availableTickets -= numberOfTickets;

    // TODO: Здесь можно добавить логику записи покупки в коллекцию Booking,
    // если у вас есть такая. Например:
    // const booking = new Booking({
    //     user: userId,
    //     event: eventId,
    //     numberOfTickets,
    //     totalPrice: event.price * numberOfTickets,
    // });
    // await booking.save();

    await event.save();

    // Отправляем обновленное событие
    const updatedEvent = await Event.findById(eventId)
        .populate('createdBy', 'name email')
        .populate('likes', 'name email')
        .populate('dislikes', 'name email')
        .populate('comments.user', 'name');

    res.json({
        message: `Успешно куплено ${numberOfTickets} билетов на событие "${event.title}"!`,
        event: updatedEvent
    });
});


module.exports = {
    getEvents,
    getEventById,
    createEvent,
    updateEvent,
    deleteEvent,
    toggleLikeEvent,
    toggleDislikeEvent,
    addComment,
    deleteComment,
    getFeaturedEvents,
    getAdminNotifications,
    buyTickets, // Экспортируем новый контроллер
};