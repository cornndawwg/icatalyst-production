import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
  Chip,
  LinearProgress,
  IconButton,
  Tooltip,
  Alert,
  CircularProgress,
  Switch,
  FormControlLabel,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Divider
} from '@mui/material';
import {
  TrendingUp,
  Speed,
  People,
  Psychology,
  AttachMoney,
  Schedule,
  Star,
  Warning,
  CheckCircle,
  Error,
  Refresh,
  Timeline,
  Assessment,
  MonetizationOn,
  Engineering
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import { useMediaQuery } from '@mui/material';

interface ExecutiveSummaryData {
  timeframe: string;
  lastUpdated: string;
  revenueImpact: {
    totalRevenue: number;
    aiAttributedRevenue: number;
    revenueImprovement: number;
    conversionRate: number;
    averageDealSize: number;
    dealSizeImprovement: number;
    totalDeals: number;
    aiGeneratedDeals: number;
    status: 'exceeding_target' | 'on_target' | 'below_target' | 'insufficient_data';
  };
  efficiencyGains: {
    proposalsGenerated: number;
    avgProposalTime: number;
    timeSavingPercentage: number;
    totalTimeSavedHours: number;
    technicianProductivity: number;
    voiceProcessingSpeed: number;
    costSavings: number;
    status: 'exceeding_target' | 'on_target' | 'below_target' | 'insufficient_data';
  };
  customerExperience: {
    customerSatisfaction: number;
    responseRate: number;
    responseRateImprovement: number;
    avgViewDuration: number;
    totalInteractions: number;
    positiveInteractions: number;
    engagementScore: number;
    status: 'exceeding_target' | 'on_target' | 'below_target' | 'insufficient_data';
  };
  aiPerformance: {
    personaAccuracy: number;
    recommendationAccuracy: number;
    voiceProcessingSpeed: number;
    systemUptime: number;
    totalProcessedRequests: number;
    successfulRequests: number;
    errorRate: number;
    status: 'exceeding_target' | 'on_target' | 'below_target' | 'insufficient_data';
  };
  roiCalculation: {
    totalInvestment: number;
    totalBenefits: number;
    netBenefit: number;
    roiPercentage: number;
    paybackPeriodMonths: number | null;
    monthlyRunRate: number;
    projectedAnnualROI: number;
    status: 'exceeding_target' | 'on_target' | 'below_target' | 'insufficient_data';
  };
  status: string;
  alerts: Array<{
    type: 'warning' | 'critical' | 'info';
    category: string;
    message: string;
    recommendation: string;
  }>;
}

const ExecutiveDashboard: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [data, setData] = useState<ExecutiveSummaryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [timeframe, setTimeframe] = useState('last_30_days');
  // @ts-ignore
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  // Fetch executive summary data
  const fetchData = async (selectedTimeframe = timeframe) => {
    try {
      setLoading(true);
      // Import API utility dynamically to avoid SSR issues
      const { apiRequest } = await import('../lib/api');
      const result = await apiRequest(`analytics/executive-summary?timeframe=${selectedTimeframe}`);
      
      if (result.success) {
        setData(result.data);
        setError(null);
      } else {
        const errorMessage = result.error || 'Failed to load data';
        throw new Error(errorMessage);
      }
      // @ts-ignore
      setLastUpdated(new Date());
    } catch (err: any) {
      console.error('Dashboard data fetch error:', err);
      setError(err?.message || 'Unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Initial load and auto-refresh setup
  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(() => {
        fetchData();
      }, 30000); // Refresh every 30 seconds
      return () => clearInterval(interval);
    }
  }, [autoRefresh, timeframe]);

  // Handle timeframe change
  const handleTimeframeChange = (newTimeframe: string) => {
    setTimeframe(newTimeframe);
    fetchData(newTimeframe);
  };

  // Manual refresh
  const handleRefresh = () => {
    fetchData();
  };

  // Status color mapping
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'exceeding_target': return { color: '#4caf50', label: 'Exceeding Target', icon: '🟢' };
      case 'on_target': return { color: '#ff9800', label: 'On Target', icon: '🟡' };
      case 'below_target': return { color: '#f44336', label: 'Below Target', icon: '🔴' };
      default: return { color: '#9e9e9e', label: 'Insufficient Data', icon: '⚪' };
    }
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Format percentage
  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  if (loading && !data) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ ml: 2 }}>Loading Executive Dashboard...</Typography>
      </Box>
    );
  }

  if (error && !data) {
    return (
      <Box p={4}>
        <Alert severity="error" action={
          <IconButton color="inherit" size="small" onClick={handleRefresh}>
            <Refresh />
          </IconButton>
        }>
          Failed to load dashboard data: {error}
        </Alert>
      </Box>
    );
  }

  if (!data) {
    return null;
  }

  return (
    <Box p={isMobile ? 2 : 4}>
      {/* Header Section */}
      <Box mb={4}>
        <Grid container spacing={2} alignItems="center" justifyContent="space-between">
          <Grid item xs={12} md={6}>
            <Typography variant="h4" component="h1" fontWeight="bold" color="primary">
              🚀 AI-CRM Executive Dashboard
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              Real-time ROI tracking • Live system performance • Business impact metrics
            </Typography>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Box display="flex" gap={2} alignItems="center" justifyContent={isMobile ? "flex-start" : "flex-end"} flexWrap="wrap">
              <FormControl size="small" sx={{ minWidth: 140 }}>
                <InputLabel>Timeframe</InputLabel>
                <Select
                  value={timeframe}
                  label="Timeframe"
                  onChange={(e) => handleTimeframeChange(e.target.value)}
                >
                  <MenuItem value="last_7_days">Last 7 Days</MenuItem>
                  <MenuItem value="last_30_days">Last 30 Days</MenuItem>
                  <MenuItem value="last_90_days">Last 90 Days</MenuItem>
                </Select>
              </FormControl>
              
              <FormControlLabel
                control={
                  <Switch
                    checked={autoRefresh}
                    onChange={(e) => setAutoRefresh(e.target.checked)}
                    color="primary"
                  />
                }
                label="Auto Refresh"
              />
              
              <Tooltip title="Refresh Now">
                <IconButton onClick={handleRefresh} color="primary">
                  <Refresh />
                </IconButton>
              </Tooltip>
            </Box>
          </Grid>
        </Grid>
        
        {/* Last Updated */}
        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
          {/* @ts-ignore */}
          Last updated: {lastUpdated.toLocaleString()} • Status: {data.status}
        </Typography>
      </Box>

      {/* Alerts Section */}
      {data.alerts && data.alerts.length > 0 && (
        <Box mb={4}>
          {data.alerts.map((alert: ExecutiveSummaryData['alerts'][0], index: number) => (
            <Alert 
              key={index} 
              severity={alert.type === 'critical' ? 'error' : alert.type === 'warning' ? 'warning' : 'info'}
              sx={{ mb: 1 }}
            >
              <Typography variant="body2" fontWeight="bold">{alert.message}</Typography>
              <Typography variant="caption">{alert.recommendation}</Typography>
            </Alert>
          ))}
        </Box>
      )}

      {/* ROI Summary Banner */}
      <Card sx={{ mb: 4, background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`, color: 'white' }}>
        <CardContent>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={3}>
              <Box textAlign="center">
                <MonetizationOn sx={{ fontSize: 48, mb: 1 }} />
                <Typography variant="h3" fontWeight="bold">
                  {formatPercentage(data.roiCalculation.roiPercentage)}
                </Typography>
                <Typography variant="h6">Current ROI</Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={9}>
              <Grid container spacing={2}>
                <Grid item xs={6} md={3}>
                  <Typography variant="h5" fontWeight="bold">{formatCurrency(data.roiCalculation.netBenefit)}</Typography>
                  <Typography variant="body2">Net Benefit</Typography>
                </Grid>
                <Grid item xs={6} md={3}>
                  <Typography variant="h5" fontWeight="bold">{data.roiCalculation.paybackPeriodMonths?.toFixed(1)} months</Typography>
                  <Typography variant="body2">Payback Period</Typography>
                </Grid>
                <Grid item xs={6} md={3}>
                  <Typography variant="h5" fontWeight="bold">{formatCurrency(data.roiCalculation.monthlyRunRate)}</Typography>
                  <Typography variant="body2">Monthly Run Rate</Typography>
                </Grid>
                <Grid item xs={6} md={3}>
                  <Typography variant="h5" fontWeight="bold">{formatPercentage(data.roiCalculation.projectedAnnualROI)}</Typography>
                  <Typography variant="body2">Projected Annual ROI</Typography>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* 4-Quadrant KPI Overview */}
      <Grid container spacing={3}>
        {/* Revenue Impact Quadrant */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                <Box display="flex" alignItems="center">
                  <TrendingUp sx={{ fontSize: 32, color: theme.palette.success.main, mr: 1 }} />
                  <Typography variant="h6" fontWeight="bold">Revenue Impact</Typography>
                </Box>
                <Chip 
                  label={`${getStatusColor(data.revenueImpact.status).icon} ${getStatusColor(data.revenueImpact.status).label}`}
                  color={data.revenueImpact.status === 'exceeding_target' ? 'success' : 
                         data.revenueImpact.status === 'on_target' ? 'warning' : 'error'}
                />
              </Box>
              
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Box mb={2}>
                    <Typography variant="h4" fontWeight="bold" color="success.main">
                      {formatCurrency(data.revenueImpact.totalRevenue)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total Revenue ({formatCurrency(data.revenueImpact.aiAttributedRevenue)} AI-attributed)
                    </Typography>
                  </Box>
                </Grid>
                
                <Grid item xs={6}>
                  <Typography variant="h6" fontWeight="bold">{formatPercentage(data.revenueImpact.revenueImprovement)}</Typography>
                  <Typography variant="body2" color="text.secondary">Revenue Growth</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="h6" fontWeight="bold">{formatPercentage(data.revenueImpact.conversionRate)}</Typography>
                  <Typography variant="body2" color="text.secondary">Conversion Rate</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="h6" fontWeight="bold">{formatCurrency(data.revenueImpact.averageDealSize)}</Typography>
                  <Typography variant="body2" color="text.secondary">Avg Deal Size</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="h6" fontWeight="bold">{data.revenueImpact.totalDeals}</Typography>
                  <Typography variant="body2" color="text.secondary">Total Deals</Typography>
                </Grid>
              </Grid>
              
              <Box mt={2}>
                <Typography variant="body2" gutterBottom>AI Deal Generation Rate</Typography>
                <LinearProgress 
                  variant="determinate" 
                  value={(data.revenueImpact.aiGeneratedDeals / data.revenueImpact.totalDeals) * 100}
                  sx={{ height: 8, borderRadius: 4 }}
                />
                <Typography variant="caption" color="text.secondary">
                  {data.revenueImpact.aiGeneratedDeals}/{data.revenueImpact.totalDeals} deals AI-generated
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Efficiency Gains Quadrant */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                <Box display="flex" alignItems="center">
                  <Speed sx={{ fontSize: 32, color: theme.palette.info.main, mr: 1 }} />
                  <Typography variant="h6" fontWeight="bold">Efficiency Gains</Typography>
                </Box>
                <Chip 
                  label={`${getStatusColor(data.efficiencyGains.status).icon} ${getStatusColor(data.efficiencyGains.status).label}`}
                  color={data.efficiencyGains.status === 'exceeding_target' ? 'success' : 
                         data.efficiencyGains.status === 'on_target' ? 'warning' : 'error'}
                />
              </Box>
              
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Box mb={2}>
                    <Typography variant="h4" fontWeight="bold" color="info.main">
                      {formatPercentage(data.efficiencyGains.timeSavingPercentage)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Time Savings ({data.efficiencyGains.totalTimeSavedHours.toFixed(1)} hours saved)
                    </Typography>
                  </Box>
                </Grid>
                
                <Grid item xs={6}>
                  <Typography variant="h6" fontWeight="bold">{data.efficiencyGains.proposalsGenerated}</Typography>
                  <Typography variant="body2" color="text.secondary">Proposals Generated</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="h6" fontWeight="bold">{Math.round(data.efficiencyGains.avgProposalTime/60)}m</Typography>
                  <Typography variant="body2" color="text.secondary">Avg Proposal Time</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="h6" fontWeight="bold">{data.efficiencyGains.technicianProductivity.toFixed(1)}x</Typography>
                  <Typography variant="body2" color="text.secondary">Productivity Gain</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="h6" fontWeight="bold">{formatCurrency(data.efficiencyGains.costSavings)}</Typography>
                  <Typography variant="body2" color="text.secondary">Cost Savings</Typography>
                </Grid>
              </Grid>
              
              <Box mt={2}>
                <Typography variant="body2" gutterBottom>Processing Speed</Typography>
                <LinearProgress 
                  variant="determinate" 
                  value={Math.min(100, (data.efficiencyGains.voiceProcessingSpeed / 10) * 100)}
                  color="info"
                  sx={{ height: 8, borderRadius: 4 }}
                />
                <Typography variant="caption" color="text.secondary">
                  {data.efficiencyGains.voiceProcessingSpeed.toFixed(1)}s average voice processing
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Customer Experience Quadrant */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                <Box display="flex" alignItems="center">
                  <People sx={{ fontSize: 32, color: theme.palette.warning.main, mr: 1 }} />
                  <Typography variant="h6" fontWeight="bold">Customer Experience</Typography>
                </Box>
                <Chip 
                  label={`${getStatusColor(data.customerExperience.status).icon} ${getStatusColor(data.customerExperience.status).label}`}
                  color={data.customerExperience.status === 'exceeding_target' ? 'success' : 
                         data.customerExperience.status === 'on_target' ? 'warning' : 'error'}
                />
              </Box>
              
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Box mb={2}>
                    <Typography variant="h4" fontWeight="bold" color="warning.main">
                      {data.customerExperience.customerSatisfaction.toFixed(1)}/10
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Customer Satisfaction (Engagement: {data.customerExperience.engagementScore.toFixed(1)})
                    </Typography>
                  </Box>
                </Grid>
                
                <Grid item xs={6}>
                  <Typography variant="h6" fontWeight="bold">{formatPercentage(data.customerExperience.responseRate)}</Typography>
                  <Typography variant="body2" color="text.secondary">Response Rate</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="h6" fontWeight="bold">{data.customerExperience.avgViewDuration.toFixed(1)}m</Typography>
                  <Typography variant="body2" color="text.secondary">Avg View Duration</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="h6" fontWeight="bold">{data.customerExperience.totalInteractions}</Typography>
                  <Typography variant="body2" color="text.secondary">Total Interactions</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="h6" fontWeight="bold">{formatPercentage(data.customerExperience.responseRateImprovement)}</Typography>
                  <Typography variant="body2" color="text.secondary">Rate Improvement</Typography>
                </Grid>
              </Grid>
              
              <Box mt={2}>
                <Typography variant="body2" gutterBottom>Positive Interaction Rate</Typography>
                <LinearProgress 
                  variant="determinate" 
                  value={(data.customerExperience.positiveInteractions / data.customerExperience.totalInteractions) * 100}
                  color="warning"
                  sx={{ height: 8, borderRadius: 4 }}
                />
                <Typography variant="caption" color="text.secondary">
                  {data.customerExperience.positiveInteractions}/{data.customerExperience.totalInteractions} positive interactions
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* AI Performance Quadrant */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                <Box display="flex" alignItems="center">
                  <Psychology sx={{ fontSize: 32, color: theme.palette.secondary.main, mr: 1 }} />
                  <Typography variant="h6" fontWeight="bold">AI Performance</Typography>
                </Box>
                <Chip 
                  label={`${getStatusColor(data.aiPerformance.status).icon} ${getStatusColor(data.aiPerformance.status).label}`}
                  color={data.aiPerformance.status === 'exceeding_target' ? 'success' : 
                         data.aiPerformance.status === 'on_target' ? 'warning' : 'error'}
                />
              </Box>
              
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Box mb={2}>
                    <Typography variant="h4" fontWeight="bold" color="secondary.main">
                      {formatPercentage(data.aiPerformance.personaAccuracy)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Persona Detection Accuracy (Uptime: {formatPercentage(data.aiPerformance.systemUptime)})
                    </Typography>
                  </Box>
                </Grid>
                
                <Grid item xs={6}>
                  <Typography variant="h6" fontWeight="bold">{formatPercentage(data.aiPerformance.recommendationAccuracy)}</Typography>
                  <Typography variant="body2" color="text.secondary">Recommendation Accuracy</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="h6" fontWeight="bold">{data.aiPerformance.voiceProcessingSpeed.toFixed(1)}s</Typography>
                  <Typography variant="body2" color="text.secondary">Processing Speed</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="h6" fontWeight="bold">{data.aiPerformance.totalProcessedRequests}</Typography>
                  <Typography variant="body2" color="text.secondary">Total Requests</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="h6" fontWeight="bold">{formatPercentage(data.aiPerformance.errorRate)}</Typography>
                  <Typography variant="body2" color="text.secondary">Error Rate</Typography>
                </Grid>
              </Grid>
              
              <Box mt={2}>
                <Typography variant="body2" gutterBottom>Success Rate</Typography>
                <LinearProgress 
                  variant="determinate" 
                  value={(data.aiPerformance.successfulRequests / data.aiPerformance.totalProcessedRequests) * 100}
                  color="secondary"
                  sx={{ height: 8, borderRadius: 4 }}
                />
                <Typography variant="caption" color="text.secondary">
                  {data.aiPerformance.successfulRequests}/{data.aiPerformance.totalProcessedRequests} successful requests
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Developer Tools Section */}
      <Box mt={6}>
        <Divider sx={{ mb: 3 }} />
        <Typography variant="h5" fontWeight="bold" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
          <Engineering sx={{ mr: 1, color: theme.palette.primary.main }} />
          Developer Tools & Testing Interfaces
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Advanced testing and debugging tools for system administrators and developers
        </Typography>
        
        <Grid container spacing={3}>
          {/* AI Testing Tools */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                  <Psychology sx={{ mr: 1, color: theme.palette.secondary.main }} />
                  AI Testing Suite
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Box 
                      component="a" 
                      href="/ai-test" 
                      sx={{ 
                        display: 'block', 
                        p: 2, 
                        border: '1px solid', 
                        borderColor: 'divider', 
                        borderRadius: 1, 
                        textDecoration: 'none',
                        '&:hover': { bgcolor: 'action.hover' }
                      }}
                    >
                      <Typography variant="subtitle2" fontWeight="bold">AI Summary Testing</Typography>
                      <Typography variant="body2" color="text.secondary">
                        Persona-targeted AI summary generation and validation
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12}>
                    <Box 
                      component="a" 
                      href="/persona-testing" 
                      sx={{ 
                        display: 'block', 
                        p: 2, 
                        border: '1px solid', 
                        borderColor: 'divider', 
                        borderRadius: 1, 
                        textDecoration: 'none',
                        '&:hover': { bgcolor: 'action.hover' }
                      }}
                    >
                      <Typography variant="subtitle2" fontWeight="bold">Persona Detection Testing</Typography>
                      <Typography variant="body2" color="text.secondary">
                        AI-enhanced persona detection validation and testing
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12}>
                    <Box 
                      component="a" 
                      href="/voice-ai" 
                      sx={{ 
                        display: 'block', 
                        p: 2, 
                        border: '1px solid', 
                        borderColor: 'divider', 
                        borderRadius: 1, 
                        textDecoration: 'none',
                        '&:hover': { bgcolor: 'action.hover' }
                      }}
                    >
                      <Typography variant="subtitle2" fontWeight="bold">Voice AI Proposals</Typography>
                      <Typography variant="body2" color="text.secondary">
                        Voice-to-proposal AI system (30-second demos)
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* System Testing Tools */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                  <Assessment sx={{ mr: 1, color: theme.palette.info.main }} />
                  System Testing & Debug
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Box 
                      component="a" 
                      href="/product-recommendation-testing" 
                      sx={{ 
                        display: 'block', 
                        p: 2, 
                        border: '1px solid', 
                        borderColor: 'divider', 
                        borderRadius: 1, 
                        textDecoration: 'none',
                        '&:hover': { bgcolor: 'action.hover' }
                      }}
                    >
                      <Typography variant="subtitle2" fontWeight="bold">Product Recommendations</Typography>
                      <Typography variant="body2" color="text.secondary">
                        Intelligent product bundling with AI-powered recommendations
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12}>
                    <Box 
                      component="a" 
                      href="/debug" 
                      sx={{ 
                        display: 'block', 
                        p: 2, 
                        border: '1px solid', 
                        borderColor: 'divider', 
                        borderRadius: 1, 
                        textDecoration: 'none',
                        '&:hover': { bgcolor: 'action.hover' }
                      }}
                    >
                      <Typography variant="subtitle2" fontWeight="bold">Debug Console</Typography>
                      <Typography variant="body2" color="text.secondary">
                        API connectivity debug tools and system diagnostics
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12}>
                    <Box 
                      component="a" 
                      href="/api-test" 
                      sx={{ 
                        display: 'block', 
                        p: 2, 
                        border: '1px solid', 
                        borderColor: 'divider', 
                        borderRadius: 1, 
                        textDecoration: 'none',
                        '&:hover': { bgcolor: 'action.hover' }
                      }}
                    >
                      <Typography variant="subtitle2" fontWeight="bold">API Testing</Typography>
                      <Typography variant="body2" color="text.secondary">
                        Comprehensive API endpoint testing and validation
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
      
      {/* Footer */}
      <Box mt={4} pt={2} borderTop={1} borderColor="divider">
        <Typography variant="caption" color="text.secondary" align="center" display="block">
          AI-powered Smart Home CRM • Real-time analytics • Executive dashboard powered by revolutionary voice-to-proposal technology
        </Typography>
      </Box>
    </Box>
  );
};

export default ExecutiveDashboard; 