import React, { useEffect, useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { uploadEventImage, getEvents, createEvent, updateEvent, deleteEvent } from '../services/eventService';

const AdminManageEventsPage = () => {
    const { user, loading } = useAuth();
    const navigate = useNavigate();
    const { t } = useTranslation();

    const [events, setEvents] = useState([]);
    const [loadingEvents, setLoadingEvents] = useState(true);
    const [error, setError] = useState(null);
    const [uploadingImage, setUploadingImage] = useState(false);

    const [isEditing, setIsEditing] = useState(false);
    const [currentEvent, setCurrentEvent] = useState(null);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        date: '',
        location: '',
        category: '',
        image: '',
        organizer: '',
        price: 0,
        availableTickets: 0
    });
    const [selectedFile, setSelectedFile] = useState(null);

    const fileInputRef = useRef(null);

    useEffect(() => {
        if (!loading && (!user || user.role !== 'admin')) {
            navigate('/login');
        }
    }, [user, loading, navigate]);

    const fetchEvents = async () => {
        setLoadingEvents(true);
        setError(null);
        try {
            const res = await getEvents();
            console.log('Response from getEvents():', res);

            if (Array.isArray(res)) {
                setEvents(res);
            } else if (res && Array.isArray(res.events)) {
                setEvents(res.events);
            } else {
                console.error('API вернул данные, которые не являются массивом или не содержат массив "events" в свойстве .events:', res);
                setError(t('error_invalid_data_from_server'));
                setEvents([]);
            }
        } catch (err) {
            console.error('Ошибка загрузки событий:', err);
            setError(err.message || t('error_loading_events'));
            setEvents([]);
        } finally {
            setLoadingEvents(false);
        }
    };

    useEffect(() => {
        if (user && user.role === 'admin') {
            fetchEvents();
        }
    }, [user]);

    const handleFormChange = (e) => {
        const { name, value, type } = e.target;
        // Для числовых полей, преобразуем значение в число
        setFormData({
            ...formData,
            [name]: type === 'number' ? parseFloat(value) : value
        });
    };

    const handleFileChange = (e) => {
        setSelectedFile(e.target.files[0]);
        setFormData(prev => ({ ...prev, image: '' }));
    };

    const handleButtonClick = () => {
        fileInputRef.current.click();
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        // Проверка обязательных полей (включая price и availableTickets)
        if (!formData.title || !formData.description || !formData.date || !formData.location ||
            !formData.category || !formData.organizer || formData.price === null || formData.availableTickets === null) {
            setError(t('all_fields_required'));
            return;
        }

        // Дополнительные проверки для числовых полей
        if (isNaN(formData.price) || formData.price < 0) {
            setError(t('invalid_price'));
            return;
        }
        if (isNaN(formData.availableTickets) || formData.availableTickets < 0) {
            setError(t('invalid_available_tickets'));
            return;
        }


        let finalImageUrl = formData.image;

        if (selectedFile) {
            setUploadingImage(true);
            try {
                const uploadedUrl = await uploadEventImage(selectedFile);
                finalImageUrl = uploadedUrl;
            } catch (err) {
                setError(err.message || t('error_uploading_image'));
                setUploadingImage(false);
                return;
            } finally {
                setUploadingImage(false);
            }
        }

        // Создаем объект eventData со всеми полями, включая price и availableTickets
        const eventData = {
            ...formData,
            image: finalImageUrl,
            price: formData.price, // Убеждаемся, что это число
            availableTickets: formData.availableTickets // Убеждаемся, что это число
        };

        try {
            if (isEditing && currentEvent) {
                await updateEvent(currentEvent._id, eventData);
                alert(t('event_updated_successfully'));
            } else {
                await createEvent(eventData);
                alert(t('event_created_successfully'));
            }
            // Сброс формы после успешной операции
            setFormData({
                title: '',
                description: '',
                date: '',
                location: '',
                category: '',
                image: '',
                organizer: '',
                price: 0,
                availableTickets: 0
            });
            setSelectedFile(null);
            setCurrentEvent(null);
            setIsEditing(false);
            fetchEvents(); // Обновляем список событий
        } catch (err) {
            console.error('Ошибка операции с событием:', err.message);
            setError(err.message || t('error_saving_event'));
        }
    };

    const handleEdit = (event) => {
        setIsEditing(true);
        setCurrentEvent(event);
        setFormData({
            title: event.title,
            description: event.description,
            date: event.date ? new Date(event.date).toISOString().split('T')[0] : '', // Форматируем дату для input type="date"
            location: event.location,
            category: event.category,
            image: event.image || '',
            organizer: event.organizer,
            price: event.price || 0, // Устанавливаем текущую цену
            availableTickets: event.availableTickets || 0 // Устанавливаем текущее количество билетов
        });
        setSelectedFile(null);
    };

    const handleDelete = async (id) => {
        if (window.confirm(t('confirm_delete_event'))) {
            setError(null);
            try {
                await deleteEvent(id);
                alert(t('event_deleted_successfully'));
                fetchEvents();
            } catch (err) {
                console.error('Ошибка удаления события:', err.message);
                setError(err.message || t('error_deleting_event'));
            }
        }
    };

    const handleCancelEdit = () => {
        setIsEditing(false);
        setCurrentEvent(null);
        setFormData({
            title: '',
            description: '',
            date: '',
            location: '',
            category: '',
            image: '',
            organizer: '',
            price: 0,
            availableTickets: 0
        });
        setSelectedFile(null);
        setError(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    if (loading) {
        return <p style={{ textAlign: 'center', marginTop: '50px' }}>{t('loading')}...</p>;
    }

    if (!user || user.role !== 'admin') {
        return null; // Или перенаправить на другую страницу, если еще не был перенаправлен
    }

    return (
        <div style={{
            padding: '20px',
            maxWidth: '1000px',
            margin: '20px auto',
            backgroundColor: 'var(--card-bg-color)',
            border: '1px solid var(--card-border-color)',
            borderRadius: '8px',
            boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
            transition: 'background-color 0.3s ease, border-color 0.3s ease'
        }}>
            <h1 style={{ color: 'var(--text-color)', marginBottom: '25px' }}>{t('manage_events')}</h1>

            {error && <p style={{ color: 'red', marginBottom: '15px' }}>{error}</p>}

            <h2 style={{ color: 'var(--text-color)', marginBottom: '20px', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
                {isEditing ? t('edit_event') : t('add_new_event')}
            </h2>
            <form onSubmit={handleFormSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '40px' }}>
                {/* Существующие поля */}
                <div>
                    <label style={{ display: 'block', color: 'var(--text-color)', marginBottom: '5px' }}>{t('title')}:</label>
                    <input
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleFormChange}
                        placeholder={t('event_title')}
                        style={{ width: 'calc(100% - 20px)', padding: '10px', borderRadius: '5px', border: '1px solid var(--input-border-color)', backgroundColor: 'var(--input-bg-color)', color: 'var(--input-text-color)' }}
                        required
                    />
                </div>
                <div>
                    <label style={{ display: 'block', color: 'var(--text-color)', marginBottom: '5px' }}>{t('description')}:</label>
                    <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleFormChange}
                        placeholder={t('event_description')}
                        rows="4"
                        style={{ width: 'calc(100% - 20px)', padding: '10px', borderRadius: '5px', border: '1px solid var(--input-border-color)', backgroundColor: 'var(--input-bg-color)', color: 'var(--input-text-color)' }}
                        required
                    ></textarea>
                </div>
                <div>
                    <label style={{ display: 'block', color: 'var(--text-color)', marginBottom: '5px' }}>{t('date')}:</label>
                    <input
                        type="date"
                        name="date"
                        value={formData.date}
                        onChange={handleFormChange}
                        style={{ width: 'calc(100% - 20px)', padding: '10px', borderRadius: '5px', border: '1px solid var(--input-border-color)', backgroundColor: 'var(--input-bg-color)', color: 'var(--input-text-color)' }}
                        required
                    />
                </div>
                <div>
                    <label style={{ display: 'block', color: 'var(--text-color)', marginBottom: '5px' }}>{t('location')}:</label>
                    <input
                        type="text"
                        name="location"
                        value={formData.location}
                        onChange={handleFormChange}
                        placeholder={t('event_location')}
                        style={{ width: 'calc(100% - 20px)', padding: '10px', borderRadius: '5px', border: '1px solid var(--input-border-color)', backgroundColor: 'var(--input-bg-color)', color: 'var(--input-text-color)' }}
                        required
                    />
                </div>
                <div>
                    <label style={{ display: 'block', color: 'var(--text-color)', marginBottom: '5px' }}>{t('category')}:</label>
                    <input
                        type="text"
                        name="category"
                        value={formData.category}
                        onChange={handleFormChange}
                        placeholder={t('event_category')}
                        style={{ width: 'calc(100% - 20px)', padding: '10px', borderRadius: '5px', border: '1px solid var(--input-border-color)', backgroundColor: 'var(--input-bg-color)', color: 'var(--input-text-color)' }}
                        required
                    />
                </div>
                <div>
                    <label style={{ display: 'block', color: 'var(--text-color)', marginBottom: '5px' }}>{t('organizer')}:</label>
                    <input
                        type="text"
                        name="organizer"
                        value={formData.organizer}
                        onChange={handleFormChange}
                        placeholder={t('event_organizer')}
                        style={{ width: 'calc(100% - 20px)', padding: '10px', borderRadius: '5px', border: '1px solid var(--input-border-color)', backgroundColor: 'var(--input-bg-color)', color: 'var(--input-text-color)' }}
                        required
                    />
                </div>

                {/* --- НОВЫЕ ПОЛЯ ДЛЯ БИЛЕТОВ --- */}
                <div>
                    <label style={{ display: 'block', color: 'var(--text-color)', marginBottom: '5px' }}>{t('price')}:</label>
                    <input
                        type="number"
                        name="price"
                        value={formData.price}
                        onChange={handleFormChange}
                        placeholder={t('ticket_price')}
                        min="0"
                        step="0.01" // Позволяет вводить десятичные значения для цены
                        style={{ width: 'calc(100% - 20px)', padding: '10px', borderRadius: '5px', border: '1px solid var(--input-border-color)', backgroundColor: 'var(--input-bg-color)', color: 'var(--input-text-color)' }}
                        required
                    />
                </div>
                <div>
                    <label style={{ display: 'block', color: 'var(--text-color)', marginBottom: '5px' }}>{t('available_tickets')}:</label>
                    <input
                        type="number"
                        name="availableTickets"
                        value={formData.availableTickets}
                        onChange={handleFormChange}
                        placeholder={t('number_of_available_tickets')}
                        min="0"
                        step="1" // Билеты должны быть целыми числами
                        style={{ width: 'calc(100% - 20px)', padding: '10px', borderRadius: '5px', border: '1px solid var(--input-border-color)', backgroundColor: 'var(--input-bg-color)', color: 'var(--input-text-color)' }}
                        required
                    />
                </div>
                {/* --- КОНЕЦ НОВЫХ ПОЛЕЙ --- */}

                <div style={{ gridColumn: '1 / span 2' }}>
                    <label style={{ display: 'block', color: 'var(--text-color)', marginBottom: '5px' }}>{t('event_image')}:</label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <input
                            type="file"
                            name="image"
                            accept="image/jpeg,image/jpg,image/png,image/gif"
                            onChange={handleFileChange}
                            ref={fileInputRef}
                            style={{ display: 'none' }}
                        />
                        <button
                            type="button"
                            onClick={handleButtonClick}
                            style={{
                                padding: '10px 15px',
                                backgroundColor: '#3d414a',
                                color: 'var(--button-text-color)',
                                border: 'none',
                                borderRadius: '5px',
                                cursor: 'pointer',
                                fontSize: '0.9em',
                                transition: 'background-color 0.3s ease'
                            }}
                        >
                            {t('select_file_button')}
                        </button>
                        <span style={{ color: 'var(--text-color-secondary)', fontSize: '0.9em' }}>
                            {selectedFile ? selectedFile.name : t('no_file_chosen')}
                        </span>
                    </div>

                    {uploadingImage && <p style={{ color: 'var(--text-color-secondary)', fontSize: '0.9em', marginTop: '5px' }}>{t('uploading_image')}...</p>}
                    {formData.image && !selectedFile && (
                        <div style={{ marginTop: '10px' }}>
                            <p style={{ color: 'var(--text-color-secondary)', marginBottom: '5px' }}>{t('current_image')}:</p>
                            <img src={`http://localhost:5001${formData.image}`} alt="Current Event" style={{ maxWidth: '200px', maxHeight: '150px', objectFit: 'cover', borderRadius: '5px' }} />
                            <p style={{ fontSize: '0.8em', color: 'var(--text-color-secondary)', wordBreak: 'break-all' }}>{formData.image}</p>
                        </div>
                    )}
                    {selectedFile && (
                        <div style={{ marginTop: '10px' }}>
                            <p style={{ color: 'var(--text-color-secondary)', marginBottom: '5px' }}>{t('new_image_preview')}:</p>
                            <img src={URL.createObjectURL(selectedFile)} alt="New Event Preview" style={{ maxWidth: '200px', maxHeight: '150px', objectFit: 'cover', borderRadius: '5px' }} />
                        </div>
                    )}
                </div>

                <div style={{ gridColumn: '1 / span 2', display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                    <button type="submit" disabled={uploadingImage} style={{
                        padding: '10px 20px',
                        backgroundColor: '#3d414a',
                        color: 'var(--button-text-color)',
                        border: 'none',
                        borderRadius: '5px',
                        cursor: uploadingImage ? 'not-allowed' : 'pointer',
                        fontSize: '1em',
                        transition: 'background-color 0.3s ease',
                        opacity: uploadingImage ? 0.7 : 1,
                    }}>
                        {isEditing ? t('save_changes') : t('create_event_button')}
                    </button>
                    {isEditing && (
                        <button type="button" onClick={handleCancelEdit} style={{
                            padding: '10px 20px',
                            backgroundColor: 'var(--cancel-button-bg-color)',
                            color: 'var(--cancel-button-text-color)',
                            border: 'none',
                            borderRadius: '5px',
                            cursor: 'pointer',
                            fontSize: '1em',
                            transition: 'background-color 0.3s ease'
                        }}>
                            {t('cancel')}
                        </button>
                    )}
                </div>
            </form>

            <h2 style={{ color: 'var(--text-color)', marginBottom: '20px', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>{t('current_events')}</h2>
            {loadingEvents ? (
                <p>{t('loading_events')}...</p>
            ) : events.length === 0 ? (
                <p>{t('no_events_found')}</p>
            ) : (
                <ul style={{ listStyle: 'none', padding: 0 }}>
                    {events.map((event) => (
                        <li key={event._id} style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            border: '1px solid var(--card-border-color)',
                            padding: '15px',
                            marginBottom: '15px',
                            borderRadius: '8px',
                            backgroundColor: 'var(--body-bg-color)',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
                            transition: 'background-color 0.3s ease, border-color 0.3s ease'
                        }}>
                            <div style={{ flexGrow: 1 }}>
                                <h3 style={{ color: 'var(--text-color)', margin: '0 0 5px 0' }}>{event.title}</h3>
                                <p style={{ color: 'var(--text-color-secondary)', margin: '0 0 5px 0' }}>{event.description.substring(0, 100)}...</p>
                                <p style={{ color: 'var(--text-color-secondary)', fontSize: '0.9em' }}>
                                    {new Date(event.date).toLocaleDateString()} - {event.location} ({event.category})
                                </p>
                                {/* Отображение цены и доступных билетов в списке событий */}
                                {event.price !== undefined && event.availableTickets !== undefined && (
                                    <p style={{ color: 'var(--text-color-secondary)', fontSize: '0.9em', marginTop: '5px' }}>
                                        <strong>{t('price')}:</strong> {event.price} {t('currency_symbol')} | <strong>{t('available_tickets')}:</strong> {event.availableTickets}
                                    </p>
                                )}
                                {event.image && (
                                    <img src={`http://localhost:5001${event.image}`} alt={event.title} style={{ width: '100px', height: 'auto', borderRadius: '4px', marginTop: '10px' }} />
                                )}
                            </div>
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <button onClick={() => handleEdit(event)} style={{
                                    padding: '8px 15px',
                                    backgroundColor: 'var(--edit-button-bg-color)',
                                    color: 'var(--edit-button-text-color)',
                                    border: 'none',
                                    borderRadius: '5px',
                                    cursor: 'pointer',
                                    fontSize: '0.9em',
                                    transition: 'background-color 0.3s ease'
                                }}>
                                    {t('edit')}
                                </button>
                                <button onClick={() => handleDelete(event._id)} style={{
                                    padding: '8px 15px',
                                    backgroundColor: 'var(--delete-button-bg-color)',
                                    color: 'var(--delete-button-text-color)',
                                    border: 'none',
                                    borderRadius: '5px',
                                    cursor: 'pointer',
                                    fontSize: '0.9em',
                                    transition: 'background-color 0.3s ease'
                                }}>
                                    {t('delete')}
                                </button>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default AdminManageEventsPage;