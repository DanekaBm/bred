// frontend/src/store/slices/ticketsSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import API from '../../api'; // Убедитесь, что путь к API правильный

// Thunk для получения билетов текущего пользователя
export const fetchUserTickets = createAsyncThunk(
    'tickets/fetchUserTickets',
    async (_, { rejectWithValue }) => {
        try {
            // Предполагаем, что бэкенд имеет маршрут GET /api/tickets/my
            // и он защищен, чтобы только авторизованный пользователь мог получить свои билеты.
            const response = await API.get('/tickets/my');
            return response.data; // Ожидаем массив объектов билетов
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || error.message);
        }
    }
);

const ticketsSlice = createSlice({
    name: 'tickets',
    initialState: {
        userTickets: [],
        status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
        error: null,
    },
    reducers: {
        // Здесь можно добавить синхронные редьюсеры, если нужны, например, для очистки билетов
        clearUserTickets: (state) => {
            state.userTickets = [];
            state.status = 'idle';
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchUserTickets.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(fetchUserTickets.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.userTickets = action.payload;
            })
            .addCase(fetchUserTickets.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
                state.userTickets = [];
            });
    },
});

export const { clearUserTickets } = ticketsSlice.actions;

export default ticketsSlice.reducer;