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
            // Предполагается, что бэкенд возвращает обновленное событие
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
            // Предполагается, что бэкенд возвращает обновленное событие
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
            // Предполагается, что бэкенд возвращает обновленное событие
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
            // Предполагается, что бэкенд возвращает обновленное событие
            return response.data.event;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || error.message);
        }
    }
);

// --- НОВЫЙ THUNK ДЛЯ ПОКУПКИ БИЛЕТОВ ---
export const buyTickets = createAsyncThunk(
    'events/buyTickets',
    async ({ eventId, numberOfTickets }, { rejectWithValue }) => {
        try {
            const response = await API.post(`/events/${eventId}/buy-tickets`, { numberOfTickets });
            // Ожидаем, что бэкенд вернет объект с message и обновленным объектом события
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
// --- КОНЕЦ НОВОГО THUNK ---


const eventsSlice = createSlice({
    name: 'events',
    initialState: {
        allEvents: [],
        currentEvent: null,
        status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
        error: null,
    },
    reducers: {
        // Здесь можно добавить любые синхронные редьюсеры, если они нужны.
        // Например, для сброса состояния ошибки или сообщения.
    },
    extraReducers: (builder) => {
        builder
            // fetchAllEvents
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
            // fetchEventById
            .addCase(fetchEventById.pending, (state) => {
                state.status = 'loading';
                state.currentEvent = null; // Очищаем предыдущее событие при новой загрузке
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
            .addCase(createEvent.fulfilled, (state, action) => {
                state.allEvents.push(action.payload);
                // Если нужно обновить currentEvent после создания, добавьте логику
            })
            // updateEvent
            .addCase(updateEvent.fulfilled, (state, action) => {
                const index = state.allEvents.findIndex(event => event._id === action.payload._id);
                if (index !== -1) {
                    state.allEvents[index] = action.payload;
                }
                if (state.currentEvent && state.currentEvent._id === action.payload._id) {
                    state.currentEvent = action.payload;
                }
            })
            // deleteEvent
            .addCase(deleteEvent.fulfilled, (state, action) => {
                state.allEvents = state.allEvents.filter(event => event._id !== action.payload);
                if (state.currentEvent && state.currentEvent._id === action.payload) {
                    state.currentEvent = null;
                }
            })
            // toggleLikeEvent
            .addCase(toggleLikeEvent.fulfilled, (state, action) => {
                const updatedEventPayload = action.payload; // Это должно быть обновленное событие целиком
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
                const updatedEventPayload = action.payload; // Это должно быть обновленное событие целиком
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
                const updatedEventPayload = action.payload; // Это должно быть обновленное событие целиком
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
                const updatedEventPayload = action.payload; // Это должно быть обновленное событие целиком
                const index = state.allEvents.findIndex(event => event._id === updatedEventPayload._id);
                if (index !== -1) {
                    state.allEvents[index] = updatedEventPayload;
                }
                if (state.currentEvent && state.currentEvent._id === updatedEventPayload._id) {
                    state.currentEvent = updatedEventPayload;
                }
            })
            // --- НОВЫЕ extraReducers ДЛЯ buyTickets ---
            .addCase(buyTickets.pending, (state) => {
                // Статус 'loading' уже устанавливается fetchEventById,
                // поэтому здесь мы просто убеждаемся, что нет ошибки, связанной с покупкой.
                // Если у вас есть отдельный статус для покупки, используйте его.
                // state.purchaseStatus = 'loading';
                state.error = null; // Очищаем предыдущие ошибки
            })
            .addCase(buyTickets.fulfilled, (state, action) => {
                // state.purchaseStatus = 'succeeded';
                // Обновляем currentEvent, чтобы отобразить новое количество билетов
                // action.payload.event содержит обновленные данные события (например, availableTickets)
                if (state.currentEvent && state.currentEvent._id === action.payload.event._id) {
                    state.currentEvent.availableTickets = action.payload.event.availableTickets;
                    // Если нужно, можете обновить и allEvents тоже
                    const index = state.allEvents.findIndex(event => event._id === action.payload.event._id);
                    if (index !== -1) {
                        state.allEvents[index].availableTickets = action.payload.event.availableTickets;
                    }
                }
                // Возможно, вам захочется сохранить `action.payload.message` в состоянии,
                // чтобы отобразить сообщение об успешной покупке на UI.
                // Для этого нужно будет добавить поле `purchaseMessage` в initialState.
            })
            .addCase(buyTickets.rejected, (state, action) => {
                // state.purchaseStatus = 'failed';
                state.error = action.payload; // Сохраняем сообщение об ошибке для отображения
            });
        // --- КОНЕЦ НОВЫХ extraReducers ---
    },
});

export default eventsSlice.reducer;