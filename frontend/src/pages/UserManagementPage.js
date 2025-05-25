// frontend/src/pages/UserManagementPage.js
import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import API from '../api';
import { useTranslation } from 'react-i18next';
import './UserManagementPage.css'; // Создадим этот CSS файл позже

function UserManagementPage() {
    const { user, loading: authLoading } = useAuth();
    const navigate = useNavigate();
    const { t } = useTranslation();

    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showConfirm, setShowConfirm] = useState(false);
    const [userToDelete, setUserToDelete] = useState(null);

    useEffect(() => {
        // Защита маршрута: только админ
        if (!authLoading && (!user || user.role !== 'admin')) {
            navigate('/login'); // Перенаправление, если не админ
            return;
        }
        if (!authLoading && user && user.role === 'admin') {
            fetchUsers();
        }
    }, [user, authLoading, navigate]);

    const fetchUsers = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await API.get('/users');
            setUsers(response.data);
            setLoading(false);
        } catch (err) {
            console.error('Error fetching users:', err);
            setError(err.response?.data?.message || 'Failed to load users.');
            setLoading(false);
        }
    };

    const handleDeleteClick = (user) => {
        setUserToDelete(user);
        setShowConfirm(true);
    };

    const confirmDeleteUser = async () => {
        if (!userToDelete) return;

        try {
            await API.delete(`/users/${userToDelete._id}`);
            setUsers(users.filter(u => u._id !== userToDelete._id));
            alert(t('user_deleted_success', { email: userToDelete.email })); // Добавим этот ключ в переводы
        } catch (err) {
            console.error('Error deleting user:', err);
            alert(err.response?.data?.message || t('user_delete_error')); // Добавим этот ключ в переводы
        } finally {
            setShowConfirm(false);
            setUserToDelete(null);
        }
    };

    const cancelDelete = () => {
        setShowConfirm(false);
        setUserToDelete(null);
    };

    if (authLoading || loading) {
        return <p>{t('loading')}...</p>;
    }

    if (error) {
        return <p className="error-message">{error}</p>;
    }

    return (
        <div className="user-management-container">
            <h1>{t('manage_users')}</h1>
            {users.length === 0 ? (
                <p>{t('no_users_found')}</p>
                ) : (
                <ul className="user-list">
            {users.map(u => (
                <li key={u._id} className="user-item">
            <span>{t('name_label')} {u.name} ({u.email}) - {t('role_label')} {u.role}</span>
            {/* Нельзя удалить самого себя */}
            {user._id !== u._id && (
                <button
                    onClick={() => handleDeleteClick(u)}
                    className="delete-button"
                >
                    {t('delete_user')} {/* Добавим этот ключ */}
                </button>
            )}
            {/* Можно запретить удалять последнего админа, но для этого нужно больше логики */}
        </li>
    ))}
</ul>
)}

{showConfirm && (
        <div className="confirmation-dialog">
            <p>{t('are_you_sure_delete_user', { email: userToDelete?.email })}</p> {/* Добавим этот ключ */}
            <button onClick={confirmDeleteUser} className="confirm-button">{t('yes_confirm')}</button>
            <button onClick={cancelDelete} className="cancel-button">{t('no_cancel')}</button>
        </div>
    )}
</div>
);
}

export default UserManagementPage;