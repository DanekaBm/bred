import React from 'react';
import { useTranslation } from 'react-i18next';

const LanguageSwitcher = () => {
    const { i18n } = useTranslation();

    const changeLanguage = (lng) => {
        i18n.changeLanguage(lng);
    };

    return (
        <div style={{ display: 'flex', gap: '5px' }}>
            <button
                onClick={() => changeLanguage('en')}
                style={{
                    backgroundColor: i18n.language === 'en' ? 'var(--accent-color)' : 'var(--secondary-color)',
                    color: 'var(--text-color)',
                    border: '1px solid var(--text-color)',
                    padding: '8px 12px',
                    borderRadius: '5px',
                    cursor: 'pointer',
                    fontWeight: i18n.language === 'en' ? 'bold' : 'normal',
                    outline: 'none',
                    transition: 'background-color 0.3s ease, border-color 0.3s ease, color 0.3s ease',
                    minWidth: '40px',
                    textAlign: 'center' // Center text
                }}
            >
                EN
            </button>
            <button
                onClick={() => changeLanguage('ru')}
                style={{
                    backgroundColor: i18n.language === 'ru' ? 'var(--accent-color)' : 'var(--secondary-color)',
                    color: 'var(--text-color)',
                    border: '1px solid var(--text-color)',
                    padding: '8px 12px',
                    borderRadius: '5px',
                    cursor: 'pointer',
                    fontWeight: i18n.language === 'ru' ? 'bold' : 'normal',
                    outline: 'none',
                    transition: 'background-color 0.3s ease, border-color 0.3s ease, color 0.3s ease',
                    minWidth: '40px',
                    textAlign: 'center' // Center text
                }}
            >
                RU
            </button>
        </div>
    );
};

export default LanguageSwitcher;
