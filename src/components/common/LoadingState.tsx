import React from 'react';
import {
  Box,
  CircularProgress,
  Typography,
  Skeleton,
  Paper,
} from '@mui/material';

interface LoadingStateProps {
  loading: boolean;
  error?: string | null;
  children: React.ReactNode;
  variant?: 'default' | 'skeleton';
  skeletonCount?: number;
}

export default function LoadingState({
  loading,
  error,
  children,
  variant = 'default',
  skeletonCount = 3,
}: LoadingStateProps) {
  if (error) {
    return (
      <Paper
        sx={{
          p: 3,
          textAlign: 'center',
          bgcolor: 'error.light',
          color: 'error.contrastText',
        }}
      >
        <Typography variant="h6" gutterBottom>
          Error
        </Typography>
        <Typography>{error}</Typography>
      </Paper>
    );
  }

  if (loading) {
    if (variant === 'skeleton') {
      return (
        <Box sx={{ width: '100%' }}>
          {[...Array(skeletonCount)].map((_, index) => (
            <Box key={index} sx={{ mb: 2 }}>
              <Skeleton variant="text" width="60%" height={32} />
              <Skeleton variant="text" width="40%" height={24} />
              <Skeleton variant="rectangular" width="100%" height={120} />
            </Box>
          ))}
        </Box>
      );
    }

    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          p: 4,
        }}
      >
        <CircularProgress sx={{ mb: 2 }} />
        <Typography variant="body1" color="textSecondary">
          Loading...
        </Typography>
      </Box>
    );
  }

  return <>{children}</>;
} 