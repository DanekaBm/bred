// backend/controllers/eventController.js
const asyncHandler = require('express-async-handler');
const Event = require('../models/Event');
const User = require('../models/User');

// @desc    Получить все события
// @route   GET /api/events
// @access  Public
const getEvents = asyncHandler(async (req, res) => {
    // Параметры для пагинации
    const pageSize = parseInt(req.query.limit) || 10;
    const page = parseInt(req.query.page) || 1;

    // Параметры для поиска по ключевому слову (title, description, location, category)
    const keyword = req.query.keyword ? {
        $or: [
            { title: { $regex: req.query.keyword, $options: 'i' } },
            { description: { $regex: req.query.keyword, $options: 'i' } },
            { location: { $regex: req.query.keyword, $options: 'i' } },
            { category: { $regex: req.query.keyword, $options: 'i' } },
        ]
    } : {};

    // Параметры для фильтрации по категории (если не используется keyword)
    const categoryFilter = req.query.category && !req.query.keyword ? { category: req.query.category } : {};

    // Параметры для сортировки
    const sort = req.query.sort || 'createdAt';
    const order = req.query.order === 'asc' ? 1 : -1;

    const count = await Event.countDocuments({ ...keyword, ...categoryFilter });
    const events = await Event.find({ ...keyword, ...categoryFilter })
        .populate('createdBy', 'name email')
        .populate('comments.user', 'name')
        .sort({ [sort]: order })
        .limit(pageSize)
        .skip(pageSize * (page - 1));

    res.json({
        events,
        page,
        pages: Math.ceil(count / pageSize),
        total: count
    });
});

// @desc    Получить событие по ID
// @route   GET /api/events/:id
// @access  Public
const getEventById = asyncHandler(async (req, res) => {
    const event = await Event.findById(req.params.id)
        .populate('createdBy', 'name email')
        .populate('likes', 'name')
        .populate('comments.user', 'name');

    if (event) {
        res.json(event);
    } else {
        res.status(404);
        throw new Error('Событие не найдено');
    }
});

// @desc    Создать новое событие
// @route   POST /api/events
// @access  Private (требует JWT)
const createEvent = asyncHandler(async (req, res) => {
    const { title, description, date, location, category } = req.body;

    const event = new Event({
        title,
        description,
        date,
        location,
        category,
        createdBy: req.user._id
    });

    const createdEvent = await event.save();
    res.status(201).json(createdEvent);
});

// @desc    Обновить событие
// @route   PUT /api/events/:id
// @access  Private (только создатель события или админ)
const updateEvent = asyncHandler(async (req, res) => {
    const { title, description, date, location, category } = req.body;

    const event = await Event.findById(req.params.id);

    if (event) {
        if (event.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            res.status(403);
            throw new Error('Недостаточно прав для обновления этого события');
        }

        event.title = title || event.title;
        event.description = description || event.description;
        event.date = date || event.date;
        event.location = location || event.location;
        event.category = category || event.category;

        const updatedEvent = await event.save();
        res.json(updatedEvent);
    } else {
        res.status(404);
        throw new Error('Событие не найдено');
    }
});

// @desc    Удалить событие
// @route   DELETE /api/events/:id
// @access  Private (только создатель события или админ)
const deleteEvent = asyncHandler(async (req, res) => {
    const event = await Event.findById(req.params.id);

    if (event) {
        if (event.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            res.status(403);
            throw new Error('Недостаточно прав для удаления этого события');
        }

        await event.deleteOne();
        res.json({ message: 'Событие удалено' });
    } else {
        res.status(404);
        throw new Error('Событие не найдено');
    }
});

// @desc    Поставить/убрать лайк событию
// @route   POST /api/events/:id/like
// @access  Private
const likeEvent = asyncHandler(async (req, res) => {
    const event = await Event.findById(req.params.id);
    if (!event) {
        res.status(404);
        throw new Error('Событие не найдено');
    }

    const userId = req.user._id;
    const hasLiked = event.likes.includes(userId);

    if (hasLiked) {
        event.likes = event.likes.filter(id => id.toString() !== userId.toString());
    } else {
        event.likes.push(userId);
    }

    await event.save();
    res.json({ message: 'Лайк обновлен', likes: event.likes });
});

// @desc    Добавить комментарий к событию
// @route   POST /api/events/:id/comment
// @access  Private
const addComment = asyncHandler(async (req, res) => {
    const { text } = req.body;
    if (!text || text.trim() === '') {
        res.status(400);
        throw new Error('Текст комментария не может быть пустым');
    }

    const event = await Event.findById(req.params.id);
    if (!event) {
        res.status(404);
        throw new Error('Событие не найдено');
    }

    const newComment = {
        user: req.user._id,
        text: text,
    };

    event.comments.push(newComment);
    await event.save();

    const updatedEvent = await Event.findById(req.params.id)
        .populate('comments.user', 'name');

    const lastComment = updatedEvent.comments[updatedEvent.comments.length - 1];

    res.status(201).json({ message: 'Комментарий добавлен', comment: lastComment });
});

// @desc    Удалить комментарий к событию
// @route   DELETE /api/events/:eventId/comment/:commentId
// @access  Private (только автор комментария или админ)
const deleteComment = asyncHandler(async (req, res) => {
    const { eventId, commentId } = req.params;

    const event = await Event.findById(eventId);

    if (!event) {
        res.status(404);
        throw new Error('Событие не найдено');
    }

    // Находим комментарий по ID
    const comment = event.comments.id(commentId);

    if (!comment) {
        res.status(404);
        throw new Error('Комментарий не найден');
    }

    // Проверяем, является ли текущий пользователь автором комментария или администратором
    if (comment.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        res.status(403);
        throw new Error('Недостаточно прав для удаления этого комментария');
    }

    // Удаляем комментарий из массива
    comment.deleteOne(); // Используем deleteOne() для вложенного документа
    await event.save();

    res.json({ message: 'Комментарий удален' });
});


module.exports = {
    getEvents,
    getEventById,
    createEvent,
    updateEvent,
    deleteEvent,
    likeEvent,
    addComment,
    deleteComment, // Экспортируем новую функцию
};