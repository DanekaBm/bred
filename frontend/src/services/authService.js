import axios from 'axios';

const API_URL = 'http://localhost:5000/api/auth';

export const loginUser = async (email, password) => {
    const response = await axios.post(`${API_URL}/login`, { email, password });
    return response.data;
};

export const registerUser = async (email, password, name) => {
    const response = await axios.post(`${API_URL}/register`, { email, password, name });
    return response.data;
};

export const resetPassword = async (email) => {
    const response = await axios.post(`${API_URL}/reset-password`, { email });
    return response.data;
};

export const updateUserPassword = async (oldPassword, newPassword) => {
    const response = await axios.put(`${API_URL}/update-password`, { oldPassword, newPassword }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
    return response.data;
};