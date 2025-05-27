// frontend/src/context/AuthContext.js
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
            if (user && user.token) {
                try {
                    const res = await API.get('/auth/profile');
                    setUser(res.data);
                } catch (error) {
                    console.error('Ошибка проверки статуса авторизации:', error.response?.data?.message || error.message);
                    setUser(null);
                    localStorage.removeItem('user');
                }
            } else {
                setUser(null);
                localStorage.removeItem('user');
            }
            setLoading(false);
        };

        checkAuthStatus();
    }, []);

    // Добавляем isAdmin для удобства
    const isAdmin = user?.role === 'admin';
    // Исправленный isAuthenticated
    const isAuthenticated = !!user;

    const login = async (email, password) => {
        try {
            const { data } = await API.post('/auth/login', { email, password });
            localStorage.setItem('user', JSON.stringify(data));
            setUser(data.user || data);

            return true;
        } catch (error) {
            console.error('Login failed:', error.response?.data?.message || error.message);
            throw new Error(error.response?.data?.message || 'Ошибка входа');
        }
    };

    // --- НАЧАЛО: ЭТИ ФУНКЦИИ ДОЛЖНЫ БЫТЬ ОПРЕДЕЛЕНЫ ЗДЕСЬ ---
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
    // --- КОНЕЦ: ЭТИ ФУНКЦИИ ДОЛЖНЫ БЫТЬ ОПРЕДЕЛЕНЫ ЗДЕСЬ ---


    const value = {
        user,
        loading,
        isAuthenticated,
        isAdmin,
        login,
        register,          // <-- ТЕПЕРЬ ОНИ СУЩЕСТВУЮТ!
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