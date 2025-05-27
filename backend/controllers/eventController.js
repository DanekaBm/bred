// backend/controllers/eventController.js
const asyncHandler = require('express-async-handler');
const Event = require('../models/Event');
const User = require('../models/User');

const getEvents = asyncHandler(async (req, res) => {
    const events = await Event.find({})
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
    // *** ИСПРАВЛЕНО: Добавлены price и availableTickets в деструктуризацию ***
    const { title, description, date, location, category, image, organizer, price, availableTickets } = req.body;

    const event = new Event({
        title,
        description,
        date,
        location,
        category,
        image,
        organizer,
        price, // *** Добавлено
        availableTickets, // *** Добавлено
        createdBy: req.user._id
    });

    const createdEvent = await event.save();
    // Обратите внимание: populate здесь возвращает только createdBy.
    // Если вам нужно populate likes/dislikes/comments сразу после создания, добавьте их.
    const populatedEvent = await Event.findById(createdEvent._id)
        .populate('createdBy', 'name email');
    res.status(201).json(populatedEvent);
});

const updateEvent = asyncHandler(async (req, res) => {
    // *** ИСПРАВЛЕНО: Добавлены price и availableTickets в деструктуризацию ***
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
        event.price = price !== undefined ? price : event.price; // *** Добавлено: используем !== undefined для корректного сохранения 0
        event.availableTickets = availableTickets !== undefined ? availableTickets : event.availableTickets; // *** Добавлено

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