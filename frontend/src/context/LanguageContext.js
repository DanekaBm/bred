// frontend/src/context/LanguageContext.js
import React, { createContext, useState, useEffect, useContext } from 'react';
import { useTranslation } from 'react-i18next'; // Используем useTranslation из react-i18next

export const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
    const { i18n } = useTranslation(); // Получаем i18n инстанс из react-i18next

    // В данном случае, нам не нужно отдельное состояние языка здесь,
    // так как i18n сам управляет текущим языком.
    // Этот провайдер просто делает i18n доступным, если это нужно.
    // Основная логика переключения языка уже в App.js

    const changeLanguage = (lng) => {
        i18n.changeLanguage(lng);
    };

    const contextValue = {
        currentLanguage: i18n.language,
        changeLanguage,
    };

    return (
        <LanguageContext.Provider value={contextValue}>
            {children}
        </LanguageContext.Provider>
    );
};

// Опционально: хук для удобства использования
export const useLanguage = () => useContext(LanguageContext);