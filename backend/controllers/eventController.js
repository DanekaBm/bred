// backend/controllers/eventController.js
const asyncHandler = require('express-async-handler');
const Event = require('../models/Event');
const User = require('../models/User'); // Может понадобиться для работы с пользователями, хотя не используется напрямую в этих функциях

// @desc Получить все события
// @route GET /api/events
// @access Public
const getEvents = asyncHandler(async (req, res) => {
    // Добавлен populate для 'createdBy', 'comments.user', 'likes', 'dislikes'
    const events = await Event.find({})
        .populate('createdBy', 'name email') // Заполняет информацию о создателе события
        .populate('comments.user', 'name') // Заполняет информацию о пользователе, оставившем комментарий
        .populate('likes', 'name email') // Заполняет информацию о пользователях, которые поставили лайк
        .populate('dislikes', 'name email'); // Заполняет информацию о пользователях, которые поставили дизлайк

    // Возвращаем массив событий напрямую, не объект { events: [] }
    res.json(events);
});

// @desc Получить событие по ID
// @route GET /api/events/:id
// @access Public
const getEventById = asyncHandler(async (req, res) => {
    // Добавлен populate для 'createdBy', 'likes', 'dislikes' и 'comments.user'
    const event = await Event.findById(req.params.id)
        .populate('createdBy', 'name email') // Заполняет информацию о создателе события
        .populate('likes', 'name email') // Заполняет информацию о пользователях, которые поставили лайк
        .populate('dislikes', 'name email') // Заполняет информацию о пользователях, которые поставили дизлайк
        .populate('comments.user', 'name'); // Заполняет информацию о пользователе, оставившем комментарий

    if (event) {
        res.json(event);
    } else {
        res.status(404);
        throw new Error('Event not found');
    }
});

// @desc Создать новое событие
// @route POST /api/events
// @access Private (требует JWT)
const createEvent = asyncHandler(async (req, res) => {
    const { title, description, date, location, category, image, organizer } = req.body;

    const event = new Event({
        title,
        description,
        date,
        location,
        category,
        image,
        organizer,
        createdBy: req.user._id
    });

    const createdEvent = await event.save();
    // Возвращаем созданное событие, заполняя создателя, чтобы фронтенд получил полное имя
    const populatedEvent = await Event.findById(createdEvent._id)
        .populate('createdBy', 'name email');
    res.status(201).json(populatedEvent);
});

// @desc Обновить событие
// @route PUT /api/events/:id
// @access Private (только создатель события или админ)
const updateEvent = asyncHandler(async (req, res) => {
    const { title, description, date, location, category, image, organizer } = req.body;

    const event = await Event.findById(req.params.id);

    if (event) {
        // Проверка прав доступа: только создатель или админ
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

        const updatedEvent = await event.save();
        // Возвращаем обновленное событие с populate, чтобы фронтенд получил полные данные
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

// @desc Удалить событие
// @route DELETE /api/events/:id
// @access Private (только создатель события или админ)
const deleteEvent = asyncHandler(async (req, res) => {
    const event = await Event.findById(req.params.id);

    if (event) {
        // Проверка прав доступа: только создатель или админ
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

// @desc Лайкнуть событие
// @route POST /api/events/:id/like
// @access Private
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

// @desc Дизлайкнуть событие
// @route POST /api/events/:id/dislike
// @access Private
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


// @desc Добавить комментарий к событию
// @route POST /api/events/:id/comment
// @access Private
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

// @desc Удалить комментарий к событию
// @route DELETE /api/events/:eventId/comments/:commentId
// @access Private (только автор комментария или админ)
const deleteComment = asyncHandler(async (req, res) => {
    // --- ИЗМЕНЕНО: req.params.eventId на req.params.id ---
    const event = await Event.findById(req.params.id); // <-- ИЗМЕНЕНО
    // --- КОНЕЦ ИЗМЕНЕНИЙ ---

    if (event) {
        const comment = event.comments.id(req.params.commentId);

        if (!comment) {
            res.status(404);
            throw new Error('Comment not found'); // Исправлена опечатка 'new new Error' на 'new Error'
        }

        // Проверка прав доступа: только автор комментария или админ
        if (comment.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            res.status(403);
            throw new Error('Unauthorized to delete this comment');
        }

        comment.deleteOne(); // Корректный метод для удаления элемента поддокумента
        await event.save();

        // --- ИЗМЕНЕНО: req.params.eventId на req.params.id ---
        const updatedEvent = await Event.findById(req.params.id) // <-- ИЗМЕНЕНО
            .populate('createdBy', 'name email')
            .populate('likes', 'name email')
            .populate('dislikes', 'name email')
            .populate('comments.user', 'name');
        // --- КОНЕЦ ИЗМЕНЕНИЙ ---

        res.json({ message: 'Comment removed', event: updatedEvent });
    } else {
        res.status(404);
        throw new Error('Event not found');
    }
});

// @desc Получить рекомендованные события
// @route GET /api/events/featured
// @access Public
const getFeaturedEvents = asyncHandler(async (req, res) => {
    const allEvents = await Event.find({})
        .populate('createdBy', 'name email')
        .populate('likes', 'name email')
        .populate('dislikes', 'name email');
    // Получаем 3 случайных события
    const featured = allEvents.sort(() => 0.5 - Math.random()).slice(0, 3);
    res.json(featured);
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
};