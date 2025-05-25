// frontend/src/App.js
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import store from './redux/store';

import HomePage from './pages/HomePage';
import RegisterPage from './pages/RegisterPage';
import LoginPage from './pages/LoginPage';
import CreateEventPage from './pages/CreateEventPage';
import EventDetailsPage from './pages/EventDetailsPage';
import EventListPage from './pages/EventListPage';
import Header from './layouts/Header';
import Footer from './layouts/Footer';
import ProfilePage from './pages/ProfilePage';
import AdminPanelPage from './pages/AdminPanelPage';
import PasswordResetPage from './pages/PasswordResetPage';
import NotFoundPage from './pages/NotFoundPage';
import ProtectedRoute from './components/ProtectedRoute';

// Context Providers for Auth and Theme
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';

// i18n for language support
import './i18n';

function App() {
  return (
    <Provider store={store}>
      <AuthProvider>
        <ThemeProvider> {/* ThemeProvider wraps everything */}
          <Header />
          <main style={{ padding: '20px', minHeight: 'calc(100vh - 120px)' }}>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/events" element={<EventListPage />} />
              <Route path="/events/:id" element={<EventDetailsPage />} />
              <Route path="/reset-password" element={<PasswordResetPage />} />

              {/* Protected Routes */}
              <Route element={<ProtectedRoute />}>
                <Route path="/create-event" element={<CreateEventPage />} />
                <Route path="/profile" element={<ProfilePage />} />
              </Route>

              {/* Admin Protected Route */}
              <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
                <Route path="/admin" element={<AdminPanelPage />} />
              </Route>

              {/* Catch-all for 404 pages */}
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </main>
          <Footer />
        </ThemeProvider>
      </AuthProvider>
    </Provider>
  );
}

export default App;