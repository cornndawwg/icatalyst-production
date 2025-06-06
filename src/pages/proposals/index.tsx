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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  CircularProgress,
  Alert,
  Fab,
} from '@mui/material';
import {
  Add as AddIcon,
  MoreVert as MoreVertIcon,
  Visibility as ViewIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  FileDownload as DownloadIcon,
  Assessment as AssessmentIcon,
} from '@mui/icons-material';
import NextLink from 'next/link';
import { useRouter } from 'next/router';
import { useApi } from '../../hooks/useApi';
import { getApiUrl } from '../../lib/api';

interface Proposal {
  id: string;
  name: string;
  description: string;
  customerPersona: string;
  status: string;
  clientStatus?: string;
  totalAmount: number;
  validUntil: string | null;
  createdAt: string;
  isExistingCustomer: boolean;
  customer?: {
    firstName: string;
    lastName: string;
    company?: string;
  };
  prospectName?: string;
  prospectCompany?: string;
  prospectEmail?: string;
  prospectPhone?: string;
  prospectStatus?: string;
  items: {
    name: string;
    quantity: number;
    totalPrice: number;
  }[];
}

export default function ProposalsPage() {
  const router = useRouter();
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [selectedProposal, setSelectedProposal] = useState<Proposal | null>(null);

  const { get: fetchProposals } = useApi<{ proposals: Proposal[] }>({
    onSuccess: (data) => {
      console.log('✅ CRM Dashboard: API Response received:', data);
      const proposalsData = data?.proposals || [];
      console.log('📊 CRM Dashboard: Setting proposals data:', proposalsData);
      
      // 🎯 ENHANCED: Debug clientStatus in received data
      console.log('🔍 CRM Dashboard: Client status analysis:');
      proposalsData.forEach((proposal, index) => {
        console.log(`   ${index + 1}. ${proposal.name}:`);
        console.log(`      status: ${proposal.status || 'undefined'}`);
        console.log(`      clientStatus: ${proposal.clientStatus !== undefined ? proposal.clientStatus : 'UNDEFINED'}`);
      });
      
      const withClientStatus = proposalsData.filter(p => p.clientStatus);
      console.log(`🤝 CRM Dashboard: Proposals with clientStatus: ${withClientStatus.length}`);
      
      setProposals(proposalsData);
      setLoading(false);
    },
    onError: (error) => {
      console.error('❌ CRM Dashboard: API Error:', error);
      setError(`Failed to load proposals: ${error.message}`);
      setProposals([]); // Ensure proposals is always an array
      setLoading(false);
    }
  });

  // Safe proposals array with fallback
  const safeProposals = proposals || [];

  // Safe calculation functions
  const getTotalProposals = () => safeProposals.length;
  
  const getTotalValue = () => {
    return safeProposals.reduce((sum, p) => sum + (p?.totalAmount || 0), 0);
  };
  
  const getAcceptedCount = () => {
    return safeProposals.filter(p => 
      p?.status === 'accepted' || p?.clientStatus === 'approved'
    ).length;
  };
  
  const getPendingCount = () => {
    return safeProposals.filter(p => 
      (p?.status && ['sent', 'viewed'].includes(p.status)) || 
      (!p?.clientStatus || p?.clientStatus === 'pending')
    ).length;
  };

  useEffect(() => {
    fetchProposals(getApiUrl('/api/proposals'));
  }, []);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, proposal: Proposal) => {
    setMenuAnchor(event.currentTarget);
    setSelectedProposal(proposal);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
    setSelectedProposal(null);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'default';
      case 'sent': return 'primary';
      case 'viewed': return 'info';
      case 'accepted': return 'success';
      case 'rejected': return 'error';
      case 'expired': return 'warning';
      default: return 'default';
    }
  };

  // 🎯 NEW: Client approval status colors
  const getClientStatusColor = (clientStatus: string) => {
    switch (clientStatus) {
      case 'approved': return 'success';
      case 'rejected': return 'error';
      case 'changes-requested': return 'warning';
      case 'pending': return 'info';
      default: return 'default';
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg">
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
          <CircularProgress size={60} />
          <Typography variant="h6" sx={{ ml: 2 }}>
            Loading proposals...
          </Typography>
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
          <Typography color="text.primary">Proposals</Typography>
        </Breadcrumbs>
        
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography variant="h4" component="h1" gutterBottom>
              Smart Proposals
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Manage AI-powered proposals with voice input and intelligent pricing.
            </Typography>
          </Box>
          
          <Button
            variant="contained"
            size="large"
            startIcon={<AddIcon />}
            component={NextLink}
            href="/proposals/create"
          >
            Create Proposal
          </Button>
          
          {/* Add Minimal Version Link */}
          <Button
            variant="outlined"
            size="large"
            startIcon={<AddIcon />}
            component={NextLink}
            href="/proposals/create-minimal"
            sx={{ ml: 2 }}
            color="success"
          >
            Create Proposal (Minimal/Stable)
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Total Proposals
              </Typography>
              <Typography variant="h4">
                {getTotalProposals()}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Total Value
              </Typography>
              <Typography variant="h4">
                {formatCurrency(getTotalValue())}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Accepted
              </Typography>
              <Typography variant="h4">
                {getAcceptedCount()}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Pending
              </Typography>
              <Typography variant="h4">
                {getPendingCount()}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Proposals Table */}
      <Paper>
        {safeProposals.length === 0 ? (
          <Box p={6} textAlign="center">
            <AssessmentIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No proposals yet
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Create your first smart proposal with voice input and AI-powered product recommendations.
            </Typography>
            <Button
              variant="contained"
              size="large"
              startIcon={<AddIcon />}
              component={NextLink}
              href="/proposals/create"
            >
              Create Your First Proposal
            </Button>
          </Box>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Proposal</TableCell>
                  <TableCell>Customer</TableCell>
                  <TableCell>Persona</TableCell>
                  <TableCell>Internal Status</TableCell>
                  <TableCell>Client Decision</TableCell>
                  <TableCell align="right">Amount</TableCell>
                  <TableCell>Created</TableCell>
                  <TableCell>Valid Until</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {safeProposals.map((proposal) => (
                  <TableRow 
                    key={proposal.id} 
                    hover 
                    sx={{ 
                      cursor: 'pointer',
                      '&:hover': {
                        backgroundColor: 'action.hover'
                      }
                    }}
                    onClick={() => {
                      if (proposal?.id) {
                        router.push(`/proposals/${proposal.id}`);
                      }
                    }}
                  >
                    <TableCell>
                      <Box>
                        <Typography variant="body2" fontWeight="medium">
                          {proposal?.name || 'Untitled Proposal'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {(proposal?.items?.length || 0)} items
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="body2">
                          {proposal?.customer ? 
                            `${proposal.customer.firstName || ''} ${proposal.customer.lastName || ''}`.trim() : 
                            (proposal?.prospectName || 'Unknown Prospect')
                          }
                        </Typography>
                        {(proposal?.customer?.company || proposal?.prospectCompany) && (
                          <Typography variant="caption" color="text.secondary">
                            {proposal?.customer?.company || proposal?.prospectCompany}
                          </Typography>
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {proposal?.customerPersona || 'Not specified'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={(proposal?.status || 'unknown').toUpperCase()}
                        color={getStatusColor(proposal?.status || 'default') as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {proposal?.clientStatus ? (
                        <Chip
                          label={proposal.clientStatus.toUpperCase().replace('-', ' ')}
                          color={getClientStatusColor(proposal.clientStatus) as any}
                          size="small"
                        />
                      ) : (
                        <Chip
                          label="PENDING"
                          color="default"
                          size="small"
                          variant="outlined"
                        />
                      )}
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2" fontWeight="medium">
                        {formatCurrency(proposal?.totalAmount || 0)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {proposal?.createdAt ? formatDate(proposal.createdAt) : 'Unknown'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {proposal?.validUntil ? (
                        <Typography variant="body2">
                          {formatDate(proposal.validUntil)}
                        </Typography>
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          No expiry
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell align="center">
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (proposal?.id) {
                            handleMenuOpen(e, proposal);
                          }
                        }}
                      >
                        <MoreVertIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      {/* Action Menu */}
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => {
          if (selectedProposal?.id) {
            router.push(`/proposals/${selectedProposal.id}`);
          }
          handleMenuClose();
        }}>
          <ViewIcon sx={{ mr: 1 }} fontSize="small" />
          View Details
        </MenuItem>
        <MenuItem onClick={() => {
          if (selectedProposal?.id) {
            router.push(`/proposals/edit/${selectedProposal.id}`);
          }
          handleMenuClose();
        }}>
          <EditIcon sx={{ mr: 1 }} fontSize="small" />
          Edit
        </MenuItem>
        <MenuItem onClick={() => {
          // TODO: Implement download functionality
          handleMenuClose();
        }}>
          <DownloadIcon sx={{ mr: 1 }} fontSize="small" />
          Download PDF
        </MenuItem>
        <MenuItem onClick={() => {
          // TODO: Implement delete functionality
          handleMenuClose();
        }}>
          <DeleteIcon sx={{ mr: 1 }} fontSize="small" />
          Delete
        </MenuItem>
      </Menu>

      {/* Floating Action Button */}
      <Fab
        color="primary"
        aria-label="add proposal"
        sx={{
          position: 'fixed',
          bottom: 16,
          right: 16,
        }}
        component={NextLink}
        href="/proposals/create"
      >
        <AddIcon />
      </Fab>
    </Container>
  );
} 