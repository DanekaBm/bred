// frontend/src/services/ticketService.js
import API from '../api'; // Убедитесь, что путь к API правильный

// Функция для получения билетов текущего пользователя
export const getUserTickets = async () => {
    try {
        // Используем маршрут, который будет реализован на бэкенде
        const response = await API.get('/tickets/my');
        return response.data;
    } catch (error) {
        // Передаем сообщение об ошибке для более детального вывода
        const message = error.response?.data?.message || error.message;
        throw new Error(message);
    }
};

// Если у вас будут другие операции с билетами (например, отмена билета),
// то вы добавите их здесь.