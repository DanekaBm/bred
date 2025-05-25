import API from '../api'; // Импортируем настроенный экземпляр Axios

// Функция для получения профиля текущего пользователя
export const getUserProfile = async () => {
    try {
        // API.get уже использует baseURL из api.js (http://localhost:5001/api)
        // Поэтому здесь нужен только относительный путь /users/profile
        const response = await API.get('/users/profile');
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Ошибка загрузки профиля');
    }
};

// Функция для обновления профиля текущего пользователя
export const updateProfile = async (userData) => {
    try {
        // API.put уже использует baseURL из api.js
        // Поэтому здесь нужен только относительный путь /users/profile
        const response = await API.put('/users/profile', userData);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Ошибка обновления профиля');
    }
};

// Функция для загрузки аватара текущего пользователя
export const uploadAvatar = async (avatarFile) => {
    try {
        const formData = new FormData();
        formData.append('avatar', avatarFile); // 'avatar' - имя поля, которое ожидает Multer на бэкенде

        // API.post уже использует baseURL из api.js
        // Поэтому здесь нужен только относительный путь /users/upload-avatar
        const response = await API.post('/users/upload-avatar', formData, {
            headers: {
                'Content-Type': 'multipart/form-data', // Важно для загрузки файлов
            }
        });
        return response.data.avatarUrl; // Бэкенд должен возвращать avatarUrl
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Ошибка загрузки аватара');
    }
};

// Функция для обновления пароля текущего пользователя
// Эта функция используется в ProfilePage.js для обновления пароля авторизованного пользователя.
export const updateCurrentUserPassword = async (oldPassword, newPassword) => {
    try {
        // Маршрут для обновления пароля находится в auth.js (PUT /api/auth/update-password)
        // API.put уже использует baseURL из api.js, поэтому здесь нужен относительный путь
        const response = await API.put('/auth/update-password', { oldPassword, newPassword });
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Ошибка обновления пароля пользователя');
    }
};

// Дополнительные функции, если они есть (например, для админки)
// export const getAllUsers = async () => { ... };
// export const deleteUser = async (userId) => { ... };
