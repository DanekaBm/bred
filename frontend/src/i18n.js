// frontend/src/i18n.js
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

i18n
  // detect user language
  // learn more: https://github.com/i18next/i18next-browser-languageDetector
  .use(LanguageDetector)
  // pass the i18n instance to react-i18next.
  .use(initReactI18next)
  // init i18next
  // for all options read: https://www.i18next.com/overview/configuration-options
  .init({
    debug: true, // Set to false in production
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false, // not needed for react as it escapes by default
    },
    resources: {
      en: {
        translation: {
          // General
          home: 'Home',
          events: 'Events',
          profile: 'Profile',
          admin_panel: 'Admin Panel',
          login: 'Login',
          register: 'Register',
          logout: 'Logout',
          welcome: 'Welcome',
          event_list: 'Event List',
          no_events_yet: 'No events yet.',
          loading_events: 'Loading events...',
          loading_event_details: 'Loading event details...',
          event_not_found: 'Event not found.',
          description_label: 'Description:',
          date_label: 'Date:',
          location_label: 'Location:',
          category_label: 'Category:',
          creator_label: 'Creator:',
          unknown: 'Unknown',
          edit_event: 'Edit Event',
          delete_event: 'Delete Event',
          confirm_delete_event: 'Are you sure you want to delete this event?',
          yes_delete: 'Yes, Delete',
          cancel: 'Cancel',
          please_login_to_like: 'Please log in to like events.',
          please_login_to_comment: 'Please log in to comment.',
          comment_cannot_be_empty: 'Comment cannot be empty.',
          confirm_delete_comment: 'Are you sure you want to delete this comment?',
          write_a_comment: 'Write a comment...',
          send: 'Send',
          comments_section: 'Comments',
          no_comments_yet: 'No comments yet.',
          like: 'Like',
          unlike: 'Unlike',
          likes_count: '{{count}} Likes', // For pluralization if needed, though simple here
          create_new_event: 'Create New Event',
          event_title: 'Event Title',
          event_description: 'Event Description',
          event_date: 'Event Date',
          event_location: 'Event Location',
          event_category: 'Event Category',
          select_category: 'Select a category',
          create_event_button: 'Create Event',
          update_event_button: 'Update Event',
          not_found_title: '404 - Page Not Found',
          not_found_message: 'The page you are looking for does not exist.',
          go_to_home: 'Go to Home',

          // Auth
          username: 'Username',
          password: 'Password',
          email: 'Email',
          login_button: 'Login',
          register_button: 'Register',
          already_have_account: 'Already have an account? Login',
          no_account_yet: 'Don\'t have an account? Register',
          reset_password_link: 'Forgot Password?',
          password_reset_title: 'Reset Password',
          send_reset_email: 'Send Reset Email',
          new_password: 'New Password',
          confirm_password: 'Confirm New Password',
          reset_password_button: 'Reset Password',

          // Profile
          my_profile: 'My Profile',
          name_label: 'Name:',
          email_label: 'Email:',
          role_label: 'Role:',
          my_events: 'My Events',
          no_events_created: 'You have not created any events yet.',
          change_password_button: 'Change Password',
          current_password: 'Current Password',
          update_password_button: 'Update Password',

          // Admin Panel
          admin_dashboard: 'Admin Dashboard',
          user_management: 'User Management',
          event_management: 'Event Management',
          user_list: 'User List',
          edit_user: 'Edit User',
          delete_user: 'Delete User',
          confirm_delete_user: 'Are you sure you want to delete this user?',
          user_role: 'User Role',
          update_role: 'Update Role',

          // Theme
          toggle_theme: 'Toggle Theme',
          dark_theme: 'Dark Theme',
          light_theme: 'Light Theme',
          switch_language: 'Switch Language',
        },
      },
      ru: {
        translation: {
          // General
          home: 'Главная',
          events: 'События',
          profile: 'Профиль',
          admin_panel: 'Панель администратора',
          login: 'Войти',
          register: 'Регистрация',
          logout: 'Выйти',
          welcome: 'Добро пожаловать',
          event_list: 'Список событий',
          no_events_yet: 'Пока нет событий.',
          loading_events: 'Загрузка событий...',
          loading_event_details: 'Загрузка деталей события...',
          event_not_found: 'Событие не найдено.',
          description_label: 'Описание:',
          date_label: 'Дата:',
          location_label: 'Местоположение:',
          category_label: 'Категория:',
          creator_label: 'Создатель:',
          unknown: 'Неизвестно',
          edit_event: 'Редактировать событие',
          delete_event: 'Удалить событие',
          confirm_delete_event: 'Вы уверены, что хотите удалить это событие?',
          yes_delete: 'Да, удалить',
          cancel: 'Отмена',
          please_login_to_like: 'Пожалуйста, войдите, чтобы поставить лайк.',
          please_login_to_comment: 'Пожалуйста, войдите, чтобы оставить комментарий.',
          comment_cannot_be_empty: 'Комментарий не может быть пустым.',
          confirm_delete_comment: 'Вы уверены, что хотите удалить этот комментарий?',
          write_a_comment: 'Напишите комментарий...',
          send: 'Отправить',
          comments_section: 'Комментарии',
          no_comments_yet: 'Пока нет комментариев.',
          like: 'Нравится',
          unlike: 'Не нравится',
          likes_count: '{{count}} Лайков',
          create_new_event: 'Создать новое событие',
          event_title: 'Название события',
          event_description: 'Описание события',
          event_date: 'Дата события',
          event_location: 'Место проведения',
          event_category: 'Категория события',
          select_category: 'Выберите категорию',
          create_event_button: 'Создать событие',
          update_event_button: 'Обновить событие',
          not_found_title: '404 - Страница не найдена',
          not_found_message: 'Страница, которую вы ищете, не существует.',
          go_to_home: 'На главную',

          // Auth
          username: 'Имя пользователя',
          password: 'Пароль',
          email: 'Email',
          login_button: 'Войти',
          register_button: 'Зарегистрироваться',
          already_have_account: 'Уже есть аккаунт? Войти',
          no_account_yet: 'Нет аккаунта? Зарегистрироваться',
          reset_password_link: 'Забыли пароль?',
          password_reset_title: 'Сброс пароля',
          send_reset_email: 'Отправить письмо для сброса',
          new_password: 'Новый пароль',
          confirm_password: 'Подтвердить новый пароль',
          reset_password_button: 'Сбросить пароль',

          // Profile
          my_profile: 'Мой профиль',
          name_label: 'Имя:',
          email_label: 'Email:',
          role_label: 'Роль:',
          my_events: 'Мои события',
          no_events_created: 'Вы еще не создали ни одного события.',
          change_password_button: 'Сменить пароль',
          current_password: 'Текущий пароль',
          update_password_button: 'Обновить пароль',

          // Admin Panel
          admin_dashboard: 'Панель администратора',
          user_management: 'Управление пользователями',
          event_management: 'Управление событиями',
          user_list: 'Список пользователей',
          edit_user: 'Редактировать пользователя',
          delete_user: 'Удалить пользователя',
          confirm_delete_user: 'Вы уверены, что хотите удалить этого пользователя?',
          user_role: 'Роль пользователя',
          update_role: 'Обновить роль',

          // Theme
          toggle_theme: 'Переключить тему',
          dark_theme: 'Темная тема',
          light_theme: 'Светлая тема',
          switch_language: 'Переключить язык',
        },
      },
    },
  });

export default i18n;