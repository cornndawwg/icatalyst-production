import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  People as PeopleIcon,
  Business as BusinessIcon,
  Assignment as AssignmentIcon,
  TrendingUp as TrendingUpIcon,
  Settings as SettingsIcon,
  Refresh as RefreshIcon,
  Description as ProposalIcon,
} from '@mui/icons-material';
import { useRouter } from 'next/router';
import { getApiUrl } from '../lib/api';

interface DashboardStats {
  totalCustomers: number;
  activeCustomers: number;
  recentProjects: number;
  completedProjects: number;
  recentCustomers?: Array<{
    id: string;
    firstName: string;
    lastName: string;
    company?: string;
    status: string;
    createdAt: string;
  }>;
}

export default function HomePage() {
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<string>('');

  const fetchStats = async () => {
    setLoading(true);
    setError(null);
    setDebugInfo('Starting API call...');

    try {
      const url = getApiUrl('/api/customers?summary=true');
      setDebugInfo(`Calling URL: ${url}`);
      console.log('🎯 Dashboard calling API URL:', url);
      
      const response = await fetch(url);
      
      setDebugInfo(`Response received: ${response.status}`);
      console.log('📥 Response status:', response.status);
      console.log('📥 Response headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      setDebugInfo(`Data received: ${JSON.stringify(data)}`);
      console.log('✅ Dashboard data loaded successfully:', data);
      
      setStats(data);
      setError(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setDebugInfo(`Error: ${errorMessage}`);
      console.error('❌ Dashboard failed to load:', err);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleRefresh = () => {
    console.log('🔄 Manual refresh triggered');
    fetchStats();
  };

  const quickActions = [
    {
      title: 'View Customers',
      description: 'Manage your customer database',
      icon: <PeopleIcon />,
      color: 'primary',
      action: () => router.push('/customers'),
    },
    {
      title: 'Smart Proposals',
      description: 'AI-powered proposal creation',
      icon: <ProposalIcon />,
      color: 'error',
      action: () => router.push('/proposals'),
    },
    {
      title: 'Properties',
      description: 'Browse customer properties',
      icon: <BusinessIcon />,
      color: 'secondary',
      action: () => router.push('/properties'),
    },
    {
      title: 'Projects',
      description: 'Active and completed projects',
      icon: <AssignmentIcon />,
      color: 'success',
      action: () => router.push('/projects'),
    },
    {
      title: 'Lead Generation',
      description: 'Generate new leads',
      icon: <TrendingUpIcon />,
      color: 'info',
      action: () => router.push('/leads'),
    },
  ];

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header with Actions */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            Dashboard Overview
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Welcome to your Smart Home CRM system
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {loading && <CircularProgress size={24} />}
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={handleRefresh}
            disabled={loading}
          >
            Refresh
          </Button>
          <Button
            variant="text"
            onClick={() => router.push('/debug')}
            size="small"
          >
            Debug Console
          </Button>
        </Box>
      </Box>

      {/* API Connection Status */}
      <Paper sx={{ p: 2, mb: 4, bgcolor: stats ? 'success.main' : error ? 'error.main' : 'info.main', color: 'white' }}>
        <Typography variant="h6" gutterBottom>
          🔧 API Connection Status
        </Typography>
        <Typography variant="body2">
          URL: {getApiUrl('/api/customers?summary=true')}
        </Typography>
        <Typography variant="body2">
          Status: {loading ? 'Loading...' : error ? `❌ Error: ${error}` : stats ? '✅ Connected Successfully' : '⏳ Not loaded yet'}
        </Typography>
        <Typography variant="body2">
          Debug: {debugInfo}
        </Typography>
      </Paper>

      {error && (
        <Alert severity="error" sx={{ mb: 4 }}>
          <Typography variant="h6">API Connection Failed</Typography>
          <Typography>{error}</Typography>
          <Button variant="outlined" color="inherit" onClick={() => router.push('/debug')} sx={{ mt: 1 }}>
            Open Debug Console
          </Button>
        </Alert>
      )}

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%', bgcolor: stats ? 'background.paper' : 'grey.100' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <PeopleIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">Customers</Typography>
              </Box>
              <Typography variant="h4" color="primary">
                {loading ? '...' : stats?.totalCustomers ?? '?'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total customers in system
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%', bgcolor: stats ? 'background.paper' : 'grey.100' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <AssignmentIcon color="warning" sx={{ mr: 1 }} />
                <Typography variant="h6">Active Customers</Typography>
              </Box>
              <Typography variant="h4" color="warning.main">
                {loading ? '...' : stats?.activeCustomers ?? '?'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Currently active
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%', bgcolor: stats ? 'background.paper' : 'grey.100' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <TrendingUpIcon color="success" sx={{ mr: 1 }} />
                <Typography variant="h6">Recent Projects</Typography>
              </Box>
              <Typography variant="h4" color="success.main">
                {loading ? '...' : stats?.recentProjects ?? '?'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Projects in progress
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%', bgcolor: stats ? 'background.paper' : 'grey.100' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <TrendingUpIcon color="info" sx={{ mr: 1 }} />
                <Typography variant="h6">Completed Projects</Typography>
              </Box>
              <Typography variant="h4" color="info.main">
                {loading ? '...' : stats?.completedProjects ?? '?'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Successfully completed
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Success Message when data loads */}
      {stats && !loading && (
        <Alert severity="success" sx={{ mb: 4 }}>
          <Typography variant="h6">🎉 API Data Loaded Successfully!</Typography>
          <Typography>
            Showing data for {stats.totalCustomers} customers, {stats.activeCustomers} active
          </Typography>
        </Alert>
      )}

      {/* Quick Actions and Recent Activity */}
      <Grid container spacing={3}>
        {/* Quick Actions */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom>
              Quick Actions
            </Typography>
            <Grid container spacing={2}>
              {quickActions.map((action, index) => (
                <Grid item xs={12} sm={6} key={index}>
                  <Card 
                    sx={{ 
                      cursor: 'pointer',
                      '&:hover': { 
                        elevation: 4,
                        transform: 'translateY(-2px)',
                        transition: 'all 0.2s'
                      }
                    }}
                    onClick={action.action}
                  >
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <Box sx={{ color: `${action.color}.main`, mr: 1 }}>
                          {action.icon}
                        </Box>
                        <Typography variant="h6">
                          {action.title}
                        </Typography>
                      </Box>
                      <Typography variant="body2" color="text.secondary">
                        {action.description}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Paper>
        </Grid>

        {/* Recent Activity */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, height: 'fit-content' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h5">Recent Customers</Typography>
              <Button 
                size="small" 
                onClick={() => router.push('/customers')}
                variant="outlined"
              >
                View All
              </Button>
            </Box>
            
            <List dense>
              {stats?.recentCustomers?.slice(0, 5).map((customer) => (
                <ListItem 
                  key={customer.id}
                  sx={{ 
                    cursor: 'pointer',
                    '&:hover': { bgcolor: 'action.hover' }
                  }}
                  onClick={() => router.push(`/customers/${customer.id}`)}
                >
                  <ListItemIcon>
                    <PeopleIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText
                    primary={`${customer.firstName} ${customer.lastName}`}
                    secondary={customer.company || 'Individual Customer'}
                  />
                  <Chip 
                    label={customer.status} 
                    size="small"
                    color={customer.status === 'active' ? 'success' : 'default'}
                  />
                </ListItem>
              )) || (
                <ListItem>
                  <ListItemText
                    primary={loading ? "Loading customers..." : error ? "Failed to load customers" : "No customer data available"}
                    secondary={loading ? "Please wait..." : error ? "Check the debug console for details" : "API may not be returning customer list"}
                  />
                </ListItem>
              )}
            </List>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
} 