import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import API from '../api';
import { updateProfile, uploadAvatar } from '../services/userService';
import { useTranslation } from 'react-i18next';

function ProfilePage() {
    const { user, logout, updatePassword } = useAuth();
    const { t } = useTranslation();

    const [profileData, setProfileData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Состояния для обновления профиля
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [profileUpdateMessage, setProfileUpdateMessage] = useState('');
    const [profileUpdateError, setProfileUpdateError] = useState('');

    // Состояния для обновления пароля
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState('');
    const [passwordUpdateMessage, setPasswordUpdateMessage] = useState('');
    const [passwordUpdateError, setPasswordUpdateError] = useState('');

    // Состояние для загрузки аватара
    const [avatarFile, setAvatarFile] = useState(null);
    const [avatarUploadMessage, setAvatarUploadMessage] = useState('');
    const [avatarUploadError, setAvatarUploadError] = useState('');

    useEffect(() => {
        const fetchProfile = async () => {
            if (!user) {
                setLoading(false);
                return;
            }
            try {
                const res = await API.get('/users/profile');
                setProfileData(res.data);
                setName(res.data.name);
                setEmail(res.data.email);
                setLoading(false);
            } catch (err) {
                setError(err.response?.data?.message || t('profile_load_error'));
                setLoading(false);
                console.error('Ошибка загрузки профиля:', err.response?.data || err.message);
                if (err.response?.status === 401) {
                    logout();
                }
            }
        };

        fetchProfile();
    }, [user, logout, t]);

    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        setProfileUpdateMessage('');
        setProfileUpdateError('');

        try {
            const updatedUser = await updateProfile({ name, email });
            setProfileData(updatedUser);
            setProfileUpdateMessage(t('profile_update_success'));
        } catch (err) {
            setProfileUpdateError(err.message || t('profile_update_error'));
            console.error('Ошибка обновления профиля:', err.response?.data || err.message);
        }
    };

    const handlePasswordUpdate = async (e) => {
        e.preventDefault();
        setPasswordUpdateMessage('');
        setPasswordUpdateError('');

        if (newPassword !== confirmNewPassword) {
            setPasswordUpdateError(t('passwords_do_not_match'));
            return;
        }

        try {
            const message = await updatePassword(oldPassword, newPassword);
            setPasswordUpdateMessage(message || t('password_update_success'));
            setOldPassword('');
            setNewPassword('');
            setConfirmNewPassword('');
        } catch (err) {
            setPasswordUpdateError(err.message || t('password_update_error'));
        }
    };

    const handleAvatarChange = (e) => {
        setAvatarFile(e.target.files[0]);
    };

    const handleAvatarUpload = async (e) => {
        e.preventDefault();
        setAvatarUploadMessage('');
        setAvatarUploadError('');

        if (!avatarFile) {
            setAvatarUploadError(t('select_file_for_upload'));
            return;
        }

        try {
            const avatarUrl = await uploadAvatar(avatarFile);
            setProfileData(prevData => ({ ...prevData, avatar: avatarUrl }));
            setAvatarUploadMessage(t('avatar_upload_success'));
            setAvatarFile(null);
        } catch (err) {
            setAvatarUploadError(err.message || t('avatar_upload_error'));
            console.error('Ошибка загрузки аватара:', err.response?.data || err.message);
        }
    };

    if (loading) return <p style={{ color: 'var(--text-color)' }}>{t('loading_profile')}</p>;
    if (error) return <p style={{ color: 'var(--red-button-bg)' }}>{t('profile_load_error', { error: error })}</p>;
    if (!user) return <p style={{ color: 'var(--text-color)' }}>{t('please_login_to_view_profile')}</p>;

    return (
        <div style={{
            maxWidth: '600px',
            margin: '20px auto',
            padding: '20px',
            backgroundColor: 'var(--card-bg-color)',
            border: '1px solid var(--card-border-color)',
            borderRadius: '8px',
            boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
            transition: 'background-color 0.3s ease, border-color 0.3s ease'
        }}>
            <h2 style={{ color: 'var(--text-color)' }}>{t('my_profile')}</h2>
            {profileData ? (
                <>
                    {profileData.avatar && (
                        <div style={{ marginBottom: '20px' }}>
                            <img src={profileData.avatar} alt={t('user_avatar')} style={{ width: '100px', height: '100px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--input-border-color)' }} />
                        </div>
                    )}
                    <p style={{ color: 'var(--text-color)' }}><strong>{t('name_label')}</strong> {profileData.name}</p>
                    <p style={{ color: 'var(--text-color)' }}><strong>{t('email')}:</strong> {profileData.email}</p>
                    <p style={{ color: 'var(--text-color)' }}><strong>{t('role_label')}</strong> {profileData.role}</p>

                    {/* Форма для обновления имени и email */}
                    <h3 style={{ color: 'var(--text-color)', marginTop: '30px' }}>{t('update_profile')}</h3>
                    <form onSubmit={handleProfileUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '15px', padding: '20px', border: '1px solid var(--card-border-color)', borderRadius: '8px', backgroundColor: 'var(--background-color)', transition: 'background-color 0.3s ease, border-color 0.3s ease' }}>
                        <input
                            type="text"
                            placeholder={t('name')}
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            style={{
                                padding: '10px',
                                border: '1px solid var(--input-border-color)',
                                borderRadius: '4px',
                                fontSize: '16px',
                                backgroundColor: 'var(--input-bg-color)',
                                color: 'var(--text-color)',
                                transition: 'background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease'
                            }}
                        />
                        <input
                            type="email"
                            placeholder={t('email')}
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            style={{
                                padding: '10px',
                                border: '1px solid var(--input-border-color)',
                                borderRadius: '4px',
                                fontSize: '16px',
                                backgroundColor: 'var(--input-bg-color)',
                                color: 'var(--text-color)',
                                transition: 'background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease'
                            }}
                        />
                        <button type="submit" style={{
                            padding: '12px 20px',
                            backgroundColor: 'var(--button-bg-color)',
                            color: 'var(--button-text-color)',
                            border: 'none',
                            borderRadius: '5px',
                            cursor: 'pointer',
                            fontSize: '1em',
                            transition: 'background-color 0.3s ease, color 0.3s ease'
                        }}>
                            {t('save_changes')}
                        </button>
                        {profileUpdateMessage && <p style={{ color: 'var(--green-button-bg)' }}>{profileUpdateMessage}</p>}
                        {profileUpdateError && <p style={{ color: 'var(--red-button-bg)' }}>{profileUpdateError}</p>}
                    </form>

                    {/* Форма для загрузки аватара */}
                    <h3 style={{ color: 'var(--text-color)', marginTop: '30px' }}>{t('upload_update_avatar')}</h3>
                    <form onSubmit={handleAvatarUpload} style={{ display: 'flex', flexDirection: 'column', gap: '15px', padding: '20px', border: '1px solid var(--card-border-color)', borderRadius: '8px', backgroundColor: 'var(--background-color)', transition: 'background-color 0.3s ease, border-color 0.3s ease' }}>
                        <input
                            type="file"
                            accept="image/jpeg,image/jpg,image/png,image/gif"
                            onChange={handleAvatarChange}
                            style={{
                                padding: '10px',
                                border: '1px solid var(--input-border-color)',
                                borderRadius: '4px',
                                fontSize: '16px',
                                backgroundColor: 'var(--input-bg-color)',
                                color: 'var(--text-color)',
                                transition: 'background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease'
                            }}
                        />
                        <button type="submit" disabled={!avatarFile} style={{
                            padding: '12px 20px',
                            backgroundColor: 'var(--button-bg-color)',
                            color: 'var(--button-text-color)',
                            border: 'none',
                            borderRadius: '5px',
                            cursor: 'pointer',
                            fontSize: '1em',
                            transition: 'background-color 0.3s ease, color 0.3s ease'
                        }}>
                            {t('upload_avatar')}
                        </button>
                        {avatarUploadMessage && <p style={{ color: 'var(--green-button-bg)' }}>{avatarUploadMessage}</p>}
                        {avatarUploadError && <p style={{ color: 'var(--red-button-bg)' }}>{avatarUploadError}</p>}
                    </form>

                    {/* Форма для изменения пароля */}
                    <h3 style={{ color: 'var(--text-color)', marginTop: '30px' }}>{t('change_password')}</h3>
                    <form onSubmit={handlePasswordUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '15px', padding: '20px', border: '1px solid var(--card-border-color)', borderRadius: '8px', backgroundColor: 'var(--background-color)', transition: 'background-color 0.3s ease, border-color 0.3s ease' }}>
                        <input
                            type="password"
                            placeholder={t('old_password')}
                            value={oldPassword}
                            onChange={(e) => setOldPassword(e.target.value)}
                            required
                            style={{
                                padding: '10px',
                                border: '1px solid var(--input-border-color)',
                                borderRadius: '4px',
                                fontSize: '16px',
                                backgroundColor: 'var(--input-bg-color)',
                                color: 'var(--text-color)',
                                transition: 'background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease'
                            }}
                        />
                        <input
                            type="password"
                            placeholder={t('new_password')}
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            required
                            style={{
                                padding: '10px',
                                border: '1px solid var(--input-border-color)',
                                borderRadius: '4px',
                                fontSize: '16px',
                                backgroundColor: 'var(--input-bg-color)',
                                color: 'var(--text-color)',
                                transition: 'background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease'
                            }}
                        />
                        <input
                            type="password"
                            placeholder={t('confirm_new_password')}
                            value={confirmNewPassword}
                            onChange={(e) => setConfirmNewPassword(e.target.value)}
                            required
                            style={{
                                padding: '10px',
                                border: '1px solid var(--input-border-color)',
                                borderRadius: '4px',
                                fontSize: '16px',
                                backgroundColor: 'var(--input-bg-color)',
                                color: 'var(--text-color)',
                                transition: 'background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease'
                            }}
                        />
                        <button type="submit" style={{
                            padding: '12px 20px',
                            backgroundColor: 'var(--button-bg-color)',
                            color: 'var(--button-text-color)',
                            border: 'none',
                            borderRadius: '5px',
                            cursor: 'pointer',
                            fontSize: '1em',
                            transition: 'background-color 0.3s ease, color 0.3s ease'
                        }}>
                            {t('update_password')}
                        </button>
                        {passwordUpdateMessage && <p style={{ color: 'var(--green-button-bg)' }}>{passwordUpdateMessage}</p>}
                        {passwordUpdateError && <p style={{ color: 'var(--red-button-bg)' }}>{passwordUpdateError}</p>}
                    </form>
                </>
            ) : (
                <p style={{ color: 'var(--text-color)' }}>{t('profile_data_not_found')}</p>
            )}
        </div>
    );
}

export default ProfilePage;
