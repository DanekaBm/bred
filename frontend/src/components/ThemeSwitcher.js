import React from 'react';
import { useTheme } from '../context/ThemeContext'; // Corrected path if needed, assuming it's 'context' not 'contexts'
import { useTranslation } from 'react-i18next';

const ThemeSwitcher = () => {
    const { theme, toggleTheme } = useTheme();
    const { t } = useTranslation();

    return (
        <button onClick={toggleTheme} style={{ background: 'none', border: '1px solid', padding: '8px', borderRadius: '5px', cursor: 'pointer' }}>
            {theme === 'light' ? t('switch_to_dark_theme') : t('switch_to_light_theme')}
        </button>
    );
};

export default ThemeSwitcher;
