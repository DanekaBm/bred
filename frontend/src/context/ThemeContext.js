// src/context/ThemeContext.js
import React, { createContext, useState, useContext, useEffect } from 'react';

// 1. Create the Theme Context
export const ThemeContext = createContext();

// 2. Create a custom hook to use the theme easily
export const useTheme = () => useContext(ThemeContext);

// 3. Create the Theme Provider component
export const ThemeProvider = ({ children }) => {
    // Get theme from localStorage, or default to 'light'
    const [theme, setTheme] = useState(() => {
        return localStorage.getItem('theme') || 'light';
    });

    // Update localStorage and apply class to body whenever theme changes
    useEffect(() => {
        document.body.className = theme; // Add 'light' or 'dark' class to body
        localStorage.setItem('theme', theme); // Persist theme preference
    }, [theme]);

    // Function to toggle theme
    const toggleTheme = () => {
        setTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'));
    };

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};