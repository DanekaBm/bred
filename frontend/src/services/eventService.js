// src/services/eventService.js (Пример)
import axios from 'axios';

const API_URL = 'http://localhost:5001/api/events'; // Замените на URL вашего бэкенда

export const getEvents = async (params) => {
    // params = { page, limit, search, category, date }
    const response = await axios.get(API_URL, { params });
    return response.data; // Ожидается { events: [], pagination: {} }
};

export const getEventById = async (id) => {
    const response = await axios.get(`${API_URL}/${id}`);
    return response.data;
};

export const createEvent = async (eventData) => {
    const response = await axios.post(API_URL, eventData, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
    return response.data;
};

export const updateEvent = async (id, eventData) => {
    const response = await axios.put(`${API_URL}/${id}`, eventData, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
    return response.data;
};

export const deleteEvent = async (id) => {
    const response = await axios.delete(`${API_URL}/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
    return response.data;
};

export const likeEvent = async (eventId, userId) => {
    // В реальном приложении бэкенд будет проверять, кто лайкает
    const response = await axios.post(`${API_URL}/${eventId}/like`, { userId }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
    return response.data; // Вернуть обновленное событие с новым количеством лайков
};

export const addCommentToEvent = async (eventId, commentData) => {
    const response = await axios.post(`${API_URL}/${eventId}/comments`, commentData, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
    return response.data; // Вернуть новый комментарий или обновленное событие
};

export const getUpcomingEvents = async () => {
    const response = await axios.get(`${API_URL}/upcoming`);
    return response.data;
};

export const getMyBookings = async (userId) => {
    const response = await axios.get(`http://localhost:5000/api/bookings/user/${userId}`, { // Отдельный эндпоинт для бронирований
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
    return response.data;
};