import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import { ru, enUS } from 'date-fns/locale';

import { fetchAllEvents } from '../redux/slices/eventsSlice';
import Pagination from '../components/Pagination'; // Импортируем компонент пагинации

// --- НОВЫЕ ИМПОРТЫ ДЛЯ ПОДДЕРЖКИ ---
import SupportFormModal from '../components/SupportFormModal'; // Импортируем новый компонент модального окна
import { FaQuestionCircle } from 'react-icons/fa'; // Импортируем иконку для кнопки
// --- КОНЕЦ НОВЫХ ИМПОРТОВ ---

// --- Утилита для debounce (можно вынести в отдельный файл, например, src/hooks/useDebounce.js) ---
function useDebounce(value, delay) {
    const [debouncedValue, setDebouncedValue] = useState(value);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);

    return debouncedValue;
}
// --- Конец утилиты debounce ---

function EventListPage() {
    const dispatch = useDispatch();
    const { t, i18n } = useTranslation();

    const events = useSelector(state => state.events.allEvents);
    const eventsStatus = useSelector(state => state.events.status);
    const error = useSelector(state => state.events.error);
    const totalEvents = useSelector(state => state.events.totalEvents); // Получаем общее количество событий

    // Состояния для фильтрации и сортировки
    const [searchTerm, setSearchTerm] = useState('');
    const [sortOrder, setSortOrder] = useState('asc'); // 'asc' для А-Я, 'desc' для Я-А
    const [priceFilter, setPriceFilter] = useState('');
    const [ticketsFilter, setTicketsFilter] = useState('');

    // Состояния для пагинации
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(5); // Количество элементов на страницу (можно сделать настраиваемым)

    // --- НОВОЕ СОСТОЯНИЕ ДЛЯ МОДАЛЬНОГО ОКНА ПОДДЕРЖКИ ---
    const [isSupportModalOpen, setIsSupportModalOpen] = useState(false);
    // --- КОНЕЦ НОВОГО СОСТОЯНИЯ ---

    const debouncedSearchTerm = useDebounce(searchTerm, 500); // Задержка 500 мс

    const formatLocalizedDateTime = useCallback((isoString) => {
        if (!isoString) return '';
        try {
            const dateObj = new Date(isoString);
            const locale = i18n.language === 'ru' ? ru : enUS;
            return format(dateObj, 'PPPPp', { locale });
        } catch (e) {
            console.error("Error formatting date:", e);
            return isoString;
        }
    }, [i18n.language]); // Зависимость от i18n.language

    // Функция для загрузки событий с параметрами
    const loadEvents = useCallback(() => {
        const params = {
            page: currentPage,
            limit: itemsPerPage,
            searchTerm: debouncedSearchTerm,
            sortOrder: sortOrder,
            priceRange: priceFilter,
            ticketsRange: ticketsFilter,
        };
        dispatch(fetchAllEvents(params));
    }, [
        dispatch,
        currentPage,
        itemsPerPage,
        debouncedSearchTerm,
        sortOrder,
        priceFilter,
        ticketsFilter
    ]);

    // Эффект для загрузки событий при изменении зависимостей
    useEffect(() => {
        loadEvents();
    }, [loadEvents]); // Зависимость от мемоизированной функции loadEvents

    // Обработчик изменения страницы
    const handlePageChange = useCallback((page) => {
        // Если пользователь пытается перейти на текущую страницу, или страница выходит за границы
        const calculatedTotalPages = Math.ceil(totalEvents / itemsPerPage);
        if (page === currentPage || page < 1 || page > calculatedTotalPages) return;

        setCurrentPage(page);
    }, [currentPage, totalEvents, itemsPerPage]);

    // Обновляем общую логику фильтрации и сортировки, предполагая, что это теперь на бэкенде.
    // `events` уже приходят отфильтрованными, отсортированными и пагинированными.
    const displayedEvents = useMemo(() => {
        return events;
    }, [events]);

    const totalPages = Math.ceil(totalEvents / itemsPerPage);

    // --- ОБРАБОТЧИКИ ОТКРЫТИЯ/ЗАКРЫТИЯ МОДАЛЬНОГО ОКНА ПОДДЕРЖКИ ---
    const openSupportModal = () => setIsSupportModalOpen(true);
    const closeSupportModal = () => setIsSupportModalOpen(false);
    // --- КОНЕЦ ОБРАБОТЧИКОВ ---

    if (eventsStatus === 'loading') return <p style={{ color: 'var(--text-color)' }}>{t('loading_events')}</p>;
    if (eventsStatus === 'failed') return <p style={{ color: 'var(--red-button-bg)' }}>{error}</p>;

    return (
        <div style={{ color: 'var(--text-color)' }}>
            <h2 style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                {t('event_list')}
                {/* --- КНОПКА ПОДДЕРЖКИ --- */}
                <button
                    onClick={openSupportModal}
                    style={{
                        padding: '10px 15px',
                        backgroundColor: '#3d414a',
                        color: 'var(--button-text-color)',
                        border: 'none',
                        borderRadius: '5px',
                        cursor: 'pointer',
                        fontSize: '1em',
                        fontWeight: 'bold',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        transition: 'background-color 0.3s ease',
                    }}
                >
                    <FaQuestionCircle size={20} /> {/* Иконка */}
                    {t('support_button_label')}
                </button>
                {/* --- КОНЕЦ КНОПКИ ПОДДЕРЖКИ --- */}
            </h2>

            {/* --- МОДАЛЬНОЕ ОКНО ПОДДЕРЖКИ --- */}
            <SupportFormModal isOpen={isSupportModalOpen} onClose={closeSupportModal} />
            {/* --- КОНЕЦ МОДАЛЬНОГО ОКНА --- */}

            {/* Блок поиска и сортировки */}
            <div style={{ marginBottom: '20px', display: 'flex', gap: '15px', alignItems: 'center' }}>
                <input
                    type="text"
                    placeholder={t('search_by_title')}
                    value={searchTerm}
                    onChange={(e) => {
                        setSearchTerm(e.target.value);
                        // При изменении поискового запроса, сбрасываем на первую страницу
                        if (currentPage !== 1) setCurrentPage(1);
                    }}
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
                    onChange={(e) => {
                        setSortOrder(e.target.value);
                        // При изменении сортировки, сбрасываем на первую страницу
                        if (currentPage !== 1) setCurrentPage(1);
                    }}
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
                    onChange={(e) => {
                        setPriceFilter(e.target.value);
                        // При изменении фильтра, сбрасываем на первую страницу
                        if (currentPage !== 1) setCurrentPage(1);
                    }}
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
            <div style={{ marginBottom: '20px' }}>
                <label htmlFor="ticketsFilter" style={{ marginRight: '10px', color: 'var(--text-color)' }}>
                    {t('filter_by_tickets')}:
                </label>
                <select
                    id="ticketsFilter"
                    value={ticketsFilter}
                    onChange={(e) => {
                        setTicketsFilter(e.target.value);
                        // При изменении фильтра, сбрасываем на первую страницу
                        if (currentPage !== 1) setCurrentPage(1);
                    }}
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

            {totalEvents === 0 && eventsStatus === 'succeeded' ? ( // Проверяем totalEvents и статус
                <p>{t('no_events_found')}</p>
            ) : (
                <>
                    <ul style={{ listStyle: 'none', padding: 0 }}>
                        {displayedEvents.map((event) => (
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

                    {/* Компонент пагинации */}
                    {totalPages > 1 && (
                        <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={handlePageChange}
                        />
                    )}
                </>
            )}
        </div>
    );
}

export default EventListPage;