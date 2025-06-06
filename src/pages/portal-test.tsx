import React from 'react';
import { Container, Typography, Paper, Box } from '@mui/material';
import PortalLayout from '../components/PortalLayout';

export default function PortalTestPage() {
  return (
    <PortalLayout 
      integratorName="Smart Home Solutions"
    >
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Paper sx={{ p: 4 }}>
          <Typography variant="h4" gutterBottom>
            Portal Layout Test
          </Typography>
          <Typography variant="body1" paragraph>
            This page should show ONLY the clean portal layout without any CRM navigation sidebar.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            If you can see this page without a sidebar, the portal layout is working correctly!
          </Typography>
          
          <Box sx={{ mt: 3, p: 2, bgcolor: 'success.light', borderRadius: 1 }}>
            <Typography variant="body2">
              ✅ Success: Portal layout is working correctly!
            </Typography>
          </Box>
        </Paper>
      </Container>
    </PortalLayout>
  );
} 