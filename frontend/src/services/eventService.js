// src/services/eventService.js
import axios from 'axios';

// ИСПОЛЬЗУЙТЕ API, который уже настроен с withCredentials: true
// Это позволит Axios автоматически отправлять куки с токеном.
// Если у вас нет такого API, я его предположу.
// Если у вас есть frontend/src/api.js, то импортируйте его.
// Если нет, то я создам базовый Axios instance здесь.

// Предполагаем, что у вас есть frontend/src/api.js
// Если нет, то используйте следующий закомментированный блок
import API from '../api'; // Предполагаемый импорт настроенного Axios instance


// const API = axios.create({
//     baseURL: 'http://localhost:5001/api', // Убедитесь, что это правильный URL вашего бэкенда
//     withCredentials: true, // Это критически важно для отправки куки
// });


const EVENTS_API_URL = '/events'; // Относительный путь, так как API уже имеет baseURL
const UPLOAD_API_URL = '/upload'; // Отдельный маршрут для загрузки

export const getEvents = async (params) => {
    const response = await API.get(EVENTS_API_URL, { params });
    // Бэкенд возвращает { events: [], page: ..., pages: ..., total: ... }
    return response.data;
};

export const getEventById = async (id) => {
    const response = await API.get(`${EVENTS_API_URL}/${id}`);
    return response.data;
};

export const createEvent = async (eventData) => {
    // API (настроенный с withCredentials: true) автоматически отправит куки.
    // Больше не нужно вручную добавлять заголовок Authorization, если JWT в куках.
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

export const likeEvent = async (eventId) => { // userId обычно не нужен на фронтенде, бэкенд берет его из токена
    const response = await API.post(`${EVENTS_API_URL}/${eventId}/like`);
    return response.data; // Вернуть обновленное событие с новым количеством лайков
};

export const addCommentToEvent = async (eventId, commentData) => {
    // commentData должен содержать { text: "ваш комментарий" }
    const response = await API.post(`${EVENTS_API_URL}/${eventId}/comment`, commentData); // Ваш маршрут /:id/comment
    return response.data; // Вернуть новый комментарий или обновленное событие
};

// Функция для загрузки изображения события
export const uploadEventImage = async (file) => {
    const formData = new FormData();
    formData.append('image', file); // 'image' должно совпадать с именем поля в Multer (upload.single('image'))

    try {
        const config = {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        };
        // Используем API, который настроен с withCredentials
        const { data } = await API.post(UPLOAD_API_URL, formData, config);
        return data.imageUrl; // Возвращаем URL загруженного изображения
    } catch (error) {
        // Пробрасываем ошибку, чтобы компонент мог ее обработать
        throw new Error(error.response?.data?.message || 'Ошибка загрузки изображения события');
    }
};

// ===========================================================================
// ВНИМАНИЕ: Следующие функции были в вашем примере, но их маршруты/логика
// не соответствуют предоставленному бэкенду или не были предоставлены.
// Я оставляю их как есть, но имейте в виду, что они могут требовать доработки.
// ===========================================================================

export const getUpcomingEvents = async () => {
    // У вас нет маршрута /api/events/upcoming на бэкенде.
    // Если вам нужны предстоящие события, вам нужно будет добавить этот маршрут на бэкенде.
    // Возможно, вам нужно будет добавить параметры к getEvents: getEvents({ date: { $gte: new Date() } })
    const response = await API.get(`${EVENTS_API_URL}/upcoming`); // Убедитесь, что этот маршрут существует
    return response.data;
};

export const getMyBookings = async (userId) => {
    // Этот маршрут указывает на localhost:5000 и uses localStorage token.
    // Вам нужно будет убедиться, что ваш бэкенд бронирований запущен на 5000
    // и что он также настроен на использование куки для аутентификации.
    // Или используйте тот же API-инстанс (API), если он относится к тому же домену/порту.
    // Если бронирования на другом сервере, то нужен отдельный axios.create instance для него.
    const response = await axios.get(`http://localhost:5000/api/bookings/user/${userId}`, {
        withCredentials: true, // Предполагаем, что бэкенд на 5000 тоже использует куки
    });
    return response.data;
};