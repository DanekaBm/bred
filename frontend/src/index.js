// frontend/src/index.js
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css'; // Important for global styles and theme variables
import App from './App';
import { BrowserRouter } from 'react-router-dom';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);