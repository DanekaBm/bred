// frontend/src/redux/slices/eventsSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import API from '../../api'; // Ваш axios инстанс

// Async Thunks for API calls
export const fetchAllEvents = createAsyncThunk(
    'events/fetchAllEvents',
    async (_, { rejectWithValue }) => {
        try {
            const response = await API.get('/events');
            return response.data;
        } catch (error) {
            // Используйте optional chaining для error.response, чтобы избежать ошибок,
            // если response или data отсутствует.
            return rejectWithValue(error.response?.data?.message || error.message);
        }
    }
);

export const fetchEventById = createAsyncThunk(
    'events/fetchEventById',
    async (id, { rejectWithValue }) => {
        try {
            const response = await API.get(`/events/${id}`);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || error.message);
        }
    }
);

export const createEvent = createAsyncThunk(
    'events/createEvent',
    async (eventData, { rejectWithValue }) => { // Убрал getState
        try {
            // Убрал config и Authorization header. Axios с withCredentials: true
            // будет автоматически отправлять куки.
            const response = await API.post('/events', eventData);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || error.message);
        }
    }
);

export const updateEvent = createAsyncThunk(
    'events/updateEvent',
    async ({ id, eventData }, { rejectWithValue }) => { // Убрал getState
        try {
            // Убрал config и Authorization header.
            const response = await API.put(`/events/${id}`, eventData);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || error.message);
        }
    }
);

export const deleteEvent = createAsyncThunk(
    'events/deleteEvent',
    async (id, { rejectWithValue }) => { // Убрал getState
        try {
            // Убрал config и Authorization header.
            await API.delete(`/events/${id}`);
            return id;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || error.message);
        }
    }
);

export const toggleLikeEvent = createAsyncThunk(
    'events/toggleLikeEvent',
    async (eventId, { rejectWithValue }) => { // Убрал getState
        try {
            // Убрал config и Authorization header.
            const response = await API.post(`/events/${eventId}/like`); // Пустой объект {} для body убрал, если бэкенд его не ожидает.
            return response.data.event;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || error.message);
        }
    }
);

export const toggleDislikeEvent = createAsyncThunk(
    'events/toggleDislikeEvent',
    async (eventId, { rejectWithValue }) => { // Убрал getState
        try {
            // Убрал config и Authorization header.
            const response = await API.post(`/events/${eventId}/dislike`); // Пустой объект {} для body убрал, если бэкенд его не ожидает.
            return response.data.event;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || error.message);
        }
    }
);


export const addEventComment = createAsyncThunk(
    'events/addEventComment',
    async ({ eventId, text }, { rejectWithValue }) => { // Убрал getState
        try {
            // Убрал config и Authorization header.
            const response = await API.post(`/events/${eventId}/comment`, { text });
            return response.data.event;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || error.message);
        }
    }
);

export const deleteEventComment = createAsyncThunk(
    'events/deleteEventComment',
    async ({ eventId, commentId }, { rejectWithValue }) => { // Убрал getState
        try {
            // Убрал config и Authorization header.
            const response = await API.delete(`/events/${eventId}/comment/${commentId}`);
            return response.data.event;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || error.message);
        }
    }
);


const eventsSlice = createSlice({
    name: 'events',
    initialState: {
        allEvents: [],
        currentEvent: null,
        status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
        error: null,
    },
    reducers: {
        // Add any synchronous reducers here if needed
    },
    extraReducers: (builder) => {
        builder
            // Fetch All Events
            .addCase(fetchAllEvents.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchAllEvents.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.allEvents = action.payload;
            })
            .addCase(fetchAllEvents.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
                state.allEvents = [];
            })
            // Fetch Event By ID
            .addCase(fetchEventById.pending, (state) => {
                state.status = 'loading';
                state.currentEvent = null;
            })
            .addCase(fetchEventById.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.currentEvent = action.payload;
            })
            .addCase(fetchEventById.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
                state.currentEvent = null;
            })
            // Create Event
            .addCase(createEvent.fulfilled, (state, action) => {
                state.allEvents.push(action.payload);
            })
            // Update Event
            .addCase(updateEvent.fulfilled, (state, action) => {
                const index = state.allEvents.findIndex(event => event._id === action.payload._id);
                if (index !== -1) {
                    state.allEvents[index] = action.payload;
                }
                if (state.currentEvent && state.currentEvent._id === action.payload._id) {
                    state.currentEvent = action.payload;
                }
            })
            // Delete Event
            .addCase(deleteEvent.fulfilled, (state, action) => {
                state.allEvents = state.allEvents.filter(event => event._id !== action.payload);
                if (state.currentEvent && state.currentEvent._id === action.payload) {
                    state.currentEvent = null;
                }
            })
            // Toggle Like Event
            .addCase(toggleLikeEvent.fulfilled, (state, action) => {
                const updatedEventPayload = action.payload;
                const index = state.allEvents.findIndex(event => event._id === updatedEventPayload._id);
                if (index !== -1) {
                    state.allEvents[index] = updatedEventPayload;
                }
                if (state.currentEvent && state.currentEvent._id === updatedEventPayload._id) {
                    state.currentEvent = updatedEventPayload;
                }
            })
            // Toggle Dislike Event
            .addCase(toggleDislikeEvent.fulfilled, (state, action) => {
                const updatedEventPayload = action.payload;
                const index = state.allEvents.findIndex(event => event._id === updatedEventPayload._id);
                if (index !== -1) {
                    state.allEvents[index] = updatedEventPayload;
                }
                if (state.currentEvent && state.currentEvent._id === updatedEventPayload._id) {
                    state.currentEvent = updatedEventPayload;
                }
            })
            // Add Comment
            .addCase(addEventComment.fulfilled, (state, action) => {
                const updatedEventPayload = action.payload;
                const index = state.allEvents.findIndex(event => event._id === updatedEventPayload._id);
                if (index !== -1) {
                    state.allEvents[index] = updatedEventPayload;
                }
                if (state.currentEvent && state.currentEvent._id === updatedEventPayload._id) {
                    state.currentEvent = updatedEventPayload;
                }
            })
            // Delete Comment
            .addCase(deleteEventComment.fulfilled, (state, action) => {
                const updatedEventPayload = action.payload;
                const index = state.allEvents.findIndex(event => event._id === updatedEventPayload._id);
                if (index !== -1) {
                    state.allEvents[index] = updatedEventPayload;
                }
                if (state.currentEvent && state.currentEvent._id === updatedEventPayload._id) {
                    state.currentEvent = updatedEventPayload;
                }
            });
    },
});

export default eventsSlice.reducer;