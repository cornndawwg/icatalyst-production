/**
 * AI Summary Generation Testing Page
 * 
 * SAFETY: This is a NEW page for testing AI functionality independently.
 * It doesn't modify or interfere with any existing proposal features.
 */

import React, { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Tabs,
  Tab,
  Card,
  CardContent,
  Button,
  TextField,
  Grid,
  Alert,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import {
  Psychology as PsychologyIcon,
  AutoAwesome as AutoAwesomeIcon,
  Person as PersonIcon,
  Business as BusinessIcon,
  CheckCircle as CheckIcon,
  Error as ErrorIcon,
  ExpandMore as ExpandMoreIcon,
  Lightbulb as LightbulbIcon,
  TrendingUp as TrendingUpIcon,
  Security as SecurityIcon,
} from '@mui/icons-material';
import { PERSONA_PROMPTS, AISummaryService } from '../services/aiSummaryService';

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
      id={`ai-tabpanel-${index}`}
      aria-labelledby={`ai-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

export default function AITestPage() {
  const [activeTab, setActiveTab] = useState(0);
  const [testData, setTestData] = useState({
    proposalName: 'Smart Home Automation Package',
    description: 'Comprehensive smart home solution including lighting, security, and entertainment systems',
    customerPersona: 'homeowner',
    totalAmount: 25000,
    voiceTranscript: 'We want a system that makes our home more secure and convenient for our family.',
    items: [
      {
        name: 'Smart Lighting Control System',
        description: 'Automated lighting throughout the home',
        category: 'lighting',
        quantity: 1,
        unitPrice: 5000,
        totalPrice: 5000
      },
      {
        name: 'Security Camera System',
        description: '8-camera security system with monitoring',
        category: 'security',
        quantity: 1,
        unitPrice: 8000,
        totalPrice: 8000
      },
      {
        name: 'Home Theater Setup',
        description: 'Premium audio-visual entertainment system',
        category: 'audio-video',
        quantity: 1,
        unitPrice: 12000,
        totalPrice: 12000
      }
    ]
  });
  
  const [generating, setGenerating] = useState(false);
  const [aiResult, setAiResult] = useState<any>(null);

  // Complete workflow state
  const [workflowData, setWorkflowData] = useState({
    voiceTranscript: '3-bedroom house remodel, want whole home audio, security cameras, and smart lighting. Budget around $15-20k. Prefer Control4 if possible. New construction.',
    projectType: 'residential' as 'residential' | 'commercial',
    customerPersona: 'homeowner',
    budget: 17500,
    propertySize: 2500
  });
  const [workflowGenerating, setWorkflowGenerating] = useState(false);
  const [workflowResult, setWorkflowResult] = useState<any>(null);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleGenerateAISummary = async () => {
    setGenerating(true);
    setAiResult(null);

    try {
      // For now, simulate the AI service call
      console.log('Would call AI service with:', testData);
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock AI result based on persona
      const personaConfig = PERSONA_PROMPTS[testData.customerPersona];
      const mockResult = {
        success: true,
        executiveSummary: `This comprehensive smart home solution is tailored specifically for ${testData.customerPersona}s, delivering ${personaConfig.focusAreas.slice(0, 2).join(' and ')} through cutting-edge automation technology.`,
        summary: `Your ${testData.proposalName} represents a strategic investment in ${personaConfig.focusAreas.join(', ')}. This ${testData.items.length}-component solution addresses your specific needs with a ${personaConfig.tone} approach. The integrated systems will provide immediate value while positioning you for future growth and enhanced ${personaConfig.focusAreas[0]}.`,
        keyBenefits: [
          `Enhanced ${personaConfig.focusAreas[0]}`,
          `Improved ${personaConfig.focusAreas[1]}`,
          `Streamlined ${personaConfig.focusAreas[2] || 'operations'}`,
          `Future-ready technology investment`,
          `Professional-grade reliability`
        ],
        callToAction: `Ready to enhance your ${personaConfig.focusAreas[0]}? Let's schedule a consultation to discuss implementation details and timeline.`,
        tokensUsed: 425,
        cost: 0.0004
      };

      setAiResult(mockResult);

    } catch (error) {
      setAiResult({
        success: false,
        error: `AI generation failed: ${(error as Error).message}`
      });
    } finally {
      setGenerating(false);
    }
  };

  const handleCompleteWorkflow = async () => {
    setWorkflowGenerating(true);
    setWorkflowResult(null);

    try {
      console.log('🚀 Running Complete AI Workflow:', workflowData);
      
      // Initialize AI service
      const aiService = new AISummaryService();
      
      // Step 1: Smart Home Integrator AI generates product recommendations
      console.log('Step 1: Smart Home Integrator AI analyzing requirements...');
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const productResult = await aiService.generateProductRecommendations({
        customerPersona: workflowData.customerPersona,
        voiceTranscript: workflowData.voiceTranscript,
        projectType: workflowData.projectType,
        budget: workflowData.budget,
        propertySize: workflowData.propertySize
      });

      if (!productResult.success) {
        throw new Error('Product recommendation failed: ' + productResult.error);
      }

      console.log('✅ Product recommendations generated:', productResult.recommendations?.length, 'products');

      // Step 2: Generate persona-targeted summary based on product recommendations
      console.log('Step 2: Generating persona-targeted summary...');
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const completeResult = await aiService.generateCompleteWorkflow({
        customerPersona: workflowData.customerPersona,
        voiceTranscript: workflowData.voiceTranscript,
        projectType: workflowData.projectType,
        budget: workflowData.budget,
        propertySize: workflowData.propertySize
      });

      if (!completeResult.success) {
        throw new Error('Complete workflow failed: ' + completeResult.error);
      }

      console.log('✅ Complete AI workflow successful!');

      setWorkflowResult({
        success: true,
        productRecommendations: completeResult.productRecommendations,
        proposalSummary: completeResult.proposalSummary,
        totalEstimate: completeResult.totalEstimate,
        tokensUsed: completeResult.tokensUsed,
        cost: completeResult.cost
      });

    } catch (error) {
      console.error('❌ Complete workflow failed:', error);
      setWorkflowResult({
        success: false,
        error: `Complete workflow failed: ${(error as Error).message}`
      });
    } finally {
      setWorkflowGenerating(false);
    }
  };

  // Available personas grouped by type
  const personalGroups = {
    ai: ['smart-home-integrator'],
    residential: ['homeowner', 'interior-designer', 'builder', 'architect'],
    commercial: ['cto-cio', 'business-owner', 'c-suite', 'office-manager', 'facilities-manager']
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Paper sx={{ p: 4, mb: 4 }}>
        <Box display="flex" alignItems="center" mb={2}>
          <PsychologyIcon sx={{ mr: 2, fontSize: 40, color: 'primary.main' }} />
          <Box>
            <Typography variant="h3" component="h1" gutterBottom>
              AI Summary Generation Testing
            </Typography>
            <Typography variant="h6" color="text.secondary">
              Test persona-targeted AI summaries for smart home proposals
            </Typography>
          </Box>
        </Box>

        <Alert severity="info" sx={{ mt: 3 }}>
          <Typography variant="body1">
            <strong>Competitive Advantage:</strong> Generate personalized, compelling proposal summaries 
            tailored to each customer persona's priorities and decision-making factors.
          </Typography>
        </Alert>
      </Paper>

      {/* Feature Overview */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h5" gutterBottom>
          AI-Powered Persona Targeting
        </Typography>
        
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <Card variant="outlined">
              <CardContent sx={{ textAlign: 'center', py: 2 }}>
                <PersonIcon sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
                <Typography variant="subtitle2" gutterBottom>
                  9 Distinct Personas
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Residential & Commercial targeting
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card variant="outlined">
              <CardContent sx={{ textAlign: 'center', py: 2 }}>
                <AutoAwesomeIcon sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
                <Typography variant="subtitle2" gutterBottom>
                  Smart Prompting
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Persona-specific language & focus
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card variant="outlined">
              <CardContent sx={{ textAlign: 'center', py: 2 }}>
                <TrendingUpIcon sx={{ fontSize: 40, color: 'warning.main', mb: 1 }} />
                <Typography variant="subtitle2" gutterBottom>
                  Higher Conversion
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Targeted messaging increases wins
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Paper>

      {/* Tabs */}
      <Paper sx={{ mb: 4 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={activeTab} onChange={handleTabChange}>
            <Tab label="Generate AI Summary" />
            <Tab label="Complete AI Workflow" />
            <Tab label="Persona Strategies" />
            <Tab label="Configuration" />
          </Tabs>
        </Box>

        {/* Generate Summary Tab */}
        <TabPanel value={activeTab} index={0}>
          <Grid container spacing={4}>
            {/* Input Form */}
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>
                Test Proposal Data
              </Typography>
              
              <Box mb={3}>
                <TextField
                  fullWidth
                  label="Proposal Name"
                  value={testData.proposalName}
                  onChange={(e) => setTestData(prev => ({ ...prev, proposalName: e.target.value }))}
                  sx={{ mb: 2 }}
                />
                
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="Description"
                  value={testData.description}
                  onChange={(e) => setTestData(prev => ({ ...prev, description: e.target.value }))}
                  sx={{ mb: 2 }}
                />

                <FormControl fullWidth sx={{ mb: 3 }}>
                  <InputLabel>Customer Persona</InputLabel>
                  <Select value={testData.customerPersona} onChange={(e) => setTestData(prev => ({ ...prev, customerPersona: e.target.value }))}
                  >
                    <MenuItem disabled><em>AI Integrator</em></MenuItem>
                    {personalGroups.ai.map(persona => (
                      <MenuItem key={persona} value={persona}>
                        {persona.replace('-', ' ').toUpperCase()}
                      </MenuItem>
                    ))}
                    <MenuItem disabled><em>Residential</em></MenuItem>
                    {personalGroups.residential.map(persona => (
                      <MenuItem key={persona} value={persona}>
                        {persona.replace('-', ' ').toUpperCase()}
                      </MenuItem>
                    ))}
                    <MenuItem disabled><em>Commercial</em></MenuItem>
                    {personalGroups.commercial.map(persona => (
                      <MenuItem key={persona} value={persona}>
                        {persona.replace('-', ' ').toUpperCase()}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <TextField
                  fullWidth
                  multiline
                  rows={2}
                  label="Voice Transcript (Optional)"
                  value={testData.voiceTranscript}
                  onChange={(e) => setTestData(prev => ({ ...prev, voiceTranscript: e.target.value }))}
                  sx={{ mb: 2 }}
                />

                <TextField
                  fullWidth
                  label="Total Amount"
                  type="number"
                  value={testData.totalAmount}
                  onChange={(e) => setTestData(prev => ({ ...prev, totalAmount: Number(e.target.value) }))}
                  InputProps={{
                    startAdornment: '$'
                  }}
                />
              </Box>

              <Button
                variant="contained"
                size="large"
                onClick={handleGenerateAISummary}
                disabled={generating}
                startIcon={generating ? <CircularProgress size={16} /> : <AutoAwesomeIcon />}
                fullWidth
              >
                {generating ? 'Generating AI Summary...' : 'Generate Persona-Targeted Summary'}
              </Button>
            </Grid>

            {/* Results */}
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>
                AI-Generated Summary
              </Typography>
              
              {aiResult ? (
                aiResult.success ? (
                  <Box>
                    <Alert severity="success" sx={{ mb: 2 }}>
                      <Box display="flex" justifyContent="space-between" alignItems="center">
                        <span>Summary generated successfully!</span>
                        <Chip label={`${aiResult.tokensUsed} tokens • $${aiResult.cost.toFixed(4)}`} size="small" />
                      </Box>
                    </Alert>

                    <Card sx={{ mb: 2 }}>
                      <CardContent>
                        <Typography variant="subtitle2" color="primary" gutterBottom>
                          Executive Summary
                        </Typography>
                        <Typography variant="body2" paragraph>
                          {aiResult.executiveSummary}
                        </Typography>
                        
                        <Typography variant="subtitle2" color="primary" gutterBottom>
                          Detailed Summary
                        </Typography>
                        <Typography variant="body2" paragraph>
                          {aiResult.summary}
                        </Typography>

                        <Typography variant="subtitle2" color="primary" gutterBottom>
                          Key Benefits
                        </Typography>
                        <List dense>
                          {aiResult.keyBenefits.map((benefit: string, index: number) => (
                            <ListItem key={index} sx={{ py: 0 }}>
                              <ListItemIcon sx={{ minWidth: 32 }}>
                                <CheckIcon color="success" fontSize="small" />
                              </ListItemIcon>
                              <ListItemText primary={benefit} />
                            </ListItem>
                          ))}
                        </List>

                        <Typography variant="subtitle2" color="primary" gutterBottom>
                          Call to Action
                        </Typography>
                        <Typography variant="body2" sx={{ fontStyle: 'italic' }}>
                          {aiResult.callToAction}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Box>
                ) : (
                  <Alert severity="error">
                    <Typography variant="body2">
                      {aiResult.error}
                    </Typography>
                  </Alert>
                )
              ) : (
                <Card variant="outlined">
                  <CardContent sx={{ textAlign: 'center', py: 6 }}>
                    <LightbulbIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                    <Typography variant="h6" gutterBottom>
                      Ready to Generate
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Configure your test data and click generate to see persona-targeted AI summaries in action.
                    </Typography>
                  </CardContent>
                </Card>
              )}
            </Grid>
          </Grid>
        </TabPanel>

        {/* Complete AI Workflow Tab */}
        <TabPanel value={activeTab} index={1}>
          <Typography variant="h6" gutterBottom>
            Complete AI Workflow: Voice → Products → Summary
          </Typography>
          
          <Alert severity="info" sx={{ mb: 3 }}>
            <Typography variant="body2">
              <strong>End-to-End AI Pipeline:</strong> Voice input → Smart Home Integrator AI → Product recommendations → Persona-targeted summary → Professional presentation
            </Typography>
          </Alert>

          <Grid container spacing={4}>
            {/* Workflow Input */}
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>
                Customer Requirements
              </Typography>
              
              <Box mb={3}>
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  label="Voice Transcript / Customer Requirements"
                  value={workflowData.voiceTranscript}
                  onChange={(e) => setWorkflowData(prev => ({ ...prev, voiceTranscript: e.target.value }))}
                  sx={{ mb: 2 }}
                />

                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth sx={{ mb: 2 }}>
                      <InputLabel>Project Type</InputLabel>
                      <Select value={workflowData.projectType} onChange={(e) => setWorkflowData(prev => ({ ...prev, projectType: e.target.value as 'residential' | 'commercial' }))}
                      >
                        <MenuItem value="residential">Residential</MenuItem>
                        <MenuItem value="commercial">Commercial</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth sx={{ mb: 2 }}>
                      <InputLabel>Customer Persona</InputLabel>
                      <Select value={workflowData.customerPersona} onChange={(e) => setWorkflowData(prev => ({ ...prev, customerPersona: e.target.value }))}
                      >
                        <MenuItem disabled><em>Residential</em></MenuItem>
                        {personalGroups.residential.map(persona => (
                          <MenuItem key={persona} value={persona}>
                            {persona.replace('-', ' ').toUpperCase()}
                          </MenuItem>
                        ))}
                        <MenuItem disabled><em>Commercial</em></MenuItem>
                        {personalGroups.commercial.map(persona => (
                          <MenuItem key={persona} value={persona}>
                            {persona.replace('-', ' ').toUpperCase()}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>

                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Budget"
                      type="number"
                      value={workflowData.budget}
                      onChange={(e) => setWorkflowData(prev => ({ ...prev, budget: Number(e.target.value) }))}
                      InputProps={{
                        startAdornment: '$'
                      }}
                      sx={{ mb: 2 }}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Property Size (sq ft)"
                      type="number"
                      value={workflowData.propertySize}
                      onChange={(e) => setWorkflowData(prev => ({ ...prev, propertySize: Number(e.target.value) }))}
                      sx={{ mb: 2 }}
                    />
                  </Grid>
                </Grid>
              </Box>

              <Button
                variant="contained"
                size="large"
                startIcon={<AutoAwesomeIcon />}
                fullWidth
                sx={{ 
                  background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                  boxShadow: '0 3px 5px 2px rgba(33, 203, 243, .3)',
                }}
                onClick={handleCompleteWorkflow}
                disabled={workflowGenerating}
              >
                {workflowGenerating ? 'Running Complete AI Workflow...' : 'Run Complete AI Workflow'}
              </Button>

              <Box mt={2}>
                <Typography variant="body2" color="text.secondary">
                  <strong>Workflow Steps:</strong><br />
                  1. 🎤 Voice/text analysis<br />
                  2. 🤖 Smart Home Integrator AI generates product recommendations<br />
                  3. 🎯 Persona-targeted summary generation<br />
                  4. 📋 Professional proposal presentation
                </Typography>
              </Box>
            </Grid>

            {/* Workflow Results */}
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>
                AI Workflow Results
              </Typography>
              
              {workflowResult ? (
                <Box>
                  <Alert severity="success" sx={{ mb: 2 }}>
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                      <span>Complete AI workflow completed successfully!</span>
                      <Chip label={`${workflowResult.tokensUsed || 0} tokens • $${(workflowResult.cost || 0).toFixed(4)}`} size="small" />
                    </Box>
                  </Alert>

                  {/* Product Recommendations */}
                  <Card sx={{ mb: 2 }}>
                    <CardContent>
                      <Typography variant="subtitle1" color="primary" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        🤖 Smart Home Integrator AI - Product Recommendations
                      </Typography>
                      
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Total Estimate: <strong>${workflowResult.totalEstimate?.toLocaleString() || 'N/A'}</strong>
                      </Typography>

                      {workflowResult.productRecommendations?.map((product: any, index: number) => (
                        <Box key={index} sx={{ 
                          border: '1px solid', 
                          borderColor: 'divider', 
                          borderRadius: 1, 
                          p: 2, 
                          mb: 1,
                          backgroundColor: product.priority === 'essential' ? 'success.light' : 
                                         product.priority === 'recommended' ? 'warning.light' : 'grey.100'
                        }}>
                          <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                            <Box flex={1}>
                              <Typography variant="subtitle2" gutterBottom>
                                {product.name} ({product.brand} {product.model})
                              </Typography>
                              <Typography variant="body2" color="text.secondary" gutterBottom>
                                {product.description}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                <strong>Reasoning:</strong> {product.reasoning}
                              </Typography>
                            </Box>
                            <Box textAlign="right" sx={{ ml: 2 }}>
                              <Chip 
                                label={product.priority.toUpperCase()} 
                                size="small"
                                color={product.priority === 'essential' ? 'success' : 
                                       product.priority === 'recommended' ? 'warning' : 'default'}
                              />
                              <Typography variant="subtitle2" sx={{ mt: 1 }}>
                                ${(product.basePrice * product.quantity).toLocaleString()}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                Qty: {product.quantity}
                              </Typography>
                            </Box>
                          </Box>
                        </Box>
                      ))}
                    </CardContent>
                  </Card>

                  {/* Persona-Targeted Summary */}
                  <Card sx={{ mb: 2 }}>
                    <CardContent>
                      <Typography variant="subtitle1" color="primary" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        🎯 Persona-Targeted Summary (HOMEOWNER)
                      </Typography>
                      
                      <Typography variant="subtitle2" color="primary" gutterBottom>
                        Executive Summary
                      </Typography>
                      <Typography variant="body2" paragraph>
                        {workflowResult.proposalSummary?.executiveSummary}
                      </Typography>
                      
                      <Typography variant="subtitle2" color="primary" gutterBottom>
                        Detailed Summary
                      </Typography>
                      <Typography variant="body2" paragraph>
                        {workflowResult.proposalSummary?.summary}
                      </Typography>

                      <Typography variant="subtitle2" color="primary" gutterBottom>
                        Key Benefits
                      </Typography>
                      <List dense>
                        {workflowResult.proposalSummary?.keyBenefits?.map((benefit: string, index: number) => (
                          <ListItem key={index} sx={{ py: 0 }}>
                            <ListItemIcon sx={{ minWidth: 32 }}>
                              <CheckIcon color="success" fontSize="small" />
                            </ListItemIcon>
                            <ListItemText primary={benefit} />
                          </ListItem>
                        ))}
                      </List>

                      <Typography variant="subtitle2" color="primary" gutterBottom>
                        Call to Action
                      </Typography>
                      <Typography variant="body2" sx={{ fontStyle: 'italic', backgroundColor: 'primary.light', p: 2, borderRadius: 1 }}>
                        {workflowResult.proposalSummary?.callToAction}
                      </Typography>
                    </CardContent>
                  </Card>
                </Box>
              ) : workflowResult === null ? (
                <Card variant="outlined">
                  <CardContent sx={{ textAlign: 'center', py: 6 }}>
                    <LightbulbIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                    <Typography variant="h6" gutterBottom>
                      Ready for Complete AI Pipeline
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      This will demonstrate the full Voice → Products → Summary workflow that creates professional proposals automatically.
                    </Typography>
                  </CardContent>
                </Card>
              ) : (
                <Alert severity="error">
                  <Typography variant="body2">
                    {workflowResult.error}
                  </Typography>
                </Alert>
              )}
            </Grid>
          </Grid>
        </TabPanel>

        {/* Persona Strategies Tab */}
        <TabPanel value={activeTab} index={2}>
          <Typography variant="h6" gutterBottom>
            Persona-Specific AI Strategies
          </Typography>
          
          <Alert severity="info" sx={{ mb: 3 }}>
            <Typography variant="body2">
              This system leverages 9 distinct AI personas to create highly targeted, persuasive proposal summaries that resonate with specific customer types.
            </Typography>
          </Alert>

          {/* AI INTEGRATOR SECTION */}
          <Box mb={4}>
            <Typography variant="h6" sx={{ 
              color: 'primary.main', 
              fontWeight: 'bold',
              mb: 2,
              display: 'flex',
              alignItems: 'center',
              gap: 1
            }}>
              🤖 AI INTEGRATOR
            </Typography>
            
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Card variant="outlined" sx={{ 
                  border: '2px solid',
                  borderColor: 'primary.light',
                  background: 'linear-gradient(135deg, #e3f2fd 0%, #f3e5f5 100%)'
                }}>
                  <CardContent>
                    <Box display="flex" alignItems="flex-start" gap={2}>
                      <Chip 
                        label="SMART-HOME-INTEGRATOR" 
                        variant="outlined" 
                        sx={{ 
                          fontWeight: 'bold',
                          borderColor: 'primary.main',
                          color: 'primary.main'
                        }} 
                      />
                      <Box flex={1}>
                        <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                          Expert Product Recommendation Engine
                        </Typography>
                        <Typography variant="body2" paragraph>
                          <strong>Focus:</strong> Product analysis, system integration, budget optimization, technology matching, scalability planning
                        </Typography>
                        <Typography variant="body2" paragraph>
                          <strong>Output:</strong> Structured JSON product recommendations with technical specifications, pricing, and integration reasoning
                        </Typography>
                        <Typography variant="body2">
                          <strong>Use Case:</strong> Analyzes customer voice input and generates optimized product selections that form the foundation for persona-targeted summaries
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Box>

          {/* RESIDENTIAL SECTION */}
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1" gutterBottom color="primary">
                <PersonIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                Residential Personas
              </Typography>
              
              {personalGroups.residential.map(persona => {
                const config = PERSONA_PROMPTS[persona];
                return (
                  <Accordion key={persona}>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Typography variant="subtitle2">
                        {persona.replace('-', ' ').toUpperCase()}
                      </Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Box>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          <strong>Tone:</strong> {config.tone}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          <strong>Technical Level:</strong> {config.technicalLevel}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          <strong>Focus Areas:</strong> {config.focusAreas.join(', ')}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          <strong>Decision Factors:</strong> {config.decisionFactors.join(', ')}
                        </Typography>
                      </Box>
                    </AccordionDetails>
                  </Accordion>
                );
              })}
            </Grid>

            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1" gutterBottom color="primary">
                <BusinessIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                Commercial Personas
              </Typography>
              
              {personalGroups.commercial.map(persona => {
                const config = PERSONA_PROMPTS[persona];
                return (
                  <Accordion key={persona}>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Typography variant="subtitle2">
                        {persona.replace('-', ' ').toUpperCase()}
                      </Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Box>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          <strong>Tone:</strong> {config.tone}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          <strong>Technical Level:</strong> {config.technicalLevel}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          <strong>Focus Areas:</strong> {config.focusAreas.join(', ')}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          <strong>Decision Factors:</strong> {config.decisionFactors.join(', ')}
                        </Typography>
                      </Box>
                    </AccordionDetails>
                  </Accordion>
                );
              })}
            </Grid>
          </Grid>
        </TabPanel>

        {/* Configuration Tab */}
        <TabPanel value={activeTab} index={3}>
          <Box textAlign="center" py={8}>
            <SecurityIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h5" gutterBottom>
              OpenAI Configuration
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              To enable real AI summaries, add your OpenAI API key to the environment configuration.
            </Typography>
            
            <Alert severity="info" sx={{ mt: 3, textAlign: 'left' }}>
              <Typography variant="body2">
                <strong>Environment Setup:</strong><br />
                1. Get an OpenAI API key from platform.openai.com<br />
                2. Add OPENAI_API_KEY to your .env file<br />
                3. Optional: Set OPENAI_MODEL (default: gpt-4o-mini)<br />
                4. Restart the development server
              </Typography>
            </Alert>
          </Box>
        </TabPanel>
      </Paper>

      {/* Benefits */}
      <Paper sx={{ p: 4 }}>
        <Typography variant="h5" gutterBottom>
          Strategic Benefits
        </Typography>
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Box textAlign="center">
              <AutoAwesomeIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                Personalized Messaging
              </Typography>
              <Typography variant="body2" color="text.secondary">
                AI generates summaries that speak directly to each persona's priorities and language preferences.
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} md={4}>
            <Box textAlign="center">
              <TrendingUpIcon sx={{ fontSize: 48, color: 'success.main', mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                Higher Conversion Rates
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Targeted messaging that addresses specific decision factors increases proposal acceptance.
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} md={4}>
            <Box textAlign="center">
              <LightbulbIcon sx={{ fontSize: 48, color: 'warning.main', mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                Competitive Advantage
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Stand out with professional, tailored proposals that demonstrate deep understanding of client needs.
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
} 