// src/components/Header.js
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../context/ThemeContext'; // Import useTheme hook

function Header() {
    const { user, logout } = useAuth();
    const { t, i18n } = useTranslation();
    const { theme, toggleTheme } = useTheme(); // Use the theme context

    const changeLanguage = (lng) => {
        i18n.changeLanguage(lng);
    };

    return (
        <header style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '15px 20px',
            backgroundColor: 'var(--header-bg-color)', /* Use CSS variable */
            color: 'var(--header-text-color)',      /* Use CSS variable */
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            transition: 'background-color 0.3s ease, color 0.3s ease'
        }}>
            <div className="logo">
                <Link to="/" style={{ color: 'var(--header-text-color)', textDecoration: 'none', fontSize: '1.5em', fontWeight: 'bold' }}>
                    {t('event_hub')}
                </Link>
            </div>
            <nav>
                <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex' }}>
                    <li style={{ marginLeft: '20px' }}><Link to="/events" style={{ color: 'var(--header-text-color)', textDecoration: 'none' }}>{t('events')}</Link></li>
                    {user ? (
                        <>
                            <li style={{ marginLeft: '20px' }}><Link to="/create-event" style={{ color: 'var(--header-text-color)', textDecoration: 'none' }}>{t('create_event')}</Link></li>
                            <li style={{ marginLeft: '20px' }}><Link to="/profile" style={{ color: 'var(--header-text-color)', textDecoration: 'none' }}>{t('profile')}</Link></li>
                            {user.role === 'admin' && (
                                <li style={{ marginLeft: '20px' }}><Link to="/admin" style={{ color: 'var(--header-text-color)', textDecoration: 'none' }}>{t('admin_dashboard')}</Link></li>
                            )}
                            <li style={{ marginLeft: '20px' }}><button onClick={logout} style={{ background: 'none', border: 'none', color: 'var(--header-text-color)', cursor: 'pointer', padding: 0, fontSize: '1em' }}>{t('logout')}</button></li>
                        </>
                    ) : (
                        <>
                            <li style={{ marginLeft: '20px' }}><Link to="/login" style={{ color: 'var(--header-text-color)', textDecoration: 'none' }}>{t('login')}</Link></li>
                            <li style={{ marginLeft: '20px' }}><Link to="/register" style={{ color: 'var(--header-text-color)', textDecoration: 'none' }}>{t('register')}</Link></li>
                        </>
                    )}
                    <li style={{ marginLeft: '20px' }}>
                        <button onClick={() => changeLanguage('en')} style={{ background: 'none', border: 'none', color: i18n.language === 'en' ? 'var(--link-hover-color)' : 'var(--header-text-color)', cursor: 'pointer', padding: 0, fontSize: '1em' }}>EN</button>
                        <span style={{ color: 'var(--header-text-color)' }}> | </span>
                        <button onClick={() => changeLanguage('ru')} style={{ background: 'none', border: 'none', color: i18n.language === 'ru' ? 'var(--link-hover-color)' : 'var(--header-text-color)', cursor: 'pointer', padding: 0, fontSize: '1em' }}>RU</button>
                    </li>
                    {/* Theme Toggle Button */}
                    <li style={{ marginLeft: '20px' }}>
                        <button onClick={toggleTheme} style={{ background: 'none', border: '1px solid var(--header-text-color)', color: 'var(--header-text-color)', cursor: 'pointer', padding: '5px 10px', borderRadius: '5px', fontSize: '0.9em' }}>
                            {theme === 'light' ? t('switch_to_dark') : t('switch_to_light')}
                        </button>
                    </li>
                </ul>
            </nav>
        </header>
    );
}

export default Header;