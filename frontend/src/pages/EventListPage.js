// frontend/src/pages/EventListPage.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import { ru, enUS } from 'date-fns/locale';

import { fetchAllEvents, toggleLikeEvent, addEventComment, deleteEventComment } from '../redux/slices/eventsSlice';

function EventListPage() {
    const dispatch = useDispatch();
    const { user } = useAuth();
    const { t, i18n } = useTranslation(); // <-- i18n здесь определен правильно

    const events = useSelector(state => state.events.allEvents);
    const eventsStatus = useSelector(state => state.events.status);
    const error = useSelector(state => state.events.error);

    const [commentText, setCommentText] = useState({});

    const formatLocalizedDateTime = (isoString) => {
        if (!isoString) return '';
        try {
            const dateObj = new Date(isoString);
            const locale = i18n.language === 'ru' ? ru : enUS;
            return format(dateObj, 'PPPPp', { locale });
        } catch (e) {
            console.error("Error formatting date:", e);
            return isoString;
        }
    };

    useEffect(() => {
        if (eventsStatus === 'idle') {
            dispatch(fetchAllEvents());
        }
    }, [eventsStatus, dispatch]);

    useEffect(() => {
        // Этот useEffect в основном используется для запуска повторного рендеринга при изменении языка.
        // Он гарантирует, что функция formatLocalizedDateTime будет переоценена.
    }, [i18n.language]); // <-- ИСПРАВЛЕНО: i18n.language

    const handleLike = (eventId) => {
        if (!user) {
            alert(t('please_login_to_like'));
            return;
        }
        dispatch(toggleLikeEvent(eventId));
    };

    const handleAddComment = (eventId) => {
        if (!user) {
            alert(t('please_login_to_comment'));
            return;
        }
        const text = commentText[eventId] || '';
        if (!text.trim()) {
            alert(t('comment_cannot_be_empty'));
            return;
        }
        dispatch(addEventComment({ eventId, text }));
        setCommentText((prev) => ({ ...prev, [eventId]: '' }));
    };

    const handleDeleteComment = (eventId, commentId) => {
        if (!window.confirm(t('confirm_delete_comment'))) {
            return;
        }
        dispatch(deleteEventComment({ eventId, commentId }));
    };

    if (eventsStatus === 'loading') return <p style={{ color: 'var(--text-color)' }}>{t('loading_events')}</p>;
    if (eventsStatus === 'failed') return <p style={{ color: 'var(--red-button-bg)' }}>{error}</p>;

    return (
        <div style={{ color: 'var(--text-color)' }}>
            <h2>{t('event_list')}</h2>
            {events.length === 0 ? (
                <p>{t('no_events_yet')}</p>
            ) : (
                <ul style={{ listStyle: 'none', padding: 0 }}>
                    {events.map((event) => (
                        <li key={event._id} style={{
                            marginBottom: '20px',
                            padding: '20px',
                            border: '1px solid var(--card-border-color)',
                            borderRadius: '8px',
                            backgroundColor: 'var(--card-bg-color)',
                            boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
                            transition: 'background-color 0.3s ease, border-color 0.3s ease'
                        }}>
                            {/* >>>>>> ДОБАВЛЕННЫЕ СТРОКИ ДЛЯ ДИАГНОСТИКИ (можете убрать после решения проблемы) <<<<<< */}
                            {console.log('Event Data (from Redux state):', event)}
                            {console.log('Image URL for event (event.image):', event.image)}
                            {/* >>>>>> КОНЕЦ ДОБАВЛЕННЫХ СТРОК <<<<<< */}

                            {/* БЛОК ДЛЯ ОТОБРАЖЕНИЯ ИЗОБРАЖЕНИЯ */}
                            {event.image && (
                                <img
                                    src={`http://localhost:5001${event.image}`} // Полный URL к изображению
                                    alt={event.title}
                                    style={{
                                        width: '100%',
                                        height: '200px', // Фиксированная высота
                                        objectFit: 'cover', // Обрезать изображение, чтобы оно заполнило область
                                        borderRadius: '8px 8px 0 0', // Скруглить только верхние углы
                                        marginBottom: '15px'
                                    }}
                                />
                            )}

                            <Link to={`/events/${event._id}`} style={{ textDecoration: 'none', color: 'var(--link-color)' }}>
                                <h3>{event.title}</h3>
                            </Link>
                            <p style={{ color: 'var(--text-color)' }}>{event.description}</p>
                            <p style={{ color: 'var(--text-color)' }}><strong>{t('date_label')}</strong> {formatLocalizedDateTime(event.date)}</p>

                            {/* Like Section */}
                            <div style={{ marginTop: '10px' }}>
                                <button
                                    onClick={() => handleLike(event._id)}
                                    disabled={!user}
                                    style={{
                                        // ИЗМЕНЕНО: Добавлена безопасная проверка 'like && like._id'
                                        backgroundColor: user && Array.isArray(event.likes) && event.likes.some(like => like && like._id && like._id.toString() === user._id.toString())
                                            ? 'var(--green-button-bg)' : 'var(--gray-button-bg)',
                                        color: 'var(--button-text-color)',
                                        border: 'none',
                                        padding: '8px 12px',
                                        borderRadius: '4px',
                                        cursor: user ? 'pointer' : 'not-allowed',
                                        fontSize: '0.9em',
                                        marginRight: '10px',
                                        transition: 'background-color 0.3s ease, color 0.3s ease'
                                    }}
                                >
                                    {/* ИЗМЕНЕНО: Добавлена безопасная проверка 'like && like._id' для текста кнопки */}
                                    {user && Array.isArray(event.likes) && event.likes.some(like => like && like._id && like._id.toString() === user._id.toString())
                                        ? t('unlike') : t('like')}
                                </button>
                                <span style={{ fontSize: '1em', color: 'var(--text-color)' }}>
                                    {t('likes_count', { count: Array.isArray(event.likes) ? event.likes.length : 0 })}
                                </span>
                            </div>

                            {/* Comments Section */}
                            <div style={{ marginTop: '15px', borderTop: '1px solid var(--card-border-color)', paddingTop: '10px' }}>
                                <h4>{t('comments_section')}</h4>
                                {event.comments && event.comments.length > 0 ? (
                                    <ul style={{ listStyleType: 'none', padding: '0' }}>
                                        {event.comments.map((comment) => (
                                            <li key={comment._id} style={{
                                                fontSize: '0.9em',
                                                borderBottom: '1px dotted var(--card-border-color)',
                                                padding: '5px 0',
                                                marginBottom: '5px',
                                                backgroundColor: 'var(--comment-bg-color)',
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'center',
                                                transition: 'background-color 0.3s ease, color 0.3s ease'
                                            }}>
                                                <div>
                                                    <strong style={{ color: 'var(--text-color)' }}>{comment.user ? comment.user.name : t('unknown')}:</strong> <span style={{ color: 'var(--text-color)' }}>{comment.text}</span>
                                                    <br />
                                                    <small style={{ color: 'var(--text-color)', fontSize: '0.8em' }}>{formatLocalizedDateTime(comment.createdAt)}</small>
                                                </div>
                                                {user && (comment.user._id === user._id || user.role === 'admin') && (
                                                    <button
                                                        onClick={() => handleDeleteComment(event._id, comment._id)}
                                                        style={{
                                                            backgroundColor: 'var(--red-button-bg)',
                                                            color: 'var(--button-text-color)',
                                                            border: 'none',
                                                            padding: '4px 8px',
                                                            borderRadius: '3px',
                                                            cursor: 'pointer',
                                                            fontSize: '0.7em',
                                                            transition: 'background-color 0.3s ease, color 0.3s ease'
                                                        }}
                                                    >
                                                        {t('delete_comment')}
                                                    </button>
                                                )}
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p style={{ color: 'var(--text-color)' }}>{t('no_comments_yet')}</p>
                                )}

                                {/* Add Comment Form */}
                                {user && (
                                    <div style={{ display: 'flex', marginTop: '10px' }}>
                                        <input
                                            type="text"
                                            placeholder={t('write_a_comment')}
                                            value={commentText[event._id] || ''}
                                            onChange={(e) =>
                                                setCommentText((prev) => ({ ...prev, [event._id]: e.target.value }))
                                            }
                                            style={{
                                                flexGrow: 1,
                                                padding: '8px',
                                                borderRadius: '4px',
                                                border: '1px solid var(--input-border-color)',
                                                backgroundColor: 'var(--input-bg-color)',
                                                color: 'var(--text-color)',
                                                transition: 'background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease'
                                            }}
                                        />
                                        <button
                                            onClick={() => handleAddComment(event._id)}
                                            style={{
                                                marginLeft: '10px',
                                                backgroundColor: 'var(--button-bg-color)',
                                                color: 'var(--button-text-color)',
                                                border: 'none',
                                                padding: '8px 12px',
                                                borderRadius: '4px',
                                                cursor: 'pointer',
                                                fontSize: '0.9em',
                                                transition: 'background-color 0.3s ease, color 0.3s ease'
                                            }}
                                        >
                                            {t('send')}
                                        </button>
                                    </div>
                                )}
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

export default EventListPage;