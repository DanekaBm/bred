import { configureStore } from '@reduxjs/toolkit';
import eventsReducer from './slices/eventsSlice';
import ticketsReducer from "./slices/ticketsSlice";

const store = configureStore({
  reducer: {
    events: eventsReducer,
    tickets: ticketsReducer,
  },
});

export default store;