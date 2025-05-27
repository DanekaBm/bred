import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import API from '../../api';

export const fetchAllEvents = createAsyncThunk(
    'events/fetchAllEvents',
    async (_, { rejectWithValue }) => {
        try {
            const response = await API.get('/events');
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
        } catch (error) {
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
            return response.data; // { message: "...", event: { _id, availableTickets, ... } }
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
        status: 'idle', // Общий статус для загрузки списков/отдельных элементов
        error: null, // Общая ошибка
        creationStatus: 'idle', // 'idle' | 'pending' | 'succeeded' | 'failed'
        updateStatus: 'idle',
        deleteStatus: 'idle',
        purchaseMessage: null, // Сообщение об успешной покупке
        purchaseError: null, // Ошибка покупки билетов
    },
    reducers: {
        // Синхронные редьюсеры, если нужны для сброса состояний или ошибок
        clearPurchaseMessage: (state) => {
            state.purchaseMessage = null;
        },
        clearPurchaseError: (state) => {
            state.purchaseError = null;
        },
        clearEventFormStatus: (state) => { // Для сброса статусов формы после операций
            state.creationStatus = 'idle';
            state.updateStatus = 'idle';
            state.deleteStatus = 'idle';
            state.error = null; // Сброс общей ошибки, если она связана с формой
        }
    },
    extraReducers: (builder) => {
        builder
            // fetchAllEvents
            .addCase(fetchAllEvents.pending, (state) => {
                state.status = 'loading';
                state.error = null; // Очищаем ошибку при начале загрузки
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
            // fetchEventById
            .addCase(fetchEventById.pending, (state) => {
                state.status = 'loading';
                state.currentEvent = null;
                state.error = null;
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
            // createEvent
            .addCase(createEvent.pending, (state) => {
                state.creationStatus = 'pending';
                state.error = null; // Очищаем общую ошибку
            })
            .addCase(createEvent.fulfilled, (state, action) => {
                state.creationStatus = 'succeeded';
                state.allEvents.push(action.payload);
            })
            .addCase(createEvent.rejected, (state, action) => {
                state.creationStatus = 'failed';
                state.error = action.payload; // Сохраняем ошибку создания
            })
            // updateEvent
            .addCase(updateEvent.pending, (state) => {
                state.updateStatus = 'pending';
                state.error = null;
            })
            .addCase(updateEvent.fulfilled, (state, action) => {
                state.updateStatus = 'succeeded';
                const index = state.allEvents.findIndex(event => event._id === action.payload._id);
                if (index !== -1) {
                    state.allEvents[index] = action.payload;
                }
                if (state.currentEvent && state.currentEvent._id === action.payload._id) {
                    state.currentEvent = action.payload;
                }
            })
            .addCase(updateEvent.rejected, (state, action) => {
                state.updateStatus = 'failed';
                state.error = action.payload; // Сохраняем ошибку обновления
            })
            // deleteEvent
            .addCase(deleteEvent.pending, (state) => {
                state.deleteStatus = 'pending';
                state.error = null;
            })
            .addCase(deleteEvent.fulfilled, (state, action) => {
                state.deleteStatus = 'succeeded';
                state.allEvents = state.allEvents.filter(event => event._id !== action.payload);
                if (state.currentEvent && state.currentEvent._id === action.payload) {
                    state.currentEvent = null;
                }
            })
            .addCase(deleteEvent.rejected, (state, action) => {
                state.deleteStatus = 'failed';
                state.error = action.payload; // Сохраняем ошибку удаления
            })
            // toggleLikeEvent
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
            // toggleDislikeEvent
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
            // addEventComment
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
            // deleteEventComment
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
            // buyTickets
            .addCase(buyTickets.pending, (state) => {
                state.purchaseMessage = null; // Сбрасываем сообщение об успехе
                state.purchaseError = null; // Сбрасываем ошибку
            })
            .addCase(buyTickets.fulfilled, (state, action) => {
                state.purchaseMessage = action.payload.message; // Сохраняем сообщение об успехе
                state.purchaseError = null; // Очищаем ошибку
                // Обновляем currentEvent и allEvents с новым количеством билетов
                const updatedEventPayload = action.payload.event;
                if (state.currentEvent && state.currentEvent._id === updatedEventPayload._id) {
                    state.currentEvent.availableTickets = updatedEventPayload.availableTickets;
                }
                const index = state.allEvents.findIndex(event => event._id === updatedEventPayload._id);
                if (index !== -1) {
                    state.allEvents[index].availableTickets = updatedEventPayload.availableTickets;
                }
            })
            .addCase(buyTickets.rejected, (state, action) => {
                state.purchaseMessage = null; // Сбрасываем сообщение об успехе
                state.purchaseError = action.payload; // Сохраняем сообщение об ошибке
            });
    },
});

// Экспортируем синхронные экшены
export const { clearPurchaseMessage, clearPurchaseError, clearEventFormStatus } = eventsSlice.actions;

export default eventsSlice.reducer;