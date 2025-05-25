// frontend/src/pages/EventDetailsPage.js
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useTranslation } from 'react-i18next';

const EventDetailsPage = () => {
    const { id } = useParams(); // Получаем ID события из URL
    const [event, setEvent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { t } = useTranslation();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchEvent = async () => {
            try {
                const response = await axios.get(`http://localhost:5001/api/events/${id}`);
                setEvent(response.data);
                setLoading(false);
            } catch (err) {
                console.error('Error fetching event details:', err);
                setError(t('failed_to_load_event_details'));
                setLoading(false);
                // Если событие не найдено, можно перенаправить на 404 или список
                if (err.response && err.response.status === 404) {
                    navigate('/events'); // Или '/404'
                }
            }
        };

        fetchEvent();
    }, [id, t, navigate]);

    if (loading) {
        return <p style={{ textAlign: 'center', marginTop: '50px' }}>{t('loading_event_details')}</p>;
    }

    if (error) {
        return <p style={{ color: 'var(--danger-color)', textAlign: 'center', marginTop: '50px' }}>{error}</p>;
    }

    if (!event) {
        return <p style={{ textAlign: 'center', marginTop: '50px' }}>{t('event_not_found')}</p>;
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
            <h1 style={{ color: 'var(--text-color)', marginBottom: '20px' }}>{event.title}</h1>
            <p style={{ color: 'var(--text-color)', lineHeight: '1.6' }}>{event.description}</p>
            <p style={{ color: 'var(--secondary-color)', marginTop: '15px' }}>
                <strong>{t('event_date_time')}:</strong> {new Date(event.date).toLocaleDateString()} {new Date(event.date).toLocaleTimeString()}
            </p>
            <p style={{ color: 'var(--secondary-color)' }}>
                <strong>{t('event_location')}:</strong> {event.location}
            </p>
            <p style={{ color: 'var(--secondary-color)' }}>
                <strong>{t('event_category')}:</strong> {event.category}
            </p>
            {/* Здесь вы можете добавить кнопки для редактирования/удаления (для админов/создателя)
                или секцию комментариев/лайков */}
            <button onClick={() => navigate('/events')} style={{
                marginTop: '30px',
                padding: '10px 20px',
                backgroundColor: 'var(--button-bg-color)',
                color: 'var(--button-text-color)',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer',
                fontSize: '1em',
                transition: 'background-color 0.3s ease'
            }}>
                {t('back_to_events')}
            </button>
        </div>
    );
};

export default EventDetailsPage;