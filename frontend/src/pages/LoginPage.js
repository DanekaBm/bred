import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';

function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();
    const { t } = useTranslation();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await login(email, password);
            setMessage(t('login_success'));
            navigate('/profile');
        } catch (error) {
            setMessage(error.message || t('login_error'));
        }
    };

    return (
        <form onSubmit={handleSubmit} style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '15px',
            padding: '30px',
            maxWidth: '400px',
            margin: '50px auto',
            backgroundColor: 'var(--card-bg-color)',
            border: '1px solid var(--card-border-color)',
            borderRadius: '8px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            transition: 'background-color 0.3s ease, border-color 0.3s ease'
        }}>
            <h2 style={{ color: 'var(--text-color)' }}>{t('login')}</h2>
            <input
                type="email"
                placeholder={t('email')}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{
                    padding: '10px',
                    border: '1px solid var(--input-border-color)',
                    borderRadius: '4px',
                    fontSize: '16px',
                    backgroundColor: 'var(--input-bg-color)',
                    color: 'var(--text-color)',
                    transition: 'background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease'
                }}
            />
            <input
                type="password"
                placeholder={t('password')}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{
                    padding: '10px',
                    border: '1px solid var(--input-border-color)',
                    borderRadius: '4px',
                    fontSize: '16px',
                    backgroundColor: 'var(--input-bg-color)',
                    color: 'var(--text-color)',
                    transition: 'background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease'
                }}
            />
            <button type="submit" style={{
                padding: '12px 20px',
                backgroundColor: 'var(--button-bg-color)',
                color: 'var(--button-text-color)',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer',
                fontSize: '1em',
                transition: 'background-color 0.3s ease, color 0.3s ease'
            }}>
                {t('login')}
            </button>
            {message && <p style={{ color: message.includes(t('error')) ? 'var(--red-button-bg)' : 'var(--green-button-bg)' }}>{message}</p>}
            <p style={{ textAlign: 'center', color: 'var(--text-color)' }}>
                <Link to="/reset-password" style={{ color: 'var(--link-color)', textDecoration: 'none' }}>{t('forgot_password')}</Link>
            </p>
            <p style={{ textAlign: 'center', color: 'var(--text-color)' }}>
                {t('no_account_yet')} <Link to="/register" style={{ color: 'var(--link-color)', textDecoration: 'none' }}>{t('register_now')}</Link>
            </p>
        </form>
    );
}

export default LoginPage;
