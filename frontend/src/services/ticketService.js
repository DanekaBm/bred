
import API from '../api';

export const getUserTickets = async () => {
    try {

        const response = await API.get('/tickets/my');
        return response.data;
    } catch (error) {

        const message = error.response?.data?.message || error.message;
        throw new Error(message);
    }
};

