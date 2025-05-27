import React, { useState } from 'react';
import API from '../api';
import { useTranslation } from 'react-i18next';

const PasswordResetPage = () => {
    const { t } = useTranslation();

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
            setError(t('fill_all_fields_error'));
            return;
        }

        if (newPassword !== confirmNewPassword) {
            setError(t('passwords_do_not_match_error'));
            return;
        }

        if (newPassword.length < 6) {
            setError(t('password_min_length_error'));
            return;
        }

        try {
            const res = await API.post('/auth/direct-reset-password', {
                name,
                email,
                newPassword,
            });
            setMessage(t(res.data.message));
            setName('');
            setEmail('');
            setNewPassword('');
            setConfirmNewPassword('');
        } catch (err) {
            setError(t(err.response?.data?.message || 'password_reset_error_occurred'));
            console.error('Ошибка при прямом сбросе пароля:', err.response?.data || err.message);
        }
    };

    return (
        <div style={{ maxWidth: '400px', margin: '50px auto', padding: '20px', border: '1px solid #ddd', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
            <h2>{t('password_reset_page_title')}</h2>
            <p>{t('password_reset_intro')}</p>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <input
                    type="text"
                    placeholder={t('your_name_placeholder')}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
                />
                <input
                    type="email"
                    placeholder={t('your_email_placeholder')}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
                />
                <input
                    type="password"
                    placeholder={t('new_password_placeholder')}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
                />
                <input
                    type="password"
                    placeholder={t('confirm_new_password_placeholder')}
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    required
                    style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
                />
                <button
                    type="submit"
                    style={{ padding: '10px 15px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                >
                    {t('reset_and_set_password_button')}
                </button>
                {message && <p style={{ color: 'green', marginTop: '10px' }}>{message}</p>}
                {error && <p style={{ color: 'red', marginTop: '10px' }}>{error}</p>}
            </form>
        </div>
    );
};

export default PasswordResetPage;