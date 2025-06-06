import React from 'react';
import type { AppProps } from 'next/app';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
// Temporarily disable date picker imports to fix startup issues
// import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
// import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import AppLayout from '../components/Layout/AppLayout';

// Create a theme instance
const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
      light: '#42a5f5',
      dark: '#1565c0',
    },
    secondary: {
      main: '#9c27b0',
    },
    background: {
      default: '#f5f5f5',
      paper: '#ffffff',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 600,
    },
    h2: {
      fontWeight: 600,
    },
    h3: {
      fontWeight: 600,
    },
    h4: {
      fontWeight: 600,
    },
    h5: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 600,
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
          fontWeight: 600,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          borderRadius: 12,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
      },
    },
  },
});

// Pages that don't need the layout (like login, 404, etc.)
const pagesWithoutLayout = ['/login', '/register', '/404', '/500'];

export default function App({ Component, pageProps, router }: AppProps) {
  // Check if the page is a portal page or other pages that need custom layouts
  const isPortalPage = router.pathname.startsWith('/portal/');
  const isTestPage = router.pathname.startsWith('/portal-test') || router.pathname.startsWith('/portal-demo');
  
  const showLayout = !pagesWithoutLayout.includes(router.pathname) && !isPortalPage && !isTestPage;

  return (
    <ThemeProvider theme={theme}>
      {/* Temporarily disable LocalizationProvider */}
      {/* <LocalizationProvider dateAdapter={AdapterDateFns}> */}
        <CssBaseline />
        {showLayout ? (
          <AppLayout>
            <Component {...pageProps} />
          </AppLayout>
        ) : (
          <Component {...pageProps} />
        )}
      {/* </LocalizationProvider> */}
    </ThemeProvider>
  );
} 