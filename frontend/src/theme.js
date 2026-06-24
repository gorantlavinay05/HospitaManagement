import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1a365d', // Deep Slate Blue
      light: '#2b6cb0',
      dark: '#0f172a',
      contrastText: '#ffffff'
    },
    secondary: {
      main: '#0d9488', // Teal
      light: '#14b8a6',
      dark: '#115e59',
      contrastText: '#ffffff'
    },
    background: {
      default: '#f8fafc', // Soft Slate White
      paper: '#ffffff'
    },
    text: {
      primary: '#1e293b',
      secondary: '#64748b'
    },
    error: {
      main: '#ef4444'
    },
    warning: {
      main: '#f59e0b'
    },
    success: {
      main: '#10b981'
    },
    info: {
      main: '#3b82f6'
    }
  },
  typography: {
    fontFamily: '"Outfit", "Inter", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 700,
      fontSize: '2.25rem',
      color: '#1a365d'
    },
    h2: {
      fontWeight: 700,
      fontSize: '1.875rem',
      color: '#1a365d'
    },
    h3: {
      fontWeight: 600,
      fontSize: '1.5rem',
      color: '#1a365d'
    },
    h4: {
      fontWeight: 600,
      fontSize: '1.25rem'
    },
    h5: {
      fontWeight: 600,
      fontSize: '1.125rem'
    },
    h6: {
      fontWeight: 600,
      fontSize: '1rem'
    },
    body1: {
      fontSize: '0.975rem',
      lineHeight: 1.6
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.5
    },
    button: {
      textTransform: 'none',
      fontWeight: 600
    }
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: '8px 16px',
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0px 4px 12px rgba(13, 148, 136, 0.15)'
          }
        },
        containedPrimary: {
          background: 'linear-gradient(135deg, #1a365d 0%, #2b6cb0 100%)'
        },
        containedSecondary: {
          background: 'linear-gradient(135deg, #0d9488 0%, #14b8a6 100%)'
        }
      }
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05), 0 2px 4px -2px rgb(0 0 0 / 0.05)',
          border: '1px solid #e2e8f0',
          transition: 'transform 0.2s ease, box-shadow 0.2s ease',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)'
          }
        }
      }
    },
    MuiTableCell: {
      styleOverrides: {
        head: {
          backgroundColor: '#f1f5f9',
          color: '#1a365d',
          fontWeight: 700
        }
      }
    }
  }
});

export default theme;
