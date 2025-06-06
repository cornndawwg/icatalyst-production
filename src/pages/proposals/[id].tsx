import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Grid,
  Card,
  CardContent,
  Button,
  Breadcrumbs,
  Link,
  Chip,
  IconButton,
  Divider,
  Alert,
  Snackbar,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Person as PersonIcon,
  Business as BusinessIcon,
  Home as HomeIcon,
  AttachMoney as MoneyIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  CalendarToday as CalendarIcon,
  Description as DescriptionIcon,
  Inventory as InventoryIcon,
  Download as DownloadIcon,
  Share as ShareIcon,
  ArrowBack as ArrowBackIcon,
  Link as LinkIcon,
  Visibility as VisibilityIcon,
  ContentCopy as CopyIcon,
  Schedule as ScheduleIcon,
  AutoAwesome as AutoAwesomeIcon,
  CheckCircle as CheckIcon,
} from '@mui/icons-material';
import NextLink from 'next/link';
import { useRouter } from 'next/router';
import { useApi } from '../../hooks/useApi';
import { getApiUrl } from '../../lib/api';
import PortalLinkGenerator from '../../components/PortalLinkGenerator';

// TypeScript interfaces
interface ProposalPersona {
  id: string;
  type: string;
  name: string;
  displayName: string;
  description: string;
  keyFeatures: string | string[];
  recommendedTier: string;
}

interface Product {
  id: string;
  name: string;
  description: string;
  category: string;
  brand: string;
  model: string;
  sku: string;
  basePrice: number;
  specifications: any;
  compatibility: string;
  installation: string;
}

interface ProposalItem {
  id: string;
  name: string;
  description: string;
  category: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  productId?: string;
  product?: Product;
  sortOrder: number;
}

interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  company?: string;
  email: string;
  phone?: string;
  type: string;
}

interface Property {
  id: string;
  name: string;
  type: string;
  squareFootage: number;
  address?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
  };
}

interface Proposal {
  id: string;
  name: string;
  description: string;
  status: 'draft' | 'sent' | 'viewed' | 'accepted' | 'rejected' | 'expired';
  customerPersona: string;
  totalAmount: number;
  validUntil?: string;
  voiceTranscript?: string;
  aiSummary?: string; // JSON string with AI-generated content
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  
  // Portal functionality
  portalToken?: string;
  portalExpiresAt?: string;
  portalViewCount?: number;
  portalLastViewed?: string;
  clientStatus?: string;
  
  // Customer vs Prospect fields
  isExistingCustomer: boolean;
  customer?: Customer | null;  // Optional for prospects
  
  // Prospect fields (used when isExistingCustomer = false)
  prospectName?: string;
  prospectCompany?: string;
  prospectEmail?: string;
  prospectPhone?: string;
  prospectStatus?: string;
  
  property?: Property;
  items: ProposalItem[];
}

const STATUS_COLORS = {
  draft: 'default',
  sent: 'primary',
  viewed: 'info',
  accepted: 'success',
  rejected: 'error',
  expired: 'warning'
} as const;

export default function ProposalDetailPage() {
  const router = useRouter();
  const { id } = router.query;

  // State management
  const [proposal, setProposal] = useState<Proposal | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [portalLinkGeneratorOpen, setPortalLinkGeneratorOpen] = useState(false);

  // API hooks
  const { get: fetchProposal } = useApi<Proposal>({
    onSuccess: (data) => {
      setProposal(data);
      setLoading(false);
    },
    onError: (error) => {
      setError(`Failed to load proposal: ${error.message}`);
      setLoading(false);
    }
  });

  const { delete: deleteProposal } = useApi<any>({
    onSuccess: () => {
      setSuccess('Proposal deleted successfully');
      setTimeout(() => router.push('/proposals'), 2000);
    },
    onError: (error) => {
      setError(`Failed to delete proposal: ${error.message}`);
      setDeleting(false);
    }
  });

  // Load proposal data
  useEffect(() => {
    if (id && typeof id === 'string') {
      fetchProposal(getApiUrl(`/api/proposals/${id}`));
    }
  }, [id]);

  // Calculate totals
  const totals = React.useMemo(() => {
    if (!proposal) return { subtotal: 0, tax: 0, total: 0 };
    
    const subtotal = proposal.items.reduce((sum, item) => sum + item.totalPrice, 0);
    const tax = subtotal * 0.08; // 8% tax
    const total = subtotal + tax;

    return { subtotal, tax, total };
  }, [proposal]);

  // Parse key features for persona
  const getKeyFeatures = (keyFeatures: string | string[] | undefined): string[] => {
    if (!keyFeatures) return [];
    
    try {
      if (typeof keyFeatures === 'string') {
        return JSON.parse(keyFeatures);
      } else if (Array.isArray(keyFeatures)) {
        return keyFeatures;
      }
    } catch (error) {
      console.error('Error parsing keyFeatures:', error);
    }
    
    return [];
  };

  const handleDelete = async () => {
    if (!proposal) return;
    
    setDeleting(true);
    await deleteProposal(getApiUrl(`/api/proposals/${proposal.id}`));
    setDeleteDialogOpen(false);
  };

  const handleStatusUpdate = async (newStatus: string) => {
    if (!proposal) return;
    
    // TODO: Implement status update API call
    console.log('Update status to:', newStatus);
  };

  const handleShare = () => {
    setShareDialogOpen(true);
  };

  const handleCopyLink = async () => {
    if (!proposal) return;
    
    try {
      const proposalUrl = `${window.location.origin}/proposals/${proposal.id}`;
      await navigator.clipboard.writeText(proposalUrl);
      setSuccess('Proposal link copied to clipboard!');
      setShareDialogOpen(false);
    } catch (error) {
      setError('Failed to copy link to clipboard');
    }
  };

  const handleExportPDF = async () => {
    if (!proposal) return;
    
    setExporting(true);
    try {
      // Basic PDF export functionality
      // In a real implementation, you'd use a library like jsPDF or call a backend service
      const pdfContent = generatePDFContent(proposal, totals);
      
      // Create a blob and download link
      const blob = new Blob([pdfContent], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `proposal-${proposal.name.replace(/\s+/g, '-').toLowerCase()}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      setSuccess('Proposal exported successfully!');
    } catch (error) {
      setError('Failed to export proposal');
    } finally {
      setExporting(false);
    }
  };

  const generatePDFContent = (proposal: Proposal, totals: any): string => {
    const customerInfo = proposal.isExistingCustomer && proposal.customer
      ? `${proposal.customer.firstName} ${proposal.customer.lastName}${proposal.customer.company ? ` (${proposal.customer.company})` : ''}`
      : `${proposal.prospectName || 'Unknown Prospect'}${proposal.prospectCompany ? ` (${proposal.prospectCompany})` : ''}`;

    return `
SMART HOME PROPOSAL
==================

Proposal: ${proposal.name}
Customer: ${customerInfo}
Date: ${new Date(proposal.createdAt).toLocaleDateString()}
Status: ${proposal.status.toUpperCase()}

Description:
${proposal.description || 'No description provided.'}

${proposal.voiceTranscript ? `Voice Notes: "${proposal.voiceTranscript}"` : ''}

PROPOSAL ITEMS
==============
${proposal.items.map((item, index) => `
${index + 1}. ${item.name}
   Category: ${item.category}
   Quantity: ${item.quantity}
   Unit Price: $${item.unitPrice.toFixed(2)}
   Total: $${item.totalPrice.toFixed(2)}
   ${item.description ? `Description: ${item.description}` : ''}
`).join('')}

PRICING SUMMARY
===============
Subtotal: $${totals.subtotal.toFixed(2)}
Tax (8%): $${totals.tax.toFixed(2)}
TOTAL: $${totals.total.toFixed(2)}

${proposal.validUntil ? `Valid Until: ${new Date(proposal.validUntil).toLocaleDateString()}` : ''}

---
Generated on ${new Date().toLocaleString()}
Smart Home CRM System
    `;
  };

  // Portal functionality handlers
  const handleGeneratePortalLink = () => {
    setPortalLinkGeneratorOpen(true);
  };

  const handlePortalLinkGenerated = (portalUrl: string) => {
    setSuccess('Portal link generated successfully! You can now share this secure link with your client.');
    // Optionally refresh the proposal data to show updated portal status
    if (proposal) {
      fetchProposal(getApiUrl(`/api/proposals/${proposal.id}`));
    }
  };

  const handleCopyPortalLink = async () => {
    if (!proposal?.portalToken) return;
    
    try {
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || window.location.origin;
      const portalUrl = `${baseUrl}/portal/${proposal.portalToken}`;
      await navigator.clipboard.writeText(portalUrl);
      setSuccess('Portal link copied to clipboard!');
    } catch (error) {
      setError('Failed to copy portal link to clipboard');
    }
  };

  const getClientName = () => {
    if (!proposal) return 'Unknown Client';
    
    if (proposal.isExistingCustomer && proposal.customer) {
      return `${proposal.customer.firstName} ${proposal.customer.lastName}`;
    }
    return proposal.prospectName || 'Unknown Client';
  };

  const getClientEmail = () => {
    if (!proposal) return '';
    
    if (proposal.isExistingCustomer && proposal.customer) {
      return proposal.customer.email;
    }
    return proposal.prospectEmail || '';
  };

  // Parse AI summary data
  const parseAISummary = () => {
    if (!proposal?.aiSummary) return null;
    
    try {
      return JSON.parse(proposal.aiSummary);
    } catch (error) {
      console.error('Error parsing AI summary:', error);
      return null;
    }
  };

  const aiSummaryData = parseAISummary();

  if (loading) {
    return (
      <Container maxWidth="lg">
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
          <CircularProgress size={60} />
          <Typography variant="h6" sx={{ ml: 2 }}>
            Loading proposal...
          </Typography>
        </Box>
      </Container>
    );
  }

  if (!proposal) {
    return (
      <Container maxWidth="lg">
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
          <Alert severity="error">
            Proposal not found or you don't have permission to view it.
          </Alert>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      {/* Header */}
      <Box mb={3}>
        <Breadcrumbs separator="/" sx={{ mb: 2 }}>
          <Link component={NextLink} href="/" color="inherit">
            Dashboard
          </Link>
          <Link component={NextLink} href="/proposals" color="inherit">
            Proposals
          </Link>
          <Typography color="text.primary">{proposal.name}</Typography>
        </Breadcrumbs>
        
        <Box display="flex" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 2 }}>
          <Box>
            <Typography variant="h4" component="h1" gutterBottom>
              {proposal.name}
            </Typography>
            <Box display="flex" alignItems="center" gap={2} sx={{ mb: 2 }}>
              <Chip
                label={proposal.status.toUpperCase()}
                color={STATUS_COLORS[proposal.status] as any}
                size="medium"
              />
              <Typography variant="body2" color="text.secondary">
                Created {new Date(proposal.createdAt).toLocaleDateString()}
              </Typography>
            </Box>
          </Box>

          <Box display="flex" gap={1}>
            <Button
              startIcon={<ArrowBackIcon />}
              onClick={() => router.push('/proposals')}
              variant="outlined"
            >
              Back to Proposals
            </Button>
            <Button
              startIcon={<EditIcon />}
              onClick={() => router.push(`/proposals/edit/${proposal.id}`)}
              variant="outlined"
              color="primary"
            >
              Edit
            </Button>
            
            {/* Portal Link Button */}
            {proposal.portalToken ? (
              <Button
                startIcon={<CopyIcon />}
                onClick={handleCopyPortalLink}
                variant="contained"
                color="success"
              >
                Copy Portal Link
              </Button>
            ) : (
              <Button
                startIcon={<LinkIcon />}
                onClick={handleGeneratePortalLink}
                variant="contained"
                color="primary"
              >
                Generate Portal Link
              </Button>
            )}
            
            <Button
              startIcon={<ShareIcon />}
              onClick={handleShare}
              variant="outlined"
              color="primary"
            >
              Share
            </Button>
            <Button
              startIcon={exporting ? <CircularProgress size={16} /> : <DownloadIcon />}
              onClick={handleExportPDF}
              variant="outlined"
              color="primary"
              disabled={exporting}
            >
              {exporting ? 'Exporting...' : 'Export PDF'}
            </Button>
            <IconButton
              color="error"
              onClick={() => setDeleteDialogOpen(true)}
            >
              <DeleteIcon />
            </IconButton>
          </Box>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {/* Main Content */}
        <Grid item xs={12} lg={8}>
          {/* Proposal Description */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Box display="flex" alignItems="center" sx={{ mb: 2 }}>
              <DescriptionIcon sx={{ mr: 1 }} />
              <Typography variant="h6">Proposal Description</Typography>
            </Box>
            
            <Typography variant="body1" sx={{ mb: 2 }}>
              {proposal.description || 'No description provided.'}
            </Typography>

            {proposal.voiceTranscript && (
              <Box>
                <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                  Voice Notes:
                </Typography>
                <Paper variant="outlined" sx={{ p: 2, bgcolor: 'grey.50' }}>
                  <Typography variant="body2" fontStyle="italic">
                    "{proposal.voiceTranscript}"
                  </Typography>
                </Paper>
              </Box>
            )}
          </Paper>

          {/* AI-Generated Summary */}
          {aiSummaryData && (
            <Paper sx={{ p: 3, mb: 3 }}>
              <Box display="flex" alignItems="center" sx={{ mb: 2 }}>
                <AutoAwesomeIcon sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h6" color="primary">AI-Enhanced Proposal Summary</Typography>
                <Chip 
                  label="AI Generated" 
                  size="small" 
                  color="primary" 
                  variant="outlined" 
                  sx={{ ml: 1 }}
                />
              </Box>
              
              {aiSummaryData.executiveSummary && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle1" fontWeight="medium" sx={{ mb: 1 }}>
                    Executive Summary
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    {aiSummaryData.executiveSummary}
                  </Typography>
                </Box>
              )}

              {aiSummaryData.keyBenefits && aiSummaryData.keyBenefits.length > 0 && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle1" fontWeight="medium" sx={{ mb: 1 }}>
                    Key Benefits
                  </Typography>
                  <Box sx={{ mb: 2 }}>
                    {aiSummaryData.keyBenefits.map((benefit: string, index: number) => (
                      <Box key={index} display="flex" alignItems="flex-start" sx={{ mb: 1 }}>
                        <CheckIcon sx={{ color: 'success.main', fontSize: 16, mr: 1, mt: 0.25 }} />
                        <Typography variant="body2">{benefit}</Typography>
                      </Box>
                    ))}
                  </Box>
                </Box>
              )}

              {aiSummaryData.callToAction && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle1" fontWeight="medium" sx={{ mb: 1 }}>
                    Next Steps
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    {aiSummaryData.callToAction}
                  </Typography>
                </Box>
              )}

              {aiSummaryData.aiMetadata && (
                <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
                  <Typography variant="caption" color="text.secondary">
                    AI-generated for {aiSummaryData.aiMetadata.persona} persona • 
                    {aiSummaryData.aiMetadata.projectType} project • 
                    Generated on {new Date(aiSummaryData.aiMetadata.generatedAt).toLocaleDateString()}
                    {aiSummaryData.aiMetadata.tokensUsed && (
                      <> • {aiSummaryData.aiMetadata.tokensUsed} tokens</>
                    )}
                  </Typography>
                </Box>
              )}
            </Paper>
          )}

          {/* Proposal Items */}
          <Paper sx={{ p: 3 }}>
            <Box display="flex" alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
              <Box display="flex" alignItems="center">
                <InventoryIcon sx={{ mr: 1 }} />
                <Typography variant="h6">
                  Proposal Items ({proposal.items.length})
                </Typography>
              </Box>
              <Typography variant="h6" color="primary">
                Total: ${totals.total.toFixed(2)}
              </Typography>
            </Box>

            {proposal.items.length === 0 ? (
              <Box textAlign="center" py={4}>
                <InventoryIcon color="disabled" sx={{ fontSize: 48, mb: 1 }} />
                <Typography variant="body1" color="text.secondary">
                  No items in this proposal
                </Typography>
              </Box>
            ) : (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Product</TableCell>
                      <TableCell align="center">Quantity</TableCell>
                      <TableCell align="right">Unit Price</TableCell>
                      <TableCell align="right">Total</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {proposal.items.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          <Box>
                            <Typography variant="body2" fontWeight="medium">
                              {item.name}
                            </Typography>
                            {item.description && (
                              <Typography variant="caption" color="text.secondary">
                                {item.description}
                              </Typography>
                            )}
                            <Box mt={0.5}>
                              <Chip label={item.category} size="small" />
                              {item.product && (
                                <Chip 
                                  label={item.product.brand} 
                                  size="small" 
                                  variant="outlined" 
                                  sx={{ ml: 0.5 }}
                                />
                              )}
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell align="center">
                          <Typography variant="body2">
                            {item.quantity}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2">
                            ${item.unitPrice.toFixed(2)}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2" fontWeight="medium">
                            ${item.totalPrice.toFixed(2)}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ))}
                    
                    {/* Totals */}
                    <TableRow>
                      <TableCell colSpan={3}>
                        <Typography variant="body2">Subtotal:</Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2">${totals.subtotal.toFixed(2)}</Typography>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell colSpan={3}>
                        <Typography variant="body2">Tax (8%):</Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2">${totals.tax.toFixed(2)}</Typography>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell colSpan={3}>
                        <Typography variant="h6">Total:</Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="h6" color="primary">
                          ${totals.total.toFixed(2)}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Paper>
        </Grid>

        {/* Sidebar */}
        <Grid item xs={12} lg={4}>
          {/* Customer/Prospect Information */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Box display="flex" alignItems="center" sx={{ mb: 2 }}>
              <PersonIcon sx={{ mr: 1 }} />
              <Typography variant="h6">
                {proposal.isExistingCustomer ? 'Customer Information' : 'Prospect Information'}
              </Typography>
            </Box>
            
            {proposal.isExistingCustomer && proposal.customer ? (
              // Customer Information
              <>
                <Box display="flex" alignItems="center" sx={{ mb: 2 }}>
                  <Avatar sx={{ mr: 2 }}>
                    {proposal.customer.firstName?.charAt(0) || 'C'}{proposal.customer.lastName?.charAt(0) || 'U'}
                  </Avatar>
                  <Box>
                    <Typography variant="body1" fontWeight="medium">
                      {proposal.customer.firstName} {proposal.customer.lastName}
                    </Typography>
                    {proposal.customer.company && (
                      <Typography variant="body2" color="text.secondary">
                        {proposal.customer.company}
                      </Typography>
                    )}
                  </Box>
                </Box>

                <Box display="flex" alignItems="center" sx={{ mb: 1 }}>
                  <EmailIcon sx={{ mr: 1, fontSize: 16 }} />
                  <Typography variant="body2">{proposal.customer.email}</Typography>
                </Box>

                {proposal.customer.phone && (
                  <Box display="flex" alignItems="center" sx={{ mb: 1 }}>
                    <PhoneIcon sx={{ mr: 1, fontSize: 16 }} />
                    <Typography variant="body2">{proposal.customer.phone}</Typography>
                  </Box>
                )}

                <Chip
                  label={proposal.customer.type?.toUpperCase() || 'CUSTOMER'}
                  size="small"
                  color="primary"
                  variant="outlined"
                  sx={{ mt: 1 }}
                />
              </>
            ) : (
              // Prospect Information
              <>
                <Box display="flex" alignItems="center" sx={{ mb: 2 }}>
                  <Avatar sx={{ mr: 2 }}>
                    {proposal.prospectName?.charAt(0) || 'P'}
                  </Avatar>
                  <Box>
                    <Typography variant="body1" fontWeight="medium">
                      {proposal.prospectName || 'Unknown Prospect'}
                    </Typography>
                    {proposal.prospectCompany && (
                      <Typography variant="body2" color="text.secondary">
                        {proposal.prospectCompany}
                      </Typography>
                    )}
                  </Box>
                </Box>

                {proposal.prospectEmail && (
                  <Box display="flex" alignItems="center" sx={{ mb: 1 }}>
                    <EmailIcon sx={{ mr: 1, fontSize: 16 }} />
                    <Typography variant="body2">{proposal.prospectEmail}</Typography>
                  </Box>
                )}

                {proposal.prospectPhone && (
                  <Box display="flex" alignItems="center" sx={{ mb: 1 }}>
                    <PhoneIcon sx={{ mr: 1, fontSize: 16 }} />
                    <Typography variant="body2">{proposal.prospectPhone}</Typography>
                  </Box>
                )}

                <Chip
                  label={proposal.prospectStatus?.toUpperCase() || 'PROSPECT'}
                  size="small"
                  color="secondary"
                  variant="outlined"
                  sx={{ mt: 1 }}
                />
              </>
            )}
          </Paper>

          {/* Portal Status */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Box display="flex" alignItems="center" sx={{ mb: 2 }}>
              <LinkIcon sx={{ mr: 1 }} />
              <Typography variant="h6">Customer Portal</Typography>
            </Box>
            
            {proposal.portalToken ? (
              <>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    Portal Status:
                  </Typography>
                  <Chip
                    label="ACTIVE"
                    color="success"
                    size="small"
                    sx={{ mb: 1 }}
                  />
                </Box>

                {proposal.portalExpiresAt && (
                  <Box display="flex" alignItems="center" sx={{ mb: 1 }}>
                    <ScheduleIcon sx={{ mr: 1, fontSize: 16 }} />
                    <Typography variant="body2">
                      Expires: {new Date(proposal.portalExpiresAt).toLocaleDateString()}
                    </Typography>
                  </Box>
                )}

                {proposal.portalViewCount !== undefined && (
                  <Box display="flex" alignItems="center" sx={{ mb: 1 }}>
                    <VisibilityIcon sx={{ mr: 1, fontSize: 16 }} />
                    <Typography variant="body2">
                      Views: {proposal.portalViewCount}
                    </Typography>
                  </Box>
                )}

                {proposal.portalLastViewed && (
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="caption" color="text.secondary">
                      Last viewed: {new Date(proposal.portalLastViewed).toLocaleString()}
                    </Typography>
                  </Box>
                )}

                {proposal.clientStatus && (
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      Client Decision:
                    </Typography>
                    <Chip
                      label={proposal.clientStatus.toUpperCase().replace('-', ' ')}
                      color={
                        proposal.clientStatus === 'approved' ? 'success' :
                        proposal.clientStatus === 'rejected' ? 'error' :
                        proposal.clientStatus === 'changes-requested' ? 'warning' : 'default'
                      }
                      size="small"
                    />
                  </Box>
                )}

                <Box display="flex" gap={1} flexDirection="column">
                  <Button
                    startIcon={<CopyIcon />}
                    onClick={handleCopyPortalLink}
                    variant="outlined"
                    size="small"
                    fullWidth
                  >
                    Copy Portal Link
                  </Button>
                  <Button
                    startIcon={<VisibilityIcon />}
                    onClick={() => window.open(`/portal/${proposal.portalToken}`, '_blank')}
                    variant="outlined"
                    size="small"
                    fullWidth
                  >
                    View Portal
                  </Button>
                </Box>
              </>
            ) : (
              <>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  No portal link generated yet. Create a secure link for your client to review and approve this proposal.
                </Typography>
                <Button
                  startIcon={<LinkIcon />}
                  onClick={handleGeneratePortalLink}
                  variant="contained"
                  color="primary"
                  fullWidth
                >
                  Generate Portal Link
                </Button>
              </>
            )}
          </Paper>

          {/* Property Information */}
          {proposal.property && (
            <Paper sx={{ p: 3, mb: 3 }}>
              <Box display="flex" alignItems="center" sx={{ mb: 2 }}>
                <HomeIcon sx={{ mr: 1 }} />
                <Typography variant="h6">Property Information</Typography>
              </Box>
              
              <Typography variant="body1" fontWeight="medium" sx={{ mb: 1 }}>
                {proposal.property.name}
              </Typography>
              
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                {proposal.property.type} • {proposal.property.squareFootage.toLocaleString()} sq ft
              </Typography>

              {proposal.property.address && (
                <Typography variant="body2" color="text.secondary">
                  {proposal.property.address.street}<br />
                  {proposal.property.address.city}, {proposal.property.address.state} {proposal.property.address.zipCode}
                </Typography>
              )}
            </Paper>
          )}

          {/* Persona & Pricing */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Customer Persona
            </Typography>
            
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary">Customer Persona:</Typography>
              <Typography variant="body1" fontWeight="medium">
                {proposal.customerPersona}
              </Typography>
            </Box>
          </Paper>

          {/* Proposal Status & Actions */}
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Proposal Status
            </Typography>
            
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Current Status:
              </Typography>
              <Chip
                label={proposal.status.toUpperCase()}
                color={STATUS_COLORS[proposal.status] as any}
                sx={{ mb: 2 }}
              />
            </Box>

            {proposal.validUntil && (
              <Box display="flex" alignItems="center" sx={{ mb: 2 }}>
                <CalendarIcon sx={{ mr: 1, fontSize: 16 }} />
                <Typography variant="body2">
                  Valid until: {new Date(proposal.validUntil).toLocaleDateString()}
                </Typography>
              </Box>
            )}

            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Last updated: {new Date(proposal.updatedAt).toLocaleDateString()}
            </Typography>

            <Box display="flex" flexDirection="column" gap={1}>
              {proposal.status === 'draft' && (
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => handleStatusUpdate('sent')}
                >
                  Send to Customer
                </Button>
              )}
              
              {proposal.status === 'sent' && (
                <>
                  <Button
                    variant="outlined"
                    color="success"
                    onClick={() => handleStatusUpdate('accepted')}
                  >
                    Mark as Accepted
                  </Button>
                  <Button
                    variant="outlined"
                    color="error"
                    onClick={() => handleStatusUpdate('rejected')}
                  >
                    Mark as Rejected
                  </Button>
                </>
              )}
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Share Dialog */}
      <Dialog
        open={shareDialogOpen}
        onClose={() => setShareDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Share Proposal</DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ mb: 2 }}>
            Share this proposal with others by copying the link below:
          </Typography>
          <Box
            sx={{
              p: 2,
              bgcolor: 'grey.100',
              borderRadius: 1,
              border: '1px solid',
              borderColor: 'grey.300',
              wordBreak: 'break-all',
              fontSize: '0.875rem',
              fontFamily: 'monospace'
            }}
          >
            {typeof window !== 'undefined' ? `${window.location.origin}/proposals/${proposal?.id}` : ''}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShareDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleCopyLink}
            variant="contained"
            color="primary"
          >
            Copy Link
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Delete Proposal</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this proposal? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleDelete}
            color="error"
            variant="contained"
            disabled={deleting}
            startIcon={deleting ? <CircularProgress size={16} /> : <DeleteIcon />}
          >
            {deleting ? 'Deleting...' : 'Delete Proposal'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar notifications */}
      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setError(null)} severity="error">
          {error}
        </Alert>
      </Snackbar>

      <Snackbar
        open={!!success}
        autoHideDuration={4000}
        onClose={() => setSuccess(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setSuccess(null)} severity="success">
          {success}
        </Alert>
      </Snackbar>

      {/* Portal Link Generator Dialog */}
      {portalLinkGeneratorOpen && (
        <PortalLinkGenerator
          proposalId={proposal.id}
          proposalName={proposal.name}
          clientName={getClientName()}
          clientEmail={getClientEmail()}
          onClose={() => setPortalLinkGeneratorOpen(false)}
          onGenerated={handlePortalLinkGenerated}
        />
      )}
    </Container>
  );
} 