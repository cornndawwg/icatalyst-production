import React, { useState, useMemo } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Tab,
  Tabs,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Tooltip,
  Paper,
  Divider,
} from '@mui/material';
import {
  Close as CloseIcon,
  TrendingUp as TrendingUpIcon,
  AttachMoney as MoneyIcon,
  People as PeopleIcon,
  Star as StarIcon,
  Business as BusinessIcon,
  Home as HomeIcon,
  Security as SecurityIcon,
  Lightbulb as LightbulbIcon,
  Download as DownloadIcon,
  LocationOn as LocationIcon,
  Share as ReferralIcon,
  CalendarToday as CalendarIcon,
} from '@mui/icons-material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend,
  Area,
  AreaChart,
} from 'recharts';

interface RevenueAnalyticsProps {
  open: boolean;
  onClose: () => void;
  clientData: any[];
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`analytics-tabpanel-${index}`}
      aria-labelledby={`analytics-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const COLORS = ['#1976d2', '#388e3c', '#f57c00', '#d32f2f', '#7b1fa2', '#0288d1', '#689f38', '#fbc02d'];

export default function RevenueAnalytics({ open, onClose, clientData }: RevenueAnalyticsProps) {
  const [tabValue, setTabValue] = useState(0);

  // Process client data for analytics
  const analytics = useMemo(() => {
    if (!clientData.length) return null;

    // Parse revenue values
    const parseRevenue = (value: string) => parseFloat(value.replace(/[$,]/g, ''));

    // Total revenue calculations
    const totalRevenue = clientData.reduce((sum, client) => sum + parseRevenue(client.lifetimeValue), 0);
    const totalReferralRevenue = clientData.reduce((sum, client) => sum + parseRevenue(client.referralRevenue), 0);
    const averageProjectValue = totalRevenue / clientData.length;

    // Revenue by source
    const revenueBySource = clientData.reduce((acc, client) => {
      const source = client.referralSource.split(' - ')[0];
      if (!acc[source]) acc[source] = 0;
      acc[source] += parseRevenue(client.lifetimeValue);
      return acc;
    }, {} as Record<string, number>);

    const sourceData = Object.entries(revenueBySource).map(([source, revenue]) => ({
      source,
      revenue: revenue as number,
      percentage: ((revenue as number / totalRevenue) * 100).toFixed(1),
    }));

    // Top clients by value
    const topClients = [...clientData]
      .sort((a: any, b: any) => parseRevenue(b.lifetimeValue) - parseRevenue(a.lifetimeValue))
      .slice(0, 5)
      .map(client => ({
        name: `${client.firstName} ${client.lastName}`,
        company: client.company,
        value: parseRevenue(client.lifetimeValue),
        referrals: client.referralsGenerated,
        type: client.customerType,
      }));

    // Monthly revenue trend (simulated based on project completion dates)
    const monthlyData = clientData.reduce((acc, client) => {
      const date = new Date(client.projectCompletionDate);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      if (!acc[monthKey]) {
        acc[monthKey] = { month: monthKey, revenue: 0, projects: 0 };
      }
      acc[monthKey].revenue += parseRevenue(client.lifetimeValue);
      acc[monthKey].projects += 1;
      return acc;
    }, {} as Record<string, { month: string; revenue: number; projects: number }>);

    const trendData = Object.values(monthlyData).sort((a: any, b: any) => a.month.localeCompare(b.month));

    // Referral performance
    const referralPerformers = clientData
      .filter(client => client.referralsGenerated > 0)
      .sort((a, b) => b.referralsGenerated - a.referralsGenerated)
      .map(client => ({
        name: `${client.firstName} ${client.lastName}`,
        referrals: client.referralsGenerated,
        referralRevenue: parseRevenue(client.referralRevenue),
        satisfactionScore: client.satisfactionScore,
      }));

    // Geographic revenue (by area - simplified)
    const geoRevenue = clientData.reduce((acc, client) => {
      const city = client.address.split(',')[1]?.trim() || 'Unknown';
      if (!acc[city]) acc[city] = { city, revenue: 0, clients: 0 };
      acc[city].revenue += parseRevenue(client.lifetimeValue);
      acc[city].clients += 1;
      return acc;
    }, {} as Record<string, { city: string; revenue: number; clients: number }>);

    const geoData = Object.values(geoRevenue).sort((a: any, b: any) => b.revenue - a.revenue);

    // System type analysis (based on brands)
    const systemTypes = clientData.reduce((acc, client) => {
      client.systemBrands.forEach((brand: string) => {
        let category = 'Other';
        if (['Control4', 'Crestron', 'Savant'].includes(brand)) category = 'Full Home Automation';
        else if (['Ring', 'ADT', 'Honeywell'].includes(brand)) category = 'Security Systems';
        else if (['Lutron', 'Philips Hue'].includes(brand)) category = 'Lighting Control';
        else if (['Ecobee', 'Nest'].includes(brand)) category = 'Climate Control';
        else if (['Sonos', 'Russound'].includes(brand)) category = 'Audio Systems';

        if (!acc[category]) acc[category] = { category, revenue: 0, projects: 0 };
        acc[category].revenue += parseRevenue(client.lifetimeValue) / client.systemBrands.length; // Split revenue across brands
        acc[category].projects += 1 / client.systemBrands.length;
      });
      return acc;
    }, {} as Record<string, { category: string; revenue: number; projects: number }>);

    const systemTypeData = Object.values(systemTypes);

    // Business metrics
    const businessMetrics = {
      totalClients: clientData.length,
      averageClv: averageProjectValue,
      referralRate: (referralPerformers.length / clientData.length) * 100,
      averageSatisfaction: clientData.reduce((sum, c) => sum + c.satisfactionScore, 0) / clientData.length,
      commercialVsResidential: {
        commercial: clientData.filter(c => c.customerType === 'Business').length,
        residential: clientData.filter(c => c.customerType === 'Individual').length,
      },
      maintenanceRevenue: clientData.reduce((sum, client) => {
        // Estimate maintenance revenue based on service level
        const base = parseRevenue(client.lifetimeValue);
        if (client.serviceLevel === 'Premium Maintenance') return sum + (base * 0.15);
        if (client.serviceLevel === 'Commercial Maintenance') return sum + (base * 0.12);
        return sum + (base * 0.08);
      }, 0),
    };

    return {
      totalRevenue,
      totalReferralRevenue,
      averageProjectValue,
      sourceData,
      topClients,
      trendData,
      referralPerformers,
      geoData,
      systemTypeData,
      businessMetrics,
    };
  }, [clientData]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const formatCurrency = (value: number) => `$${value.toLocaleString()}`;

  if (!analytics) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xl" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <TrendingUpIcon sx={{ mr: 2, color: 'primary.main' }} />
            <Typography variant="h5" component="div">
              Revenue Analytics Dashboard
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Tooltip title="Export Report">
              <IconButton onClick={() => {}}>
                <DownloadIcon />
              </IconButton>
            </Tooltip>
            <IconButton onClick={onClose}>
              <CloseIcon />
            </IconButton>
          </Box>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ p: 0 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange} variant="scrollable" scrollButtons="auto">
            <Tab label="Overview" />
            <Tab label="Revenue Sources" />
            <Tab label="Client Analytics" />
            <Tab label="Growth Trends" />
            <Tab label="Geographic Analysis" />
          </Tabs>
        </Box>

        {/* Overview Tab */}
        <TabPanel value={tabValue} index={0}>
          {/* Key Metrics Cards */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box>
                      <Typography variant="h4" color="primary">
                        {formatCurrency(analytics.totalRevenue)}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Total Revenue
                      </Typography>
                    </Box>
                    <MoneyIcon sx={{ fontSize: 40, color: 'primary.main' }} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box>
                      <Typography variant="h4" color="success.main">
                        {formatCurrency(analytics.averageProjectValue)}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Avg Project Value
                      </Typography>
                    </Box>
                    <HomeIcon sx={{ fontSize: 40, color: 'success.main' }} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box>
                      <Typography variant="h4" color="info.main">
                        {formatCurrency(analytics.totalReferralRevenue)}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Referral Revenue
                      </Typography>
                    </Box>
                    <ReferralIcon sx={{ fontSize: 40, color: 'info.main' }} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box>
                      <Typography variant="h4" color="warning.main">
                        {analytics.businessMetrics.averageSatisfaction.toFixed(1)}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Avg Satisfaction
                      </Typography>
                    </Box>
                    <StarIcon sx={{ fontSize: 40, color: 'warning.main' }} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Revenue by System Type */}
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Revenue by System Type
                  </Typography>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={analytics.systemTypeData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ category, revenue }) => `${category}: ${formatCurrency(revenue)}`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="revenue"
                      >
                        {analytics.systemTypeData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <RechartsTooltip formatter={(value: any) => formatCurrency(value)} />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Top 5 Clients by Revenue
                  </Typography>
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Client</TableCell>
                          <TableCell align="right">Revenue</TableCell>
                          <TableCell align="center">Referrals</TableCell>
                          <TableCell>Type</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {analytics.topClients.map((client, index) => (
                          <TableRow key={index}>
                            <TableCell>
                              <Box>
                                <Typography variant="body2" fontWeight="bold">
                                  {client.name}
                                </Typography>
                                {client.company && (
                                  <Typography variant="caption" color="text.secondary">
                                    {client.company}
                                  </Typography>
                                )}
                              </Box>
                            </TableCell>
                            <TableCell align="right">
                              <Typography variant="body2" fontWeight="bold" color="primary">
                                {formatCurrency(client.value)}
                              </Typography>
                            </TableCell>
                            <TableCell align="center">
                              <Chip label={client.referrals} size="small" color="info" />
                            </TableCell>
                            <TableCell>
                              <Chip 
                                label={client.type} 
                                size="small" 
                                color={client.type === 'Business' ? 'primary' : 'secondary'} 
                              />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Revenue Sources Tab */}
        <TabPanel value={tabValue} index={1}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={8}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Revenue by Acquisition Source
                  </Typography>
                  <ResponsiveContainer width="100%" height={400}>
                    <BarChart data={analytics.sourceData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="source" />
                      <YAxis tickFormatter={(value) => `$${(value / 1000).toFixed(0)}K`} />
                      <RechartsTooltip formatter={(value: any) => formatCurrency(value)} />
                      <Bar dataKey="revenue" fill="#1976d2" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Source Performance
                  </Typography>
                  <Box sx={{ mt: 2 }}>
                    {analytics.sourceData.map((source, index) => (
                      <Box key={index} sx={{ mb: 2 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                          <Typography variant="body2" fontWeight="bold">
                            {source.source}
                          </Typography>
                          <Typography variant="body2" color="primary">
                            {source.percentage}%
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography variant="caption" color="text.secondary">
                            Revenue: {formatCurrency(source.revenue)}
                          </Typography>
                        </Box>
                        <Divider sx={{ mt: 1 }} />
                      </Box>
                    ))}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Client Analytics Tab */}
        <TabPanel value={tabValue} index={2}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Top Referral Generators
                  </Typography>
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Client</TableCell>
                          <TableCell align="center">Referrals</TableCell>
                          <TableCell align="right">Referral Revenue</TableCell>
                          <TableCell align="center">Satisfaction</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {analytics.referralPerformers.slice(0, 5).map((client, index) => (
                          <TableRow key={index}>
                            <TableCell>
                              <Typography variant="body2" fontWeight="bold">
                                {client.name}
                              </Typography>
                            </TableCell>
                            <TableCell align="center">
                              <Chip label={client.referrals} size="small" color="info" />
                            </TableCell>
                            <TableCell align="right">
                              <Typography variant="body2" fontWeight="bold" color="success.main">
                                {formatCurrency(client.referralRevenue)}
                              </Typography>
                            </TableCell>
                            <TableCell align="center">
                              <Chip 
                                label={`${client.satisfactionScore}/10`} 
                                size="small" 
                                color={client.satisfactionScore >= 9 ? 'success' : 'warning'} 
                              />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Business Intelligence Metrics
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
                        <Typography variant="h4" color="primary">
                          {analytics.businessMetrics.referralRate.toFixed(1)}%
                        </Typography>
                        <Typography variant="caption">Referral Rate</Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={6}>
                      <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
                        <Typography variant="h4" color="success.main">
                          {formatCurrency(analytics.businessMetrics.maintenanceRevenue)}
                        </Typography>
                        <Typography variant="caption">Est. Annual Maintenance</Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={6}>
                      <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
                        <Typography variant="h4" color="info.main">
                          {analytics.businessMetrics.commercialVsResidential.commercial}
                        </Typography>
                        <Typography variant="caption">Commercial Clients</Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={6}>
                      <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
                        <Typography variant="h4" color="warning.main">
                          {analytics.businessMetrics.commercialVsResidential.residential}
                        </Typography>
                        <Typography variant="caption">Residential Clients</Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Growth Trends Tab */}
        <TabPanel value={tabValue} index={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Monthly Revenue and Project Trends
              </Typography>
              <ResponsiveContainer width="100%" height={400}>
                <AreaChart data={analytics.trendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis tickFormatter={(value) => `$${(value / 1000).toFixed(0)}K`} />
                  <RechartsTooltip 
                    formatter={(value: any, name: string) => [
                      name === 'revenue' ? formatCurrency(value) : value,
                      name === 'revenue' ? 'Revenue' : 'Projects'
                    ]} 
                  />
                  <Area type="monotone" dataKey="revenue" stackId="1" stroke="#1976d2" fill="#1976d2" />
                  <Legend />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabPanel>

        {/* Geographic Analysis Tab */}
        <TabPanel value={tabValue} index={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Revenue by Geographic Area
              </Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>City/Area</TableCell>
                      <TableCell align="right">Revenue</TableCell>
                      <TableCell align="center">Clients</TableCell>
                      <TableCell align="right">Avg Value</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {analytics.geoData.map((area: any, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <LocationIcon sx={{ mr: 1, fontSize: 16, color: 'text.secondary' }} />
                            {area.city}
                          </Box>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2" fontWeight="bold" color="primary">
                            {formatCurrency(area.revenue)}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Chip label={area.clients} size="small" />
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2">
                            {formatCurrency(area.revenue / area.clients)}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </TabPanel>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Close</Button>
        <Button variant="contained" startIcon={<DownloadIcon />}>
          Export Report
        </Button>
      </DialogActions>
    </Dialog>
  );
} 