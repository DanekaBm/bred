// frontend/src/pages/AdminNotificationsPage.js
import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { getAdminNotifications } from '../services/eventService';
import { format } from 'date-fns';
import { ru, enUS } from 'date-fns/locale';

const AdminNotificationsPage = () => {
    const { user, loading } = useAuth();
    const navigate = useNavigate();
    const { t, i18n } = useTranslation();

    const [notifications, setNotifications] = useState([]);
    const [loadingNotifications, setLoadingNotifications] = useState(true);
    const [error, setError] = useState(null);

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

    // Функция для получения локализованного заголовка и сообщения уведомления
    const getLocalizedNotificationContent = (notif) => {
        const { type, relatedEntity, user: notificationUser } = notif; // Удаляем title и message из деструктуризации notif
        let localizedTitle = '';
        let localizedMessage = '';
        const userName = notificationUser?.name || t('unknown_user');
        const userEmail = notificationUser?.email || '';

        switch (type) {
            case 'new_like':
                localizedTitle = t('notification_new_like_title', { eventTitle: relatedEntity?.eventTitle });
                localizedMessage = t('notification_new_like_message', { userName, userEmail, eventTitle: relatedEntity?.eventTitle });
                break;
            case 'like_removed':
                localizedTitle = t('notification_like_removed_title', { eventTitle: relatedEntity?.eventTitle });
                localizedMessage = t('notification_like_removed_message', { userName, userEmail, eventTitle: relatedEntity?.eventTitle });
                break;
            case 'new_dislike':
                localizedTitle = t('notification_new_dislike_title', { eventTitle: relatedEntity?.eventTitle });
                localizedMessage = t('notification_new_dislike_message', { userName, userEmail, eventTitle: relatedEntity?.eventTitle });
                break;
            case 'dislike_removed':
                localizedTitle = t('notification_dislike_removed_title', { eventTitle: relatedEntity?.eventTitle });
                localizedMessage = t('notification_dislike_removed_message', { userName, userEmail, eventTitle: relatedEntity?.eventTitle });
                break;
            case 'new_comment':
                localizedTitle = t('notification_new_comment_title', { eventTitle: relatedEntity?.eventTitle });
                // Для комментария используем commentText из relatedEntity
                localizedMessage = t('notification_new_comment_message', { userName, userEmail, eventTitle: relatedEntity?.eventTitle, commentText: relatedEntity?.commentText });
                break;
            case 'support_message':
                // Для support_message используем новые ключи и данные из relatedEntity
                localizedTitle = t('notification_support_message_title', {
                    userName: relatedEntity?.userName,
                    userEmail: relatedEntity?.userEmail,
                    subject: relatedEntity?.supportSubject
                });
                localizedMessage = t('notification_support_message_message', {
                    message: relatedEntity?.supportMessage
                });
                break;
            // Добавьте другие типы уведомлений, если они у вас есть
            // Например: 'new_event_created', 'ticket_sold'
            case 'new_event_created':
                localizedTitle = t('notification_new_event_created_title', { eventTitle: relatedEntity?.eventTitle });
                localizedMessage = t('notification_new_event_created_message', { eventTitle: relatedEntity?.eventTitle, userName, userEmail });
                break;
            case 'ticket_sold':
                localizedTitle = t('notification_ticket_sold_title', { eventTitle: relatedEntity?.eventTitle });
                localizedMessage = t('notification_ticket_sold_message', { userName, userEmail, quantity: relatedEntity?.quantity });
                break;
            default:
                // Если тип неизвестен или не требует специальных данных, используем оригинальные title/message
                localizedTitle = notif.title || t('no_title'); // Добавьте 'no_title' в локализацию
                localizedMessage = notif.message || t('no_message'); // Добавьте 'no_message' в локализацию
                break;
        }
        return { localizedTitle, localizedMessage };
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
                    {notifications.map((notif, index) => {
                        const { localizedTitle, localizedMessage } = getLocalizedNotificationContent(notif);
                        return (
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
                                <p style={{ margin: '0', color: 'var(--text-color)', fontWeight: 'bold' }}>
                                    {localizedTitle}
                                </p>
                                <p style={{ margin: '5px 0', color: 'var(--text-color)' }}>
                                    {localizedMessage}
                                </p>

                                {/* Ссылка на событие, если есть relatedEntity и это событие */}
                                {notif.relatedEntity && notif.relatedEntity.type === 'Event' && notif.relatedEntity.id && (
                                    <Link to={`/events/${notif.relatedEntity.id}`} style={{ marginLeft: '5px', color: 'var(--link-color)', textDecoration: 'none' }}>
                                        {t('view_event')}
                                    </Link>
                                )}

                                {notif.user && ( // Проверяем наличие пользователя
                                    <p style={{ margin: '5px 0 0 0', fontSize: '0.8em', color: 'var(--text-color-secondary)' }}>
                                        {t('from')}: {notif.user.name} ({notif.user.email})
                                    </p>
                                )}
                            </li>
                        );
                    })}
                </ul>
            )}
        </div>
    );
};

export default AdminNotificationsPage;