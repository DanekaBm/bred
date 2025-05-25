import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const AdminPanelPage = () => {
    const { user, isAdmin } = useAuth();
    const navigate = useNavigate();
    const { t } = useTranslation();

    if (!isAdmin) {
        // You might want to show an access denied message before redirecting
        // For now, it redirects immediately.
        navigate('/');
        return <p style={{ color: 'var(--red-button-bg)' }}>{t('access_denied', { roles: 'admin' })}</p>;
    }

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
            <h1 style={{ color: 'var(--text-color)' }}>{t('admin_panel')}</h1>
            <p style={{ color: 'var(--text-color)' }}>{t('admin_panel_welcome', { name: user?.name })}</p>
            <nav style={{ marginTop: '30px' }}>
                <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    <li>
                        <button onClick={() => alert(t('manage_users'))} style={{
                            width: '100%',
                            padding: '12px 20px',
                            backgroundColor: 'var(--button-bg-color)',
                            color: 'var(--button-text-color)',
                            border: 'none',
                            borderRadius: '5px',
                            cursor: 'pointer',
                            fontSize: '1em',
                            transition: 'background-color 0.3s ease, color 0.3s ease'
                        }}>
                            {t('manage_users')}
                        </button>
                    </li>
                    <li>
                        <button onClick={() => alert(t('manage_events'))} style={{
                            width: '100%',
                            padding: '12px 20px',
                            backgroundColor: 'var(--button-bg-color)',
                            color: 'var(--button-text-color)',
                            border: 'none',
                            borderRadius: '5px',
                            cursor: 'pointer',
                            fontSize: '1em',
                            transition: 'background-color 0.3s ease, color 0.3s ease'
                        }}>
                            {t('manage_events')}
                        </button>
                    </li>
                    <li>
                        <button onClick={() => alert(t('view_statistics'))} style={{
                            width: '100%',
                            padding: '12px 20px',
                            backgroundColor: 'var(--button-bg-color)',
                            color: 'var(--button-text-color)',
                            border: 'none',
                            borderRadius: '5px',
                            cursor: 'pointer',
                            fontSize: '1em',
                            transition: 'background-color 0.3s ease, color 0.3s ease'
                        }}>
                            {t('view_statistics')}
                        </button>
                    </li>
                </ul>
            </nav>
            {/* Here will be components for managing users, events, etc. */}
        </div>
    );
};

export default AdminPanelPage;
