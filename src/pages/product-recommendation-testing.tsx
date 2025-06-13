/**
 * Product Recommendation Testing Interface
 * 
 * Comprehensive testing interface for Phase 1B: Intelligent Product Bundling
 * Features AI-powered recommendations, persona-based pricing, and bundle optimization.
 */

import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Tab,
  Tabs,
  Grid,
  Card,
  CardContent,
  Button,
  TextField,
  MenuItem,
  Chip,
  Alert,
  AlertTitle,
  Divider,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Collapse,
  FormControl,
  InputLabel,
  Select,
  InputAdornment,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Switch,
  FormControlLabel
} from '@mui/material';
import {
  Psychology as BrainIcon,
  ShoppingCart as CartIcon,
  TrendingUp as TrendingIcon,
  Assessment as AnalyticsIcon,
  ExpandMore as ExpandMoreIcon,
  PlayArrow as RunIcon,
  Speed as SpeedIcon,
  AttachMoney as MoneyIcon,
  Home as HomeIcon,
  Business as BusinessIcon,
  Settings as SettingsIcon,
  CheckCircle as CheckIcon,
  Error as ErrorIcon,
  Lightbulb as BulbIcon,
  Security as SecurityIcon,
  Wifi as NetworkIcon,
  Speaker as AudioIcon,
  Thermostat as ClimateIcon
} from '@mui/icons-material';
import AppLayout from '../components/Layout/AppLayout';

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
      id={`product-rec-tabpanel-${index}`}
      aria-labelledby={`product-rec-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const ProductRecommendationTesting: React.FC = () => {
  const [currentTab, setCurrentTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [serviceHealth, setServiceHealth] = useState<any>(null);
  
  // Single Test State
  const [singleTestInput, setSingleTestInput] = useState({
    persona: 'homeowner',
    budget: 15000,
    projectSize: 2000,
    preferredTier: 'better',
    voiceTranscript: '',
    description: '',
    additionalRequirements: []
  });
  const [singleTestResult, setSingleTestResult] = useState<any>(null);

  // Bundle Analysis State
  const [selectedPersona, setSelectedPersona] = useState('homeowner');
  const [bundleAnalysis, setBundleAnalysis] = useState<any>(null);

  // Bulk Testing State
  const [bulkTestResults, setBulkTestResults] = useState<any>(null);

  // Personas and Preferences State
  const [personaData, setPersonaData] = useState<any>(null);

  // Performance Metrics State
  const [performanceMetrics, setPerformanceMetrics] = useState<any>(null);

  const personas = [
    { value: 'homeowner', label: 'Homeowner', icon: <HomeIcon />, type: 'residential' },
    { value: 'interior-designer', label: 'Interior Designer', icon: <BulbIcon />, type: 'residential' },
    { value: 'builder', label: 'Builder', icon: <SettingsIcon />, type: 'residential' },
    { value: 'architect', label: 'Architect', icon: <SettingsIcon />, type: 'residential' },
    { value: 'cto-cio', label: 'CTO/CIO', icon: <BusinessIcon />, type: 'commercial' },
    { value: 'business-owner', label: 'Business Owner', icon: <BusinessIcon />, type: 'commercial' },
    { value: 'c-suite', label: 'C-Suite Executive', icon: <BusinessIcon />, type: 'commercial' },
    { value: 'office-manager', label: 'Office Manager', icon: <BusinessIcon />, type: 'commercial' },
    { value: 'facilities-manager', label: 'Facilities Manager', icon: <BusinessIcon />, type: 'commercial' }
  ];

  const tiers = [
    { value: 'good', label: 'Good', color: '#4caf50' },
    { value: 'better', label: 'Better', color: '#2196f3' },
    { value: 'best', label: 'Best', color: '#9c27b0' }
  ];

  const sampleVoiceTranscripts = {
    homeowner: "Hi, this is for the Johnson residence at 123 Oak Street. We're looking to upgrade our home security and add some smart lighting. The house is about 2,500 square feet, and we have kids, so we want something user-friendly and reliable. Our budget is around $15,000 to $20,000.",
    'interior-designer': "This project is for a high-end residential renovation in the Hills. My client wants a sophisticated smart home system that's completely integrated with the aesthetic design. We need premium finishes, hidden technology, and customizable lighting scenes. Budget is $50,000 to $75,000.",
    builder: "We're building a subdivision of 20 homes and need standardized smart home packages for each unit. Looking for cost-effective solutions that are easy to install and maintain. Each house is about 1,800 square feet. Budget per unit is $5,000 to $8,000.",
    'cto-cio': "Enterprise office building project, 50,000 square feet. Need scalable infrastructure with enterprise-grade security, comprehensive networking, and integration capabilities. This is for our corporate headquarters. Budget approved for $150,000 to $250,000.",
    'business-owner': "Small business office renovation, about 5,000 square feet. Want to improve security, add conference room AV, and enhance the customer experience. Looking for ROI-focused solutions. Budget is $15,000 to $25,000."
  };

  useEffect(() => {
    checkServiceHealth();
    loadPersonaData();
  }, []);

  const checkServiceHealth = async () => {
    try {
      const response = await fetch('/api/product-recommendations/health');
      const data = await response.json();
      setServiceHealth(data.data);
    } catch (error) {
      console.error('Health check failed:', error);
    }
  };

  const loadPersonaData = async () => {
    try {
      const response = await fetch('/api/product-recommendations/personas');
      const data = await response.json();
      setPersonaData(data.data);
    } catch (error) {
      console.error('Failed to load persona data:', error);
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
  };

  const runSingleTest = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/product-recommendations/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(singleTestInput)
      });
      const data = await response.json();
      setSingleTestResult(data);
    } catch (error) {
      console.error('Single test failed:', error);
      setSingleTestResult({ 
        success: false, 
        error: 'Test failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setLoading(false);
    }
  };

  const runBundleAnalysis = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        budget: singleTestInput.budget.toString(),
        tier: singleTestInput.preferredTier,
        projectSize: singleTestInput.projectSize.toString()
      });
      
      const response = await fetch(`/api/product-recommendations/bundles/${selectedPersona}?${params}`);
      const data = await response.json();
      setBundleAnalysis(data);
    } catch (error) {
      console.error('Bundle analysis failed:', error);
      setBundleAnalysis({ 
        success: false, 
        error: 'Bundle analysis failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setLoading(false);
    }
  };

  const runBulkTests = async () => {
    setLoading(true);
    try {
      // First get default test cases
      const defaultResponse = await fetch('/api/product-recommendations/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ testCases: [] })
      });
      const defaultData = await defaultResponse.json();
      
      if (defaultData.data.availableTestCases) {
        // Run the actual tests
        const testResponse = await fetch('/api/product-recommendations/test', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ testCases: defaultData.data.availableTestCases })
        });
        const testData = await testResponse.json();
        setBulkTestResults(testData);
        
        // Generate performance metrics
        generatePerformanceMetrics(testData.data);
      }
    } catch (error) {
      console.error('Bulk tests failed:', error);
      setBulkTestResults({ 
        success: false, 
        error: 'Bulk testing failed',
        details: error instanceof Error ? error.message : 'Unknown error' 
      });
    } finally {
      setLoading(false);
    }
  };

  const generatePerformanceMetrics = (testData: any) => {
    const results = testData.results || [];
    const summary = testData.summary || {};
    
    const performanceData = {
      summary,
      categoryAnalysis: analyzeCategoryPerformance(results),
      personaAccuracy: analyzePersonaAccuracy(results),
      pricingAccuracy: analyzePricingAccuracy(results),
      recommendations: generateOptimizationRecommendations(results)
    };
    
    setPerformanceMetrics(performanceData);
  };

  const analyzeCategoryPerformance = (results: any[]) => {
    const categoryStats: { [key: string]: { count: number; avgItems: number } } = {};
    results.forEach(result => {
      if (result.result?.categories) {
        result.result.categories.forEach((category: string) => {
          if (!categoryStats[category]) {
            categoryStats[category] = { count: 0, avgItems: 0 };
          }
          categoryStats[category].count++;
        });
      }
    });
    return categoryStats;
  };

  const analyzePersonaAccuracy = (results: any[]) => {
    const personaStats: { [key: string]: { tests: number; passed: number } } = {};
    results.forEach(result => {
      const persona = result.name.includes('Homeowner') ? 'homeowner' :
                     result.name.includes('Interior') ? 'interior-designer' :
                     result.name.includes('Builder') ? 'builder' :
                     result.name.includes('C-Suite') ? 'c-suite' : 'unknown';
      
      if (!personaStats[persona]) {
        personaStats[persona] = { tests: 0, passed: 0 };
      }
      personaStats[persona].tests++;
      if (result.passed) personaStats[persona].passed++;
    });
    return personaStats;
  };

  const analyzePricingAccuracy = (results: any[]) => {
    return results.map(result => ({
      name: result.name,
      budgetCompliance: result.validation?.checks?.find((c: any) => c.check === 'maximum_total')?.passed || false,
      itemCountCompliance: result.validation?.checks?.find((c: any) => c.check === 'minimum_items')?.passed || false
    }));
  };

  const generateOptimizationRecommendations = (results: any[]) => {
    const recommendations: { type: string; title: string; description: string }[] = [];
    const failedTests = results.filter(r => !r.passed);
    
    if (failedTests.length > 0) {
      recommendations.push({
        type: 'error',
        title: 'Failed Tests Detected',
        description: `${failedTests.length} tests failed. Review test cases and validation logic.`
      });
    }
    
    const budgetIssues = results.filter(r => 
      r.validation?.checks?.some((c: any) => c.check === 'maximum_total' && !c.passed)
    );
    
    if (budgetIssues.length > 0) {
      recommendations.push({
        type: 'warning',
        title: 'Budget Optimization Needed',
        description: `${budgetIssues.length} tests exceeded budget limits. Consider price optimization.`
      });
    }
    
    if (results.every(r => r.passed)) {
      recommendations.push({
        type: 'success',
        title: 'Perfect Test Performance',
        description: 'All tests passed! The recommendation system is performing optimally.'
      });
    }
    
    return recommendations;
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'lighting': return <BulbIcon />;
      case 'security': return <SecurityIcon />;
      case 'networking': return <NetworkIcon />;
      case 'audio-video': return <AudioIcon />;
      case 'climate': return <ClimateIcon />;
      default: return <SettingsIcon />;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <AppLayout title="Product Recommendation Testing">
      <Container maxWidth="xl">
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            🛍️ Product Recommendation Testing
          </Typography>
          <Typography variant="subtitle1" color="text.secondary" gutterBottom>
            Phase 1B: Intelligent Product Bundling - AI-powered recommendations with persona-based optimization
          </Typography>
          
          {/* Service Health Status */}
          {serviceHealth && (
            <Card sx={{ mb: 3, bgcolor: serviceHealth.status === 'healthy' ? 'success.main' : 'error.main', color: 'white' }}>
              <CardContent>
                <Grid container alignItems="center" spacing={2}>
                  <Grid item>
                    {serviceHealth.status === 'healthy' ? <CheckIcon /> : <ErrorIcon />}
                  </Grid>
                  <Grid item xs>
                    <Typography variant="h6">
                      Service Status: {serviceHealth.status}
                    </Typography>
                    <Typography variant="body2">
                      AI Recommendations: {serviceHealth.capabilities.aiRecommendations ? 'Available' : 'Fallback Mode'} | 
                      Personas: {serviceHealth.configuration.totalPersonas} | 
                      Bundle Strategies: {serviceHealth.configuration.bundleStrategies}
                    </Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          )}
        </Box>

        {/* Tabs */}
        <Paper sx={{ mb: 3 }}>
          <Tabs value={currentTab} onChange={handleTabChange} variant="scrollable" scrollButtons="auto">
            <Tab icon={<CartIcon />} label="Single Test" />
            <Tab icon={<AnalyticsIcon />} label="Bundle Analysis" />
            <Tab icon={<SpeedIcon />} label="Bulk Testing" />
            <Tab icon={<BrainIcon />} label="Persona Analysis" />
            <Tab icon={<TrendingIcon />} label="Performance Metrics" />
          </Tabs>
        </Paper>

        {/* Tab 1: Single Test */}
        <TabPanel value={currentTab} index={0}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  🧪 Single Recommendation Test
                </Typography>
                
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth margin="normal">
                      <InputLabel>Persona</InputLabel>
                      <Select
                        value={singleTestInput.persona}
                        onChange={(e) => setSingleTestInput({...singleTestInput, persona: e.target.value})}
                      >
                        {personas.map(persona => (
                          <MenuItem key={persona.value} value={persona.value}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              {persona.icon}
                              {persona.label}
                              <Chip 
                                size="small" 
                                label={persona.type} 
                                color={persona.type === 'residential' ? 'primary' : 'secondary'}
                              />
                            </Box>
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth margin="normal">
                      <InputLabel>Preferred Tier</InputLabel>
                      <Select
                        value={singleTestInput.preferredTier}
                        onChange={(e) => setSingleTestInput({...singleTestInput, preferredTier: e.target.value})}
                      >
                        {tiers.map(tier => (
                          <MenuItem key={tier.value} value={tier.value}>
                            <Chip 
                              label={tier.label} 
                              sx={{ bgcolor: tier.color, color: 'white' }}
                            />
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Budget"
                      type="number"
                      value={singleTestInput.budget}
                      onChange={(e) => setSingleTestInput({...singleTestInput, budget: parseInt(e.target.value)})}
                      InputProps={{
                        startAdornment: <InputAdornment position="start">$</InputAdornment>
                      }}
                      margin="normal"
                    />
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Project Size (sq ft)"
                      type="number"
                      value={singleTestInput.projectSize}
                      onChange={(e) => setSingleTestInput({...singleTestInput, projectSize: parseInt(e.target.value)})}
                      margin="normal"
                    />
                  </Grid>
                  
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Voice Transcript (Optional)"
                      multiline
                      rows={3}
                      value={singleTestInput.voiceTranscript}
                      onChange={(e) => setSingleTestInput({...singleTestInput, voiceTranscript: e.target.value})}
                      placeholder="Paste voice transcript or customer description here..."
                      margin="normal"
                    />
                  </Grid>
                  
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" gutterBottom>
                      Sample Voice Transcripts:
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                      {Object.entries(sampleVoiceTranscripts).map(([persona, transcript]) => (
                        <Button
                          key={persona}
                          variant="outlined"
                          size="small"
                          onClick={() => setSingleTestInput({...singleTestInput, persona, voiceTranscript: transcript})}
                        >
                          {personas.find(p => p.value === persona)?.label}
                        </Button>
                      ))}
                    </Box>
                  </Grid>
                  
                  <Grid item xs={12}>
                    <Button
                      variant="contained"
                      startIcon={<RunIcon />}
                      onClick={runSingleTest}
                      disabled={loading}
                      fullWidth
                      size="large"
                    >
                      {loading ? 'Generating Recommendations...' : 'Generate Recommendations'}
                    </Button>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>
            
            <Grid item xs={12} md={6}>
              {loading && (
                <Paper sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    🔄 Processing...
                  </Typography>
                  <LinearProgress sx={{ mb: 2 }} />
                  <Typography variant="body2" color="text.secondary">
                    Generating intelligent product recommendations...
                  </Typography>
                </Paper>
              )}
              
              {singleTestResult && !loading && (
                <Paper sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    📊 Recommendation Results
                  </Typography>
                  
                  {singleTestResult.success ? (
                    <Box>
                      <Alert severity="success" sx={{ mb: 2 }}>
                        <AlertTitle>Recommendations Generated Successfully</AlertTitle>
                        {singleTestResult.data.recommendations.items.length} items recommended
                      </Alert>
                      
                      <Grid container spacing={2}>
                        <Grid item xs={12}>
                          <Card variant="outlined">
                            <CardContent>
                              <Typography variant="subtitle1" gutterBottom>
                                📋 Summary
                              </Typography>
                              <Typography variant="body2" gutterBottom>
                                <strong>Persona:</strong> {singleTestResult.data.persona} 
                                ({Math.round(singleTestResult.data.personaConfidence * 100)}% confidence)
                              </Typography>
                              <Typography variant="body2" gutterBottom>
                                <strong>Bundle Strategy:</strong> {singleTestResult.data.bundleStrategy}
                              </Typography>
                              <Typography variant="body2" gutterBottom>
                                <strong>Recommended Tier:</strong> 
                                <Chip 
                                  size="small" 
                                  label={singleTestResult.data.recommendations.recommendedTier}
                                  sx={{ ml: 1 }}
                                />
                              </Typography>
                              <Typography variant="body2">
                                <strong>Total:</strong> {formatCurrency(singleTestResult.data.recommendations.estimatedTotal)}
                              </Typography>
                            </CardContent>
                          </Card>
                        </Grid>
                        
                        <Grid item xs={12}>
                          <Typography variant="subtitle1" gutterBottom>
                            💰 Pricing Tiers
                          </Typography>
                          <Grid container spacing={1}>
                            {['good', 'better', 'best'].map(tier => {
                              const tierData = singleTestResult.data.recommendations[`${tier}Tier`];
                              const isRecommended = singleTestResult.data.recommendations.recommendedTier === tier;
                              return (
                                <Grid item xs={4} key={tier}>
                                  <Card 
                                    variant={isRecommended ? 'elevation' : 'outlined'}
                                    sx={{ 
                                      bgcolor: isRecommended ? 'primary.light' : 'background.paper',
                                      color: isRecommended ? 'primary.contrastText' : 'text.primary'
                                    }}
                                  >
                                    <CardContent>
                                      <Typography variant="h6" textAlign="center">
                                        {tier.charAt(0).toUpperCase() + tier.slice(1)}
                                      </Typography>
                                      <Typography variant="h5" textAlign="center">
                                        {formatCurrency(tierData.total)}
                                      </Typography>
                                      <Typography variant="body2" textAlign="center">
                                        {tierData.items.length} items
                                      </Typography>
                                    </CardContent>
                                  </Card>
                                </Grid>
                              );
                            })}
                          </Grid>
                        </Grid>
                        
                        <Grid item xs={12}>
                          <Accordion>
                            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                              <Typography variant="subtitle1">
                                🛍️ Recommended Products ({singleTestResult.data.recommendations.items.length} items)
                              </Typography>
                            </AccordionSummary>
                            <AccordionDetails>
                              <TableContainer>
                                <Table size="small">
                                  <TableHead>
                                    <TableRow>
                                      <TableCell>Product</TableCell>
                                      <TableCell>Category</TableCell>
                                      <TableCell>Price</TableCell>
                                      <TableCell>Reasoning</TableCell>
                                    </TableRow>
                                  </TableHead>
                                  <TableBody>
                                    {singleTestResult.data.recommendations.items.map((item: any, index: number) => (
                                      <TableRow key={index}>
                                        <TableCell>
                                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            {getCategoryIcon(item.category)}
                                            {item.name}
                                          </Box>
                                        </TableCell>
                                        <TableCell>
                                          <Chip size="small" label={item.category} />
                                        </TableCell>
                                        <TableCell>{formatCurrency(item.price)}</TableCell>
                                        <TableCell>
                                          <Typography variant="body2" sx={{ maxWidth: 200 }}>
                                            {item.reasoning}
                                          </Typography>
                                        </TableCell>
                                      </TableRow>
                                    ))}
                                  </TableBody>
                                </Table>
                              </TableContainer>
                            </AccordionDetails>
                          </Accordion>
                        </Grid>
                      </Grid>
                    </Box>
                  ) : (
                    <Alert severity="error">
                      <AlertTitle>Recommendation Failed</AlertTitle>
                      {singleTestResult.error}: {singleTestResult.details}
                    </Alert>
                  )}
                </Paper>
              )}
            </Grid>
          </Grid>
        </TabPanel>

        {/* Tab 2: Bundle Analysis */}
        <TabPanel value={currentTab} index={1}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  📦 Bundle Analysis
                </Typography>
                
                <FormControl fullWidth margin="normal">
                  <InputLabel>Select Persona</InputLabel>
                  <Select
                    value={selectedPersona}
                    onChange={(e) => setSelectedPersona(e.target.value)}
                  >
                    {personas.map(persona => (
                      <MenuItem key={persona.value} value={persona.value}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {persona.icon}
                          {persona.label}
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                
                <Button
                  variant="contained"
                  startIcon={<AnalyticsIcon />}
                  onClick={runBundleAnalysis}
                  disabled={loading}
                  fullWidth
                  sx={{ mt: 2 }}
                >
                  {loading ? 'Analyzing...' : 'Analyze Bundles'}
                </Button>
              </Paper>
            </Grid>
            
            <Grid item xs={12} md={8}>
              {bundleAnalysis && bundleAnalysis.success && (
                <Paper sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    📊 Bundle Analysis Results
                  </Typography>
                  
                  <Grid container spacing={2}>
                    {Object.entries(bundleAnalysis.data.bundles).map(([tier, bundle]: [string, any]) => (
                      <Grid item xs={12} key={tier}>
                        <Card variant="outlined">
                          <CardContent>
                            <Typography variant="h6" gutterBottom>
                              {tier.charAt(0).toUpperCase() + tier.slice(1)} Tier
                              {bundleAnalysis.data.recommendedTier === tier && (
                                <Chip 
                                  label="Recommended" 
                                  color="primary" 
                                  size="small" 
                                  sx={{ ml: 1 }}
                                />
                              )}
                            </Typography>
                            <Typography variant="h5" color="primary">
                              {formatCurrency(bundle.total)}
                            </Typography>
                            <Typography variant="body2" gutterBottom>
                              {bundle.items.length} items included
                            </Typography>
                            
                            <Box sx={{ mt: 2 }}>
                              <Typography variant="subtitle2" gutterBottom>
                                Top Products:
                              </Typography>
                              {bundle.items.slice(0, 3).map((item: any, index: number) => (
                                <Typography key={index} variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                  {getCategoryIcon(item.category)}
                                  {item.name} - {formatCurrency(item.price)}
                                </Typography>
                              ))}
                              {bundle.items.length > 3 && (
                                <Typography variant="body2" color="text.secondary">
                                  +{bundle.items.length - 3} more items...
                                </Typography>
                              )}
                            </Box>
                          </CardContent>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                </Paper>
              )}
            </Grid>
          </Grid>
        </TabPanel>

        {/* Tab 3: Bulk Testing */}
        <TabPanel value={currentTab} index={2}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              🧪 Bulk Testing Suite
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Run comprehensive tests across all personas and scenarios
            </Typography>
            
            <Button
              variant="contained"
              startIcon={<SpeedIcon />}
              onClick={runBulkTests}
              disabled={loading}
              size="large"
              sx={{ mb: 3 }}
            >
              {loading ? 'Running Tests...' : 'Run Bulk Tests'}
            </Button>
            
            {loading && <LinearProgress sx={{ mb: 2 }} />}
            
            {bulkTestResults && bulkTestResults.success && (
              <Box>
                <Alert severity={bulkTestResults.data.summary.successRate === 100 ? 'success' : 'warning'} sx={{ mb: 3 }}>
                  <AlertTitle>Test Results Summary</AlertTitle>
                  {bulkTestResults.data.summary.passed} of {bulkTestResults.data.summary.totalTests} tests passed 
                  ({bulkTestResults.data.summary.successRate}% success rate)
                </Alert>
                
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Test Case</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Items</TableCell>
                        <TableCell>Total</TableCell>
                        <TableCell>Performance</TableCell>
                        <TableCell>Details</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {bulkTestResults.data.results.map((result: any, index: number) => (
                        <TableRow key={index}>
                          <TableCell>{result.name}</TableCell>
                          <TableCell>
                            <Chip 
                              icon={result.passed ? <CheckIcon /> : <ErrorIcon />}
                              label={result.passed ? 'Passed' : 'Failed'}
                              color={result.passed ? 'success' : 'error'}
                            />
                          </TableCell>
                          <TableCell>{result.result?.itemCount || 'N/A'}</TableCell>
                          <TableCell>
                            {result.result?.total ? formatCurrency(result.result.total) : 'N/A'}
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {result.performance.duration}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            {result.validation && (
                              <Typography variant="body2">
                                {result.validation.checks.length} checks performed
                              </Typography>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            )}
          </Paper>
        </TabPanel>

        {/* Tab 4: Persona Analysis */}
        <TabPanel value={currentTab} index={3}>
          {personaData && (
            <Grid container spacing={3}>
              {Object.entries(personaData.personas).map(([personaKey, personaInfo]: [string, any]) => (
                <Grid item xs={12} md={6} lg={4} key={personaKey}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        {personas.find(p => p.value === personaKey)?.label || personaKey}
                      </Typography>
                      
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="subtitle2" gutterBottom>
                          Budget Range:
                        </Typography>
                        <Typography variant="body2">
                          {formatCurrency(personaInfo.budgetRange.min)} - {formatCurrency(personaInfo.budgetRange.max)}
                        </Typography>
                      </Box>
                      
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="subtitle2" gutterBottom>
                          Preferred Tier:
                        </Typography>
                        <Chip 
                          label={personaInfo.preferredTier} 
                          color="primary" 
                          size="small"
                        />
                      </Box>
                      
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="subtitle2" gutterBottom>
                          Priority Categories:
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                          {/* @ts-ignore */}
                          {personaInfo.priorityCategories.map((category, index) => (
                            <Chip
                              key={index}
                              label={category}
                              size="small"
                              color="primary"
                              variant="outlined"
                            />
                          ))}
                        </Box>
                        
                        <Typography variant="body2" sx={{ mt: 2, mb: 1 }}>
                          Key Features:
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                          {/* @ts-ignore */}
                          {personaInfo.keyFeatures.map((feature, index) => (
                            <Chip
                              key={index}
                              label={feature}
                              size="small"
                              variant="outlined"
                            />
                          ))}
                        </Box>
                      </Box>
                      
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="subtitle2" gutterBottom>
                          Bundle Strategy:
                        </Typography>
                        <Typography variant="body2">
                          {personaInfo.bundleStrategy.description}
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </TabPanel>

        {/* Tab 5: Performance Metrics */}
        <TabPanel value={currentTab} index={4}>
          {performanceMetrics ? (
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Paper sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    📈 Performance Summary
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={6} md={3}>
                      <Card>
                        <CardContent>
                          <Typography variant="h4" color="primary">
                            {performanceMetrics.summary.successRate}%
                          </Typography>
                          <Typography variant="body2">
                            Success Rate
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                    <Grid item xs={6} md={3}>
                      <Card>
                        <CardContent>
                          <Typography variant="h4" color="primary">
                            {performanceMetrics.summary.totalTests}
                          </Typography>
                          <Typography variant="body2">
                            Total Tests
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                    <Grid item xs={6} md={3}>
                      <Card>
                        <CardContent>
                          <Typography variant="h4" color="success.main">
                            {performanceMetrics.summary.passed}
                          </Typography>
                          <Typography variant="body2">
                            Passed
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                    <Grid item xs={6} md={3}>
                      <Card>
                        <CardContent>
                          <Typography variant="h4" color="error.main">
                            {performanceMetrics.summary.failed}
                          </Typography>
                          <Typography variant="body2">
                            Failed
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  </Grid>
                </Paper>
              </Grid>
              
              <Grid item xs={12}>
                <Paper sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    💡 Optimization Recommendations
                  </Typography>
                  {performanceMetrics.recommendations.length > 0 && (
                    <Box sx={{ mt: 3 }}>
                      {/* @ts-ignore */}
                      {performanceMetrics.recommendations.map((rec, index) => (
                        <Alert 
                          key={index}
                          severity={rec.type}
                          sx={{ mb: 2 }}
                        >
                          <AlertTitle>{rec.title}</AlertTitle>
                          {rec.description}
                        </Alert>
                      ))}
                    </Box>
                  )}
                </Paper>
              </Grid>
            </Grid>
          ) : (
            <Paper sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="h6" gutterBottom>
                📊 No Performance Data Available
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Run bulk tests to generate performance metrics
              </Typography>
              <Button
                variant="contained"
                startIcon={<SpeedIcon />}
                onClick={runBulkTests}
                disabled={loading}
              >
                Run Tests Now
              </Button>
            </Paper>
          )}
        </TabPanel>
      </Container>
    </AppLayout>
  );
};

export default ProductRecommendationTesting;