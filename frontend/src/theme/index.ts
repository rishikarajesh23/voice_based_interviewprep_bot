// src/theme/index.ts
import { createTheme, ThemeOptions } from '@mui/material/styles';

// Dark Neomorphism Color Palette
const darkNeoPalette = {
  // Primary dark background
  dark: {
    900: '#0a0a0a',
    800: '#121212',
    700: '#1a1a1a',
    600: '#262626',
    500: '#333333',
    400: '#404040',
    300: '#4d4d4d',
    200: '#666666',
    100: '#808080',
  },
  // Accent colors for neomorphism
  neo: {
    primary: '#bb86fc',
    secondary: '#03dac6',
    accent: '#cf6679',
    warning: '#ff9800',
    success: '#4caf50',
  },
  // Shadows for depth
  shadows: {
    inset: 'inset 8px 8px 16px #0a0a0a, inset -8px -8px 16px #1a1a1a',
    raised: '8px 8px 16px #0a0a0a, -8px -8px 16px #1a1a1a',
    pressed: 'inset 4px 4px 8px #0a0a0a, inset -4px -4px 8px #1a1a1a',
    soft: '4px 4px 8px #0a0a0a, -4px -4px 8px #1a1a1a',
  }
};

// Custom MUI Theme for Dark Neomorphism
const darkNeomorphismTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: darkNeoPalette.neo.primary,
      light: '#d7c4ff',
      dark: '#7c4dff',
      contrastText: '#ffffff',
    },
    secondary: {
      main: darkNeoPalette.neo.secondary,
      light: '#64ffda',
      dark: '#00bfa5',
      contrastText: '#000000',
    },
    error: {
      main: darkNeoPalette.neo.accent,
      light: '#ff5983',
      dark: '#c2185b',
    },
    warning: {
      main: darkNeoPalette.neo.warning,
      light: '#ffb74d',
      dark: '#f57c00',
    },
    success: {
      main: darkNeoPalette.neo.success,
      light: '#81c784',
      dark: '#388e3c',
    },
    background: {
      default: darkNeoPalette.dark[800],
      paper: darkNeoPalette.dark[700],
    },
    text: {
      primary: '#e0e0e0',
      secondary: '#b0b0b0',
      disabled: '#666666',
    },
    divider: 'rgba(255, 255, 255, 0.12)',
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Arial", sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 600,
      letterSpacing: '-0.02em',
      color: '#e0e0e0',
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 600,
      letterSpacing: '-0.01em',
      color: '#e0e0e0',
    },
    h3: {
      fontSize: '1.5rem',
      fontWeight: 600,
      color: '#e0e0e0',
    },
    h4: {
      fontSize: '1.25rem',
      fontWeight: 500,
      color: '#e0e0e0',
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.6,
      color: '#b0b0b0',
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.5,
      color: '#b0b0b0',
    },
    button: {
      fontWeight: 600,
      textTransform: 'none',
      fontSize: '0.95rem',
    },
  },
  shape: {
    borderRadius: 16,
  },
  spacing: 8,
  components: {
    // Button Component - Neomorphism Style
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '16px',
          padding: '12px 28px',
          background: darkNeoPalette.dark[800],
          boxShadow: darkNeoPalette.shadows.raised,
          border: 'none',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            boxShadow: darkNeoPalette.shadows.soft,
            transform: 'translateY(-2px)',
            background: darkNeoPalette.dark[700],
          },
          '&:active': {
            boxShadow: darkNeoPalette.shadows.pressed,
            transform: 'translateY(0)',
          },
        },
        contained: {
          background: `linear-gradient(135deg, ${darkNeoPalette.neo.primary}, ${darkNeoPalette.neo.secondary})`,
          '&:hover': {
            background: `linear-gradient(135deg, ${darkNeoPalette.neo.primary}dd, ${darkNeoPalette.neo.secondary}dd)`,
          },
        },
      },
    },
    // Card Component - Neomorphism Style
    MuiCard: {
      styleOverrides: {
        root: {
          background: darkNeoPalette.dark[800],
          boxShadow: darkNeoPalette.shadows.raised,
          borderRadius: '20px',
          border: `1px solid ${darkNeoPalette.dark[600]}`,
          transition: 'all 0.3s ease',
          '&:hover': {
            boxShadow: '12px 12px 24px #0a0a0a, -12px -12px 24px #1a1a1a',
            transform: 'translateY(-4px)',
          },
        },
      },
    },
    // Paper Component
    MuiPaper: {
      styleOverrides: {
        root: {
          background: darkNeoPalette.dark[800],
          boxShadow: darkNeoPalette.shadows.soft,
          borderRadius: '16px',
        },
        elevation1: {
          boxShadow: darkNeoPalette.shadows.soft,
        },
        elevation2: {
          boxShadow: darkNeoPalette.shadows.raised,
        },
      },
    },
    // TextField Component - Neomorphism Input
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            background: darkNeoPalette.dark[800],
            boxShadow: darkNeoPalette.shadows.inset,
            borderRadius: '12px',
            border: 'none',
            '& fieldset': {
              border: 'none',
            },
            '&:hover fieldset': {
              border: 'none',
            },
            '&.Mui-focused fieldset': {
              border: `2px solid ${darkNeoPalette.neo.primary}`,
              boxShadow: `0 0 0 4px ${darkNeoPalette.neo.primary}20`,
            },
          },
        },
      },
    },
    // AppBar Component
    MuiAppBar: {
      styleOverrides: {
        root: {
          background: darkNeoPalette.dark[800],
          boxShadow: darkNeoPalette.shadows.raised,
          backdropFilter: 'blur(10px)',
          borderBottom: `1px solid ${darkNeoPalette.dark[600]}`,
        },
      },
    },
    // Drawer Component
    MuiDrawer: {
      styleOverrides: {
        paper: {
          background: darkNeoPalette.dark[900],
          borderRight: `1px solid ${darkNeoPalette.dark[600]}`,
        },
      },
    },
    // List Items
    MuiListItem: {
      styleOverrides: {
        root: {
          borderRadius: '12px',
          margin: '4px 8px',
          '&:hover': {
            background: darkNeoPalette.dark[700],
            boxShadow: darkNeoPalette.shadows.soft,
          },
        },
      },
    },
    // Chip Component
    MuiChip: {
      styleOverrides: {
        root: {
          background: darkNeoPalette.dark[700],
          boxShadow: darkNeoPalette.shadows.soft,
          border: `1px solid ${darkNeoPalette.dark[500]}`,
          '&:hover': {
            boxShadow: darkNeoPalette.shadows.raised,
          },
        },
      },
    },
    // Switch Component
    MuiSwitch: {
      styleOverrides: {
        track: {
          background: darkNeoPalette.dark[600],
          boxShadow: darkNeoPalette.shadows.inset,
        },
        thumb: {
          background: darkNeoPalette.neo.primary,
          boxShadow: darkNeoPalette.shadows.soft,
        },
      },
    },
  },
} as ThemeOptions);

export default darkNeomorphismTheme;

// Custom hook for neomorphism styles
export const useNeomorphismStyles = () => {
  return {
    // Raised element (buttons, cards)
    raised: {
      background: darkNeoPalette.dark[800],
      boxShadow: darkNeoPalette.shadows.raised,
      border: `1px solid ${darkNeoPalette.dark[600]}`,
      borderRadius: '16px',
      transition: 'all 0.3s ease',
      '&:hover': {
        boxShadow: '12px 12px 24px #0a0a0a, -12px -12px 24px #1a1a1a',
        transform: 'translateY(-2px)',
      },
      '&:active': {
        boxShadow: darkNeoPalette.shadows.pressed,
        transform: 'translateY(0)',
      },
    },
    // Inset element (inputs, pressed buttons)
    inset: {
      background: darkNeoPalette.dark[800],
      boxShadow: darkNeoPalette.shadows.inset,
      borderRadius: '12px',
      border: `1px solid ${darkNeoPalette.dark[700]}`,
    },
    // Flat element (backgrounds)
    flat: {
      background: darkNeoPalette.dark[800],
      border: `1px solid ${darkNeoPalette.dark[600]}`,
    },
    // Gradient accent
    gradient: {
      background: `linear-gradient(135deg, ${darkNeoPalette.neo.primary}, ${darkNeoPalette.neo.secondary})`,
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
    },
  };
};