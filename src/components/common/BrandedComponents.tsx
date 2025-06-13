import React from 'react';
import { 
  Button, 
  Card, 
  CardContent, 
  Typography, 
  Chip, 
  Alert,
  Paper,
  Box,
  ButtonProps,
  CardProps,
  ChipProps,
  AlertProps,
  styled
} from '@mui/material';

// iCatalyst Brand Colors
export const iCatalystColors = {
  // Primary Colors
  iCatalystBlue: '#2563EB',
  catalystOrange: '#F97316',
  pureWhite: '#FFFFFF',
  
  // Secondary Colors
  slateGray: '#64748B',
  lightGray: '#F1F5F9',
  darkNavy: '#1E293B',
  
  // Extended palette
  lightBlue: '#3B82F6',
  darkBlue: '#1D4ED8',
  lightOrange: '#FB923C',
  darkOrange: '#EA580C',
  successGreen: '#10B981',
  errorRed: '#EF4444',
};

// Styled Components with iCatalyst Branding

export const ICatalystButton = styled(Button)<ButtonProps & { variant?: 'primary' | 'secondary' | 'accent' }>(
  ({ variant = 'primary' }) => ({
    borderRadius: 6,
    textTransform: 'none',
    fontWeight: 500,
    padding: '10px 20px',
    fontFamily: '"Inter", sans-serif',
    fontSize: '0.875rem',
    
    ...(variant === 'primary' && {
      backgroundColor: iCatalystColors.iCatalystBlue,
      color: iCatalystColors.pureWhite,
      '&:hover': {
        backgroundColor: iCatalystColors.darkBlue,
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      },
    }),
    
    ...(variant === 'secondary' && {
      backgroundColor: iCatalystColors.pureWhite,
      color: iCatalystColors.iCatalystBlue,
      border: `1px solid ${iCatalystColors.iCatalystBlue}`,
      '&:hover': {
        backgroundColor: `${iCatalystColors.iCatalystBlue}08`,
        borderColor: iCatalystColors.darkBlue,
      },
    }),
    
    ...(variant === 'accent' && {
      backgroundColor: iCatalystColors.catalystOrange,
      color: iCatalystColors.pureWhite,
      '&:hover': {
        backgroundColor: iCatalystColors.darkOrange,
      },
    }),
  })
);

export const ICatalystCard = styled(Card)<CardProps>(() => ({
  borderRadius: 8,
  backgroundColor: iCatalystColors.pureWhite,
  border: `1px solid ${iCatalystColors.lightGray}`,
  boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
  padding: 24,
  transition: 'all 0.3s ease-in-out',
  '&:hover': {
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  },
}));

export const ICatalystChip = styled(Chip)<ChipProps & { status?: 'success' | 'warning' | 'error' | 'default' }>(
  ({ status = 'default' }) => ({
    borderRadius: 6,
    fontWeight: 500,
    height: 32,
    fontFamily: '"Inter", sans-serif',
    fontSize: '0.875rem',
    
    ...(status === 'success' && {
      backgroundColor: iCatalystColors.successGreen,
      color: iCatalystColors.pureWhite,
    }),
    
    ...(status === 'warning' && {
      backgroundColor: iCatalystColors.catalystOrange,
      color: iCatalystColors.pureWhite,
    }),
    
    ...(status === 'error' && {
      backgroundColor: iCatalystColors.errorRed,
      color: iCatalystColors.pureWhite,
    }),
    
    ...(status === 'default' && {
      backgroundColor: iCatalystColors.slateGray,
      color: iCatalystColors.pureWhite,
    }),
  })
);

export const ICatalystAlert = styled(Alert)<AlertProps>(() => ({
  borderRadius: 8,
  fontFamily: '"Inter", sans-serif',
  fontWeight: 500,
}));

export const ICatalystPaper = styled(Paper)(() => ({
  backgroundColor: iCatalystColors.pureWhite,
  borderRadius: 8,
  border: `1px solid ${iCatalystColors.lightGray}`,
  boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
  padding: 24,
}));

// Typography Components
export const ICatalystTitle = styled(Typography)(() => ({
  color: iCatalystColors.darkNavy,
  fontWeight: 600,
  fontFamily: '"Inter", sans-serif',
  lineHeight: 1.2,
}));

export const ICatalystSubtitle = styled(Typography)(() => ({
  color: iCatalystColors.slateGray,
  fontWeight: 400,
  fontFamily: '"Inter", sans-serif',
  lineHeight: 1.5,
}));

export const ICatalystLabel = styled(Typography)(() => ({
  color: iCatalystColors.slateGray,
  fontWeight: 500,
  fontFamily: '"Inter", sans-serif',
  fontSize: '0.875rem',
}));

// Layout Components
export const ICatalystContainer = styled(Box)(() => ({
  backgroundColor: iCatalystColors.lightGray,
  minHeight: '100vh',
  padding: '24px',
  fontFamily: '"Inter", sans-serif',
}));

export const ICatalystSection = styled(Box)(() => ({
  backgroundColor: iCatalystColors.pureWhite,
  borderRadius: 8,
  border: `1px solid ${iCatalystColors.lightGray}`,
  padding: '24px',
  marginBottom: '24px',
  boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
}));

// Status Indicator Component
interface StatusIndicatorProps {
  status: 'exceeding' | 'on-target' | 'below-target' | 'insufficient';
  label: string;
}

export const ICatalystStatusIndicator: React.FC<StatusIndicatorProps> = ({ status, label }) => {
  const getStatusStyles = () => {
    switch (status) {
      case 'exceeding':
        return { backgroundColor: iCatalystColors.successGreen, color: iCatalystColors.pureWhite };
      case 'on-target':
        return { backgroundColor: iCatalystColors.catalystOrange, color: iCatalystColors.pureWhite };
      case 'below-target':
        return { backgroundColor: iCatalystColors.errorRed, color: iCatalystColors.pureWhite };
      case 'insufficient':
        return { backgroundColor: iCatalystColors.slateGray, color: iCatalystColors.pureWhite };
      default:
        return { backgroundColor: iCatalystColors.slateGray, color: iCatalystColors.pureWhite };
    }
  };

  return (
    <Box
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        borderRadius: '6px',
        padding: '8px 16px',
        fontFamily: '"Inter", sans-serif',
        fontWeight: 500,
        fontSize: '0.875rem',
        ...getStatusStyles(),
      }}
    >
      {label}
    </Box>
  );
};

// Metric Display Component
interface MetricDisplayProps {
  value: string | number;
  label: string;
  size?: 'large' | 'medium' | 'small';
}

export const ICatalystMetric: React.FC<MetricDisplayProps> = ({ value, label, size = 'large' }) => {
  const getSizeStyles = () => {
    switch (size) {
      case 'large':
        return { fontSize: '2.5rem', fontWeight: 600 };
      case 'medium':
        return { fontSize: '1.5rem', fontWeight: 500 };
      case 'small':
        return { fontSize: '1rem', fontWeight: 500 };
      default:
        return { fontSize: '2.5rem', fontWeight: 600 };
    }
  };

  return (
    <Box>
      <Typography
        sx={{
          color: iCatalystColors.iCatalystBlue,
          fontFamily: '"Inter", sans-serif',
          lineHeight: 1.2,
          marginBottom: '8px',
          ...getSizeStyles(),
        }}
      >
        {value}
      </Typography>
      <ICatalystLabel>{label}</ICatalystLabel>
    </Box>
  );
};

// Header Component
interface HeaderProps {
  title: string;
  subtitle?: string;
}

export const ICatalystHeader: React.FC<HeaderProps> = ({ title, subtitle }) => {
  return (
    <Box
      sx={{
        marginBottom: '32px',
        padding: '20px 0',
        borderBottom: `1px solid ${iCatalystColors.lightGray}`,
      }}
    >
      <ICatalystTitle variant="h1" sx={{ fontSize: '2rem', marginBottom: '8px' }}>
        {title}
      </ICatalystTitle>
      {subtitle && (
        <ICatalystSubtitle variant="body1" sx={{ fontSize: '1rem' }}>
          {subtitle}
        </ICatalystSubtitle>
      )}
    </Box>
  );
};

export default {
  ICatalystButton,
  ICatalystCard,
  ICatalystChip,
  ICatalystAlert,
  ICatalystPaper,
  ICatalystTitle,
  ICatalystSubtitle,
  ICatalystLabel,
  ICatalystContainer,
  ICatalystSection,
  ICatalystStatusIndicator,
  ICatalystMetric,
  ICatalystHeader,
  iCatalystColors,
}; 