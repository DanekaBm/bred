
import React, { createContext, useState, useEffect, useContext } from 'react';
import { useTranslation } from 'react-i18next';

export const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
    const { i18n } = useTranslation();





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

export const useLanguage = () => useContext(LanguageContext);