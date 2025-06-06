import React, { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const AdminPanelPage = () => {
    const { user, loading } = useAuth();
    const navigate = useNavigate();
    const { t } = useTranslation();

    useEffect(() => {
        console.log('AdminPanelPage useEffect: User:', user, 'Loading:', loading);
        if (!loading && (!user || user.role !== 'admin')) {
            console.log('AdminPanelPage useEffect: Not admin or not logged in. Redirecting to /login.');
            navigate('/login');
        }
    }, [user, loading, navigate]);

    if (loading) {
        console.log('AdminPanelPage: Displaying loading message.');
        return <p style={{ textAlign: 'center', marginTop: '50px', fontSize: '1.2em' }}>{t('loading')}...</p>;
    }

    if (!user || user.role !== 'admin') {
        console.log('AdminPanelPage: User is NOT admin or NOT authenticated. Returning null (should have been redirected).');
        return null;
    }

    console.log('AdminPanelPage: User IS admin. Rendering admin panel content for user:', user);
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
                        <Link to="/admin/users" style={{
                            display: 'block',
                            width: '100%',
                            padding: '12px 20px',
                            backgroundColor: '#3d414a',
                            color: 'var(--button-text-color)',
                            textDecoration: 'none',
                            textAlign: 'center',
                            border: 'none',
                            borderRadius: '5px',
                            cursor: 'pointer',
                            fontSize: '1em',
                            transition: 'background-color 0.3s ease, color 0.3s ease'
                        }}>
                            {t('manage_users')}
                        </Link>
                    </li>
                    <li>
                        <Link to="/admin/events" style={{
                            display: 'block',
                            width: '100%',
                            padding: '12px 20px',
                            backgroundColor: '#3d414a',
                            color: 'var(--button-text-color)',
                            textDecoration: 'none',
                            textAlign: 'center',
                            border: 'none',
                            borderRadius: '5px',
                            cursor: 'pointer',
                            fontSize: '1em',
                            transition: 'background-color 0.3s ease, color 0.3s ease'
                        }}>
                            {t('manage_events')}
                        </Link>
                    </li>
                </ul>
            </nav>
        </div>
    );
};

export default AdminPanelPage;