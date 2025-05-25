import React from 'react';
import { useTranslation } from 'react-i18next'; // Import useTranslation

function HomePage() {
    const { t } = useTranslation(); // Initialize useTranslation

    return (
        <div>
            <h1>{t('welcome_message')}</h1> {/* Use t() */}
            <p>{t('login_register_prompt')}</p> {/* Use t() */}
        </div>
    );
}

export default HomePage;
