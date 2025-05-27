import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { I18nextProvider } from 'react-i18next';
import i18n from './i18n';
import { ThemeProvider } from './context/ThemeContext';
import { Provider } from 'react-redux';
import store from './redux/store';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <React.StrictMode>
        <I18nextProvider i18n={i18n}>
            <ThemeProvider>
                <BrowserRouter>
                    <AuthProvider>
                        <Provider store={store}>
                            <App />
                        </Provider>
                    </AuthProvider>
                </BrowserRouter>
            </ThemeProvider>
        </I18nextProvider>
    </React.StrictMode>
);