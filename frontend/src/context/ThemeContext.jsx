import React, { createContext, useState, useContext, useMemo } from 'react';
import { createTheme, ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  // Check if dark mode is preferred in localStorage or system settings
  const [mode, setMode] = useState(() => {
    const savedMode = localStorage.getItem('themeMode');
    if (savedMode) return savedMode;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'dark'; // default dark
  });

  const toggleTheme = () => {
    setMode((prevMode) => {
      const newMode = prevMode === 'light' ? 'dark' : 'light';
      localStorage.setItem('themeMode', newMode);
      return newMode;
    });
  };

  // Custom Palette design for Premium Aesthetics
  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode,
          primary: {
            main: mode === 'dark' ? '#6366f1' : '#4f46e5', // Indigo
          },
          secondary: {
            main: mode === 'dark' ? '#14b8a6' : '#0d9488', // Teal
          },
          background: {
            default: mode === 'dark' ? '#0f172a' : '#f8fafc', // Slate 900 / Slate 50
            paper: mode === 'dark' ? '#1e293b' : '#ffffff',   // Slate 800 / White
          },
          text: {
            primary: mode === 'dark' ? '#f8fafc' : '#0f172a',
            secondary: mode === 'dark' ? '#94a3b8' : '#475569',
          },
        },
        typography: {
          fontFamily: '"Inter", "Outfit", -apple-system, sans-serif',
          h1: { fontFamily: '"Outfit", sans-serif', fontWeight: 800 },
          h2: { fontFamily: '"Outfit", sans-serif', fontWeight: 700 },
          h3: { fontFamily: '"Outfit", sans-serif', fontWeight: 700 },
          h4: { fontFamily: '"Outfit", sans-serif', fontWeight: 600 },
          h5: { fontFamily: '"Outfit", sans-serif', fontWeight: 600 },
          h6: { fontFamily: '"Outfit", sans-serif', fontWeight: 500 },
          button: { textTransform: 'none', fontWeight: 600 },
        },
        shape: {
          borderRadius: 12,
        },
        components: {
          MuiButton: {
            styleOverrides: {
              root: {
                borderRadius: 8,
                padding: '8px 20px',
                transition: 'all 0.2s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-1px)',
                },
              },
            },
          },
          MuiCard: {
            styleOverrides: {
              root: {
                backgroundImage: 'none', // Remove default MUI overlay in dark mode
                boxShadow: mode === 'dark' 
                  ? '0 4px 6px -1px rgb(0 0 0 / 0.2), 0 2px 4px -2px rgb(0 0 0 / 0.2)' 
                  : '0 4px 6px -1px rgb(0 0 0 / 0.05), 0 2px 4px -2px rgb(0 0 0 / 0.05)',
                border: mode === 'dark' ? '1px solid #334155' : '1px solid #e2e8f0',
              },
            },
          },
        },
      }),
    [mode]
  );

  return (
    <ThemeContext.Provider value={{ mode, toggleTheme }}>
      <MuiThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
};

export const useThemeToggle = () => useContext(ThemeContext);
