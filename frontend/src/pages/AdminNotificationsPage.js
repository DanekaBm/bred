// frontend/src/pages/AdminNotificationsPage.js
import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { getAdminNotifications } from '../services/eventService';
import { format } from 'date-fns'; // Для форматирования даты
import { ru, enUS } from 'date-fns/locale';

const AdminNotificationsPage = () => {
    const { user, loading } = useAuth();
    const navigate = useNavigate();
    const { t, i18n } = useTranslation();

    const [notifications, setNotifications] = useState([]);
    const [loadingNotifications, setLoadingNotifications] = useState(true);
    const [error, setError] = useState(null);

    // Форматирование даты
    const formatLocalizedDateTime = (isoString) => {
        if (!isoString) return '';
        try {
            const dateObj = new Date(isoString);
            const locale = i18n.language === 'ru' ? ru : enUS;
            // Используем 'PPP p' для красивого формата даты и времени
            return format(dateObj, 'PPP p', { locale });
        } catch (e) {
            console.error("Error formatting date:", e);
            return isoString;
        }
    };

    useEffect(() => {
        if (!loading) {
            if (!user || user.role !== 'admin') {
                navigate('/login'); // Перенаправить, если не админ
            } else {
                fetchNotifications();
            }
        }
    }, [user, loading, navigate]);

    const fetchNotifications = async () => {
        setLoadingNotifications(true);
        setError(null);
        try {
            const data = await getAdminNotifications();
            setNotifications(data);
        } catch (err) {
            console.error('Ошибка загрузки уведомлений:', err);
            setError(err.message || t('error_loading_notifications'));
        } finally {
            setLoadingNotifications(false);
        }
    };

    if (loading || loadingNotifications) {
        return <p style={{ textAlign: 'center', marginTop: '50px' }}>{t('loading')}...</p>;
    }

    if (error) {
        return <p style={{ color: 'red', textAlign: 'center', marginTop: '20px' }}>{error}</p>;
    }

    return (
        <div style={{
            padding: '20px',
            maxWidth: '800px',
            margin: '20px auto',
            backgroundColor: 'var(--card-bg-color)',
            border: '1px solid var(--card-border-color)',
            borderRadius: '8px',
            boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
            transition: 'background-color 0.3s ease, border-color 0.3s ease'
        }}>
            <h1 style={{ color: 'var(--text-color)', marginBottom: '25px', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
                {t('admin_notifications_page_title')}
            </h1>

            {notifications.length === 0 ? (
                <p style={{ color: 'var(--text-color-secondary)', textAlign: 'center' }}>{t('no_new_notifications')}</p>
            ) : (
                <ul style={{ listStyle: 'none', padding: 0 }}>
                    {notifications.map((notif, index) => (
                        <li key={index} style={{
                            marginBottom: '15px',
                            padding: '15px',
                            border: '1px solid var(--border-color)',
                            borderRadius: '8px',
                            backgroundColor: 'var(--body-bg-color)',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
                        }}>
                            <p style={{ margin: '0 0 5px 0', fontSize: '0.9em', color: 'var(--text-color-secondary)' }}>
                                {formatLocalizedDateTime(notif.createdAt)}
                            </p>
                            {notif.type === 'like' && (
                                <p style={{ margin: '0', color: 'var(--text-color)' }}>
                                    {t('user_liked_event', { userName: notif.user.name, eventTitle: notif.eventTitle })}
                                    <Link to={`/events/${notif.eventId}`} style={{ marginLeft: '5px', color: 'var(--link-color)', textDecoration: 'none' }}>
                                        ({t('view_event')})
                                    </Link>
                                </p>
                            )}
                            {notif.type === 'dislike' && (
                                <p style={{ margin: '0', color: 'var(--text-color)' }}>
                                    {t('user_disliked_event', { userName: notif.user.name, eventTitle: notif.eventTitle })}
                                    <Link to={`/events/${notif.eventId}`} style={{ marginLeft: '5px', color: 'var(--link-color)', textDecoration: 'none' }}>
                                        ({t('view_event')})
                                    </Link>
                                </p>
                            )}
                            {notif.type === 'comment' && (
                                <p style={{ margin: '0', color: 'var(--text-color)' }}>
                                    {t('user_commented_on_event', { userName: notif.user.name, eventTitle: notif.eventTitle, commentText: notif.text })}
                                    <Link to={`/events/${notif.eventId}`} style={{ marginLeft: '5px', color: 'var(--link-color)', textDecoration: 'none' }}>
                                        ({t('view_event')})
                                    </Link>
                                </p>
                            )}
                            <p style={{ margin: '5px 0 0 0', fontSize: '0.8em', color: 'var(--text-color-secondary)' }}>
                                {t('from')}: {notif.user.name} ({notif.user.email})
                            </p>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default AdminNotificationsPage;