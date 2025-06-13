import { createTheme } from '@mui/material/styles';

// iCatalyst Brand Color Palette
const iCatalystColors = {
  // Primary Colors
  iCatalystBlue: '#2563EB',
  catalystOrange: '#F97316', 
  pureWhite: '#FFFFFF',
  
  // Secondary Colors
  slateGray: '#64748B',
  lightGray: '#F1F5F9',
  darkNavy: '#1E293B',
  
  // Extended palette for various states
  lightBlue: '#3B82F6',
  darkBlue: '#1D4ED8',
  lightOrange: '#FB923C',
  darkOrange: '#EA580C',
};

export const dashboardTheme = createTheme({
  palette: {
    primary: {
      main: iCatalystColors.iCatalystBlue,
      light: iCatalystColors.lightBlue,
      dark: iCatalystColors.darkBlue,
      contrastText: iCatalystColors.pureWhite,
    },
    secondary: {
      main: iCatalystColors.catalystOrange,
      light: iCatalystColors.lightOrange,
      dark: iCatalystColors.darkOrange,
      contrastText: iCatalystColors.pureWhite,
    },
    success: {
      main: '#10B981', // Modern green that complements the palette
      light: '#34D399',
      dark: '#059669',
      contrastText: iCatalystColors.pureWhite,
    },
    warning: {
      main: iCatalystColors.catalystOrange,
      light: iCatalystColors.lightOrange,
      dark: iCatalystColors.darkOrange,
      contrastText: iCatalystColors.pureWhite,
    },
    error: {
      main: '#EF4444', // Modern red that fits the professional palette
      light: '#F87171',
      dark: '#DC2626',
      contrastText: iCatalystColors.pureWhite,
    },
    info: {
      main: iCatalystColors.iCatalystBlue,
      light: iCatalystColors.lightBlue,
      dark: iCatalystColors.darkBlue,
      contrastText: iCatalystColors.pureWhite,
    },
    background: {
      default: iCatalystColors.lightGray,
      paper: iCatalystColors.pureWhite,
    },
    text: {
      primary: iCatalystColors.darkNavy,
      secondary: iCatalystColors.slateGray,
    },
    grey: {
      50: '#F8FAFC',
      100: iCatalystColors.lightGray,
      200: '#E2E8F0',
      300: '#CBD5E1',
      400: '#94A3B8',
      500: iCatalystColors.slateGray,
      600: '#475569',
      700: '#334155',
      800: '#1E293B',
      900: '#0F172A',
    },
  },
  typography: {
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    h1: {
      fontSize: '2rem', // 32px desktop
      fontWeight: 600, // Inter Semibold
      lineHeight: 1.2,
      color: iCatalystColors.darkNavy,
      '@media (max-width:768px)': {
        fontSize: '1.75rem', // 28px mobile
      },
    },
    h2: {
      fontSize: '1.5rem', // 24px desktop
      fontWeight: 600, // Inter Semibold
      lineHeight: 1.3,
      color: iCatalystColors.darkNavy,
      '@media (max-width:768px)': {
        fontSize: '1.375rem', // 22px mobile
      },
    },
    h3: {
      fontSize: '1.25rem', // 20px desktop
      fontWeight: 500, // Inter Medium
      lineHeight: 1.4,
      color: iCatalystColors.darkNavy,
      '@media (max-width:768px)': {
        fontSize: '1.125rem', // 18px mobile
      },
    },
    h4: {
      fontSize: '1.125rem',
      fontWeight: 500,
      lineHeight: 1.4,
      color: iCatalystColors.darkNavy,
    },
    h5: {
      fontSize: '1rem',
      fontWeight: 500,
      lineHeight: 1.4,
      color: iCatalystColors.darkNavy,
    },
    h6: {
      fontSize: '0.875rem',
      fontWeight: 500,
      lineHeight: 1.5,
      color: iCatalystColors.darkNavy,
    },
    body1: {
      fontSize: '1rem', // 16px desktop
      fontWeight: 400, // Inter Regular
      lineHeight: 1.5,
      color: iCatalystColors.slateGray,
      '@media (max-width:768px)': {
        fontSize: '0.875rem', // 14px mobile
      },
    },
    body2: {
      fontSize: '0.875rem', // 14px desktop
      fontWeight: 400, // Inter Regular
      lineHeight: 1.43,
      color: iCatalystColors.slateGray,
      '@media (max-width:768px)': {
        fontSize: '0.75rem', // 12px mobile
      },
    },
    caption: {
      fontSize: '0.75rem',
      lineHeight: 1.33,
      color: iCatalystColors.slateGray,
      fontWeight: 400,
    },
    button: {
      fontSize: '0.875rem',
      fontWeight: 500,
      textTransform: 'none',
      letterSpacing: '0.025em',
    },
  },
  shape: {
    borderRadius: 8, // Clean, modern 8px border radius
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          backgroundColor: iCatalystColors.pureWhite,
          border: `1px solid ${iCatalystColors.lightGray}`,
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
          padding: 24,
          transition: 'all 0.3s ease-in-out',
          '&:hover': {
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 6, // iCatalyst button border radius
          textTransform: 'none',
          fontWeight: 500,
          padding: '10px 20px',
          fontFamily: '"Inter", sans-serif',
        },
        contained: {
          backgroundColor: iCatalystColors.iCatalystBlue,
          color: iCatalystColors.pureWhite,
          boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
          '&:hover': {
            backgroundColor: iCatalystColors.darkBlue,
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
          },
        },
        outlined: {
          backgroundColor: iCatalystColors.pureWhite,
          borderColor: iCatalystColors.iCatalystBlue,
          color: iCatalystColors.iCatalystBlue,
          '&:hover': {
            backgroundColor: `${iCatalystColors.iCatalystBlue}08`,
            borderColor: iCatalystColors.darkBlue,
          },
        },
      },
      variants: [
        {
          props: { variant: 'contained', color: 'secondary' },
          style: {
            backgroundColor: iCatalystColors.catalystOrange,
            color: iCatalystColors.pureWhite,
            '&:hover': {
              backgroundColor: iCatalystColors.darkOrange,
            },
          },
        },
      ],
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 6,
          fontWeight: 500,
          height: 32,
          fontFamily: '"Inter", sans-serif',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: iCatalystColors.pureWhite,
          color: iCatalystColors.darkNavy,
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundColor: iCatalystColors.pureWhite,
          borderRadius: 8,
          border: `1px solid ${iCatalystColors.lightGray}`,
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          border: '1px solid',
          fontFamily: '"Inter", sans-serif',
        },
        standardError: {
          backgroundColor: '#FEF2F2',
          borderColor: '#FECACA',
          color: '#B91C1C',
        },
        standardWarning: {
          backgroundColor: '#FFFBEB',
          borderColor: '#FED7AA',
          color: '#D97706',
        },
        standardInfo: {
          backgroundColor: '#EFF6FF',
          borderColor: '#DBEAFE',
          color: iCatalystColors.darkBlue,
        },
        standardSuccess: {
          backgroundColor: '#F0FDF4',
          borderColor: '#BBF7D0',
          color: '#166534',
        },
      },
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: {
          borderRadius: 4,
          height: 6,
        },
        bar: {
          borderRadius: 4,
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 6,
            backgroundColor: iCatalystColors.pureWhite,
            '& fieldset': {
              borderColor: iCatalystColors.lightGray,
            },
            '&:hover fieldset': {
              borderColor: iCatalystColors.slateGray,
            },
            '&.Mui-focused fieldset': {
              borderColor: iCatalystColors.iCatalystBlue,
            },
          },
        },
      },
    },
  },
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 960,
      lg: 1280,
      xl: 1920,
    },
  },
});

export default dashboardTheme; 