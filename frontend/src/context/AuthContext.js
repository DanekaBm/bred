import React, { createContext, useState, useContext, useEffect } from 'react';
import API from '../api'; // Убедитесь, что это правильный импорт api.js

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    // Инициализируем user из localStorage, если он там есть
    const [user, setUser] = useState(() => {
        try {
            const storedUser = localStorage.getItem('user');
            return storedUser ? JSON.parse(storedUser) : null;
        } catch (error) {
            console.error("Failed to parse user from localStorage:", error);
            return null;
        }
    });
    const [loading, setLoading] = useState(true);

    // Логика проверки статуса авторизации при загрузке страницы
    useEffect(() => {
        const checkAuthStatus = async () => {
            try {
                // Пытаемся получить профиль. Если кука есть и валидна, бэкенд вернет данные.
                // Если куки нет или она не валидна, бэкенд вернет 401.
                const res = await API.get('/users/profile'); // <-- ИСПРАВЛЕНО ЗДЕСЬ: /users/profile
                setUser(res.data);
            } catch (error) {
                // Если произошла ошибка (например, 401 Unauthorized), это означает, что пользователь не авторизован.
                console.error('Ошибка проверки статуса авторизации или пользователь не авторизован:', error.response?.data?.message || error.message);
                // Очищаем пользователя и localStorage, так как кука невалидна
                setUser(null);
                localStorage.removeItem('user');
            } finally {
                setLoading(false); // Завершаем состояние загрузки в любом случае
            }
        };

        checkAuthStatus();
    }, []); // Пустой массив зависимостей означает, что эффект запустится только один раз при монтировании.

    // Добавляем isAdmin для удобства
    const isAdmin = user?.role === 'admin';
    // Исправленный isAuthenticated
    const isAuthenticated = !!user;

    const login = async (email, password) => {
        try {
            const { data } = await API.post('/auth/login', { email, password });
            // Сохраняем только данные пользователя в localStorage, без токена
            localStorage.setItem('user', JSON.stringify(data));
            setUser(data); // data уже содержит данные пользователя
            return true;
        } catch (error) {
            console.error('Login failed:', error.response?.data?.message || error.message);
            throw new Error(error.response?.data?.message || 'Ошибка входа');
        }
    };

    const register = async (name, email, password) => {
        try {
            await API.post('/auth/register', { name, email, password });
            return true;
        } catch (error) {
            console.error('Registration failed:', error.response?.data?.message || error.message);
            throw new Error(error.response?.data?.message || 'Ошибка регистрации');
        }
    };

    const logout = async () => {
        try {
            await API.post('/auth/logout');
        } catch (error) {
            console.error('Logout failed:', error.message);
        } finally {
            setUser(null);
            localStorage.removeItem('user');
        }
    };

    const forgotPassword = async (email) => {
        try {
            const res = await API.post('/auth/forgot-password', { email });
            return res.data.message;
        } catch (error) {
            console.error('Forgot password failed:', error.response?.data?.message || error.message);
            throw new Error(error.response?.data?.message || 'Ошибка запроса сброса пароля');
        }
    };

    const resetPassword = async (token, newPassword) => {
        try {
            const res = await API.put(`/auth/reset-password/${token}`, { password: newPassword });
            return res.data.message;
        } catch (error) {
            console.error('Reset password failed:', error.response?.data?.message || error.message);
            throw new Error(error.response?.data?.message || 'Ошибка сброса пароля');
        }
    };

    const updatePassword = async (oldPassword, newPassword) => {
        try {
            const res = await API.put('/auth/update-password', { oldPassword, newPassword });
            return res.data.message;
        } catch (error) {
            console.error('Update password failed:', error.response?.data?.message || error.message);
            throw new Error(error.response?.data?.message || 'Ошибка обновления пароля');
        }
    };

    const value = {
        user,
        loading,
        isAuthenticated,
        isAdmin,
        login,
        register,
        logout,
        forgotPassword,
        resetPassword,
        updatePassword,
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};