// frontend/src/i18n.js
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import Backend from 'i18next-http-backend'; // <-- Убедитесь, что этот импорт есть

i18n
    // detect user language
    .use(Backend) // <-- Используем бэкенд для загрузки файлов
    .use(LanguageDetector)
    // pass the i18n instance to react-i18next.
    .use(initReactI18next)
    // init i18next
    .init({
      debug: true, // Установите на false в production
      fallbackLng: 'en', // Язык по умолчанию, если выбранный язык не найден
      interpolation: {
        escapeValue: false, // не нужно для React, так как он по умолчанию экранирует XSS
      },
      // КОНФИГУРАЦИЯ БЭКЕНДА
      backend: {
        loadPath: '/locales/{{lng}}/translation.json', // <-- Важно: путь к вашим файлам переводов
      },
      // УДАЛИТЕ БЛОК 'resources' ОТСЮДА!
      // resources: {
      //   en: {
      //     translation: {
      //       // ... ваши переводы
      //     },
      //   },
      //   ru: {
      //     translation: {
      //       // ... ваши переводы
      //     },
      //   },
      // },
    });

export default i18n;