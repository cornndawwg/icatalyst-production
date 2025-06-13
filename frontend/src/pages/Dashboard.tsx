import { 
  Box, 
  Typography, 
  Paper, 
  Grid,
  Button,
  Card,
  CardContent,
  CardActions,
  Chip
} from '@mui/material';
import { 
  People as PeopleIcon,
  Business as BusinessIcon,
  Assignment as AssignmentIcon,
  TrendingUp as TrendingUpIcon
} from '@mui/icons-material';

const Dashboard = () => {
  // Use environment-aware URLs
  const getBaseUrl = () => {
    if (typeof window !== 'undefined') {
      const origin = window.location.origin;
      // In production (Railway), use the same domain
      if (origin.includes('railway.app')) {
        return origin;
      }
      // In development, use port 3002 for main Next.js app
      return origin.replace(':3000', ':3002');
    }
    return '';
  };

  const handleCustomerManagement = () => {
    window.open(`${getBaseUrl()}/customers`, '_blank');
  };

  const handleCustomerDashboard = () => {
    window.open(`${getBaseUrl()}`, '_blank');
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Smart Home CRM Dashboard
      </Typography>
      
      <Typography variant="h6" color="text.secondary" gutterBottom sx={{ mb: 4 }}>
        Welcome to your Customer Relationship Management system
      </Typography>

      {/* Quick Actions */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <PeopleIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">Customer Management</Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                View and manage your customer database with full CRM features
              </Typography>
            </CardContent>
            <CardActions>
              <Button size="small" onClick={handleCustomerManagement}>
                Open Customers
              </Button>
            </CardActions>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <TrendingUpIcon color="secondary" sx={{ mr: 1 }} />
                <Typography variant="h6">CRM Dashboard</Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                View customer analytics, metrics, and business insights
              </Typography>
            </CardContent>
            <CardActions>
              <Button size="small" onClick={handleCustomerDashboard}>
                Open CRM Dashboard
              </Button>
            </CardActions>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <BusinessIcon color="success" sx={{ mr: 1 }} />
                <Typography variant="h6">Lead Generation</Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Find and manage potential customers and leads
              </Typography>
            </CardContent>
            <CardActions>
              <Button size="small" href="/lead-generation">
                Generate Leads
              </Button>
            </CardActions>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <AssignmentIcon color="warning" sx={{ mr: 1 }} />
                <Typography variant="h6">Email Campaigns</Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Create and manage email marketing campaigns
              </Typography>
            </CardContent>
            <CardActions>
              <Button size="small" href="/campaigns">
                View Campaigns
              </Button>
            </CardActions>
          </Card>
        </Grid>
      </Grid>

      {/* Status Cards */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              System Status
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              <Chip label="Frontend: Running" color="success" size="small" />
              <Chip label="API: Ready" color="success" size="small" />
              <Chip label="Database: Connected" color="success" size="small" />
            </Box>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Available Features
            </Typography>
            <Typography variant="body2" color="text.secondary">
              • Customer Management System
              <br />• Property & Project Tracking
              <br />• Interaction History
              <br />• Lead Generation Tools
              <br />• Email Campaign Builder
            </Typography>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Quick Start
            </Typography>
            <Typography variant="body2" color="text.secondary">
              1. Access Customer Management to view/add customers
              <br />2. Use Lead Generation to find prospects
              <br />3. Create email campaigns to engage customers
              <br />4. Track projects and interactions
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard; 
