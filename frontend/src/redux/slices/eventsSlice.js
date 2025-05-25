// frontend/src/redux/slices/eventsSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import API from '../../api'; // Assuming your API setup is correct

// Async Thunks for API calls
export const fetchAllEvents = createAsyncThunk(
  'events/fetchAllEvents',
  async (_, { rejectWithValue }) => {
    try {
      const response = await API.get('/events');
      return response.data.events;
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
      return response.data.event;
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
      return response.data.event;
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
      return response.data.event;
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
      return id; // Return the ID of the deleted event
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const toggleLikeEvent = createAsyncThunk(
  'events/toggleLikeEvent',
  async (eventId, { getState, rejectWithValue }) => {
    try {
      const response = await API.post(`/events/${eventId}/like`);
      // Update the event in the store with the new likes array
      // This response typically contains the updated event or a success message
      return { eventId, likes: response.data.likes };
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
      return { eventId, comment: response.data.comment }; // Assuming backend returns the new comment
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const deleteEventComment = createAsyncThunk(
  'events/deleteEventComment',
  async ({ eventId, commentId }, { rejectWithValue }) => {
    try {
      await API.delete(`/events/${eventId}/comment/${commentId}`);
      return { eventId, commentId };
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
      })
      // Fetch Event By ID
      .addCase(fetchEventById.pending, (state) => {
        state.status = 'loading';
        state.currentEvent = null; // Clear previous event details
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
        state.allEvents.push(action.payload); // Add new event to list
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
        const { eventId, likes } = action.payload;
        const updatedEvent = state.allEvents.find(event => event._id === eventId);
        if (updatedEvent) {
          updatedEvent.likes = likes; // Update likes array
        }
        if (state.currentEvent && state.currentEvent._id === eventId) {
          state.currentEvent.likes = likes;
        }
      })
      // Add Comment
      .addCase(addEventComment.fulfilled, (state, action) => {
        const { eventId, comment } = action.payload;
        const eventToUpdate = state.allEvents.find(event => event._id === eventId);
        if (eventToUpdate) {
          if (!eventToUpdate.comments) {
            eventToUpdate.comments = [];
          }
          eventToUpdate.comments.push(comment);
        }
        if (state.currentEvent && state.currentEvent._id === eventId) {
          if (!state.currentEvent.comments) {
            state.currentEvent.comments = [];
          }
          state.currentEvent.comments.push(comment);
        }
      })
      // Delete Comment
      .addCase(deleteEventComment.fulfilled, (state, action) => {
        const { eventId, commentId } = action.payload;
        const eventToUpdate = state.allEvents.find(event => event._id === eventId);
        if (eventToUpdate) {
          eventToUpdate.comments = (eventToUpdate.comments || []).filter(comment => comment._id !== commentId);
        }
        if (state.currentEvent && state.currentEvent._id === eventId) {
          state.currentEvent.comments = (state.currentEvent.comments || []).filter(comment => comment._id !== commentId);
        }
      });
  },
});

export default eventsSlice.reducer;