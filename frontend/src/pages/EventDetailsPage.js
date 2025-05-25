// frontend/src/pages/EventDetailsPage.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import { ru, enUS } from 'date-fns/locale';

import {
  fetchEventById,
  deleteEvent,
  toggleLikeEvent,
  addEventComment,
  deleteEventComment,
} from '../redux/slices/eventsSlice';

function EventDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useAuth();
  const { t, i18n } = useTranslation();

  const event = useSelector((state) => state.events.currentEvent);
  const status = useSelector((state) => state.events.status);
  const error = useSelector((state) => state.events.error);

  const [commentText, setCommentText] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    dispatch(fetchEventById(id));
  }, [dispatch, id]);

  const formatLocalizedDateTime = (isoString) => {
    if (!isoString) return '';
    try {
      const dateObj = new Date(isoString);
      const locale = i18n.language === 'ru' ? ru : enUS;
      return format(dateObj, 'PPPPp', { locale });
    } catch (e) {
      console.error('Error formatting date:', e);
      return isoString; // Fallback
    }
  };

  const handleDelete = async () => {
    if (window.confirm(t('confirm_delete_event'))) {
      await dispatch(deleteEvent(id));
      if (status === 'succeeded') {
        navigate('/events');
      }
    }
    setShowDeleteConfirm(false);
  };

  const handleLike = async () => {
    if (!user) {
      alert(t('please_login_to_like'));
      return;
    }
    await dispatch(toggleLikeEvent(event._id));
  };

  const handleAddComment = async () => {
    if (!user) {
      alert(t('please_login_to_comment'));
      return;
    }
    if (!commentText.trim()) {
      alert(t('comment_cannot_be_empty'));
      return;
    }
    await dispatch(addEventComment({ eventId: event._id, text: commentText }));
    setCommentText('');
  };

  const handleDeleteComment = async (commentId) => {
    if (window.confirm(t('confirm_delete_comment'))) {
      await dispatch(deleteEventComment({ eventId: event._id, commentId }));
    }
  };

  if (status === 'loading') return <p style={{ color: 'var(--text-color)' }}>{t('loading_event_details')}</p>;
  if (status === 'failed') return <p style={{ color: 'var(--red-button-bg)' }}>{error}</p>;
  if (!event) return <p style={{ color: 'var(--text-color)' }}>{t('event_not_found')}</p>;

  const userHasLiked = user && event.likes && event.likes.includes(user._id);

  return (
    <div style={{ color: 'var(--text-color)' }}>
      <h2>{event.title}</h2>
      <p><strong>{t('description_label')}</strong> {event.description}</p>
      <p><strong>{t('date_label')}</strong> {formatLocalizedDateTime(event.date)}</p>
      <p><strong>{t('location_label')}</strong> {event.location}</p>
      <p><strong>{t('category_label')}</strong> {event.category}</p>
      <p><strong>{t('creator_label')}</strong> {event.createdBy ? event.createdBy.name : t('unknown')}</p>

      <div style={{ marginBottom: '15px' }}>
        <button
          onClick={handleLike}
          disabled={!user}
          style={{
            backgroundColor: userHasLiked ? 'var(--green-button-bg)' : 'var(--gray-button-bg)',
            color: 'var(--button-text-color)',
            border: 'none',
            padding: '10px 15px',
            borderRadius: '5px',
            cursor: user ? 'pointer' : 'not-allowed',
            fontSize: '1em',
            marginRight: '10px',
            transition: 'background-color 0.3s ease, color 0.3s ease',
          }}
        >
          {userHasLiked ? t('unlike') : t('like')}
        </button>
        <span style={{ fontSize: '1.1em', color: 'var(--text-color)' }}>
          {t('likes_count', { count: event.likes ? event.likes.length : 0 })}
        </span>
      </div>

      {(user && event.createdBy && user._id === event.createdBy._id) || (user && user.role === 'admin') ? (
        <div style={{ marginTop: '20px' }}>
          <button
            onClick={() => navigate(`/create-event?editId=${event._id}`)}
            style={{
              backgroundColor: 'var(--yellow-button-bg)',
              color: 'var(--button-text-color)',
              border: 'none',
              padding: '10px 15px',
              borderRadius: '5px',
              cursor: 'pointer',
              marginRight: '10px',
              transition: 'background-color 0.3s ease, color 0.3s ease',
            }}
          >
            {t('edit_event')}
          </button>
          <button
            onClick={() => setShowDeleteConfirm(true)}
            style={{
              backgroundColor: 'var(--red-button-bg)',
              color: 'var(--button-text-color)',
              border: 'none',
              padding: '10px 15px',
              borderRadius: '5px',
              cursor: 'pointer',
              transition: 'background-color 0.3s ease, color 0.3s ease',
            }}
          >
            {t('delete_event')}
          </button>
          {showDeleteConfirm && (
            <div style={{ marginTop: '10px', padding: '10px', border: '1px solid var(--red-button-bg)', borderRadius: '5px', backgroundColor: 'var(--card-bg-color)' }}>
              <p>{t('are_you_sure_delete_event')}</p>
              <button
                onClick={handleDelete}
                style={{
                  backgroundColor: 'var(--red-button-bg)',
                  color: 'var(--button-text-color)',
                  border: 'none',
                  padding: '8px 12px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  marginRight: '10px',
                }}
              >
                {t('yes_delete')}
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                style={{
                  backgroundColor: 'var(--gray-button-bg)',
                  color: 'var(--button-text-color)',
                  border: 'none',
                  padding: '8px 12px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                }}
              >
                {t('cancel')}
              </button>
            </div>
          )}
        </div>
      ) : null}

      {/* Comments Section */}
      <div style={{ marginTop: '25px', borderTop: '1px solid var(--card-border-color)', paddingTop: '15px' }}>
        <h3>{t('comments_section')}</h3>
        {event.comments && event.comments.length > 0 ? (
          <ul style={{ listStyleType: 'none', padding: '0' }}>
            {event.comments.map((comment) => (
              <li key={comment._id} style={{
                fontSize: '0.95em',
                borderBottom: '1px dotted var(--card-border-color)',
                padding: '8px 0',
                marginBottom: '8px',
                backgroundColor: 'var(--comment-bg-color)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderRadius: '4px',
                paddingLeft: '10px',
              }}>
                <div>
                  <strong style={{ color: 'var(--text-color)' }}>{comment.user ? comment.user.name : t('unknown')}:</strong> <span style={{ color: 'var(--text-color)' }}>{comment.text}</span>
                  <br />
                  <small style={{ color: 'var(--text-color)', fontSize: '0.8em' }}>{formatLocalizedDateTime(comment.createdAt)}</small>
                </div>
                {user && (comment.user._id === user._id || user.role === 'admin') && (
                  <button
                    onClick={() => handleDeleteComment(comment._id)}
                    style={{
                      backgroundColor: 'var(--red-button-bg)',
                      color: 'var(--button-text-color)',
                      border: 'none',
                      padding: '5px 10px',
                      borderRadius: '3px',
                      cursor: 'pointer',
                      fontSize: '0.75em',
                      marginRight: '5px',
                    }}
                  >
                    {t('delete_comment')}
                  </button>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <p style={{ color: 'var(--text-color)' }}>{t('no_comments_yet')}</p>
        )}

        {/* Add Comment Form */}
        {user && (
          <div style={{ display: 'flex', marginTop: '15px' }}>
            <input
              type="text"
              placeholder={t('write_a_comment')}
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              style={{
                flexGrow: 1,
                padding: '10px',
                borderRadius: '5px',
                border: '1px solid var(--input-border-color)',
                backgroundColor: 'var(--input-bg-color)',
                color: 'var(--text-color)',
              }}
            />
            <button
              onClick={handleAddComment}
              style={{
                marginLeft: '10px',
                backgroundColor: 'var(--button-bg-color)',
                color: 'var(--button-text-color)',
                border: 'none',
                padding: '10px 15px',
                borderRadius: '5px',
                cursor: 'pointer',
                fontSize: '1em',
              }}
            >
              {t('send')}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default EventDetailsPage;