
const asyncHandler = require('express-async-handler');
const Event = require('../models/Event');
const User = require('../models/User');
const Notification = require('../models/notificationModel');

const getEvents = asyncHandler(async (req, res) => {

    const { priceRange, ticketsRange, category, search, page, limit, sortOrder } = req.query;

    let query = {};

    if (priceRange) {
        if (priceRange === 'upTo1000') {
            query.price = { $lte: 1000 };
        } else if (priceRange === 'over1001') {
            query.price = { $gte: 1001 };
        }
    }

    if (ticketsRange) {
        if (ticketsRange === 'upTo50') {
            query.availableTickets = { $lte: 50 };
        } else if (ticketsRange === 'over51') {
            query.availableTickets = { $gte: 51 };
        }
    }

    if (category && category !== 'all') {
        query.category = category;
    }

    if (search) {
        query.$or = [
            { title: { $regex: search, $options: 'i' } },
            { description: { $regex: search, $options: 'i' } }
        ];
    }

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 5;
    const skip = (pageNum - 1) * limitNum;

    let sort = {};
    if (sortOrder === 'desc') {
        sort.title = -1;
    } else {
        sort.title = 1;
    }

    const totalEvents = await Event.countDocuments(query);

    const events = await Event.find(query)
        .populate('createdBy', 'name email')
        .populate('comments.user', 'name')
        .populate('likes', 'name email')
        .populate('dislikes', 'name email')
        .sort(sort)
        .skip(skip)
        .limit(limitNum);

    res.json({
        events,
        totalEvents,
        currentPage: pageNum,
        totalPages: Math.ceil(totalEvents / limitNum),
    });
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
    const user = req.user;

    if (!event) {
        res.status(404);
        throw new Error('Event not found');
    }

    const userId = user._id;
    let notificationType;

    if (event.likes.includes(userId)) {

        event.likes = event.likes.filter((id) => id.toString() !== userId.toString());
        notificationType = 'like_removed';
    } else {

        event.likes.push(userId);
        event.dislikes = event.dislikes.filter((id) => id.toString() !== userId.toString());
        notificationType = 'new_like';
    }
    await event.save();


    await Notification.create({
        user: userId,
        type: notificationType,
        title: '',
        message: '',
        read: false,
        relatedEntity: {
            id: event._id,
            type: 'Event',
            eventTitle: event.title,
            userName: user.name,
            userEmail: user.email,
        },
    });

    const updatedEvent = await Event.findById(req.params.id)
        .populate('createdBy', 'name email')
        .populate('likes', 'name email')
        .populate('dislikes', 'name email')
        .populate('comments.user', 'name');

    res.json({ message: 'Like updated', event: updatedEvent });
});

const toggleDislikeEvent = asyncHandler(async (req, res) => {
    console.log('toggleDislikeEvent: Запрос получен!', 'Event ID:', req.params.id, 'User ID:', req.user?._id);

    const event = await Event.findById(req.params.id);
    const user = req.user;

    if (!event) {
        res.status(404);
        throw new Error('Event not found');
    }

    const userId = user._id;
    let notificationType;

    if (event.dislikes.includes(userId)) {

        event.dislikes = event.dislikes.filter(
            (id) => id.toString() !== userId.toString()
        );
        notificationType = 'dislike_removed';
    } else {

        event.dislikes.push(userId);
        event.likes = event.likes.filter(
            (id) => id.toString() !== userId.toString()
        );
        notificationType = 'new_dislike';
    }
    await event.save();

    await Notification.create({
        user: userId,
        type: notificationType,
        title: '',
        message: '',
        read: false,
        relatedEntity: {
            id: event._id,
            type: 'Event',
            eventTitle: event.title,
            userName: user.name,
            userEmail: user.email,
        },
    });

    const updatedEvent = await Event.findById(req.params.id)
        .populate('createdBy', 'name email')
        .populate('likes', 'name email')
        .populate('dislikes', 'name email')
        .populate('comments.user', 'name');

    res.json({ message: 'Dislike updated', event: updatedEvent });
});


const addComment = asyncHandler(async (req, res) => {
    const { text } = req.body;
    const event = await Event.findById(req.params.id);
    const user = req.user;

    if (!event) {
        res.status(404);
        throw new Error('Event not found');
    }

    const comment = {
        user: user._id,
        name: user.name,
        text,
    };
    event.comments.push(comment);
    await event.save();

    await Notification.create({
        user: user._id,
        type: 'new_comment',
        title: '',
        message: '',
        read: false,
        relatedEntity: {
            id: event._id,
            type: 'Event',
            eventTitle: event.title,
            userName: user.name,
            userEmail: user.email,
            commentText: text,
        },
    });

    const updatedEvent = await Event.findById(req.params.id)
        .populate('createdBy', 'name email')
        .populate('likes', 'name email')
        .populate('dislikes', 'name email')
        .populate('comments.user', 'name');

    res.status(201).json({ message: 'Comment added', event: updatedEvent });
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

    const notifications = await Notification.find({})
        .populate('user', 'name email')
        .sort({ createdAt: -1 });

    res.json(notifications);
});

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

    event.availableTickets -= numberOfTickets;

    await event.save();

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


const sendSupportMessage = asyncHandler(async (req, res) => {
    const { subject, message } = req.body;
    const user = req.user;

    if (!subject || !message) {
        res.status(400);
        throw new Error('Please add a subject and message');
    }

    const newNotification = await Notification.create({
        user: user._id,
        type: 'support_message',
        title: '',
        message: '',
        read: false,
        relatedEntity: {
            id: user._id,
            type: 'SupportMessage',
            userName: user.name,
            userEmail: user.email,
            supportSubject: subject,
            supportMessage: message,
        },
    });

    res.status(200).json({
        message: 'Support message sent successfully',
        notification: newNotification,
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
    buyTickets,
    sendSupportMessage,
};