import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Grid,
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert,
  CircularProgress,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Tabs,
  Tab,
  Badge,
  LinearProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Switch,
  FormControlLabel,
  Tooltip,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Psychology as PsychologyIcon,
  Analytics as AnalyticsIcon,
  Science as ScienceIcon,
  Speed as SpeedIcon,
  TrendingUp as TrendingUpIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
} from '@mui/icons-material';
import AppLayout from '../components/Layout/AppLayout';

// Types
interface PersonaDetectionResult {
  success: boolean;
  persona: string;
  confidence: number;
  method: string;
  projectType: string;
  reasoning?: string;
  keyIndicators?: string[];
  error?: string;
}

interface TestCase {
  name: string;
  text: string;
  voiceTranscript?: string;
  expectedPersona: string;
  additionalContext?: Record<string, any>;
}

interface Persona {
  id: string;
  name: string;
  displayName: string;
  type: string;
  description: string;
  keyFeatures: string[];
  recommendedTier: string;
  detectionPatterns?: {
    keywordCount: number;
    phraseCount: number;
    contextClueCount: number;
    tierPreference: string;
    confidenceBoost: number;
  };
}

const PersonaTestingPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [testResult, setTestResult] = useState<any>(null);
  const [bulkResults, setBulkResults] = useState<any>(null);
  const [error, setError] = useState<string>('');

  // Single test form
  const [testText, setTestText] = useState('');
  const [voiceTranscript, setVoiceTranscript] = useState('');
  const [expectedPersona, setExpectedPersona] = useState('');
  const [testName, setTestName] = useState('');

  // Bulk test cases
  const [testCases, setTestCases] = useState<TestCase[]>([]);

  // Service health
  const [serviceHealth, setServiceHealth] = useState<any>(null);

  useEffect(() => {
    loadPersonas();
    checkServiceHealth();
    loadPredefinedTestCases();
  }, []);

  const loadPersonas = async () => {
    try {
      const response = await fetch('/api/persona-detection/personas');
      const data = await response.json();
      if (data.success) {
        setPersonas(data.personas);
      }
    } catch (error) {
      console.error('Error loading personas:', error);
    }
  };

  const checkServiceHealth = async () => {
    try {
      const response = await fetch('/api/persona-detection/health');
      const data = await response.json();
      setServiceHealth(data);
    } catch (error) {
      console.error('Error checking service health:', error);
    }
  };

  const loadPredefinedTestCases = () => {
    const predefinedCases: TestCase[] = [
      {
        name: 'Homeowner Security Focus',
        text: 'I want to improve security for my family home. We have kids and I want peace of mind when we\'re away. Looking for cameras, door locks, and maybe an alarm system.',
        expectedPersona: 'homeowner'
      },
      {
        name: 'Interior Designer Aesthetic',
        text: 'Working on a high-end residential project. Client wants seamless technology integration that doesn\'t disrupt the design aesthetic. Hidden speakers, invisible lighting controls.',
        expectedPersona: 'interior-designer'
      },
      {
        name: 'CTO Infrastructure',
        text: 'Need to upgrade our office building\'s technology infrastructure. Security is paramount, and we need scalable systems that integrate with our existing IT architecture.',
        expectedPersona: 'cto-cio'
      },
      {
        name: 'Builder Volume Pricing',
        text: 'Building 50 new homes in a development. Need standardized smart home packages that appeal to buyers but keep costs down. Installation efficiency is key.',
        expectedPersona: 'builder'
      },
      {
        name: 'Business Owner ROI',
        text: 'Looking to upgrade our retail store with smart systems. Need to see clear return on investment and operational efficiency gains. Customer experience is important.',
        expectedPersona: 'business-owner'
      }
    ];
    setTestCases(predefinedCases);
  };

  const runSingleTest = async () => {
    if (!testText && !voiceTranscript) {
      setError('Please provide either text or voice transcript');
      return;
    }

    setLoading(true);
    setError('');
    setTestResult(null);

    try {
      const response = await fetch('/api/persona-detection/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: testText,
          voiceTranscript: voiceTranscript,
          expectedPersona: expectedPersona || undefined,
          testName: testName || 'Manual Test',
        }),
      });

      const data = await response.json();
      setTestResult(data);
    } catch (error) {
      setError(`Test failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const runBulkTest = async () => {
    if (testCases.length === 0) {
      setError('No test cases available');
      return;
    }

    setLoading(true);
    setError('');
    setBulkResults(null);

    try {
      const response = await fetch('/api/persona-detection/bulk-test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          testCases: testCases,
        }),
      });

      const data = await response.json();
      setBulkResults(data);
    } catch (error) {
      setError(`Bulk test failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const getConfidenceColor = (confidence: number): 'success' | 'warning' | 'error' => {
    if (confidence >= 0.8) return 'success';
    if (confidence >= 0.6) return 'warning';
    return 'error';
  };

  const getMethodIcon = (method: string) => {
    switch (method) {
      case 'ai':
      case 'ai-primary':
        return <PsychologyIcon />;
      case 'rule-based':
      case 'rule-based-primary':
        return <ScienceIcon />;
      case 'combined':
      case 'weighted-average':
        return <AnalyticsIcon />;
      default:
        return <InfoIcon />;
    }
  };

  return (
    <AppLayout>
      <Container maxWidth="xl" sx={{ py: 4 }}>
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h3" component="h1" fontWeight="bold" gutterBottom>
            🎯 AI-Enhanced Persona Detection Testing
          </Typography>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            Test and validate the AI-powered customer persona detection system
          </Typography>
          
          {/* Service Health Status */}
          {serviceHealth && (
            <Card sx={{ mt: 2, bgcolor: serviceHealth.status === 'healthy' ? 'success.light' : 'error.light' }}>
              <CardContent sx={{ py: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  {serviceHealth.status === 'healthy' ? 
                    <CheckCircleIcon color="success" /> : 
                    <ErrorIcon color="error" />
                  }
                  <Typography variant="h6">
                    Service Status: {serviceHealth.status}
                  </Typography>
                  <Chip 
                    label={`OpenAI: ${serviceHealth.features?.openaiConfigured ? 'Enabled' : 'Disabled'}`}
                    color={serviceHealth.features?.openaiConfigured ? 'success' : 'warning'}
                    size="small"
                  />
                  <Chip 
                    label={`${serviceHealth.features?.availablePersonas || 0} Personas`}
                    color="info"
                    size="small"
                  />
                </Box>
              </CardContent>
            </Card>
          )}
        </Box>

        {/* Error Display */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Main Tabs */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
            <Tab icon={<ScienceIcon />} label="Single Test" />
            <Tab icon={<SpeedIcon />} label="Bulk Testing" />
            <Tab icon={<AnalyticsIcon />} label="Persona Analysis" />
            <Tab icon={<TrendingUpIcon />} label="Performance Metrics" />
          </Tabs>
        </Box>

        {/* Tab Content */}
        {activeTab === 0 && (
          <Grid container spacing={3}>
            {/* Test Input */}
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h5" gutterBottom>
                    🧪 Single Persona Detection Test
                  </Typography>
                  
                  <Box sx={{ mb: 3 }}>
                    <TextField
                      fullWidth
                      label="Test Name"
                      value={testName}
                      onChange={(e) => setTestName(e.target.value)}
                      placeholder="e.g., Homeowner Security Test"
                      sx={{ mb: 2 }}
                    />
                    
                    <TextField
                      fullWidth
                      multiline
                      rows={4}
                      label="Text Input"
                      value={testText}
                      onChange={(e) => setTestText(e.target.value)}
                      placeholder="Enter customer communication text..."
                      sx={{ mb: 2 }}
                    />
                    
                    <TextField
                      fullWidth
                      multiline
                      rows={3}
                      label="Voice Transcript (Optional)"
                      value={voiceTranscript}
                      onChange={(e) => setVoiceTranscript(e.target.value)}
                      placeholder="Enter voice memo transcript..."
                      sx={{ mb: 2 }}
                    />
                    
                    <FormControl fullWidth sx={{ mb: 3 }}>
                      <InputLabel>Expected Persona (Optional)</InputLabel>
                      <Select
                        value={expectedPersona}
                        onChange={(e) => setExpectedPersona(e.target.value)}
                        label="Expected Persona (Optional)"
                      >
                        <MenuItem value="">
                          <em>None (for discovery testing)</em>
                        </MenuItem>
                        {personas.map((persona) => (
                          <MenuItem key={persona.id} value={persona.name}>
                            {persona.displayName} ({persona.type})
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                    
                    <Button
                      variant="contained"
                      onClick={runSingleTest}
                      disabled={loading || (!testText && !voiceTranscript)}
                      fullWidth
                      size="large"
                      startIcon={loading ? <CircularProgress size={20} /> : <PsychologyIcon />}
                    >
                      {loading ? 'Analyzing...' : 'Run Persona Detection'}
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Test Results */}
            <Grid item xs={12} md={6}>
              {testResult && (
                <Card>
                  <CardContent>
                    <Typography variant="h5" gutterBottom>
                      📊 Detection Results
                    </Typography>
                    
                    {testResult.success ? (
                      <>
                        <Box sx={{ mb: 3 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                            <Typography variant="h6">Detected Persona:</Typography>
                            <Chip 
                              label={testResult.test.detected}
                              color="primary"
                              size="medium"
                            />
                            {testResult.test.isCorrect !== null && (
                              <Chip 
                                label={testResult.test.isCorrect ? 'CORRECT' : 'INCORRECT'}
                                color={testResult.test.isCorrect ? 'success' : 'error'}
                                icon={testResult.test.isCorrect ? <CheckCircleIcon /> : <ErrorIcon />}
                              />
                            )}
                          </Box>
                          
                          <Box sx={{ mb: 2 }}>
                            <Typography variant="body2" color="text.secondary">
                              Confidence Score
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <LinearProgress
                                variant="determinate"
                                value={testResult.test.confidence * 100}
                                color={getConfidenceColor(testResult.test.confidence)}
                                sx={{ flex: 1, height: 8, borderRadius: 1 }}
                              />
                              <Typography variant="body2" fontWeight="bold">
                                {Math.round(testResult.test.confidence * 100)}%
                              </Typography>
                            </Box>
                          </Box>
                          
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                            {getMethodIcon(testResult.test.method)}
                            <Typography variant="body2">
                              Detection Method: <strong>{testResult.test.method}</strong>
                            </Typography>
                          </Box>
                        </Box>

                        {/* Detailed Results */}
                        <Accordion>
                          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                            <Typography>Detailed Analysis</Typography>
                          </AccordionSummary>
                          <AccordionDetails>
                            <pre style={{ fontSize: '12px', overflow: 'auto' }}>
                              {JSON.stringify(testResult.test.detectionDetails, null, 2)}
                            </pre>
                          </AccordionDetails>
                        </Accordion>
                      </>
                    ) : (
                      <Alert severity="error">
                        Test failed: {testResult.error}
                      </Alert>
                    )}
                  </CardContent>
                </Card>
              )}
            </Grid>
          </Grid>
        )}

        {activeTab === 1 && (
          <Box>
            <Card>
              <CardContent>
                <Typography variant="h5" gutterBottom>
                  ⚡ Bulk Persona Detection Testing
                </Typography>
                
                <Box sx={{ mb: 3 }}>
                  <Typography variant="body1" gutterBottom>
                    Test multiple scenarios simultaneously to evaluate overall system performance.
                  </Typography>
                  
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    {testCases.length} test cases loaded
                  </Typography>
                  
                  <Button
                    variant="contained"
                    onClick={runBulkTest}
                    disabled={loading || testCases.length === 0}
                    size="large"
                    startIcon={loading ? <CircularProgress size={20} /> : <SpeedIcon />}
                    sx={{ mr: 2 }}
                  >
                    {loading ? 'Running Tests...' : `Run ${testCases.length} Tests`}
                  </Button>
                  
                  <Button
                    variant="outlined"
                    onClick={loadPredefinedTestCases}
                    disabled={loading}
                  >
                    Reset Test Cases
                  </Button>
                </Box>

                {bulkResults && (
                  <Box sx={{ mt: 4 }}>
                    <Typography variant="h6" gutterBottom>
                      📈 Bulk Test Results
                    </Typography>
                    
                    {/* Summary Stats */}
                    <Grid container spacing={2} sx={{ mb: 3 }}>
                      <Grid item xs={6} sm={3}>
                        <Card variant="outlined">
                          <CardContent sx={{ textAlign: 'center' }}>
                            <Typography variant="h4" color="primary">
                              {bulkResults.summary.overallAccuracy || 'N/A'}%
                            </Typography>
                            <Typography variant="caption">Overall Accuracy</Typography>
                          </CardContent>
                        </Card>
                      </Grid>
                      <Grid item xs={6} sm={3}>
                        <Card variant="outlined">
                          <CardContent sx={{ textAlign: 'center' }}>
                            <Typography variant="h4" color="success.main">
                              {bulkResults.summary.correctPredictions}
                            </Typography>
                            <Typography variant="caption">Correct</Typography>
                          </CardContent>
                        </Card>
                      </Grid>
                      <Grid item xs={6} sm={3}>
                        <Card variant="outlined">
                          <CardContent sx={{ textAlign: 'center' }}>
                            <Typography variant="h4" color="error.main">
                              {bulkResults.summary.testsWithExpected - bulkResults.summary.correctPredictions}
                            </Typography>
                            <Typography variant="caption">Incorrect</Typography>
                          </CardContent>
                        </Card>
                      </Grid>
                      <Grid item xs={6} sm={3}>
                        <Card variant="outlined">
                          <CardContent sx={{ textAlign: 'center' }}>
                            <Typography variant="h4" color="info.main">
                              {bulkResults.summary.successfulTests}
                            </Typography>
                            <Typography variant="caption">Completed</Typography>
                          </CardContent>
                        </Card>
                      </Grid>
                    </Grid>

                    {/* Detailed Results Table */}
                    <TableContainer component={Paper}>
                      <Table>
                        <TableHead>
                          <TableRow>
                            <TableCell>Test Name</TableCell>
                            <TableCell>Expected</TableCell>
                            <TableCell>Detected</TableCell>
                            <TableCell>Confidence</TableCell>
                            <TableCell>Method</TableCell>
                            <TableCell>Result</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {bulkResults.results.map((result: any, index: number) => (
                            <TableRow key={index}>
                              <TableCell>{result.name}</TableCell>
                              <TableCell>{result.expected || 'N/A'}</TableCell>
                              <TableCell>
                                <Chip label={result.detected} size="small" />
                              </TableCell>
                              <TableCell>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <LinearProgress
                                    variant="determinate"
                                    value={result.confidence * 100}
                                    color={getConfidenceColor(result.confidence)}
                                    sx={{ width: 60, height: 4 }}
                                  />
                                  <Typography variant="caption">
                                    {Math.round(result.confidence * 100)}%
                                  </Typography>
                                </Box>
                              </TableCell>
                              <TableCell>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  {getMethodIcon(result.method)}
                                  <Typography variant="caption">{result.method}</Typography>
                                </Box>
                              </TableCell>
                              <TableCell>
                                {result.isCorrect !== null ? (
                                  <Chip 
                                    label={result.isCorrect ? 'PASS' : 'FAIL'}
                                    color={result.isCorrect ? 'success' : 'error'}
                                    size="small"
                                  />
                                ) : (
                                  <Chip label="N/A" size="small" />
                                )}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Box>
        )}

        {activeTab === 2 && (
          <Box>
            <Typography variant="h5" gutterBottom>
              🔍 Persona Analysis & Patterns
            </Typography>
            
            <Grid container spacing={3}>
              {personas.map((persona) => (
                <Grid item xs={12} md={6} lg={4} key={persona.id}>
                  <Card>
                    <CardContent>
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="h6" gutterBottom>
                          {persona.displayName}
                        </Typography>
                        <Chip 
                          label={persona.type}
                          color={persona.type === 'residential' ? 'primary' : 'secondary'}
                          size="small"
                          sx={{ mr: 1 }}
                        />
                        <Chip 
                          label={`Tier: ${persona.recommendedTier}`}
                          color="info"
                          size="small"
                        />
                      </Box>
                      
                      <Typography variant="body2" color="text.secondary" paragraph>
                        {persona.description}
                      </Typography>
                      
                      {persona.detectionPatterns && (
                        <Box sx={{ mt: 2 }}>
                          <Typography variant="caption" color="text.secondary">
                            Detection Patterns:
                          </Typography>
                          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 1 }}>
                            <Chip 
                              label={`${persona.detectionPatterns.keywordCount} keywords`}
                              size="small"
                              variant="outlined"
                            />
                            <Chip 
                              label={`${persona.detectionPatterns.phraseCount} phrases`}
                              size="small"
                              variant="outlined"
                            />
                            <Chip 
                              label={`${persona.detectionPatterns.contextClueCount} context clues`}
                              size="small"
                              variant="outlined"
                            />
                          </Box>
                          <Typography variant="caption" color="text.secondary">
                            Confidence Boost: +{Math.round(persona.detectionPatterns.confidenceBoost * 100)}%
                          </Typography>
                        </Box>
                      )}
                      
                      <Accordion sx={{ mt: 2 }}>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                          <Typography variant="body2">Key Features</Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                            {persona.keyFeatures.map((feature, idx) => (
                              <Chip 
                                key={idx}
                                label={feature}
                                size="small"
                                variant="outlined"
                                color="primary"
                              />
                            ))}
                          </Box>
                        </AccordionDetails>
                      </Accordion>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        )}

        {activeTab === 3 && (
          <Box>
            <Typography variant="h5" gutterBottom>
              📈 Performance Metrics & Analytics
            </Typography>
            
            <Alert severity="info" sx={{ mb: 3 }}>
              Performance metrics will be collected as you run tests. Run bulk tests to see accuracy trends and method performance comparisons.
            </Alert>
            
            {/* Placeholder for future analytics */}
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      🎯 Accuracy Trends
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Track persona detection accuracy over time across different input types and scenarios.
                    </Typography>
                    <Box sx={{ mt: 2, p: 3, bgcolor: 'grey.100', borderRadius: 1, textAlign: 'center' }}>
                      <Typography variant="body2" color="text.secondary">
                        Analytics Dashboard Coming Soon
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      ⚡ Method Performance
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Compare AI vs rule-based detection methods and identify optimal scenarios for each approach.
                    </Typography>
                    <Box sx={{ mt: 2, p: 3, bgcolor: 'grey.100', borderRadius: 1, textAlign: 'center' }}>
                      <Typography variant="body2" color="text.secondary">
                        Method Comparison Charts Coming Soon
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Box>
        )}
      </Container>
    </AppLayout>
  );
};

export default PersonaTestingPage;