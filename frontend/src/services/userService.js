import API from '../api';

export const getUserProfile = async () => {
    try {
        const response = await API.get('/users/profile');
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Ошибка загрузки профиля');
    }
};

export const updateProfile = async (userData) => {
    try {
        const response = await API.put('/users/profile', userData);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Ошибка обновления профиля');
    }
};

export const uploadAvatar = async (avatarFile) => {
    try {
        const formData = new FormData();
        formData.append('avatar', avatarFile);

        const response = await API.post('/users/upload-avatar', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            }
        });
        return response.data.avatarUrl;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Ошибка загрузки аватара');
    }
};

export const updateCurrentUserPassword = async (oldPassword, newPassword) => {
    try {
        const response = await API.put('/auth/update-password', { oldPassword, newPassword });
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Ошибка обновления пароля пользователя');
    }
};