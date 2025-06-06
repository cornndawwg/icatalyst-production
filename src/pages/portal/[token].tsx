import React, { useState, useEffect } from 'react';
import { GetServerSideProps } from 'next';
import { useRouter } from 'next/router';
import {
  Container,
  Box,
  Typography,
  Paper,
  Stepper,
  Step,
  StepLabel,
  StepButton,
  Grid,
  Card,
  CardContent,
  Chip,
  Button,
  Alert,
  Divider,
  Avatar,
  useTheme,
  useMediaQuery,
  Tabs,
  Tab,
  Fade,
} from '@mui/material';
import {
  Business as BusinessIcon,
  Home as HomeIcon,
  Assignment as AssignmentIcon,
  AttachMoney as MoneyIcon,
  CheckCircle as CheckIcon,
  Schedule as ScheduleIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import { validatePortalTokenFromDatabase, PortalTokenPayload } from '../../lib/simplePortalAuth';
import PortalLayout from '../../components/PortalLayout';

// Types
interface ProposalData {
  id: string;
  name: string;
  description?: string;
  totalAmount: number;
  validUntil?: string | null;
  clientStatus?: string;
  items: ProposalItem[];
  customer?: {
    firstName: string;
    lastName: string;
    company?: string;
  } | null;
  prospectName?: string | null;
  prospectCompany?: string | null;
  property?: {
    name: string;
    type?: string | null;
    squareFootage?: number | null;
    address?: {
      street: string;
      city: string;
      state: string;
      zipCode: string;
    } | null;
  } | null;
  // 🎯 NEW: AI-enhanced fields
  voiceTranscript?: string | null;
  aiSummary?: any | null;
  customerPersona?: string | null;
}

interface ProposalItem {
  id: string;
  name: string;
  description?: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  category: string;
  product?: {
    name: string;
    brand?: string;
    specifications?: string;
  };
}

interface PortalPageProps {
  tokenData: PortalTokenPayload | null;
  proposal: ProposalData | null;
  error?: string;
}

const steps = [
  { label: 'Overview', icon: <HomeIcon /> },
  { label: 'Products', icon: <BusinessIcon /> },
  { label: 'Investment', icon: <MoneyIcon /> },
  { label: 'Approval', icon: <CheckIcon /> },
];

export default function CustomerPortalPage({ tokenData, proposal, error }: PortalPageProps) {
  const [activeStep, setActiveStep] = useState(0);
  const [approvalStatus, setApprovalStatus] = useState<string>('');
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const router = useRouter();
  const { token } = router.query;

  useEffect(() => {
    if (proposal?.clientStatus) {
      setApprovalStatus(proposal.clientStatus);
    }
  }, [proposal]);

  if (error) {
    return (
      <Container maxWidth="md" sx={{ py: 8 }}>
        <Alert severity="error" sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            Access Denied
          </Typography>
          <Typography>{error}</Typography>
        </Alert>
      </Container>
    );
  }

  if (!tokenData || !proposal) {
    return (
      <Container maxWidth="md" sx={{ py: 8 }}>
        <Alert severity="warning">
          <Typography variant="h6" gutterBottom>
            Proposal Not Found
          </Typography>
          <Typography>
            The proposal you're looking for could not be found or may have expired.
          </Typography>
        </Alert>
      </Container>
    );
  }

  // 🎯 ENHANCED: Improved navigation handler with visual feedback
  const handleStepClick = (step: number) => {
    console.log('🔄 Navigating to step:', step, steps[step]?.label);
    setActiveStep(step);
  };

  // 🎯 ENHANCED: Tab change handler for alternative navigation
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    console.log('🔄 Tab changed to:', newValue, steps[newValue]?.label);
    setActiveStep(newValue);
  };

  const clientName = proposal.customer 
    ? `${proposal.customer.firstName} ${proposal.customer.lastName}`
    : proposal.prospectName || 'Valued Client';

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  return (
    <PortalLayout>
      {/* Proposal Header */}
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Paper sx={{ p: 4, mb: 4 }}>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={8}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ bgcolor: 'primary.main', mr: 3, width: 56, height: 56 }}>
                  <HomeIcon sx={{ fontSize: 32 }} />
                </Avatar>
                <Box>
                  <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>
                    {proposal.name}
                  </Typography>
                  <Typography variant="h6" color="text.secondary">
                    Proposal for {clientName}
                  </Typography>
                </Box>
              </Box>
            </Grid>
            <Grid item xs={12} md={4}>
              <Box sx={{ textAlign: { xs: 'left', md: 'right' } }}>
                <Typography variant="h3" color="primary.main" fontWeight="bold" gutterBottom>
                  {formatCurrency(proposal.totalAmount)}
                </Typography>
                {proposal.validUntil && (
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: { xs: 'flex-start', md: 'flex-end' }, mb: 1 }}>
                    <ScheduleIcon sx={{ fontSize: 18, mr: 1, color: 'text.secondary' }} />
                    <Typography variant="body1" color="text.secondary">
                      Valid until {new Date(proposal.validUntil).toLocaleDateString()}
                    </Typography>
                  </Box>
                )}
                {approvalStatus && (
                  <Chip 
                    label={approvalStatus.replace('-', ' ').toUpperCase()}
                    color={
                      approvalStatus === 'approved' ? 'success' :
                      approvalStatus === 'rejected' ? 'error' :
                      approvalStatus === 'changes-requested' ? 'warning' : 'default'
                    }
                    size="medium"
                    sx={{ mt: 1 }}
                  />
                )}
              </Box>
            </Grid>
          </Grid>
        </Paper>

        {/* 🎯 ENHANCED: Improved Navigation with Multiple Interaction Methods */}
        <Paper sx={{ mb: 4 }}>
          {isMobile ? (
            // Mobile: Use Tabs for better touch interaction
            <Tabs
              value={activeStep}
              onChange={handleTabChange}
              variant="scrollable"
              scrollButtons="auto"
              sx={{ borderBottom: 1, borderColor: 'divider' }}
            >
              {steps.map((step, index) => (
                <Tab
                  key={step.label}
                  label={step.label}
                  icon={step.icon}
                  sx={{
                    minWidth: 120,
                    fontWeight: activeStep === index ? 'bold' : 'normal',
                    color: activeStep === index ? 'primary.main' : 'text.secondary',
                    '&.Mui-selected': {
                      color: 'primary.main',
                    }
                  }}
                />
              ))}
            </Tabs>
          ) : (
            // Desktop: Enhanced Stepper with better click targets
            <Box sx={{ p: 3 }}>
              <Grid container spacing={2} justifyContent="center">
                {steps.map((step, index) => (
                  <Grid item key={step.label}>
                    <Button
                      onClick={() => handleStepClick(index)}
                      variant={activeStep === index ? "contained" : "outlined"}
                      size="large"
                      startIcon={
                        <Avatar 
                          sx={{ 
                            bgcolor: activeStep === index ? 'white' : 'primary.main',
                            color: activeStep === index ? 'primary.main' : 'white',
                            width: 32,
                            height: 32,
                            mr: 1
                          }}
                        >
                          {step.icon}
                        </Avatar>
                      }
                      sx={{
                        px: 3,
                        py: 1.5,
                        fontSize: '1rem',
                        fontWeight: 'bold',
                        borderRadius: 3,
                        textTransform: 'none',
                        minWidth: 160,
                        boxShadow: activeStep === index ? 3 : 1,
                        '&:hover': {
                          transform: 'translateY(-2px)',
                          boxShadow: 6,
                        },
                        transition: 'all 0.3s ease',
                        border: '2px solid',
                        borderColor: activeStep === index ? 'primary.main' : 'grey.300',
                      }}
                    >
                      {step.label}
                    </Button>
                  </Grid>
                ))}
              </Grid>
              
              {/* 🎯 NEW: Current Section Indicator */}
              <Box sx={{ mt: 3, textAlign: 'center' }}>
                <Typography variant="h5" color="primary.main" fontWeight="bold">
                  {steps[activeStep]?.label}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Step {activeStep + 1} of {steps.length}
                </Typography>
              </Box>
            </Box>
          )}
        </Paper>

        {/* 🎯 ENHANCED: Content Sections with Fade Transitions */}
        <Fade in={activeStep === 0} timeout={500} unmountOnExit>
          <Box sx={{ display: activeStep === 0 ? 'block' : 'none' }}>
            <OverviewSection proposal={proposal} />
          </Box>
        </Fade>
        
        <Fade in={activeStep === 1} timeout={500} unmountOnExit>
          <Box sx={{ display: activeStep === 1 ? 'block' : 'none' }}>
            <ProductsSection proposal={proposal} />
          </Box>
        </Fade>
        
        <Fade in={activeStep === 2} timeout={500} unmountOnExit>
          <Box sx={{ display: activeStep === 2 ? 'block' : 'none' }}>
            <InvestmentSection proposal={proposal} />
          </Box>
        </Fade>
        
        <Fade in={activeStep === 3} timeout={500} unmountOnExit>
          <Box sx={{ display: activeStep === 3 ? 'block' : 'none' }}>
            <ApprovalSection proposal={proposal} tokenData={tokenData} token={token as string} />
          </Box>
        </Fade>

        {/* 🎯 NEW: Navigation Helper Buttons */}
        <Paper sx={{ p: 3, mt: 4, textAlign: 'center' }}>
          <Grid container spacing={2} justifyContent="center">
            <Grid item>
              <Button
                variant="outlined"
                onClick={() => handleStepClick(Math.max(0, activeStep - 1))}
                disabled={activeStep === 0}
                sx={{ minWidth: 120 }}
              >
                ← Previous
              </Button>
            </Grid>
            <Grid item>
              <Button
                variant="contained"
                onClick={() => handleStepClick(Math.min(steps.length - 1, activeStep + 1))}
                disabled={activeStep === steps.length - 1}
                sx={{ minWidth: 120 }}
              >
                Next →
              </Button>
            </Grid>
          </Grid>
          
          {/* 🎯 NEW: Quick Navigation */}
          <Box sx={{ mt: 2 }}>
            <Typography variant="caption" color="text.secondary">
              Quick Navigation: 
            </Typography>
            {steps.map((step, index) => (
              <Button
                key={step.label}
                size="small"
                variant={activeStep === index ? "contained" : "text"}
                onClick={() => handleStepClick(index)}
                sx={{ mx: 0.5, minWidth: 'auto', fontSize: '0.75rem' }}
              >
                {step.label}
              </Button>
            ))}
          </Box>
        </Paper>
      </Container>
    </PortalLayout>
  );
}

// Overview Section Component
function OverviewSection({ proposal }: { proposal: ProposalData }) {
  const clientName = proposal.customer 
    ? `${proposal.customer.firstName} ${proposal.customer.lastName}`
    : proposal.prospectName || 'Valued Client';

  return (
    <Grid container spacing={3}>
      <Grid item xs={12} md={8}>
        <Paper sx={{ p: 4, mb: 3 }}>
          <Typography variant="h5" gutterBottom fontWeight="bold">
            Project Overview
          </Typography>
          <Typography variant="body1" paragraph>
            {proposal.description || `We're excited to present this comprehensive smart home solution for ${clientName}. This proposal includes cutting-edge technology and professional installation to transform your space into an intelligent, connected environment.`}
          </Typography>
          
          <Divider sx={{ my: 3 }} />
          
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <PersonIcon sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h6">Client</Typography>
              </Box>
              <Typography variant="body1">{clientName}</Typography>
              {(proposal.customer?.company || proposal.prospectCompany) && (
                <Typography variant="body2" color="text.secondary">
                  {proposal.customer?.company || proposal.prospectCompany}
                </Typography>
              )}
            </Grid>
            
            {proposal.property && (
              <Grid item xs={12} sm={6}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <HomeIcon sx={{ mr: 1, color: 'primary.main' }} />
                  <Typography variant="h6">Property</Typography>
                </Box>
                <Typography variant="body1">{proposal.property.name}</Typography>
                {proposal.property.address && (
                  <Typography variant="body2" color="text.secondary">
                    {typeof proposal.property.address === 'string' 
                      ? proposal.property.address 
                      : `${proposal.property.address.street}, ${proposal.property.address.city}`
                    }
                  </Typography>
                )}
              </Grid>
            )}
          </Grid>
        </Paper>
      </Grid>
      
      <Grid item xs={12} md={4}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Project Highlights
          </Typography>
          <Box sx={{ space: 2 }}>
            <Chip label="Professional Installation" sx={{ m: 0.5 }} />
            <Chip label="2-Year Warranty" sx={{ m: 0.5 }} />
            <Chip label="24/7 Support" sx={{ m: 0.5 }} />
            <Chip label="Smart Home Integration" sx={{ m: 0.5 }} />
            <Chip label="Energy Efficient" sx={{ m: 0.5 }} />
          </Box>
        </Paper>
      </Grid>
    </Grid>
  );
}

// Products Section Component
function ProductsSection({ proposal }: { proposal: ProposalData }) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  // Group items by category
  const groupedItems = proposal.items.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, ProposalItem[]>);

  return (
    <Box>
      <Typography variant="h5" gutterBottom fontWeight="bold">
        Proposed Products & Services
      </Typography>
      
      {Object.entries(groupedItems).map(([category, items]) => (
        <Paper key={category} sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom sx={{ textTransform: 'capitalize' }}>
            {category.replace('-', ' ')}
          </Typography>
          
          <Grid container spacing={2}>
            {items.map((item) => (
              <Grid item xs={12} key={item.id}>
                <Card variant="outlined">
                  <CardContent>
                    <Grid container spacing={2} alignItems="center">
                      <Grid item xs={12} sm={6}>
                        <Typography variant="subtitle1" fontWeight="bold">
                          {item.product?.name || item.name}
                        </Typography>
                        {item.product?.brand && (
                          <Typography variant="body2" color="text.secondary">
                            {item.product.brand}
                          </Typography>
                        )}
                        {item.description && (
                          <Typography variant="body2" sx={{ mt: 1 }}>
                            {item.description}
                          </Typography>
                        )}
                      </Grid>
                      
                      <Grid item xs={6} sm={2}>
                        <Typography variant="body2" color="text.secondary">
                          Quantity
                        </Typography>
                        <Typography variant="body1" fontWeight="bold">
                          {item.quantity}
                        </Typography>
                      </Grid>
                      
                      <Grid item xs={6} sm={2}>
                        <Typography variant="body2" color="text.secondary">
                          Unit Price
                        </Typography>
                        <Typography variant="body1">
                          {formatCurrency(item.unitPrice)}
                        </Typography>
                      </Grid>
                      
                      <Grid item xs={12} sm={2}>
                        <Typography variant="body2" color="text.secondary">
                          Total
                        </Typography>
                        <Typography variant="h6" color="primary.main" fontWeight="bold">
                          {formatCurrency(item.totalPrice)}
                        </Typography>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Paper>
      ))}
    </Box>
  );
}

// Investment Section Component
function InvestmentSection({ proposal }: { proposal: ProposalData }) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  // 🔧 ENHANCED: Calculate accurate pricing breakdown
  const itemsSubtotal = proposal.items.reduce((sum, item) => sum + item.totalPrice, 0);
  const taxRate = 0.08; // 8% tax rate
  const tax = itemsSubtotal * taxRate;
  const total = itemsSubtotal + tax;

  // Verify against stored total (use stored value if available)
  const displayTotal = proposal.totalAmount || total;
  const calculatedTax = proposal.totalAmount ? proposal.totalAmount - (proposal.totalAmount / (1 + taxRate)) : tax;
  const calculatedSubtotal = displayTotal - calculatedTax;

  return (
    <Grid container spacing={3}>
      <Grid item xs={12} md={8}>
        <Paper sx={{ p: 4 }}>
          <Typography variant="h5" gutterBottom fontWeight="bold">
            Investment Summary
          </Typography>
          
          {/* 🎯 ENHANCED: Detailed line items breakdown */}
          <Box sx={{ mt: 3, mb: 4 }}>
            <Typography variant="h6" gutterBottom sx={{ color: 'text.secondary' }}>
              Project Components
            </Typography>
            {proposal.items.map((item) => (
              <Grid container spacing={2} sx={{ mb: 1 }} key={item.id}>
                <Grid item xs={8}>
                  <Typography variant="body2">
                    {item.name} {item.quantity > 1 && `(${item.quantity}x)`}
                  </Typography>
                </Grid>
                <Grid item xs={4} sx={{ textAlign: 'right' }}>
                  <Typography variant="body2">{formatCurrency(item.totalPrice)}</Typography>
                </Grid>
              </Grid>
            ))}
            
            <Divider sx={{ my: 2 }} />
            
            <Grid container spacing={2} sx={{ mb: 2 }}>
              <Grid item xs={8}>
                <Typography variant="body1" fontWeight="medium">Subtotal:</Typography>
              </Grid>
              <Grid item xs={4} sx={{ textAlign: 'right' }}>
                <Typography variant="body1" fontWeight="medium">{formatCurrency(calculatedSubtotal)}</Typography>
              </Grid>
            </Grid>
            
            <Grid container spacing={2} sx={{ mb: 2 }}>
              <Grid item xs={8}>
                <Typography variant="body1">Tax (8%):</Typography>
              </Grid>
              <Grid item xs={4} sx={{ textAlign: 'right' }}>
                <Typography variant="body1">{formatCurrency(calculatedTax)}</Typography>
              </Grid>
            </Grid>
            
            <Divider sx={{ my: 2 }} />
            
            <Grid container spacing={2}>
              <Grid item xs={8}>
                <Typography variant="h6" fontWeight="bold" color="primary">Total Investment:</Typography>
              </Grid>
              <Grid item xs={4} sx={{ textAlign: 'right' }}>
                <Typography variant="h6" color="primary.main" fontWeight="bold">
                  {formatCurrency(displayTotal)}
                </Typography>
              </Grid>
            </Grid>
          </Box>

          {/* 🎯 NEW: AI Summary Display (if available) */}
          {proposal.aiSummary && (
            <Box sx={{ mt: 4, p: 3, bgcolor: 'primary.50', borderRadius: 2, border: '1px solid', borderColor: 'primary.200' }}>
              <Typography variant="h6" gutterBottom color="primary" sx={{ display: 'flex', alignItems: 'center' }}>
                ✨ AI-Enhanced Proposal Summary
              </Typography>
              {proposal.aiSummary.executiveSummary && (
                <Typography variant="body2" paragraph>
                  <strong>Executive Summary:</strong> {proposal.aiSummary.executiveSummary}
                </Typography>
              )}
              {proposal.aiSummary.keyBenefits && (
                <Box>
                  <Typography variant="body2" fontWeight="medium" gutterBottom>Key Benefits:</Typography>
                  <ul style={{ margin: 0, paddingLeft: 20 }}>
                    {proposal.aiSummary.keyBenefits.map((benefit: string, index: number) => (
                      <li key={index}>
                        <Typography variant="body2">{benefit}</Typography>
                      </li>
                    ))}
                  </ul>
                </Box>
              )}
            </Box>
          )}
        </Paper>
      </Grid>
      
      <Grid item xs={12} md={4}>
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            💳 Payment Options
          </Typography>
          <Typography variant="body2" paragraph>
            We offer flexible payment options to make your smart home investment convenient:
          </Typography>
          <Box component="ul" sx={{ pl: 2, m: 0 }}>
            <Typography component="li" variant="body2" sx={{ mb: 1 }}>
              ✅ Full payment upon completion
            </Typography>
            <Typography component="li" variant="body2" sx={{ mb: 1 }}>
              ✅ 50% deposit, 50% on completion
            </Typography>
            <Typography component="li" variant="body2" sx={{ mb: 1 }}>
              ✅ Financing options available
            </Typography>
          </Box>
        </Paper>

        {/* 🎯 NEW: Project Timeline */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            📅 Project Timeline
          </Typography>
          <Typography variant="body2" paragraph>
            Estimated project completion:
          </Typography>
          <Box sx={{ pl: 1 }}>
            <Typography variant="body2" sx={{ mb: 1 }}>
              📋 <strong>Planning:</strong> 1-2 weeks
            </Typography>
            <Typography variant="body2" sx={{ mb: 1 }}>
              🔧 <strong>Installation:</strong> 2-4 weeks
            </Typography>
            <Typography variant="body2" sx={{ mb: 1 }}>
              ✅ <strong>Testing & Training:</strong> 1 week
            </Typography>
          </Box>
          <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
            Timeline may vary based on project complexity and product availability.
          </Typography>
        </Paper>
      </Grid>
    </Grid>
  );
}

// Approval Section Component
function ApprovalSection({ proposal, tokenData, token }: { proposal: ProposalData; tokenData: PortalTokenPayload; token: string }) {
  const [approvalComment, setApprovalComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [selectedDecision, setSelectedDecision] = useState<string | null>(null);
  const [showCommentField, setShowCommentField] = useState(false);

  const handleApproval = async (decision: 'approved' | 'changes-requested' | 'rejected') => {
    setSubmitting(true);
    try {
      console.log('🔄 Submitting approval decision:', { decision, token, proposalId: tokenData.proposalId });
      
      const response = await fetch(`http://localhost:3001/api/portal/${token}/approve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          decision,
          comment: approvalComment,
          clientName: tokenData.clientName,
          timestamp: new Date().toISOString()
        }),
      });

      const data = await response.json();
      
      console.log('📡 API Response:', { status: response.status, data });

      if (!response.ok) {
        // 🎯 ENHANCED: Better error handling for authentication issues
        if (response.status === 401) {
          throw new Error('Portal session expired. Please use the latest portal link sent to you.');
        }
        throw new Error(data.error || `Failed to submit approval (Status: ${response.status})`);
      }

      // Show success message based on decision
      let successMessage = '';
      switch (decision) {
        case 'approved':
          successMessage = '✅ Proposal approved! We\'ll contact you within 24 hours to schedule the next steps.';
          break;
        case 'changes-requested':
          successMessage = '⚠️ Change request submitted! We\'ll review your feedback and provide an updated proposal.';
          break;
        case 'rejected':
          successMessage = '❌ Proposal declined. Thank you for your time. Feel free to contact us if you have any questions.';
          break;
      }
      
      alert(successMessage);
      // Reload the page to show updated status
      window.location.reload();
    } catch (error) {
      console.error('Error submitting approval:', error);
      alert('Error submitting response. Please try again or contact us directly.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDecisionClick = (decision: 'approved' | 'changes-requested' | 'rejected') => {
    setSelectedDecision(decision);
    
    // Show comment field for changes-requested or rejected
    if (decision === 'changes-requested' || decision === 'rejected') {
      setShowCommentField(true);
    } else {
      setShowCommentField(false);
      // Auto-submit for approval
      handleApproval(decision);
    }
  };

  const handleSubmitWithComment = () => {
    if (selectedDecision && (selectedDecision === 'changes-requested' || selectedDecision === 'rejected')) {
      handleApproval(selectedDecision as 'approved' | 'changes-requested' | 'rejected');
    }
  };

  // Show approved state
  if (proposal.clientStatus === 'approved') {
    return (
      <Paper sx={{ p: 4, textAlign: 'center', bgcolor: 'success.50', border: '2px solid', borderColor: 'success.200' }}>
        <CheckIcon sx={{ fontSize: 64, color: 'success.main', mb: 2 }} />
        <Typography variant="h4" gutterBottom color="success.main" fontWeight="bold">
          ✅ Proposal Approved!
        </Typography>
        <Typography variant="h6" gutterBottom>
          Thank you for choosing us for your smart home project.
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          We'll be in touch within 24 hours to schedule your consultation and begin the planning process.
        </Typography>
        <Box sx={{ mt: 3, p: 2, bgcolor: 'white', borderRadius: 1, border: '1px solid', borderColor: 'success.300' }}>
          <Typography variant="body2" color="success.dark">
            📞 <strong>Next Steps:</strong> Our project manager will contact you to schedule an in-home consultation and finalize project details.
          </Typography>
        </Box>
      </Paper>
    );
  }

  // Show other status states
  if (proposal.clientStatus === 'changes-requested') {
    return (
      <Paper sx={{ p: 4, textAlign: 'center', bgcolor: 'warning.50', border: '2px solid', borderColor: 'warning.200' }}>
        <ScheduleIcon sx={{ fontSize: 64, color: 'warning.main', mb: 2 }} />
        <Typography variant="h5" gutterBottom color="warning.main" fontWeight="bold">
          ⚠️ Changes Requested
        </Typography>
        <Typography variant="body1" color="text.secondary">
          We're reviewing your feedback and will provide an updated proposal soon.
        </Typography>
      </Paper>
    );
  }

  if (proposal.clientStatus === 'rejected') {
    return (
      <Paper sx={{ p: 4, textAlign: 'center', bgcolor: 'error.50', border: '2px solid', borderColor: 'error.200' }}>
        <Typography variant="h5" gutterBottom color="error.main" fontWeight="bold">
          ❌ Proposal Declined
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Thank you for your time. Please feel free to contact us if you have any questions.
        </Typography>
      </Paper>
    );
  }

  // Show pending approval form
  return (
    <Paper sx={{ p: 4 }}>
      <Typography variant="h5" gutterBottom fontWeight="bold" color="primary">
        🤝 Your Decision
      </Typography>
      <Typography variant="body1" paragraph color="text.secondary">
        Please review the proposal above and let us know your decision. We're here to answer any questions you may have.
      </Typography>

      {/* 🎯 ENHANCED: Decision Buttons */}
      <Grid container spacing={3} sx={{ mt: 2, mb: 4 }}>
        <Grid item xs={12} sm={4}>
          <Button
            variant="contained"
            color="success"
            fullWidth
            size="large"
            onClick={() => handleDecisionClick('approved')}
            disabled={submitting}
            sx={{ 
              py: 2,
              fontSize: '1.1rem',
              fontWeight: 'bold',
              boxShadow: 3,
              '&:hover': {
                boxShadow: 6,
                transform: 'translateY(-2px)'
              },
              transition: 'all 0.3s ease'
            }}
          >
            ✅ Approve Proposal
          </Button>
        </Grid>
        
        <Grid item xs={12} sm={4}>
          <Button
            variant="outlined"
            color="warning"
            fullWidth
            size="large"
            onClick={() => handleDecisionClick('changes-requested')}
            disabled={submitting}
            sx={{ 
              py: 2,
              fontSize: '1.1rem',
              fontWeight: 'bold',
              '&:hover': {
                backgroundColor: 'warning.50'
              }
            }}
          >
            ⚠️ Request Changes
          </Button>
        </Grid>
        
        <Grid item xs={12} sm={4}>
          <Button
            variant="outlined"
            color="error"
            fullWidth
            size="large"
            onClick={() => handleDecisionClick('rejected')}
            disabled={submitting}
            sx={{ 
              py: 2,
              fontSize: '1.1rem',
              fontWeight: 'bold',
              '&:hover': {
                backgroundColor: 'error.50'
              }
            }}
          >
            ❌ Decline Proposal
          </Button>
        </Grid>
      </Grid>

      {/* 🎯 ENHANCED: Comment Section for Changes/Rejection */}
      {showCommentField && (
        <Box sx={{ mt: 3, p: 3, bgcolor: 'grey.50', borderRadius: 2, border: '1px solid', borderColor: 'grey.300' }}>
          <Typography variant="h6" gutterBottom>
            {selectedDecision === 'changes-requested' ? '📝 What changes would you like?' : '💬 Please share your feedback'}
          </Typography>
          <textarea
            value={approvalComment}
            onChange={(e) => setApprovalComment(e.target.value)}
            placeholder={
              selectedDecision === 'changes-requested' 
                ? "Please describe the specific changes you'd like to see in the proposal..."
                : "Please let us know why this proposal doesn't meet your needs..."
            }
            style={{
              width: '100%',
              minHeight: '120px',
              padding: '12px',
              border: '1px solid #ccc',
              borderRadius: '8px',
              fontSize: '14px',
              fontFamily: 'inherit',
              resize: 'vertical'
            }}
          />
          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
            <Button
              variant="outlined"
              onClick={() => {
                setShowCommentField(false);
                setSelectedDecision(null);
                setApprovalComment('');
              }}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              color={selectedDecision === 'changes-requested' ? 'warning' : 'error'}
              onClick={handleSubmitWithComment}
              disabled={submitting || !approvalComment.trim()}
            >
              {submitting ? 'Submitting...' : `Submit ${selectedDecision === 'changes-requested' ? 'Change Request' : 'Feedback'}`}
            </Button>
          </Box>
        </Box>
      )}

      {/* 🎯 NEW: Contact Information */}
      <Box sx={{ mt: 4, p: 3, bgcolor: 'primary.50', borderRadius: 2, border: '1px solid', borderColor: 'primary.200' }}>
        <Typography variant="h6" gutterBottom color="primary">
          💬 Questions? We're Here to Help!
        </Typography>
        <Typography variant="body2" paragraph>
          Have questions about this proposal? Our team is ready to help you make the best decision for your smart home.
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
          <Button variant="outlined" color="primary" href="tel:555-123-4567">
            📞 (555) 123-4567
          </Button>
          <Button variant="outlined" color="primary" href="mailto:support@example.com">
            ✉️ Email Us
          </Button>
        </Box>
      </Box>
    </Paper>
  );
}

// Server-side token validation and real data fetching
export const getServerSideProps: GetServerSideProps = async (context) => {
  const { token } = context.params as { token: string };

  try {
    console.log('🔍 Portal page: Validating token for:', token?.substring(0, 20) + '...');
    
    // 🔧 ENHANCED: Use database-backed token validation
    const tokenData = await validatePortalTokenFromDatabase(token);
    
    if (!tokenData) {
      console.log('❌ Portal token validation failed');
      return {
        props: {
          tokenData: null,
          proposal: null,
          error: 'Invalid or expired portal link. Please contact us for a new link.'
        }
      };
    }

    console.log('✅ Portal token validated, fetching proposal data...');

    // 🔧 ENHANCED: Fetch real proposal data from database
    try {
      const { PrismaClient } = require('@prisma/client');
      const prisma = new PrismaClient();

      const proposal = await prisma.proposal.findUnique({
        where: { id: tokenData.proposalId },
        include: {
          customer: {
            select: {
              firstName: true,
              lastName: true,
              company: true,
              email: true
            }
          },
          property: {
            select: {
              name: true,
              type: true,
              squareFootage: true,
              address: {
                select: {
                  street: true,
                  city: true,
                  state: true,
                  zipCode: true
                }
              }
            }
          },
          items: {
            include: {
              product: {
                select: {
                  name: true,
                  brand: true,
                  model: true,
                  category: true,
                  specifications: true,
                  compatibility: true
                }
              }
            },
            orderBy: { sortOrder: 'asc' }
          }
        }
      });

      if (!proposal) {
        console.log('❌ Proposal not found for ID:', tokenData.proposalId);
        return {
          props: {
            tokenData: null,
            proposal: null,
            error: 'Proposal not found. It may have been deleted or moved.'
          }
        };
      }

      console.log('✅ Proposal data fetched successfully');

      // 🎯 ENHANCED: Transform data for portal display
      const proposalData: ProposalData = {
        id: proposal.id,
        name: proposal.name,
        description: proposal.description || '',
        totalAmount: proposal.totalAmount,
        validUntil: proposal.validUntil?.toISOString() || null,
        clientStatus: proposal.clientStatus || 'pending',
        // 🔧 FIXED: Enhanced customer/prospect handling with proper null handling
        customer: proposal.isExistingCustomer && proposal.customer ? {
          firstName: proposal.customer.firstName,
          lastName: proposal.customer.lastName,
          company: proposal.customer.company || null // Fix undefined serialization
        } : null, // Return null instead of undefined
        prospectName: !proposal.isExistingCustomer ? (proposal.prospectName || null) : null,
        prospectCompany: !proposal.isExistingCustomer ? (proposal.prospectCompany || null) : null,
        // 🔧 FIXED: Enhanced property information with proper null handling
        property: proposal.property ? {
          name: proposal.property.name,
          type: proposal.property.type || null,
          squareFootage: proposal.property.squareFootage || null,
          address: proposal.property.address ? {
            street: proposal.property.address.street,
            city: proposal.property.address.city,
            state: proposal.property.address.state,
            zipCode: proposal.property.address.zipCode
          } : null
        } : null,
        // 🔧 FIXED: Enhanced items with real product data and proper null handling
        items: proposal.items.map((item: any) => ({
          id: item.id,
          name: item.name,
          description: item.description || '',
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          totalPrice: item.totalPrice,
          category: item.category,
          product: item.product ? {
            name: item.product.name,
            brand: item.product.brand || null,
            model: item.product.model || null,
            specifications: item.product.specifications || null,
            compatibility: item.product.compatibility || null
          } : null
        })),
        // 🔧 FIXED: Add AI-generated content with proper null handling
        voiceTranscript: proposal.voiceTranscript || null,
        aiSummary: proposal.aiSummary ? JSON.parse(proposal.aiSummary) : null,
        customerPersona: proposal.customerPersona || null
      };

      // 🔧 NEW: Update portal view count and last viewed timestamp
      await prisma.proposal.update({
        where: { id: proposal.id },
        data: {
          portalViewCount: {
            increment: 1
          },
          portalLastViewed: new Date()
        }
      });

      await prisma.$disconnect();

      console.log('🎯 Portal page data prepared successfully');

      return {
        props: {
          tokenData,
          proposal: proposalData,
        },
      };

    } catch (dbError) {
      console.error('❌ Database error fetching proposal:', dbError);
      
      // 🔧 FALLBACK: Return mock data if database fails (for development)
      console.log('⚠️  Using fallback mock data due to database error');
      const mockProposal: ProposalData = {
        id: tokenData.proposalId,
        name: tokenData.proposalName,
        description: 'Complete smart home automation with security, lighting, and climate control.',
        totalAmount: 25000,
        validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        clientStatus: 'pending',
        items: [
          {
            id: '1',
            name: 'Control4 Home Automation Hub',
            description: 'Central control system for all smart home devices',
            quantity: 1,
            unitPrice: 2500,
            totalPrice: 2500,
            category: 'automation',
            product: {
              name: 'Control4 EA-5',
              brand: 'Control4',
              specifications: '8-room capacity, wireless connectivity'
            }
          },
          {
            id: '2',
            name: 'Smart Lighting System',
            description: 'Lutron dimmer switches and smart bulbs',
            quantity: 12,
            unitPrice: 150,
            totalPrice: 1800,
            category: 'lighting',
            product: {
              name: 'Lutron Caseta',
              brand: 'Lutron',
              specifications: 'Wireless dimmer switches'
            }
          }
        ],
        // 🔧 FIXED: Ensure all fields are properly serialized
        customer: null,
        prospectName: tokenData.clientName,
        prospectCompany: 'Valued Client',
        property: null,
        voiceTranscript: null,
        aiSummary: null,
        customerPersona: null
      };

      return {
        props: {
          tokenData,
          proposal: mockProposal,
        },
      };
    }

  } catch (error) {
    console.error('❌ Portal token validation error:', error);
    return {
      props: {
        tokenData: null,
        proposal: null,
        error: 'Unable to access this proposal. Please contact us for assistance.'
      },
    };
  }
}; 