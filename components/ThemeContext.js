// components/ThemeContext.js
import React, { createContext, useContext, useState } from 'react';
import { ThemeProvider as StyledProvider } from 'styled-components/native';

const ACCENTS = ['#4f46e5', '#16a34a', '#dc2626', '#d97706', '#8b5cf6'];

const lightBase = {
  bg: '#eef2ff',
  surface: '#fff',
  text: '#1e1e2f',
  border: '#e5e7eb',
};

const darkBase = {
  bg: '#1e1e2f',
  surface: '#2a2a3c',
  text: '#fff',
  border: '#4b5563',
};

const AppThemeContext = createContext({
  mode: 'light',
  accentIndex: 0,
  toggleMode: () => {},
  cycleAccent: () => {},
  theme: { colors: lightBase },
});

export function AppThemeProvider({ children }) {
  const [mode, setMode] = useState('light');
  const [accentIndex, setAccentIndex] = useState(0);

  const toggleMode = () => setMode(m => (m === 'light' ? 'dark' : 'light'));
  const cycleAccent = () => setAccentIndex(i => (i + 1) % ACCENTS.length);

  const base = mode === 'light' ? lightBase : darkBase;
  const theme = {
    colors: {
      primary: ACCENTS[accentIndex],
      ...base,
    },
  };

  return (
    <AppThemeContext.Provider value={{ mode, accentIndex, toggleMode, cycleAccent, theme }}>
      {/* Now p.theme === { colors: { bg, surface, text, border, primary } } */}
      <StyledProvider theme={theme}>
        {children}
      </StyledProvider>
    </AppThemeContext.Provider>
  );
}

export function useAppTheme() {
  return useContext(AppThemeContext);
}
