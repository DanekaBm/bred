// src/pages/PasswordResetPage.js
import React, { useState } from 'react';
import API from '../api'; // Убедитесь, что у вас есть этот импорт для вызова API

const PasswordResetPage = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');

        if (!name || !email || !newPassword || !confirmNewPassword) {
            setError('Пожалуйста, заполните все поля.');
            return;
        }

        if (newPassword !== confirmNewPassword) {
            setError('Новый пароль и подтверждение не совпадают.');
            return;
        }

        if (newPassword.length < 6) {
            setError('Новый пароль должен быть не менее 6 символов.');
            return;
        }

        try {
            const res = await API.post('/auth/direct-reset-password', {
                name,
                email,
                newPassword,
            });
            setMessage(res.data.message);
            setName('');
            setEmail('');
            setNewPassword('');
            setConfirmNewPassword('');
        } catch (err) {
            setError(err.response?.data?.message || 'Произошла ошибка при сбросе пароля.');
            console.error('Ошибка при прямом сбросе пароля:', err.response?.data || err.message);
        }
    };

    return (
        <div style={{ maxWidth: '400px', margin: '50px auto', padding: '20px', border: '1px solid #ddd', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
            <h2>Сброс пароля</h2>
            <p>Введите ваше имя, email и новый пароль.</p>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <input
                    type="text"
                    placeholder="Ваше Имя"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
                />
                <input
                    type="email"
                    placeholder="Ваш Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
                />
                <input
                    type="password"
                    placeholder="Новый пароль"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
                />
                <input
                    type="password"
                    placeholder="Подтвердите новый пароль"
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    required
                    style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
                />
                <button
                    type="submit"
                    style={{ padding: '10px 15px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                >
                    Сбросить и установить пароль
                </button>
                {message && <p style={{ color: 'green', marginTop: '10px' }}>{message}</p>}
                {error && <p style={{ color: 'red', marginTop: '10px' }}>{error}</p>}
            </form>
        </div>
    );
};

export default PasswordResetPage;