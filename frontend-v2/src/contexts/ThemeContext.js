import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { createTheme, ThemeProvider as MUIThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

const ThemeContext = createContext();

// Brand orange: app bar & selected nav (light + dark)
const primaryOrange = {
  main: 'rgb(236, 128, 39)',   // #ec8027 – top bar & selected item
  light: 'rgb(255, 167, 92)',
  dark: 'rgb(193, 121, 21)',    // #c17915 – hover on selected
  contrastText: '#ffffff',
};

// Alternate brand blue
const primaryBlue = {
  main: 'rgb(25, 118, 210)',   // #1976d2 – top bar & selected item
  light: 'rgb(66, 165, 245)',  // #42a5f5
  dark: 'rgb(13, 71, 161)',    // #0d47a1 – hover on selected
  contrastText: '#ffffff',
};

const PRIMARY_BY_COLOR = {
  orange: primaryOrange,
  blue: primaryBlue,
};

const SUPPORTED_COLORS = Object.keys(PRIMARY_BY_COLOR);

// Eye-friendly color palettes
const buildLightPalette = (primary) => ({
  mode: 'light',
  primary,
  secondary: {
    main: '#9c27b0', // Purple accent
    light: '#ba68c8',
    dark: '#7b1fa2',
    contrastText: '#ffffff',
  },
  background: {
    default: '#f8f9fa', // Soft off-white
    paper: '#ffffff',
  },
  text: {
    primary: '#1a1a1a', // Soft black for readability
    secondary: '#4a4a4a',
  },
  error: {
    main: '#d32f2f',
    light: '#ef5350',
    dark: '#c62828',
  },
  warning: {
    main: '#ed6c02',
    light: '#ff9800',
    dark: '#e65100',
  },
  info: {
    main: '#0288d1',
    light: '#03a9f4',
    dark: '#01579b',
  },
  success: {
    main: '#2e7d32',
    light: '#4caf50',
    dark: '#1b5e20',
  },
  divider: 'rgba(0, 0, 0, 0.08)',
});

const buildDarkPalette = (primary) => ({
  mode: 'dark',
  primary,
  secondary: {
    main: '#ce93d8', // Softer purple
    light: '#f3e5f5',
    dark: '#ab47bc',
    contrastText: '#000000',
  },
  background: {
    default: '#121212', // True dark background
    paper: '#1e1e1e', // Slightly lighter for cards
  },
  text: {
    primary: '#e0e0e0', // Soft white for readability
    secondary: '#b0b0b0',
  },
  error: {
    main: '#ef5350',
    light: '#ff867c',
    dark: '#c62828',
  },
  warning: {
    main: '#ffa726',
    light: '#ffb74d',
    dark: '#f57c00',
  },
  info: {
    main: '#42a5f5',
    light: '#64b5f6',
    dark: '#1976d2',
  },
  success: {
    main: '#66bb6a',
    light: '#81c784',
    dark: '#388e3c',
  },
  divider: 'rgba(255, 255, 255, 0.12)',
});

export const ThemeProvider = ({ children }) => {
  // Check system preference and localStorage
  const [mode, setMode] = useState(() => {
    const savedMode = localStorage.getItem('themeMode');
    if (savedMode) return savedMode;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  // Brand color (orange | blue), persisted; defaults to orange to match legacy look.
  const [color, setColorState] = useState(() => {
    const saved = localStorage.getItem('themeColor');
    return saved && SUPPORTED_COLORS.includes(saved) ? saved : 'orange';
  });

  // Listen to system preference changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e) => {
      // Only auto-switch if user hasn't manually set a preference
      if (!localStorage.getItem('themeMode')) {
        setMode(e.matches ? 'dark' : 'light');
      }
    };
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const toggleMode = () => {
    const newMode = mode === 'light' ? 'dark' : 'light';
    setMode(newMode);
    localStorage.setItem('themeMode', newMode);
  };

  const setColor = (next) => {
    if (!SUPPORTED_COLORS.includes(next)) return;
    setColorState(next);
    localStorage.setItem('themeColor', next);
  };

  const toggleColor = () => {
    setColor(color === 'orange' ? 'blue' : 'orange');
  };

  const theme = useMemo(() => {
    const primary = PRIMARY_BY_COLOR[color] || primaryOrange;
    const palette = mode === 'dark' ? buildDarkPalette(primary) : buildLightPalette(primary);
    
    return createTheme({
      palette,
      typography: {
        fontFamily: [
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'Roboto',
          '"Helvetica Neue"',
          'Arial',
          'sans-serif',
        ].join(','),
        h1: {
          fontWeight: 600,
          fontSize: '2.5rem',
          lineHeight: 1.2,
        },
        h2: {
          fontWeight: 600,
          fontSize: '2rem',
          lineHeight: 1.3,
        },
        h3: {
          fontWeight: 600,
          fontSize: '1.75rem',
          lineHeight: 1.3,
        },
        h4: {
          fontWeight: 600,
          fontSize: '1.5rem',
          lineHeight: 1.4,
        },
        h5: {
          fontWeight: 600,
          fontSize: '1.25rem',
          lineHeight: 1.4,
        },
        h6: {
          fontWeight: 600,
          fontSize: '1rem',
          lineHeight: 1.5,
        },
        body1: {
          fontSize: '1rem',
          lineHeight: 1.6,
        },
        body2: {
          fontSize: '0.875rem',
          lineHeight: 1.6,
        },
      },
      shape: {
        borderRadius: 8,
      },
      components: {
        MuiButton: {
          styleOverrides: {
            root: {
              textTransform: 'none',
              fontWeight: 500,
              borderRadius: 8,
              padding: '8px 16px',
            },
          },
        },
        MuiCard: {
          styleOverrides: {
            root: {
              borderRadius: 12,
              boxShadow: mode === 'dark' 
                ? '0 2px 8px rgba(0, 0, 0, 0.3)'
                : '0 2px 8px rgba(0, 0, 0, 0.1)',
              transition: 'box-shadow 0.3s ease, transform 0.2s ease',
              '&:hover': {
                boxShadow: mode === 'dark'
                  ? '0 4px 16px rgba(0, 0, 0, 0.4)'
                  : '0 4px 16px rgba(0, 0, 0, 0.15)',
              },
            },
          },
        },
        MuiTextField: {
          styleOverrides: {
            root: {
              '& .MuiOutlinedInput-root': {
                borderRadius: 8,
              },
            },
          },
        },
        MuiChip: {
          styleOverrides: {
            root: {
              borderRadius: 6,
            },
          },
        },
      },
    });
  }, [mode, color]);

  return (
    <ThemeContext.Provider
      value={{
        mode,
        toggleMode,
        color,
        toggleColor,
        setColor,
        availableColors: SUPPORTED_COLORS,
      }}
    >
      <MUIThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </MUIThemeProvider>
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};






