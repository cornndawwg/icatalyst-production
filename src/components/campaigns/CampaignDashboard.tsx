import { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Paper,
  Button,
} from '@mui/material';
import { useRouter } from 'next/router';

interface CampaignDashboardProps {}

export default function CampaignDashboard(props: CampaignDashboardProps) {
  const router = useRouter();

  const handleCreateCampaign = () => {
    router.push('/campaigns/new');
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h4" component="h1">
            Email Campaigns
          </Typography>
          <Button variant="contained" color="primary" onClick={handleCreateCampaign}>
            Create New Campaign
          </Button>
        </Box>

        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Paper sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="h4" component="div" gutterBottom>
                0
              </Typography>
              <Typography variant="subtitle1" color="text.secondary">
                Active Campaigns
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
}