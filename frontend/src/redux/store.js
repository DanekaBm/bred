// frontend/src/redux/store.js
import { configureStore } from '@reduxjs/toolkit';
import eventsReducer from './slices/eventsSlice';
import notificationsReducer from './slices/notificationsSlice'; // Assuming you have this for global notifications

const store = configureStore({
  reducer: {
    events: eventsReducer,
    notifications: notificationsReducer, // Add other reducers here if you have them
  },
});

export default store;