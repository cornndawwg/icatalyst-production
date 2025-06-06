import React from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Card,
  CardContent,
  LinearProgress,
  Avatar,
  AvatarGroup,
} from '@mui/material';
import PeopleIcon from '@mui/icons-material/People';
import BusinessIcon from '@mui/icons-material/Business';
import HomeIcon from '@mui/icons-material/Home';
import StarIcon from '@mui/icons-material/Star';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import AssignmentIcon from '@mui/icons-material/Assignment';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import { CustomerDashboardMetrics } from '../../types/customer';

interface CustomerDashboardProps {
  metrics: CustomerDashboardMetrics;
}

export default function CustomerDashboard({ metrics }: CustomerDashboardProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Key Metrics */}
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                <PeopleIcon />
              </Avatar>
              <Typography variant="h6">Total Customers</Typography>
            </Box>
            <Typography variant="h3" component="div" gutterBottom>
              {metrics.totalCustomers}
            </Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Typography variant="caption" color="text.secondary">
                Residential: {metrics.customersByType.residential}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Commercial: {metrics.customersByType.commercial}
              </Typography>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Avatar sx={{ bgcolor: 'success.main', mr: 2 }}>
                <AssignmentIcon />
              </Avatar>
              <Typography variant="h6">Active Projects</Typography>
            </Box>
            <Typography variant="h3" component="div" gutterBottom>
              {metrics.activeProjects}
            </Typography>
            <LinearProgress
              variant="determinate"
              value={70}
              sx={{ height: 8, borderRadius: 4 }}
            />
          </Paper>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Avatar sx={{ bgcolor: 'warning.main', mr: 2 }}>
                <AttachMoneyIcon />
              </Avatar>
              <Typography variant="h6">Total Revenue</Typography>
            </Box>
            <Typography variant="h3" component="div" gutterBottom>
              {formatCurrency(metrics.totalRevenue)}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <TrendingUpIcon color="success" fontSize="small" />
              <Typography variant="caption" color="success.main">
                +12% from last month
              </Typography>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Avatar sx={{ bgcolor: 'info.main', mr: 2 }}>
                <StarIcon />
              </Avatar>
              <Typography variant="h6">Satisfaction</Typography>
            </Box>
            <Typography variant="h3" component="div" gutterBottom>
              {metrics.averageSatisfactionScore.toFixed(1)}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              {[1, 2, 3, 4, 5].map((star) => (
                <StarIcon
                  key={star}
                  sx={{
                    color: star <= metrics.averageSatisfactionScore
                      ? 'warning.main'
                      : 'action.disabled',
                  }}
                />
              ))}
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Recent Activity and Tasks */}
      <Grid container spacing={3} sx={{ mt: 1 }}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Recent Activity
              </Typography>
              <List>
                {metrics.recentActivity.map((activity, index) => (
                  <React.Fragment key={activity.date + activity.description}>
                    <ListItem>
                      <ListItemIcon>
                        {activity.type === 'residential' ? (
                          <HomeIcon color="primary" />
                        ) : (
                          <BusinessIcon color="primary" />
                        )}
                      </ListItemIcon>
                      <ListItemText
                        primary={activity.description}
                        secondary={
                          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Typography variant="caption">
                              {activity.customerName}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {formatDate(activity.date)}
                            </Typography>
                          </Box>
                        }
                      />
                    </ListItem>
                    {index < metrics.recentActivity.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Upcoming Tasks
              </Typography>
              <List>
                {metrics.upcomingTasks.map((task, index) => (
                  <React.Fragment key={task.id}>
                    <ListItem>
                      <ListItemIcon>
                        <AssignmentIcon color="primary" />
                      </ListItemIcon>
                      <ListItemText
                        primary={task.description}
                        secondary={
                          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Typography variant="caption">
                              {task.customerName}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              Due: {formatDate(task.date)}
                            </Typography>
                          </Box>
                        }
                      />
                    </ListItem>
                    {index < metrics.upcomingTasks.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
} 