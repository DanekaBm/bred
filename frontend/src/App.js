// frontend/src/App.js
import React from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { useTranslation } from 'react-i18next';

// Импортируем компоненты страниц
import RegisterPage from './pages/RegisterPage';
import LoginPage from './pages/LoginPage';
import ProfilePage from './pages/ProfilePage';
import EventListPage from './pages/EventListPage';
import CreateEventPage from './pages/CreateEventPage';
import HomePage from './pages/HomePage';
import PasswordResetPage from './pages/PasswordResetPage';
import EventDetailsPage from './pages/EventDetailsPage';
import AdminUserListPage from './pages/AdminUserListPage';
import AdminPanelPage from './pages/AdminPanelPage'; // <-- Импорт AdminPanelPage

import './App.css';

function App() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

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
                  <li><Link to="/events/create">{t('create_event')}</Link></li>
                  {user.role === 'admin' && (
                      <li><Link to="/admin">{t('admin_panel')}</Link></li>
                    )}
                  <li><button onClick={handleLogout}>{t('logout')} ({user.name})</button></li>
                </>
            )}
          </ul>
          <div className="language-switcher" style={{ float: 'right', marginRight: '20px' }}>
            <button onClick={() => changeLanguage('en')} style={{ margin: '0 5px', padding: '5px 10px', cursor: 'pointer', border: '1px solid #ccc', borderRadius: '4px', backgroundColor: i18n.language === 'en' ? '#e0e0e0' : 'white' }}>English</button>
            <button onClick={() => changeLanguage('ru')} style={{ margin: '0 5px', padding: '5px 10px', cursor: 'pointer', border: '1px solid #ccc', borderRadius: '4px', backgroundColor: i18n.language === 'ru' ? '#e0e0e0' : 'white' }}>Русский</button>
          </div>
        </nav>

        <div className="content">
          <Routes>
            <Route path="/" element={ <HomePage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/password-reset" element={<PasswordResetPage />} />
            {user && (
                <>
                  <Route path="/profile" element={<ProfilePage />} />
                  <Route path="/events" element={<EventListPage />} />
                  <Route path="/events/:id" element={<EventDetailsPage />} />
                  <Route path="/events/create" element={<CreateEventPage />} />
                  {user.role === 'admin' && (
                      <>
                        <Route path="/admin" element={<AdminPanelPage />} /> {/* <-- Маршрут для AdminPanelPage */}
                        <Route path="/admin/users" element={<AdminUserListPage />} /> {/* Остается как под-страница */}
                        {/* Здесь можно добавить маршруты для других админ-страниц */}
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