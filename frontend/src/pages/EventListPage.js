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
    const { t, i18n } = useTranslation();

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

                            {event.image && (
                                <img
                                    src={`http://localhost:5001${event.image}`}
                                    alt={event.title}
                                    style={{
                                        width: '100%',
                                        height: '200px',
                                        objectFit: 'cover',
                                        borderRadius: '8px 8px 0 0',
                                        marginBottom: '15px'
                                    }}
                                />
                            )}

                            <Link to={`/events/${event._id}`} style={{ textDecoration: 'none', color: 'var(--link-color)' }}>
                                <h3>{event.title}</h3>
                            </Link>
                            <p style={{ color: 'var(--text-color)' }}><strong>{t('location_label')}</strong>{event.location}</p>
                            <p style={{ color: 'var(--text-color)' }}><strong>{t('date_label')}</strong> {formatLocalizedDateTime(event.date)}</p>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

export default EventListPage;