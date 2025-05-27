import API from '../api';

export const getUserProfile = async () => {
    try {
        const response = await API.get('/users/profile');
        return response.data;
    } catch (error) {
        // Убедитесь, что error.response?.data?.message является ключом перевода на бэкенде
        throw new Error(error.response?.data?.message || 'profile_load_error');
    }
};

export const updateProfile = async (userData) => {
    try {
        const response = await API.put('/users/profile', userData);
        // response.data должен содержать message (ключ перевода)
        return response.data;
    } catch (error) {
        // Убедитесь, что error.response?.data?.message является ключом перевода на бэкенде
        throw new Error(error.response?.data?.message || 'profile_update_error');
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
        // <-- ИЗМЕНЕНИЕ ЗДЕСЬ: Возвращаем весь объект data, который содержит message и avatarUrl
        return response.data;
    } catch (error) {
        // Убедитесь, что error.response?.data?.message является ключом перевода на бэкенде
        throw new Error(error.response?.data?.message || 'avatar_upload_error');
    }
};

export const updateCurrentUserPassword = async (oldPassword, newPassword) => {
    try {
        const response = await API.put('/auth/update-password', { oldPassword, newPassword });
        // response.data должен содержать message (ключ перевода)
        return response.data;
    } catch (error) {
        // Убедитесь, что error.response?.data?.message является ключом перевода на бэкенде
        throw new Error(error.response?.data?.message || 'password_update_error');
    }
};