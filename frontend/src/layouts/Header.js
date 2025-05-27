import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../context/ThemeContext';
import { FaBell } from 'react-icons/fa'; // <-- Добавлен импорт иконки колокольчика

const Header = () => {
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
        <header style={{
            backgroundColor: 'var(--header-bg-color)',
            color: 'var(--header-text-color)',
            padding: '10px 20px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            transition: 'background-color 0.3s ease, color 0.3s ease'
        }}>
            <h1 style={{ margin: 0, fontSize: '1.5em' }}>
                <Link to="/" style={{ color: 'var(--header-text-color)', textDecoration: 'none' }}>
                    Event Hub
                </Link>
            </h1>
            <nav>
                <ul style={{
                    listStyleType: 'none',
                    margin: 0,
                    padding: 0,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '20px'
                }}>
                    <li><Link to="/events">{t('events')}</Link></li>

                    {user ? (
                        <>
                            <li><Link to="/profile">{t('profile')}</Link></li>
                            <li><Link to="/my-tickets">{t('my_tickets')}</Link></li>

                            {user.role === 'admin' && (
                                <>
                                    <li><Link to="/admin/events">{t('admin_dashboard')}</Link></li>
                                    {/* НОВАЯ КНОПКА-КОЛОКОЛЬЧИК */}
                                    <li>
                                        <Link to="/admin/notifications" style={{ position: 'relative', color: 'var(--header-text-color)', textDecoration: 'none' }}>
                                            <FaBell size={20} />
                                            {/* Можно добавить значок с количеством непрочитанных уведомлений, если у вас есть unreadCount */}
                                            {/* {unreadCount > 0 && (
                                                <span style={{
                                                    position: 'absolute',
                                                    top: '-5px',
                                                    right: '-10px',
                                                    backgroundColor: 'var(--red-button-bg)', // Красный кружок
                                                    color: 'white',
                                                    borderRadius: '50%',
                                                    padding: '2px 6px',
                                                    fontSize: '0.7em',
                                                    fontWeight: 'bold',
                                                    lineHeight: '1',
                                                    minWidth: '10px',
                                                    textAlign: 'center'
                                                }}>
                                                    {unreadCount}
                                                </span>
                                            )} */}
                                        </Link>
                                    </li>
                                </>
                            )}
                            <li><button onClick={handleLogout}>{t('logout')} ({user.name})</button></li>
                        </>
                    ) : (
                        <>
                            <li><Link to="/register">{t('register')}</Link></li>
                            <li><Link to="/login">{t('login')}</Link></li>
                            <li><Link to="/password-reset">{t('password_reset')}</Link></li>
                        </>
                    )}

                    <li style={{ display: 'flex', alignItems: 'center', marginLeft: 'auto' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                            <button
                                onClick={() => changeLanguage('en')}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    color: i18n.language === 'en' ? 'var(--link-color)' : 'var(--header-text-color)',
                                    cursor: 'pointer',
                                    padding: '5px 10px',
                                    fontSize: '0.9em',
                                    fontWeight: i18n.language === 'en' ? 'bold' : 'normal',
                                    borderRadius: '5px',
                                }}
                            >
                                EN
                            </button>
                            <span style={{ color: 'var(--header-text-color)', margin: '0' }}>/</span>
                            <button
                                onClick={() => changeLanguage('ru')}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    color: i18n.language === 'ru' ? 'var(--link-color)' : 'var(--header-text-color)',
                                    cursor: 'pointer',
                                    padding: '5px 10px',
                                    fontSize: '0.9em',
                                    fontWeight: i18n.language === 'ru' ? 'bold' : 'normal',
                                    borderRadius: '5px',
                                }}
                            >
                                RU
                            </button>
                        </div>

                        <button
                            onClick={toggleTheme}
                            style={{
                                margin: '0 0 0 15px',
                                padding: '5px 10px',
                                cursor: 'pointer',
                                border: '1px solid var(--header-text-color)',
                                borderRadius: '4px',
                                backgroundColor: 'transparent',
                                color: 'var(--header-text-color)',
                                transition: 'background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease',
                            }}
                        >
                            {theme === 'light' ? t('switch_to_dark') : t('switch_to_light')}
                        </button>
                    </li>
                </ul>
            </nav>
        </header>
    );
};

export default Header;