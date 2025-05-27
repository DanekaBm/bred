import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import API from '../../api'; // Убедитесь, что ваш API инстанс корректно импортирован

export const fetchAllEvents = createAsyncThunk(
    'events/fetchAllEvents',
    // Изменено: теперь принимает `params` в качестве первого аргумента
    async (params = {}, { rejectWithValue }) => {
        try {
            // Передаем `params` в запрос. Axios автоматически сериализует их в query string.
            const response = await API.get('/events', { params });
            return response.data;
        } catch (error) {
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
    async (eventData, { rejectWithValue }) => {
        try {
            const response = await API.post('/events', eventData);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || error.message);
        }
    }
);

export const updateEvent = createAsyncThunk(
    'events/updateEvent',
    async ({ id, eventData }, { rejectWithValue }) => {
        try {
            const response = await API.put(`/events/${id}`, eventData);
            return response.data;
        }
        catch (error) {
            return rejectWithValue(error.response?.data?.message || error.message);
        }
    }
);

export const deleteEvent = createAsyncThunk(
    'events/deleteEvent',
    async (id, { rejectWithValue }) => {
        try {
            await API.delete(`/events/${id}`);
            return id;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || error.message);
        }
    }
);

export const toggleLikeEvent = createAsyncThunk(
    'events/toggleLikeEvent',
    async (eventId, { rejectWithValue }) => {
        try {
            const response = await API.post(`/events/${eventId}/like`);
            return response.data.event;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || error.message);
        }
    }
);

export const toggleDislikeEvent = createAsyncThunk(
    'events/toggleDislikeEvent',
    async (eventId, { rejectWithValue }) => {
        try {
            const response = await API.post(`/events/${eventId}/dislike`);
            return response.data.event;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || error.message);
        }
    }
);

export const addEventComment = createAsyncThunk(
    'events/addEventComment',
    async ({ eventId, text }, { rejectWithValue }) => {
        try {
            const response = await API.post(`/events/${eventId}/comment`, { text });
            return response.data.event;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || error.message);
        }
    }
);

export const deleteEventComment = createAsyncThunk(
    'events/deleteEventComment',
    async ({ eventId, commentId }, { rejectWithValue }) => {
        try {
            const response = await API.delete(`/events/${eventId}/comment/${commentId}`);
            return response.data.event;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || error.message);
        }
    }
);

export const buyTickets = createAsyncThunk(
    'events/buyTickets',
    async ({ eventId, numberOfTickets }, { rejectWithValue }) => {
        try {
            const response = await API.post(`/events/${eventId}/buy-tickets`, { numberOfTickets });
            return response.data;
        } catch (error) {
            const message =
                error.response && error.response.data.message
                    ? error.response.data.message
                    : error.message;
            return rejectWithValue(message);
        }
    }
);


const eventsSlice = createSlice({
    name: 'events',
    initialState: {
        allEvents: [],
        currentEvent: null,
        status: 'idle',
        error: null,
    },
    reducers: {
        // Здесь можно добавить любые синхронные редьюсеры, если они нужны.
    },
    extraReducers: (builder) => {
        builder
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
            .addCase(createEvent.fulfilled, (state, action) => {
                state.allEvents.push(action.payload);
            })
            .addCase(updateEvent.fulfilled, (state, action) => {
                const index = state.allEvents.findIndex(event => event._id === action.payload._id);
                if (index !== -1) {
                    state.allEvents[index] = action.payload;
                }
                if (state.currentEvent && state.currentEvent._id === action.payload._id) {
                    state.currentEvent = action.payload;
                }
            })
            .addCase(deleteEvent.fulfilled, (state, action) => {
                state.allEvents = state.allEvents.filter(event => event._id !== action.payload);
                if (state.currentEvent && state.currentEvent._id === action.payload) {
                    state.currentEvent = null;
                }
            })
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
            .addCase(deleteEventComment.fulfilled, (state, action) => {
                const updatedEventPayload = action.payload;
                const index = state.allEvents.findIndex(event => event._id === updatedEventPayload._id);
                if (index !== -1) {
                    state.allEvents[index] = updatedEventPayload;
                }
                if (state.currentEvent && state.currentEvent._id === updatedEventPayload._id) {
                    state.currentEvent = updatedEventPayload;
                }
            })
            .addCase(buyTickets.pending, (state) => {
                state.error = null;
            })
            .addCase(buyTickets.fulfilled, (state, action) => {
                if (state.currentEvent && state.currentEvent._id === action.payload.event._id) {
                    state.currentEvent.availableTickets = action.payload.event.availableTickets;
                    const index = state.allEvents.findIndex(event => event._id === action.payload.event._id);
                    if (index !== -1) {
                        state.allEvents[index].availableTickets = action.payload.event.availableTickets;
                    }
                }
            })
            .addCase(buyTickets.rejected, (state, action) => {
                state.error = action.payload;
            });
    },
});

export default eventsSlice.reducer;