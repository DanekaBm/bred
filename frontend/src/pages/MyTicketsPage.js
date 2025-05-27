// frontend/src/pages/MyTicketsPage.js
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUserTickets } from '../redux/slices/ticketsSlice';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const MyTicketsPage = () => {
    const dispatch = useDispatch();
    const { user, loading: authLoading } = useAuth();
    const navigate = useNavigate();
    const { t } = useTranslation();

    // Получаем состояние из Redux store
    const { userTickets, status, error } = useSelector((state) => state.tickets);

    useEffect(() => {
        // Если пользователь не загружен или не авторизован, перенаправляем на логин
        if (!authLoading && !user) {
            navigate('/login');
        } else if (user) {
            // Загружаем билеты пользователя только если пользователь авторизован
            dispatch(fetchUserTickets());
        }
    }, [user, authLoading, navigate, dispatch]);

    if (authLoading || status === 'loading') {
        return <p style={{ textAlign: 'center', marginTop: '50px', color: 'var(--text-color)' }}>{t('loading_tickets')}...</p>;
    }

    if (error) {
        return <p style={{ textAlign: 'center', marginTop: '50px', color: 'red' }}>{t('error_loading_tickets')}: {error}</p>;
    }

    if (!user) {
        return null; // Уже перенаправили, но на всякий случай
    }

    return (
        <div style={{
            padding: '20px',
            maxWidth: '900px',
            margin: '20px auto',
            backgroundColor: 'var(--card-bg-color)',
            border: '1px solid var(--card-border-color)',
            borderRadius: '8px',
            boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
            transition: 'background-color 0.3s ease, border-color 0.3s ease'
        }}>
            <h1 style={{ color: 'var(--text-color)', marginBottom: '25px', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>{t('my_tickets')}</h1>

            {userTickets.length === 0 ? (
                <p style={{ textAlign: 'center', color: 'var(--text-color-secondary)' }}>{t('no_tickets_found')}</p>
            ) : (
                <ul style={{ listStyle: 'none', padding: 0 }}>
                    {userTickets.map((ticket) => (
                        <li key={ticket._id} style={{
                            display: 'flex',
                            flexDirection: 'column',
                            border: '1px solid var(--card-border-color)',
                            padding: '15px',
                            marginBottom: '15px',
                            borderRadius: '8px',
                            backgroundColor: 'var(--body-bg-color)',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
                            transition: 'background-color 0.3s ease, border-color 0.3s ease'
                        }}>
                            <h3 style={{ color: 'var(--text-color)', margin: '0 0 10px 0' }}>{ticket.event?.title || t('unknown_event')}</h3>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '0.95em' }}>
                                <p style={{ margin: 0, color: 'var(--text-color-secondary)' }}><strong>{t('date')}:</strong> {ticket.event?.date ? new Date(ticket.event.date).toLocaleDateString() : t('n_a')}</p>
                                <p style={{ margin: 0, color: 'var(--text-color-secondary)' }}><strong>{t('location')}:</strong> {ticket.event?.location || t('n_a')}</p>
                                <p style={{ margin: 0, color: 'var(--text-color-secondary)' }}><strong>{t('category')}:</strong> {ticket.event?.category || t('n_a')}</p>
                                <p style={{ margin: 0, color: 'var(--text-color-secondary)' }}><strong>{t('organizer')}:</strong> {ticket.event?.organizer || t('n_a')}</p>
                                <p style={{ margin: 0, color: 'var(--text-color-secondary)' }}><strong>{t('ticket_price')}:</strong> {ticket.price} {t('currency_symbol')}</p>
                                <p style={{ margin: 0, color: 'var(--text-color-secondary)' }}><strong>{t('purchased_quantity')}:</strong> {ticket.quantity}</p>
                                <p style={{ margin: 0, color: 'var(--text-color-secondary)' }}><strong>{t('total_cost')}:</strong> {ticket.quantity * ticket.price} {t('currency_symbol')}</p>
                                <p style={{ margin: 0, color: 'var(--text-color-secondary)' }}><strong>{t('purchase_date')}:</strong> {new Date(ticket.purchaseDate).toLocaleDateString()}</p>
                            </div>
                            {ticket.event?.image && (
                                <div style={{ marginTop: '15px', textAlign: 'center' }}>
                                    <img src={`http://localhost:5001${ticket.event.image}`} alt={ticket.event.title} style={{ maxWidth: '200px', height: 'auto', borderRadius: '4px' }} />
                                </div>
                            )}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default MyTicketsPage;