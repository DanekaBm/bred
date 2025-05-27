import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
    fetchEventById,
    toggleLikeEvent,
    toggleDislikeEvent,
    addEventComment,
    deleteEventComment,
    buyTickets // <-- ИМПОРТИРУЕМ НОВЫЙ THUNK
} from '../redux/slices/eventsSlice';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import { ru, enUS } from 'date-fns/locale';
import { FaThumbsUp, FaThumbsDown, FaStar, FaRegStar, FaTrash } from 'react-icons/fa';
import { AuthContext } from '../context/AuthContext';

const EventDetailsPage = () => {
    const { id } = useParams();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { t, i18n } = useTranslation();

    const event = useSelector((state) => state.events.currentEvent);
    const status = useSelector((state) => state.events.status); // Статус для fetchEventById
    const error = useSelector((state) => state.events.error); // Ошибка для fetchEventById

    const { user } = useContext(AuthContext);
    const currentUserId = user?._id;
    const isAdmin = user?.role === 'admin';

    const [numTickets, setNumTickets] = useState(1);

    const { currentEvent } = useSelector((state) => state.events); // <-- currentEvent должен быть получен здесь


    const [commentText, setCommentText] = useState('');
    const [eventLoading, setEventLoading] = useState(true); // Для начальной загрузки event
    const [commentPosting, setCommentPosting] = useState(false);

    // --- НОВОЕ СОСТОЯНИЕ ДЛЯ ПОКУПКИ БИЛЕТОВ ---
    const [numberOfTicketsToBuy, setNumberOfTicketsToBuy] = useState(1);
    const [purchaseMessage, setPurchaseMessage] = useState('');
    const [purchaseError, setPurchaseError] = useState('');
    const purchaseStatus = useSelector(state => state.events.status); // Используем статус для отслеживания buyTickets
    // --- КОНЕЦ НОВОГО СОСТОЯНИЯ ---

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
        if (id) {
            setEventLoading(true);
            dispatch(fetchEventById(id)).unwrap()
                .then(() => setEventLoading(false))
                .catch(() => setEventLoading(false));
        }
    }, [id, dispatch]);

    // Для лайков и дизлайков
    const handleLike = () => {
        if (!user) {
            alert(t('login_to_like'));
            navigate('/login');
            return;
        }
        dispatch(toggleLikeEvent(event._id));
    };

    const handleDislike = () => {
        if (!user) {
            alert(t('login_to_dislike'));
            navigate('/login');
            return;
        }
        dispatch(toggleDislikeEvent(event._id));
    };

    // Для комментариев
    const handleAddComment = async (e) => {
        e.preventDefault();
        if (!user) {
            navigate('/login');
            return;
        }
        if (commentText.trim() === '') {
            alert(t('comment_cannot_be_empty'));
            return;
        }

        setCommentPosting(true);
        try {
            await dispatch(addEventComment({ eventId: event._id, text: commentText })).unwrap();
            setCommentText('');
        } catch (err) {
            alert(`${t('error_adding_comment')}: ${err}`);
            console.error('Error adding comment:', err);
        } finally {
            setCommentPosting(false);
        }
    };

    const handleDeleteComment = async (commentId) => {
        if (!user) {
            navigate('/login');
            return;
        }
        if (window.confirm(t('confirm_delete_comment'))) {
            try {
                await dispatch(deleteEventComment({ eventId: event._id, commentId })).unwrap();
            } catch (err) {
                alert(`${t('error_deleting_comment')}: ${err}`);
                console.error('Error deleting comment:', err);
            }
        }
    };

    // --- НОВАЯ ФУНКЦИЯ ДЛЯ ПОКУПКИ БИЛЕТОВ ---
    const handleBuyTickets = async () => {
        if (!user) { // user из AuthContext, а не из Redux
            alert(t('login_to_buy_tickets'));
            navigate('/login');
            return;
        }

        if (numberOfTicketsToBuy <= 0) {
            setPurchaseError(t('invalid_number_of_tickets'));
            return;
        }

        if (numberOfTicketsToBuy > event.availableTickets) {
            setPurchaseError(t('not_enough_tickets_available') + event.availableTickets);
            return;
        }

        setPurchaseMessage('');
        setPurchaseError('');

        try {
            const resultAction = await dispatch(buyTickets({
                eventId: event._id,
                numberOfTickets: numberOfTicketsToBuy,
            })).unwrap(); // .unwrap() вернет payload или выбросит ошибку
            setPurchaseMessage(resultAction.message);
            setNumberOfTicketsToBuy(1); // Сброс количества
        } catch (err) {
            console.error('Ошибка при покупке билетов:', err);
            setPurchaseError(err || t('failed_to_purchase_tickets')); // err уже содержит сообщение от rejectWithValue
        }
    };
    // --- КОНЕЦ НОВОЙ ФУНКЦИИ ---


    if (eventLoading || status === 'loading') { // Проверка статуса Redux slice для fetchEventById
        return <p style={{ textAlign: 'center', marginTop: '50px' }}>{t('loading_event_details')}</p>;
    }

    if (status === 'failed') { // Ошибка Redux slice для fetchEventById
        return <p style={{ color: 'var(--danger-color)', textAlign: 'center', marginTop: '50px' }}>{error}</p>;
    }

    if (!event) {
        return <p style={{ textAlign: 'center', marginTop: '50px' }}>{t('event_not_found')}</p>;
    }

    // Для лайков и дизлайков
    const isLiked = currentUserId && event.likes && event.likes.includes(currentUserId);
    const isDisliked = currentUserId && event.dislikes && event.dislikes.includes(currentUserId);

    const likesCount = event.likes?.length || 0;
    const dislikesCount = event.dislikes?.length || 0;

    let rating = 0;
    if (likesCount + dislikesCount > 0) {
        rating = (likesCount / (likesCount + dislikesCount)) * 10;
    }
    const displayRating = rating.toFixed(1);

    const renderTenStars = (ratingValue) => {
        const fullStars = Math.round(ratingValue);
        const stars = [];

        for (let i = 0; i < fullStars; i++) {
            stars.push(<FaStar key={`full-${i}`} style={{ color: 'gold' }} />);
        }
        for (let i = fullStars; i < 10; i++) {
            stars.push(<FaRegStar key={`empty-${i}`} style={{ color: 'gray' }} />);
        }
        return stars;
    };

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
            {event.image && (
                <img
                    src={`http://localhost:5001${event.image}`}
                    alt={event.title}
                    style={{
                        width: '100%',
                        maxHeight: '400px',
                        objectFit: 'cover',
                        borderRadius: '8px',
                        marginBottom: '20px'
                    }}
                />
            )}

            <h1 style={{ color: 'var(--text-color)', marginBottom: '20px' }}>{event.title}</h1>
            <p style={{ color: 'var(--text-color)', lineHeight: '1.6' }}>{event.description}</p>
            <p style={{ color: 'var(--secondary-color)', marginTop: '15px' }}>
                <strong>{t('event_date_time')}:</strong> {formatLocalizedDateTime(event.date)}
            </p>
            <p style={{ color: 'var(--secondary-color)' }}>
                <strong>{t('event_location')}:</strong> {event.location}
            </p>
            <p style={{ color: 'var(--secondary-color)' }}>
                <strong>{t('event_category')}:</strong> {event.category}
            </p>
            <p style={{ color: 'var(--secondary-color)'}}>
                <strong>{t('organizer')}:</strong> {event.organizer}
            </p>

            {event.createdBy && (
                <p style={{ color: 'var(--secondary-color)' }}>
                    <strong>{t('created_by_label')}:</strong> {event.createdBy.name} ({event.createdBy.email})
                </p>
            )}

            <div style={{ marginTop: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <strong style={{ color: 'var(--text-color)' }}>{t('rating')}:</strong>
                <span style={{ color: 'var(--text-color)', fontWeight: 'bold' }}>
                    {displayRating} / 10
                </span>
                <div style={{ display: 'flex', color: 'gold' }}>
                    {renderTenStars(rating)}
                </div>
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                <button
                    onClick={handleLike}
                    style={{
                        padding: '10px 15px',
                        backgroundColor: isLiked ? 'var(--primary-color)' : 'var(--button-bg-color)',
                        color: isLiked ? 'white' : 'var(--button-text-color)',
                        border: 'none',
                        borderRadius: '5px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '5px',
                        fontWeight: isLiked ? 'bold' : 'normal'
                    }}
                >
                    <FaThumbsUp /> {likesCount} {t('likes')}
                </button>
                <button
                    onClick={handleDislike}
                    style={{
                        padding: '10px 15px',
                        backgroundColor: isDisliked ? 'var(--danger-color)' : 'var(--button-bg-color)',
                        color: isDisliked ? 'white' : 'var(--button-text-color)',
                        border: 'none',
                        borderRadius: '5px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '5px',
                        fontWeight: isDisliked ? 'bold' : 'normal'
                    }}
                >
                    <FaThumbsDown /> {dislikesCount} {t('dislikes')}
                </button>
            </div>

            {/* --- БЛОК ПОКУПКИ БИЛЕТОВ --- */}
            <div style={{ marginTop: '30px', padding: '20px', border: '1px solid var(--card-border-color)', borderRadius: '8px', backgroundColor: 'var(--element-bg-color)' }}>
                <h2 style={{ color: 'var(--text-color)' }}>{t('tickets')}</h2>
                <p style={{ color: 'var(--secondary-color)' }}>
                    <strong>{t('price')}:</strong> {event.price} {t('currency_symbol')}
                </p>
                <p style={{ color: 'var(--secondary-color)' }}>
                    <strong>{t('available_tickets')}:</strong> {event.availableTickets}
                </p>

                {event.availableTickets > 0 ? (
                    user ? ( // Проверяем user из AuthContext для авторизации
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '15px' }}>
                            <label htmlFor="numTickets" style={{ color: 'var(--text-color)' }}>{t('number_of_tickets')}:</label>
                            <input
                                type="number"
                                id="numTickets"
                                value={numberOfTicketsToBuy}
                                onChange={(e) => setNumberOfTicketsToBuy(parseInt(e.target.value) || 0)}
                                min="1"
                                max={event.availableTickets}
                                style={{ width: '150px', padding: '8px', borderRadius: '4px', border: '1px solid var(--input-border-color)', backgroundColor: 'var(--input-bg-color)', color: 'var(--input-text-color)' }}
                            />
                            <button
                                onClick={handleBuyTickets}
                                disabled={purchaseStatus === 'loading'} // Отключаем кнопку во время загрузки
                                style={{
                                    padding: '10px 20px',
                                    backgroundColor: 'light-blue',
                                    color: 'white',
                                    borderRadius: '5px',
                                    border: 'none',
                                    cursor: 'pointer',
                                    transition: 'background-color 0.3s ease',
                                    width: 'fit-content',
                                    opacity: purchaseStatus === 'loading' ? 0.7 : 1
                                }}
                            >
                                {purchaseStatus === 'loading' ? t('purchasing') : t('buy_tickets')}
                            </button>
                            {purchaseMessage && (
                                <p style={{ color: 'green', textAlign: 'center', marginTop: '10px' }}>
                                    {t('ticket_purchase_success_message', { count: numTickets, eventTitle: currentEvent.title })}
                                </p>
                            )}
                            {purchaseError && (
                                <p style={{ color: 'red', textAlign: 'center', marginTop: '10px' }}>
                                    {t('purchase_failed')} {purchaseError}
                                </p>
                            )}
                        </div>
                    ) : (
                        <p style={{ marginTop: '15px', color: 'var(--secondary-color)' }}>
                            <Link to="/login" style={{ color: 'var(--link-color)' }}>{t('login_to_buy_tickets_link')}</Link>
                        </p>
                    )
                ) : (
                    <p style={{ color: 'red', marginTop: '15px' }}>{t('tickets_sold_out')}</p>
                )}
            </div>
            {/* --- КОНЕЦ БЛОКА ПОКУПКИ БИЛЕТОВ --- */}

            <div style={{ marginTop: '30px', borderTop: '1px solid var(--card-border-color)', paddingTop: '20px' }}>
                <h2 style={{ color: 'var(--text-color)', marginBottom: '20px' }}>{t('comments')}</h2>

                {user ? (
                    <form onSubmit={handleAddComment} style={{ marginBottom: '30px' }}>
                        <textarea
                            value={commentText}
                            onChange={(e) => setCommentText(e.target.value)}
                            placeholder={t('write_a_comment')}
                            rows="4"
                            style={{
                                width: '100%',
                                padding: '10px',
                                border: '1px solid var(--input-border-color)',
                                borderRadius: '5px',
                                backgroundColor: 'var(--input-bg-color)',
                                color: 'var(--input-text-color)',
                                resize: 'vertical'
                            }}
                        ></textarea>
                        <button
                            type="submit"
                            disabled={commentPosting}
                            style={{
                                padding: '10px 20px',
                                backgroundColor: 'var(--primary-color)', // Изменил цвет кнопки
                                color: 'white',
                                border: 'none',
                                borderRadius: '5px',
                                cursor: 'pointer',
                                fontSize: '1em',
                                opacity: commentPosting ? 0.7 : 1
                            }}
                        >
                            {commentPosting ? t('posting') : t('add_a_comment')}
                        </button>
                    </form>
                ) : (
                    <p style={{ color: 'var(--secondary-color)', marginBottom: '20px' }}>
                        {t('login_to_comment')}
                    </p>
                )}

                {event.comments && event.comments.length > 0 ? (
                    <div style={{ borderTop: '1px solid var(--card-border-color)', paddingTop: '20px' }}>
                        {event.comments.map((comment) => (
                            <div key={comment._id} style={{
                                backgroundColor: 'var(--element-bg-color)',
                                padding: '15px',
                                borderRadius: '5px',
                                marginBottom: '15px',
                                boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
                                position: 'relative'
                            }}>
                                <p style={{ color: 'var(--text-color)', marginBottom: '5px' }}>
                                    <strong>{comment.user?.name || t('anonymous_user')}:</strong> {comment.text}
                                </p>
                                <p style={{ fontSize: '0.8em', color: 'var(--secondary-color)' }}>
                                    {formatLocalizedDateTime(comment.createdAt)}
                                </p>
                                {(currentUserId === comment.user?._id || isAdmin) && (
                                    <button
                                        onClick={() => handleDeleteComment(comment._id)}
                                        style={{
                                            position: 'absolute',
                                            top: '10px',
                                            right: '10px',
                                            backgroundColor: 'transparent',
                                            border: 'none',
                                            color: 'var(--danger-color)',
                                            cursor: 'pointer',
                                            fontSize: '1.2em'
                                        }}
                                        title={t('delete_comment')}
                                    >
                                        <FaTrash />
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                    <p style={{ color: 'var(--secondary-color)' }}>{t('no_comments_yet')}</p>
                )}
            </div>


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