import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import Slider from 'react-slick';
import API from '../api';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function HomePage() {
    const { t } = useTranslation();
    const [featuredEvents, setFeaturedEvents] = useState([]);
    const [userEvents, setUserEvents] = useState([]);
    const [likedEvents, setLikedEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { user } = useAuth();

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError(null);
            if (user) {
                try {
                    const carouselResponse = await API.get('/events/featured');
                    setFeaturedEvents(carouselResponse.data);

                    const userEventsResponse = await API.get(`/users/${user._id}/events`);
                    setUserEvents(userEventsResponse.data);

                    const likedEventsResponse = await API.get(`/users/${user._id}/liked-events`);
                    setLikedEvents(likedEventsResponse.data);


                } catch (err) {
                    console.error('Ошибка при загрузке персонализированных данных:', err);
                    setError(t('personalized_data_load_error'));
                } finally {
                    setLoading(false);
                }
            } else {
                setFeaturedEvents([]);
                setUserEvents([]);
                setLikedEvents([]);
                setLoading(false);
                setError(null);
            }
        };

        fetchData();
    }, [t, user]);

    const sliderSettings = {
        dots: true,
        infinite: true,
        speed: 500,
        slidesToShow: 1,
        slidesToScroll: 1,
        autoplay: true,
        autoplaySpeed: 3000,
        arrows: true,
    };

    return (
        <div style={{ padding: '20px' }}>
            <h1>{t('welcome_message')}</h1>

            {user ? (
                <>
                    <h2 style={{ marginTop: '40px', marginBottom: '20px' }}>{t('featured_events')}</h2>
                    {loading ? (
                        <p>{t('loading_events')}</p>
                    ) : error ? (
                        <p style={{ color: 'red' }}>{error}</p>
                    ) : featuredEvents.length === 0 ? (
                        <p>{t('no_featured_events_available')}</p>
                    ) : (
                        <div style={{ maxWidth: '800px', margin: '0 auto', marginBottom: '40px' }}>
                            <Slider {...sliderSettings}>
                                {featuredEvents.map((event) => (
                                    <Link to={`/events/${event._id}`} key={event._id} style={{ textDecoration: 'none', color: 'inherit' }}>
                                        <div style={{ textAlign: 'center', padding: '10px', cursor: 'pointer' }}>
                                            {event.image && (
                                                <img
                                                    src={`http://localhost:5001${event.image}`}
                                                    alt={event.title}
                                                    style={{ width: '100%', maxHeight: '400px', objectFit: 'cover', borderRadius: '8px', marginBottom: '10px' }}
                                                />
                                            )}
                                            <h3 style={{ color: 'var(--text-color)' }}>{event.title}</h3>
                                            <p style={{ color: 'var(--text-color)' }}>{event.description}</p>
                                            {event.date && <p style={{ color: 'var(--text-color)' }}>{t('date_label')}: {new Date(event.date).toLocaleDateString()}</p>}
                                            {event.location && <p style={{ color: 'var(--text-color)' }}>{t('location_label')}: {event.location}</p>}
                                        </div>
                                    </Link>
                                ))}
                            </Slider>
                        </div>
                    )}

                    {user && user.role === 'admin' && (
                        <div className="admin-user-events-section">
                            <h2 style={{ marginTop: '40px', marginBottom: '20px' }}>{t('your_events')}</h2>
                            {loading ? (
                                <p>{t('loading_data')}</p>
                            ) : userEvents.length === 0 ? (
                                <p>{t('no_events_created_by_you')}</p>
                            ) : (
                                <ul style={{ listStyle: 'none', padding: 0 }}>
                                    {userEvents.map(event => (
                                        <li key={event._id} style={{ marginBottom: '10px', padding: '10px', border: '1px solid var(--card-border-color)', borderRadius: '4px', backgroundColor: 'var(--card-bg-color)' }}>
                                            <Link to={`/events/${event._id}`} style={{ textDecoration: 'none', color: 'var(--link-color)' }}>
                                                {event.title} - {event.location}
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    )}


                    <h2 style={{ marginTop: '40px', marginBottom: '20px' }}>{t('events_you_liked')}</h2>
                    {loading ? (
                        <p>{t('loading_data')}</p>
                    ) : likedEvents.length === 0 ? (
                        <p>{t('no_liked_events')}</p>
                    ) : (
                        <ul style={{ listStyle: 'none', padding: 0 }}>
                            {likedEvents.map(event => (
                                <li key={event._id} style={{ marginBottom: '10px', padding: '10px', border: '1px solid var(--card-border-color)', borderRadius: '4px', backgroundColor: 'var(--card-bg-color)' }}>
                                    <Link to={`/events/${event._id}`} style={{ textDecoration: 'none', color: 'var(--link-color)' }}>
                                        {event.title} - {event.location} ({event.likes.length} {t('likes')})
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    )}

                    <h2 style={{ marginTop: '40px', marginBottom: '20px' }}>{t('quick_actions')}</h2>
                    <div style={{ display: 'flex', gap: '15px' }}>
                        <Link to="/profile" style={{
                            padding: '10px 15px',
                            backgroundColor: 'var(--button-bg-color)',
                            color: 'var(--button-text-color)',
                            borderRadius: '5px',
                            textDecoration: 'none',
                            transition: 'background-color 0.3s ease'
                        }}>{t('view_profile')}</Link>
                        {user.role === 'admin' && (
                            <Link to="/admin/events" style={{
                                padding: '10px 15px',
                                backgroundColor: 'var(--button-bg-color)',
                                color: 'var(--button-text-color)',
                                borderRadius: '5px',
                                textDecoration: 'none',
                                transition: 'background-color 0.3s ease'
                            }}>{t('create_new_event')}</Link>
                        )}
                        <Link to="/events" style={{
                            padding: '10px 15px',
                            backgroundColor: 'var(--button-bg-color)',
                            color: 'var(--button-text-color)',
                            borderRadius: '5px',
                            textDecoration: 'none',
                            transition: 'background-color 0.3s ease'
                        }}>{t('view_all_events')}</Link>
                    </div>

                </>
            ) : (
                <div style={{ marginTop: '40px', textAlign: 'center' }}>
                    <p style={{ fontSize: '1.2em', color: 'var(--text-color)' }}>
                        {t('please_login_to_view_personalized_content')}
                    </p>
                    <Link to="/login" style={{ marginRight: '10px' }}>{t('login')}</Link>
                    <Link to="/register">{t('register')}</Link>
                </div>
            )}
        </div>
    );
}

export default HomePage;