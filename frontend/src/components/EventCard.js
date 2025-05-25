import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import { ru, enUS } from 'date-fns/locale'; // Corrected date-fns locale imports

const EventCard = ({ event }) => {
    const { t, i18n } = useTranslation();

    // Function to format the date based on the current application language
    const formatLocalizedDate = (isoString) => {
        if (!isoString) return '';
        try {
            const dateObj = new Date(isoString);
            const locale = i18n.language === 'ru' ? ru : enUS;
            const options = {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit'
            };
            return new Intl.DateTimeFormat(locale, options).format(dateObj);
        } catch (e) {
            console.error("Error formatting date in EventCard:", e);
            return isoString; // Fallback
        }
    };

    return (
        <div style={{
            border: '1px solid var(--card-border-color)',
            padding: '15px',
            borderRadius: '8px',
            backgroundColor: 'var(--card-bg-color)',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            transition: 'background-color 0.3s ease, border-color 0.3s ease',
            color: 'var(--text-color)'
        }}>
            <h3 style={{ color: 'var(--text-color)', marginBottom: '10px' }}>{event.title}</h3>
            <p style={{ color: 'var(--text-color)', fontSize: '0.9em', marginBottom: '10px' }}>{event.description}</p>
            <p style={{ color: 'var(--text-color)', fontSize: '0.9em', marginBottom: '15px' }}>
                {t('date_label')} {formatLocalizedDate(event.date)}
            </p>
            <Link to={`/events/${event._id}`} style={{
                display: 'inline-block',
                padding: '8px 15px',
                backgroundColor: 'var(--button-bg-color)',
                color: 'var(--button-text-color)',
                textDecoration: 'none',
                borderRadius: '5px',
                fontSize: '0.9em',
                transition: 'background-color 0.3s ease, color 0.3s ease'
            }}>
                {t('event_details')}
            </Link>
        </div>
    );
};

export default EventCard;
