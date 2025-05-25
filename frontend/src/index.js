// frontend/src/index.js
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { BrowserRouter } from 'react-router-dom';

// !!! ИМПОРТИРУЙТЕ ВСЕ ПРОВАЙДЕРЫ, ВКЛЮЧАЯ REDUX PROVIDER !!!
import { AuthProvider } from './context/AuthContext';
import { I18nextProvider } from 'react-i18next';
import i18n from './i18n';
import { ThemeProvider } from './context/ThemeContext';

// !!! ИМПОРТИРУЙТЕ REDUX PROVIDER И ВАШ STORE !!!
import { Provider } from 'react-redux'; // Импортируем Provider
import store from './redux/store'; // Импортируем ваш Redux Store

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <React.StrictMode>
        <I18nextProvider i18n={i18n}>
            <ThemeProvider>
                <BrowserRouter>
                    <AuthProvider>
                        <Provider store={store}> {/* <--- ОБЕРНИТЕ ВАШЕ ПРИЛОЖЕНИЕ В REDUX PROVIDER */}
                            <App />
                        </Provider>
                    </AuthProvider>
                </BrowserRouter>
            </ThemeProvider>
        </I18nextProvider>
    </React.StrictMode>
);