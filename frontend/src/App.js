// frontend/src/App.js
import React from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { useTranslation } from 'react-i18next';
import { useTheme } from './context/ThemeContext';

// Импортируем компоненты страниц
import RegisterPage from './pages/RegisterPage';
import LoginPage from './pages/LoginPage';
import ProfilePage from './pages/ProfilePage';
import EventListPage from './pages/EventListPage';
import HomePage from './pages/HomePage';
import PasswordResetPage from './pages/PasswordResetPage';
import EventDetailsPage from './pages/EventDetailsPage';
import AdminUserListPage from './pages/AdminUserListPage';
import AdminPanelPage from './pages/AdminPanelPage';
import AdminManageEventsPage from './pages/AdminManageEventsPage';

import './App.css';

function App() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const { theme, toggleTheme } = useTheme();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };

  return (
      <div className="App">
        <nav>
          <ul>
            <li><Link to="/">{t('home')}</Link></li>
            {!user ? (
                <>
                  <li><Link to="/register">{t('register')}</Link></li>
                  <li><Link to="/login">{t('login')}</Link></li>
                  <li><Link to="/password-reset">{t('password_reset')}</Link></li>
                </>
            ) : (
                <>
                  <li><Link to="/profile">{t('profile')}</Link></li>
                  <li><Link to="/events">{t('events')}</Link></li>
                  {user.role === 'admin' && (
                      <li><Link to="/admin">{t('admin_panel')}</Link></li>
                  )}
                  <li><button onClick={handleLogout}>{t('logout')} ({user.name})</button></li>
                </>
            )}
            {/* Кнопки переключения языка, теперь через / */}
            <li style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center' }}>
              <button
                  onClick={() => changeLanguage('en')}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: i18n.language === 'en' ? '#007bff' : 'inherit', // Синий для активного, наследуем для неактивного
                    cursor: 'pointer',
                    padding: '0',
                    fontSize: '1em',
                    fontWeight: i18n.language === 'en' ? 'bold' : 'normal', // Жирный для активного
                  }}
              >
                EN
              </button>
              <span style={{ margin: '0 5px', color: 'inherit' }}>/</span> {/* Разделитель */}
              <button
                  onClick={() => changeLanguage('ru')}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: i18n.language === 'ru' ? '#007bff' : 'inherit', // Синий для активного, наследуем для неактивного
                    cursor: 'pointer',
                    padding: '0',
                    fontSize: '1em',
                    fontWeight: i18n.language === 'ru' ? 'bold' : 'normal', // Жирный для активного
                  }}
              >
                RU
              </button>
            </li>
            {/* Кнопка переключения темы */}
            <li style={{ marginLeft: '10px' }}>
              <button onClick={toggleTheme} style={{
                margin: '0 5px',
                padding: '5px 10px',
                cursor: 'pointer',
                border: '1px solid #ccc',
                borderRadius: '4px',
                backgroundColor: 'white', // Или сделайте динамичным по теме
                color: 'black' // Или сделайте динамичным по теме
              }}>
                {theme === 'light' ? t('switch_to_dark') : t('switch_to_light')}
              </button>
            </li>
          </ul>
        </nav>

        <div className="content">
          <Routes>
            <Route path="/" element={ <HomePage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/password-reset" element={<PasswordResetPage />} />
            {user && ( // Оберните маршруты, требующие авторизации, в условный рендеринг
                <>
                  <Route path="/profile" element={<ProfilePage />} />
                  <Route path="/events" element={<EventListPage />} />
                  <Route path="/events/:id" element={<EventDetailsPage />} />
                  {user.role === 'admin' && (
                      <>
                        <Route path="/admin" element={<AdminPanelPage />} />
                        <Route path="/admin/users" element={<AdminUserListPage />} />
                        <Route path="/admin/events" element={<AdminManageEventsPage />} />
                      </>
                  )}
                </>
            )}
            <Route path="*" element={<h2>404 - {t('page_not_found')}</h2>} />
          </Routes>
        </div>
      </div>
  );
}

export default App;