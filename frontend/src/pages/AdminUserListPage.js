// frontend/src/pages/AdminUserListPage.js
import React, { useState, useEffect } from 'react';
import API from '../api';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

function AdminUserListPage() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const { user, token } = useAuth();
    const navigate = useNavigate();
    const { t } = useTranslation();

    useEffect(() => {
        // Проверяем, что пользователь авторизован и является админом
        if (!user || user.role !== 'admin') {
            navigate('/'); // Перенаправляем на главную, если не админ
            return;
        }

        const fetchUsers = async () => {
            try {
                const config = {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                };
                const { data } = await API.get('/users', config);
                setUsers(data);
                setLoading(false);
            } catch (err) {
                setError(err.response?.data?.message || 'Не удалось загрузить пользователей.');
                setLoading(false);
            }
        };

        fetchUsers();
    }, [user, token, navigate]);

    const handleDeleteUser = async (id) => {
        if (window.confirm(t('confirm_delete_user'))) { // Добавляем перевод
            try {
                const config = {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                };
                await API.delete(`/users/${id}`, config);
                setUsers(users.filter(u => u._id !== id));
            } catch (err) {
                setError(err.response?.data?.message || 'Ошибка при удалении пользователя.');
            }
        }
    };

    if (loading) return <div>{t('loading')}...</div>;
    if (error) return <div style={{ color: 'red' }}>{error}</div>;
    // Если пользователь не админ, это будет обработано useEffect выше, но можно добавить и здесь
    if (!user || user.role !== 'admin') return <div style={{ color: 'red' }}>{t('access_denied')}.</div>;


    return (
        <div style={{ maxWidth: '800px', margin: '50px auto', padding: '20px', border: '1px solid #ddd', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
            <h2>{t('user_management')}</h2> {/* Добавляем перевод */}
            <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
                <thead>
                <tr style={{ backgroundColor: '#f2f2f2' }}>
                    <th style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'left' }}>ID</th>
                    <th style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'left' }}>{t('your_name')}</th>
                    <th style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'left' }}>{t('your_email')}</th>
                    <th style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'left' }}>{t('actions')}</th> {/* Добавляем перевод */}
                </tr>
                </thead>
                <tbody>
                {users.map((u) => (
                    <tr key={u._id}>
                        <td style={{ padding: '10px', border: '1px solid #ddd' }}>{u._id}</td>
                        <td style={{ padding: '10px', border: '1px solid #ddd' }}>{u.name}</td>
                        <td style={{ padding: '10px', border: '1px solid #ddd' }}>{u.email}</td>
                        <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                            <button
                                onClick={() => handleDeleteUser(u._id)}
                                style={{ padding: '8px 12px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                            >
                                {t('delete')} {/* Добавляем перевод */}
                            </button>
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
}

export default AdminUserListPage;