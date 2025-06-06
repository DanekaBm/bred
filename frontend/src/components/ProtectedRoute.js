import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';

const ProtectedRoute = ({ allowedRoles }) => {
    const { user, loading } = useAuth();
    const { t } = useTranslation();

    if (loading) {
        return <div style={{ color: 'var(--text-color)', textAlign: 'center', padding: '50px' }}>{t('loading')}</div>;
    }

    if (!user) {

        return <Navigate to="/login" replace state={{ from: window.location.pathname, message: t('please_login_to_view_page') }} />;
    }

    if (allowedRoles && !allowedRoles.includes(user.role)) {

        return <Navigate to="/" replace state={{ message: t('access_denied', { roles: allowedRoles.join(', ') }) }} />;
    }

    return <Outlet />;
};

export default ProtectedRoute;
