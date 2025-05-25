import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';

function CreateEventPage() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const { t } = useTranslation();

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [date, setDate] = useState('');
    const [location, setLocation] = useState('');
    const [category, setCategory] = useState('');
    const [message, setMessage] = useState('');

    if (!user) {
        navigate('/login');
        return <p style={{ color: 'var(--text-color)' }}>{t('redirecting_to_login')}</p>;
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');

        try {
            const formattedDate = new Date(date).toISOString();

            await API.post('/events', {
                title,
                description,
                date: formattedDate,
                location,
                category,
            });
            setMessage(t('event_created_success'));
            setTitle('');
            setDescription('');
            setDate('');
            setLocation('');
            setCategory('');
            navigate('/events');
        } catch (error) {
            setMessage(error.response?.data?.message || t('event_creation_error'));
            console.error('Ошибка создания события:', error.response?.data || error.message);
        }
    };

    return (
        <form onSubmit={handleSubmit} style={{
            display: 'flex',
            flexDirection: 'column', // Changed to column for vertical stacking
            gap: '15px', // Gap between elements
            padding: '20px',
            maxWidth: '600px',
            margin: '20px auto',
            backgroundColor: 'var(--card-bg-color)',
            border: '1px solid var(--card-border-color)',
            borderRadius: '8px',
            boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
            transition: 'background-color 0.3s ease, border-color 0.3s ease'
        }}>
            <h2 style={{ color: 'var(--text-color)', textAlign: 'center', marginBottom: '10px' }}>{t('create_new_event')}</h2>
            <input
                type="text"
                placeholder={t('event_title')}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                style={{
                    padding: '12px', // Increased padding for better touch targets
                    border: '1px solid var(--input-border-color)',
                    borderRadius: '6px', // Slightly more rounded corners
                    fontSize: '1em',
                    backgroundColor: 'var(--input-bg-color)',
                    color: 'var(--text-color)',
                    transition: 'background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease'
                }}
            />
            <textarea
                placeholder={t('event_description')}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                rows="5" // Increased rows for more visible description area
                style={{
                    padding: '12px',
                    border: '1px solid var(--input-border-color)',
                    borderRadius: '6px',
                    fontSize: '1em',
                    backgroundColor: 'var(--input-bg-color)',
                    color: 'var(--text-color)',
                    resize: 'vertical',
                    transition: 'background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease'
                }}
            />
            <label style={{ color: 'var(--text-color)', fontSize: '0.9em', marginBottom: '-5px' }}>{t('event_date_time')}</label>
            <input
                type="datetime-local"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                style={{
                    padding: '12px',
                    border: '1px solid var(--input-border-color)',
                    borderRadius: '6px',
                    fontSize: '1em',
                    backgroundColor: 'var(--input-bg-color)',
                    color: 'var(--text-color)',
                    transition: 'background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease'
                }}
            />
            <input
                type="text"
                placeholder={t('event_location')}
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                required
                style={{
                    padding: '12px',
                    border: '1px solid var(--input-border-color)',
                    borderRadius: '6px',
                    fontSize: '1em',
                    backgroundColor: 'var(--input-bg-color)',
                    color: 'var(--text-color)',
                    transition: 'background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease'
                }}
            />
            <input
                type="text"
                placeholder={t('event_category')}
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                required
                style={{
                    padding: '12px',
                    border: '1px solid var(--input-border-color)',
                    borderRadius: '6px',
                    fontSize: '1em',
                    backgroundColor: 'var(--input-bg-color)',
                    color: 'var(--text-color)',
                    transition: 'background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease'
                }}
            />
            <button type="submit" style={{
                padding: '14px 20px', // Increased padding for button
                backgroundColor: 'var(--button-bg-color)',
                color: 'var(--button-text-color)',
                border: 'none',
                borderRadius: '8px', // More rounded button
                cursor: 'pointer',
                fontSize: '1.1em', // Slightly larger font
                fontWeight: 'bold',
                marginTop: '10px', // More space above button
                transition: 'background-color 0.3s ease, color 0.3s ease, transform 0.2s ease',
                boxShadow: '0 4px 6px rgba(0,0,0,0.1)' // Added subtle shadow
            }}>
                {t('create_event')}
            </button>
            {message && <p style={{ color: message.includes(t('error')) ? 'var(--red-button-bg)' : 'var(--green-button-bg)', textAlign: 'center', marginTop: '10px' }}>{message}</p>}
        </form>
    );
}

export default CreateEventPage;
