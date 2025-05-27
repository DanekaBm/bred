import axios from 'axios';
import API from '../api'; // Убедитесь, что ваш API инстанс корректно импортирован

const EVENTS_API_URL = '/events';
const UPLOAD_API_URL = '/upload';

export const getEvents = async (params) => {
    // Axios автоматически добавит `params` как query string к URL.
    // Теперь `params` может содержать: page, limit, searchTerm, sortOrder, priceRange, ticketsRange.
    const response = await API.get(EVENTS_API_URL, { params });
    // Предполагаем, что бэкенд вернет объект вида: { events: [...], totalEvents: N }
    return response.data;
};

export const getEventById = async (id) => {
    const response = await API.get(`${EVENTS_API_URL}/${id}`);
    return response.data;
};

export const createEvent = async (eventData) => {
    const response = await API.post(EVENTS_API_URL, eventData);
    return response.data;
};

export const updateEvent = async (id, eventData) => {
    const response = await API.put(`${EVENTS_API_URL}/${id}`, eventData);
    return response.data;
};

export const deleteEvent = async (id) => {
    const response = await API.delete(`${EVENTS_API_URL}/${id}`);
    return response.data;
};

export const likeEvent = async (eventId) => {
    const response = await API.post(`${EVENTS_API_URL}/${eventId}/like`);
    return response.data;
};

export const addCommentToEvent = async (eventId, commentData) => {
    const response = await API.post(`${EVENTS_API_URL}/${eventId}/comment`, commentData);
    return response.data;
};

export const uploadEventImage = async (file) => {
    const formData = new FormData();
    formData.append('image', file);

    try {
        const config = {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        };
        const { data } = await API.post(UPLOAD_API_URL, formData, config);
        return data.imageUrl;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Ошибка загрузки изображения события');
    }
};

export const getUpcomingEvents = async () => {
    const response = await API.get(`${EVENTS_API_URL}/upcoming`);
    return response.data;
};

export const getMyBookings = async (userId) => {
    const response = await axios.get(`http://localhost:5001/api/bookings/user/${userId}`, {
        withCredentials: true,
    });
    return response.data;
};

export const getAdminNotifications = async () => {
    try {
        const response = await API.get(`${EVENTS_API_URL}/admin-notifications`);
        return response.data;
    } catch (error) {
        console.error('Error fetching admin notifications:', error);
        throw error.response?.data?.message || error.message;
    }
};