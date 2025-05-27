import API from '../api';

export const getUserProfile = async () => {
    try {
        const response = await API.get('/users/profile');
        return response.data;
    } catch (error) {

        throw new Error(error.response?.data?.message || 'profile_load_error');
    }
};

export const updateProfile = async (userData) => {
    try {
        const response = await API.put('/users/profile', userData);

        return response.data;
    } catch (error) {

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

        return response.data;
    } catch (error) {

        throw new Error(error.response?.data?.message || 'avatar_upload_error');
    }
};

export const updateCurrentUserPassword = async (oldPassword, newPassword) => {
    try {
        const response = await API.put('/auth/update-password', { oldPassword, newPassword });

        return response.data;
    } catch (error) {

        throw new Error(error.response?.data?.message || 'password_update_error');
    }
};