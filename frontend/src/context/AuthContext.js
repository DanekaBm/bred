import React, { createContext, useState, useContext, useEffect } from 'react';
import API from '../api'; // Импортируем настроенный Axios

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkAuthStatus = async () => {
            try {
                // Пытаемся получить профиль пользователя.
                // Если токен в куки, браузер отправит его автоматически.
                const res = await API.get('/auth/profile');
                setUser(res.data);
            } catch (error) {
                // Если запрос к профилю возвращает ошибку (например, 401 Unauthorized),
                // значит, пользователь не авторизован или токен недействителен.
                console.error('Ошибка проверки статуса авторизации:', error.response?.data?.message || error.message);
                setUser(null); // Сбрасываем пользователя
            } finally {
                setLoading(false);
            }
        };

        checkAuthStatus();
    }, []); // Пустой массив зависимостей, чтобы выполнять только один раз при монтировании

    // Добавляем isAdmin для удобства
    const isAdmin = user?.role === 'admin';

    const login = async (email, password) => {
        try {
            // Отправляем учетные данные. Бэкенд установит токен в Set-Cookie И ВЕРНЕТ ДАННЫЕ ПОЛЬЗОВАТЕЛЯ.
            const { data } = await API.post('/auth/login', { email, password });

            // Устанавливаем данные пользователя, которые пришли непосредственно из ответа на логин
            setUser(data);

            return true; // Успешный вход
        } catch (error) {
            console.error('Login failed:', error.response?.data?.message || error.message);
            throw new Error(error.response?.data?.message || 'Ошибка входа');
        }
    };

    const register = async (name, email, password) => {
        try {
            await API.post('/auth/register', { name, email, password });
            return true; // Успешная регистрация
        } catch (error) {
            console.error('Registration failed:', error.response?.data?.message || error.message);
            throw new Error(error.response?.data?.message || 'Ошибка регистрации');
        }
    };

    const logout = async () => {
        try {
            // Если бэкенд имеет маршрут для очистки куки на сервере (например, /auth/logout)
            // этот запрос отправит куки, и бэкенд их удалит/аннулирует.
            // Если такого маршрута нет, можно удалить эту строку.
            await API.post('/auth/logout');
        } catch (error) {
            console.error('Logout failed:', error.message);
        } finally {
            setUser(null);
            // Удаляем старую логику удаления из localStorage
            // localStorage.removeItem('user'); // Эту строку УДАЛЯЕМ
        }
    };

    // НОВЫЕ ФУНКЦИИ ДЛЯ СБРОСА ПАРОЛЯ
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

    // ВОЗВРАЩЕННАЯ ФУНКЦИЯ ДЛЯ ОБНОВЛЕНИЯ ПАРОЛЯ АВТОРИЗОВАННОГО ПОЛЬЗОВАТЕЛЯ
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
        isAdmin, // Предоставляем флаг isAdmin
        login,
        register,
        logout,
        forgotPassword,
        resetPassword,
        updatePassword,
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children} {/* Отображаем дочерние элементы после загрузки */}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    return useContext(AuthContext);
};