import React from 'react';
import { Box, AppBar, Toolbar, Typography, Container } from '@mui/material';
import { Business as BusinessIcon } from '@mui/icons-material';

interface PortalLayoutProps {
  children: React.ReactNode;
  integratorName?: string;
  integratorLogo?: string;
}

export default function PortalLayout({ 
  children, 
  integratorName = "Smart Home Solutions",
  integratorLogo 
}: PortalLayoutProps) {
  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'grey.50' }}>
      {/* Clean header with integrator branding */}
      <AppBar 
        position="static" 
        elevation={0}
        sx={{ 
          bgcolor: 'white', 
          borderBottom: 1, 
          borderColor: 'divider',
          color: 'text.primary'
        }}
      >
        <Container maxWidth="lg">
          <Toolbar sx={{ px: { xs: 0 } }}>
            <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
              {integratorLogo ? (
                <img 
                  src={integratorLogo} 
                  alt={integratorName}
                  style={{ height: 40, marginRight: 16 }}
                />
              ) : (
                <BusinessIcon sx={{ mr: 2, color: 'primary.main', fontSize: 32 }} />
              )}
              <Typography 
                variant="h6" 
                component="div" 
                sx={{ 
                  fontWeight: 'bold',
                  color: 'text.primary'
                }}
              >
                {integratorName}
              </Typography>
            </Box>
            
            {/* Optional: Contact info or phone number */}
            <Typography 
              variant="body2" 
              sx={{ 
                display: { xs: 'none', sm: 'block' },
                color: 'text.secondary'
              }}
            >
              Questions? Call (555) 123-4567
            </Typography>
          </Toolbar>
        </Container>
      </AppBar>

      {/* Main content area */}
      <Box component="main" sx={{ flex: 1 }}>
        {children}
      </Box>

      {/* Clean footer */}
      <Box 
        component="footer" 
        sx={{ 
          mt: 'auto',
          py: 3,
          px: 2,
          bgcolor: 'white',
          borderTop: 1,
          borderColor: 'divider'
        }}
      >
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              © 2024 {integratorName}. Professional Smart Home Installation & Automation.
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
              This is a secure, private proposal portal. For questions about this proposal, please contact us directly.
            </Typography>
          </Box>
        </Container>
      </Box>
    </Box>
  );
} 