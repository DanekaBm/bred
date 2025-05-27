import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import { ru, enUS } from 'date-fns/locale';

import { fetchAllEvents } from '../redux/slices/eventsSlice'; // Удалены toggleLikeEvent, addEventComment, deleteEventComment

function EventListPage() {
    const dispatch = useDispatch();
    const { t, i18n } = useTranslation();

    const events = useSelector(state => state.events.allEvents);
    const eventsStatus = useSelector(state => state.events.status);
    const error = useSelector(state => state.events.error);

    // Состояния для сортировки и поиска
    const [searchTerm, setSearchTerm] = useState('');
    const [sortOrder, setSortOrder] = useState('asc'); // 'asc' для А-Я, 'desc' для Я-А
    const [priceFilter, setPriceFilter] = useState('');
    const [ticketsFilter, setTicketsFilter] = useState('');


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

    const handleFetchEvents = useCallback(() => {
        const params = {
            priceRange: priceFilter,
            ticketsRange: ticketsFilter,
            // Сортировка (sortOrder) будет обрабатываться на фронтенде после получения данных,
            // если вы не хотите передавать ее на бэкенд для запроса к БД.
            // Если нужно, добавьте 'sortOrder' в params и обработайте на бэкенде.
        };
        dispatch(fetchAllEvents(params));
    }, [dispatch, priceFilter, ticketsFilter]); // Зависимости для useCallback

    useEffect(() => {
        // Загружаем события при первом рендере и при изменении фильтров/поиска
        handleFetchEvents();
    }, [handleFetchEvents]); // Зависимость от мемоизированной функции


    // Логика фильтрации и сортировки событий
    const filteredAndSortedEvents = useMemo(() => {
        let currentEvents = [...events]; // Создаем копию для мутаций

        // 1. Фильтрация по поисковому запросу
        if (searchTerm) {
            currentEvents = currentEvents.filter(event =>
                event.title.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // 2. Сортировка по названию
        currentEvents.sort((a, b) => {
            const titleA = a.title.toLowerCase();
            const titleB = b.title.toLowerCase();

            if (sortOrder === 'asc') {
                return titleA.localeCompare(titleB); // Сортировка А-Я
            } else {
                return titleB.localeCompare(titleA); // Сортировка Я-А
            }
        });

        return currentEvents;
    }, [events, searchTerm, sortOrder]); // Пересчитываем только при изменении этих зависимостей

    if (eventsStatus === 'loading') return <p style={{ color: 'var(--text-color)' }}>{t('loading_events')}</p>;
    if (eventsStatus === 'failed') return <p style={{ color: 'var(--red-button-bg)' }}>{error}</p>;

    return (
        <div style={{ color: 'var(--text-color)' }}>
            <h2>{t('event_list')}</h2>

            {/* Блок поиска и сортировки */}
            <div style={{ marginBottom: '20px', display: 'flex', gap: '15px', alignItems: 'center' }}>
                <input
                    type="text"
                    placeholder={t('search_by_title')}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{
                        padding: '10px',
                        borderRadius: '5px',
                        border: '1px solid var(--input-border-color)',
                        backgroundColor: 'var(--input-bg-color)',
                        color: 'var(--input-text-color)',
                        width: '300px'
                    }}
                />
                <select
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value)}
                    style={{
                        padding: '10px',
                        borderRadius: '5px',
                        border: '1px solid var(--input-border-color)',
                        backgroundColor: 'var(--input-bg-color)',
                        color: 'var(--input-text-color)'
                    }}
                >
                    <option value="asc">{t('sort_asc')}</option>
                    <option value="desc">{t('sort_desc')}</option>
                </select>
            </div>

            {/* Фильтр по цене */}
            <div>
                <label htmlFor="priceFilter" style={{ marginRight: '10px', color: 'var(--text-color)' }}>
                    {t('filter_by_price')}:
                </label>
                <select
                    id="priceFilter"
                    value={priceFilter}
                    onChange={(e) => setPriceFilter(e.target.value)}
                    style={{
                        padding: '8px',
                        borderRadius: '5px',
                        border: '1px solid var(--border-color)',
                        backgroundColor: 'var(--input-bg-color)',
                        color: 'var(--text-color)',
                    }}
                >
                    <option value="">{t('all_prices')}</option>
                    <option value="upTo1000">{t('up_to_1000')}</option>
                    <option value="over1001">{t('over_1001')}</option>
                </select>
            </div>

            {/* Фильтр по количеству билетов */}
            <div>
                <label htmlFor="ticketsFilter" style={{ marginRight: '10px', color: 'var(--text-color)' }}>
                    {t('filter_by_tickets')}:
                </label>
                <select
                    id="ticketsFilter"
                    value={ticketsFilter}
                    onChange={(e) => setTicketsFilter(e.target.value)}
                    style={{
                        padding: '8px',
                        borderRadius: '5px',
                        border: '1px solid var(--border-color)',
                        backgroundColor: 'var(--input-bg-color)',
                        color: 'var(--text-color)',
                    }}
                >
                    <option value="">{t('all_tickets')}</option>
                    <option value="upTo50">{t('up_to_50')}</option>
                    <option value="over51">{t('over_51')}</option>
                </select>
            </div>
    {/* Конец блока поиска и сортировки */}

            {filteredAndSortedEvents.length === 0 ? (
                <p>{t('no_events_found')}</p>
            ) : (
                <ul style={{ listStyle: 'none', padding: 0 }}>
                    {filteredAndSortedEvents.map((event) => (
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
                            <p style={{ color: 'var(--text-color)' }}><strong>{t('location_label')}</strong> {event.location}</p>
                            <p style={{ color: 'var(--text-color)' }}><strong>{t('date_label')}</strong> {formatLocalizedDateTime(event.date)}</p>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

export default EventListPage;