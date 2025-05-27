import React from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { useTranslation } from 'react-i18next';
import { useTheme, ThemeProvider } from './context/ThemeContext';
import { LanguageProvider } from './context/LanguageContext';

// Импортируем компоненты страниц
import RegisterPage from './pages/RegisterPage';
import LoginPage from './pages/LoginPage';
import ProfilePage from './pages/ProfilePage';
import EventListPage from './pages/EventListPage';
import HomePage from './pages/HomePage';
import PasswordResetPage from './pages/PasswordResetPage';
import EventDetailsPage from './pages/EventDetailsPage';
import AdminUserListPage from './pages/AdminUserListPage';
import AdminPanelPage from './pages/AdminPanelPage';
import AdminManageEventsPage from './pages/AdminManageEventsPage';

import Header from './layouts/Header'; // <-- ИМПОРТИРУЕМ КОМПОНЕНТ HEADER (если он используется)

import './App.css';

function AppContent() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const { t, i18n } = useTranslation();
    const { theme, toggleTheme } = useTheme();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const changeLanguage = (lng) => {
        i18n.changeLanguage(lng);
    };

    return (
        <div className="App">
            <Header />
            <div className="content">
                <Routes>
                    <Route path="/" element={ <HomePage />} />
                    <Route path="/register" element={<RegisterPage />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/password-reset" element={<PasswordResetPage />} />
                    {user && (
                        <>
                            <Route path="/profile" element={<ProfilePage />} />
                            <Route path="/events" element={<EventListPage />} />
                            <Route path="/events/:id" element={<EventDetailsPage />} />
                            {user.role === 'admin' && (
                                <>
                                    <Route path="/admin" element={<AdminPanelPage />} />
                                    <Route path="/admin/users" element={<AdminUserListPage />} />
                                    <Route path="/admin/events" element={<AdminManageEventsPage />} />
                                </>
                            )}
                        </>
                    )}
                    <Route path="*" element={<h2>404 - {t('page_not_found')}</h2>} />
                </Routes>
            </div>
        </div>
    );
}

function App() {
    return (
        <ThemeProvider>
            <LanguageProvider>
                <AuthProvider>
                        <AppContent />
                </AuthProvider>
            </LanguageProvider>
        </ThemeProvider>
    );
}

export default App;