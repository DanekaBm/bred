// backend/controllers/eventController.js
const asyncHandler = require('express-async-handler');
const Event = require('../models/Event');
const User = require('../models/User'); // Убедитесь, что эта строка есть, хотя она не используется напрямую здесь, но это хорошая практика

// @desc    Получить все события
// @route   GET /api/events
// @access  Public
const getEvents = asyncHandler(async (req, res) => {
    // Добавлен populate для 'createdBy' и 'comments.user'
    const events = await Event.find({})
        .populate('createdBy', 'name email') // Заполняет информацию о создателе события
        .populate('comments.user', 'name'); // Заполняет информацию о пользователе, оставившем комментарий
    res.json({ events });
});

// @desc    Получить событие по ID
// @route   GET /api/events/:id
// @access  Public
const getEventById = asyncHandler(async (req, res) => {
    // Добавлен populate для 'createdBy', 'likes' и 'comments.user'
    const event = await Event.findById(req.params.id)
        .populate('createdBy', 'name email') // Заполняет информацию о создателе события
        .populate('likes', 'name email')    // Заполняет информацию о пользователях, которые поставили лайк
        .populate('comments.user', 'name'); // Заполняет информацию о пользователе, оставившем комментарий

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

// @desc    Обновить событие
// @route   PUT /api/events/:id
// @access  Private (только создатель события или админ)
const updateEvent = asyncHandler(async (req, res) => {
    const { title, description, date, location, category, image, organizer } = req.body;

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
        event.image = image !== undefined ? image : event.image;
        event.organizer = organizer || event.organizer;

        const updatedEvent = await event.save();
        // Возвращаем обновленное событие с populate, чтобы фронтенд получил полные данные
        const populatedEvent = await Event.findById(updatedEvent._id)
            .populate('createdBy', 'name email')
            .populate('likes', 'name email')
            .populate('comments.user', 'name');
        res.json(populatedEvent);
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
        await Event.deleteOne({ _id: req.params.id });
        res.json({ message: 'Событие удалено' });
    } else {
        res.status(404);
        throw new Error('Событие не найдено');
    }
});

// @desc    Лайкнуть событие
// @route   POST /api/events/:id/like
// @access  Private
const likeEvent = asyncHandler(async (req, res) => {
    const event = await Event.findById(req.params.id);

    if (event) {
        // Проверяем, есть ли уже лайк от текущего пользователя
        if (event.likes.includes(req.user._id)) {
            // Если лайк есть, удаляем его
            event.likes = event.likes.filter(
                (userId) => userId.toString() !== req.user._id.toString()
            );
        } else {
            // Если лайка нет, добавляем его
            event.likes.push(req.user._id);
        }
        await event.save(); // Сохраняем изменения в событии

        // После сохранения, получаем обновленное событие с заполненными данными
        const updatedEvent = await Event.findById(req.params.id)
            .populate('createdBy', 'name email')
            .populate('likes', 'name email') // Заполняем данные пользователей, которые поставили лайк
            .populate('comments.user', 'name'); // Заполняем данные пользователей в комментариях

        // Отправляем обновленное событие фронтенду
        res.json({ message: 'Лайк обновлен', event: updatedEvent });
    } else {
        res.status(404);
        throw new Error('Событие не найдено');
    }
});

// @desc    Добавить комментарий к событию
// @route   POST /api/events/:id/comment
// @access  Private
const addComment = asyncHandler(async (req, res) => {
    const { text } = req.body;
    const event = await Event.findById(req.params.id);

    if (event) {
        const comment = {
            user: req.user._id,
            name: req.user.name, // Это поле не нужно в схеме, если вы заполняете 'user'
            text,
        };
        event.comments.push(comment);
        await event.save(); // Сохраняем новый комментарий

        // После сохранения, получаем обновленное событие с заполненными данными
        const updatedEvent = await Event.findById(req.params.id)
            .populate('createdBy', 'name email')
            .populate('likes', 'name email')
            .populate('comments.user', 'name'); // Обязательно заполните пользователя комментария

        // Отправляем все обновленное событие, чтобы фронтенд мог обновить его целиком
        res.status(201).json({ message: 'Комментарий добавлен', event: updatedEvent });
    } else {
        res.status(404);
        throw new Error('Событие не найдено');
    }
});

// @desc    Удалить комментарий к событию
// @route   DELETE /api/events/:eventId/comments/:commentId
// @access  Private (только автор комментария или админ)
const deleteComment = asyncHandler(async (req, res) => {
    const event = await Event.findById(req.params.eventId);

    if (event) {
        // Находим комментарий по ID поддокумента
        const comment = event.comments.id(req.params.commentId);

        if (!comment) {
            res.status(404);
            throw new Error('Комментарий не найден');
        }

        // Проверяем права на удаление: автор комментария или админ
        if (comment.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            res.status(403);
            throw new Error('Недостаточно прав для удаления этого комментария');
        }

        // Удаляем комментарий (для Mongoose 6+ используем deleteOne())
        comment.deleteOne();
        await event.save(); // Сохраняем событие после удаления комментария

        // После сохранения, получаем обновленное событие с заполненными данными
        const updatedEvent = await Event.findById(req.params.eventId)
            .populate('createdBy', 'name email')
            .populate('likes', 'name email')
            .populate('comments.user', 'name');

        // Отправляем обновленное событие фронтенду
        res.json({ message: 'Комментарий удален', event: updatedEvent });
    } else {
        res.status(404);
        throw new Error('Событие не найдено');
    }
});

module.exports = {
    getEvents,
    getEventById,
    createEvent,
    updateEvent,
    deleteEvent,
    likeEvent,
    addComment,
    deleteComment,
};