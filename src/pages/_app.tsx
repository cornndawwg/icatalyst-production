import React from 'react';
import type { AppProps } from 'next/app';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
// Temporarily disable date picker imports to fix startup issues
// import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
// import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import AppLayout from '../components/Layout/AppLayout';
import { dashboardTheme } from '../theme/dashboard-theme';
import '../styles/dashboard.css';

// Using the comprehensive iCatalyst theme

// Pages that don't need the layout (like login, 404, etc.)
const pagesWithoutLayout = ['/login', '/register', '/404', '/500'];

export default function App({ Component, pageProps, router }: AppProps) {
  // Check if the page is a portal page or other pages that need custom layouts
  const isPortalPage = router.pathname.startsWith('/portal/');
  const isTestPage = router.pathname.startsWith('/portal-test') || router.pathname.startsWith('/portal-demo');
  
  const showLayout = !pagesWithoutLayout.includes(router.pathname) && !isPortalPage && !isTestPage;

  return (
    <ThemeProvider theme={dashboardTheme}>
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