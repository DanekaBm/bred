
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import API from '../../api';

export const fetchUserTickets = createAsyncThunk(
    'tickets/fetchUserTickets',
    async (_, { rejectWithValue }) => {
        try {


            const response = await API.get('/tickets/my');
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || error.message);
        }
    }
);

const ticketsSlice = createSlice({
    name: 'tickets',
    initialState: {
        userTickets: [],
        status: 'idle',
        error: null,
    },
    reducers: {

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