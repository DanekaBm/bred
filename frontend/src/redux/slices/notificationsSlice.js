    import { createSlice } from '@reduxjs/toolkit';

    const notificationsSlice = createSlice({
        name: 'notifications',
        initialState: {
            items: [],
            unreadCount: 0,
            settings: {
                newBooking: true,
                eventReminder: true,
                adminMessage: true,
            }
        },
        reducers: {
            addNotification: (state, action) => {
                state.items.unshift({ ...action.payload, id: Date.now(), read: false });
                state.unreadCount += 1;
            },
            markAsRead: (state, action) => {
                const notification = state.items.find(n => n.id === action.payload);
                if (notification && !notification.read) {
                    notification.read = true;
                    state.unreadCount -= 1;
                }
            },
            markAllAsRead: (state) => {
                state.items.forEach(n => n.read = true);
                state.unreadCount = 0;
            },
            setNotificationSettings: (state, action) => {
                state.settings = { ...state.settings, ...action.payload };
            }
        },
    });

    export const { addNotification, markAsRead, markAllAsRead, setNotificationSettings } = notificationsSlice.actions;
    export default notificationsSlice.reducer;
    