
import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { sendSupportMessage } from '../redux/slices/eventsSlice';

import { AiOutlineClose } from 'react-icons/ai';

const SupportFormModal = ({ isOpen, onClose }) => {
    const { t } = useTranslation();
    const dispatch = useDispatch();

    const { status, error } = useSelector(state => state.events.supportMessageStatus);

    const [subject, setSubject] = useState('');
    const [message, setMessage] = useState('');
    const [isSubmitted, setIsSubmitted] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitted(false);

        try {
            await dispatch(sendSupportMessage({ subject, message })).unwrap();
            setIsSubmitted(true);
            setSubject('');
            setMessage('');


        } catch (err) {
            console.error("Failed to send support message:", err);
            setIsSubmitted(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div style={modalOverlayStyle}>
            <div style={modalContentStyle}>
                <button onClick={onClose} style={closeButtonStyle}>
                    <AiOutlineClose size={20} />
                </button>
                <h2>{t('support_form_title')}</h2>
                {isSubmitted && status === 'succeeded' && (
                    <p style={{ color: 'var(--accent-color)' }}>{t('support_message_sent_success')}</p>
                )}
                {status === 'failed' && error && (
                    <p style={{ color: 'var(--red-button-bg)' }}>{t('support_message_sent_error')}: {error}</p>
                )}

                <form onSubmit={handleSubmit}>
                    <div style={formGroupStyle}>
                        <label htmlFor="subject" style={labelStyle}>{t('subject_label')}:</label>
                        <input
                            type="text"
                            id="subject"
                            value={subject}
                            onChange={(e) => setSubject(e.target.value)}
                            required
                            style={inputStyle}
                            disabled={status === 'loading'}
                        />
                    </div>
                    <div style={formGroupStyle}>
                        <label htmlFor="message" style={labelStyle}>{t('message_label')}:</label>
                        <textarea
                            id="message"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            required
                            rows="5"
                            style={textareaStyle}
                            disabled={status === 'loading'}
                        ></textarea>
                    </div>
                    <button
                        type="submit"
                        style={submitButtonStyle}
                        disabled={status === 'loading'}
                    >
                        {status === 'loading' ? t('sending') : t('send_message')}
                    </button>
                </form>
            </div>
        </div>
    );
};

const modalOverlayStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
};

const modalContentStyle = {
    backgroundColor: 'var(--background-color)',
    padding: '30px',
    borderRadius: '10px',
    boxShadow: '0 5px 15px rgba(0, 0, 0, 0.3)',
    maxWidth: '500px',
    width: '90%',
    position: 'relative',
    color: 'var(--text-color)',
};

const closeButtonStyle = {
    position: 'absolute',
    top: '15px',
    right: '15px',
    backgroundColor: 'transparent',
    border: 'none',
    cursor: 'pointer',
    color: 'var(--text-color)',
    fontSize: '1.5em',
    transition: 'color 0.2s ease',
};

const formGroupStyle = {
    marginBottom: '15px',
};

const labelStyle = {
    display: 'block',
    marginBottom: '8px',
    fontWeight: 'bold',
};

const inputStyle = {
    width: '100%',
    padding: '10px',
    borderRadius: '5px',
    border: '1px solid var(--input-border-color)',
    backgroundColor: 'var(--input-bg-color)',
    color: 'var(--input-text-color)',
    fontSize: '1em',
    boxSizing: 'border-box',
};

const textareaStyle = {
    width: '100%',
    padding: '10px',
    borderRadius: '5px',
    border: '1px solid var(--input-border-color)',
    backgroundColor: 'var(--input-bg-color)',
    color: 'var(--input-text-color)',
    fontSize: '1em',
    resize: 'vertical',
    minHeight: '100px',
    boxSizing: 'border-box',
};

const submitButtonStyle = {
    padding: '10px 20px',
    backgroundColor: 'var(--button-bg-color)',
    color: 'var(--button-text-color)',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '1em',
    fontWeight: 'bold',
    transition: 'background-color 0.3s ease',
};


export default SupportFormModal;