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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  Avatar,
  Fab,
  Snackbar,
} from '@mui/material';
import {
  Add as AddIcon,
  MoreVert as MoreVertIcon,
  Visibility as ViewIcon,
  Edit as EditIcon,
  PersonAdd as PersonAddIcon,
  Business as BusinessIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  TrendingUp as TrendingUpIcon,
  Assessment as AssessmentIcon,
  ContactPhone as ContactPhoneIcon,
  Close as CloseIcon,
  Save as SaveIcon,
} from '@mui/icons-material';
import NextLink from 'next/link';
import { useRouter } from 'next/router';
import { useApi } from '../../hooks/useApi';
import { getApiUrl } from '../../lib/api';

interface Prospect {
  id: string;
  name: string;
  description?: string;
  prospectName: string;
  prospectCompany?: string;
  prospectEmail: string;
  prospectPhone?: string;
  prospectStatus: 'prospect' | 'qualified' | 'approved' | 'converted_to_customer' | 'lost' | 'new' | 'contacted' | 'proposal_sent' | 'converted';
  customerPersona: string;
  status: string;
  totalAmount: number;
  leadSource?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  hasProposal?: boolean;
  proposalCount?: number;
}

interface NewProspectData {
  prospectName: string;
  prospectCompany: string;
  prospectEmail: string;
  prospectPhone: string;
  customerPersona: string;
  leadSource: string;
  notes: string;
}

export default function ProspectsPage() {
  const router = useRouter();
  const [prospects, setProspects] = useState<Prospect[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [selectedProspect, setSelectedProspect] = useState<Prospect | null>(null);
  const [addProspectDialogOpen, setAddProspectDialogOpen] = useState(false);
  const [newProspectData, setNewProspectData] = useState<NewProspectData>({
    prospectName: '',
    prospectCompany: '',
    prospectEmail: '',
    prospectPhone: '',
    customerPersona: 'homeowner',
    leadSource: 'website',
    notes: ''
  });

  // Fetch prospects from API
  useEffect(() => {
    const fetchProspects = async () => {
      try {
        setLoading(true);
        const response = await fetch(getApiUrl('/api/proposals?prospectOnly=true'));
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Fetched prospects:', data);
        
        // Transform proposals to prospect format
        const prospectsData = data.proposals.map((proposal: any) => ({
          id: proposal.id,
          name: proposal.name,
          description: proposal.description,
          prospectName: proposal.prospectName,
          prospectCompany: proposal.prospectCompany || 'Individual',
          prospectEmail: proposal.prospectEmail,
          prospectPhone: proposal.prospectPhone,
          prospectStatus: proposal.prospectStatus || 'prospect',
          customerPersona: proposal.customerPersona,
          status: proposal.status,
          totalAmount: proposal.totalAmount || 0,
          createdAt: proposal.createdAt,
          updatedAt: proposal.updatedAt,
          hasProposal: true,
          proposalCount: 1
        }));
        
        setProspects(prospectsData);
      } catch (err) {
        console.error('Error fetching prospects:', err);
        setError(err instanceof Error ? err.message : 'Failed to load prospects');
      } finally {
        setLoading(false);
      }
    };

    fetchProspects();
  }, []);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, prospect: Prospect) => {
    setMenuAnchor(event.currentTarget);
    setSelectedProspect(prospect);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
    setSelectedProspect(null);
  };

  const handleAddProspect = () => {
    setAddProspectDialogOpen(true);
  };

  const handleSaveProspect = () => {
    // TODO: Implement API call to save new prospect
    const newProspect: Prospect = {
      id: Math.random().toString(36).substr(2, 9),
      name: `New Prospect - ${newProspectData.prospectName}`,
      description: newProspectData.notes,
      ...newProspectData,
      prospectStatus: 'prospect',
      status: 'draft',
      totalAmount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      hasProposal: false,
      proposalCount: 0
    };
    
    setProspects(prev => [newProspect, ...prev]);
    setSuccess('New prospect added successfully!');
    setAddProspectDialogOpen(false);
    setNewProspectData({
      prospectName: '',
      prospectCompany: '',
      prospectEmail: '',
      prospectPhone: '',
      customerPersona: 'homeowner',
      leadSource: 'website',
      notes: ''
    });
  };

  const handleStatusUpdate = (prospectId: string, newStatus: Prospect['prospectStatus']) => {
    setProspects(prev => 
      prev.map(prospect => 
        prospect.id === prospectId 
          ? { ...prospect, prospectStatus: newStatus, updatedAt: new Date().toISOString() }
          : prospect
      )
    );
    setSuccess('Prospect status updated!');
    handleMenuClose();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getStatusColor = (status: Prospect['prospectStatus']) => {
    switch (status) {
      case 'prospect':
      case 'new': return 'info';
      case 'contacted': return 'primary';
      case 'qualified': return 'warning';
      case 'proposal_sent':
      case 'approved': return 'secondary';
      case 'converted':
      case 'converted_to_customer': return 'success';
      case 'lost': return 'error';
      default: return 'default';
    }
  };

  const getStatusLabel = (status: Prospect['prospectStatus']) => {
    switch (status) {
      case 'prospect':
      case 'new': return 'New Lead';
      case 'contacted': return 'Contacted';
      case 'qualified': return 'Qualified';
      case 'proposal_sent': return 'Proposal Sent';
      case 'approved': return 'Approved';
      case 'converted':
      case 'converted_to_customer': return 'Converted';
      case 'lost': return 'Lost';
      default: return String(status).toUpperCase();
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg">
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
          <CircularProgress size={60} />
          <Typography variant="h6" sx={{ ml: 2 }}>
            Loading prospects...
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
          <Link component={NextLink} href="/proposals" color="inherit">
            Smart Proposals
          </Link>
          <Typography color="text.primary">Prospects</Typography>
        </Breadcrumbs>
        
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography variant="h4" component="h1" gutterBottom>
              Prospect Management
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Manage leads and prospects in your sales pipeline. Create proposals after consultation.
            </Typography>
          </Box>
          
          <Button
            variant="contained"
            size="large"
            startIcon={<PersonAddIcon />}
            onClick={handleAddProspect}
          >
            Add New Prospect
          </Button>
        </Box>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Total Prospects
              </Typography>
              <Typography variant="h4">
                {prospects.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                New Leads
              </Typography>
              <Typography variant="h4">
                {prospects.filter(p => p.prospectStatus === 'prospect' || p.prospectStatus === 'new').length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Qualified
              </Typography>
              <Typography variant="h4">
                {prospects.filter(p => p.prospectStatus === 'qualified').length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Converted
              </Typography>
              <Typography variant="h4">
                {prospects.filter(p => p.prospectStatus === 'converted').length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Prospects Table */}
      <Paper>
        {prospects.length === 0 ? (
          <Box p={6} textAlign="center">
            <TrendingUpIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No prospects yet
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Add your first prospect to start building your sales pipeline.
            </Typography>
            <Button
              variant="contained"
              size="large"
              startIcon={<PersonAddIcon />}
              onClick={handleAddProspect}
            >
              Add First Prospect
            </Button>
          </Box>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Contact</TableCell>
                  <TableCell>Company</TableCell>
                  <TableCell>Customer Persona</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Lead Source</TableCell>
                  <TableCell>Proposals</TableCell>
                  <TableCell>Created</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {prospects.map((prospect) => (
                  <TableRow 
                    key={prospect.id} 
                    hover 
                    sx={{ 
                      cursor: 'pointer',
                      '&:hover': {
                        backgroundColor: 'action.hover'
                      }
                    }}
                    onClick={() => router.push(`/prospects/${prospect.id}`)}
                  >
                    <TableCell>
                      <Box display="flex" alignItems="center">
                        <Avatar sx={{ mr: 2, width: 32, height: 32 }}>
                          {prospect.prospectName.split(' ').map(n => n[0]).join('')}
                        </Avatar>
                        <Box>
                          <Typography variant="body2" fontWeight="medium">
                            {prospect.prospectName}
                          </Typography>
                          <Box display="flex" alignItems="center" sx={{ mt: 0.5 }}>
                            <EmailIcon sx={{ fontSize: 14, mr: 0.5, color: 'text.secondary' }} />
                            <Typography variant="caption" color="text.secondary">
                              {prospect.prospectEmail}
                            </Typography>
                          </Box>
                          {prospect.prospectPhone && (
                            <Box display="flex" alignItems="center">
                              <PhoneIcon sx={{ fontSize: 14, mr: 0.5, color: 'text.secondary' }} />
                              <Typography variant="caption" color="text.secondary">
                                {prospect.prospectPhone}
                              </Typography>
                            </Box>
                          )}
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box display="flex" alignItems="center">
                        <BusinessIcon sx={{ mr: 1, fontSize: 16, color: 'text.secondary' }} />
                        <Typography variant="body2">
                          {prospect.prospectCompany || 'Individual'}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={prospect.customerPersona.toUpperCase()}
                        size="small"
                        variant="outlined"
                        color={prospect.customerPersona.includes('business') || prospect.customerPersona.includes('office') ? 'primary' : 'secondary'}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={getStatusLabel(prospect.prospectStatus)}
                        color={getStatusColor(prospect.prospectStatus) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>
                        {prospect.leadSource || 'Unknown'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {prospect.proposalCount || 0} proposal{prospect.proposalCount !== 1 ? 's' : ''}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {formatDate(prospect.createdAt)}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMenuOpen(e, prospect);
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

      {/* Add Prospect Dialog */}
      <Dialog 
        open={addProspectDialogOpen} 
        onClose={() => setAddProspectDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Add New Prospect</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                label="Contact Name"
                fullWidth
                required
                value={newProspectData.prospectName}
                onChange={(e) => setNewProspectData(prev => ({ ...prev, prospectName: e.target.value }))}
                placeholder="John Smith"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Company/Organization"
                fullWidth
                value={newProspectData.prospectCompany}
                onChange={(e) => setNewProspectData(prev => ({ ...prev, prospectCompany: e.target.value }))}
                placeholder="Acme Corp (optional)"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Email Address"
                type="email"
                fullWidth
                required
                value={newProspectData.prospectEmail}
                onChange={(e) => setNewProspectData(prev => ({ ...prev, prospectEmail: e.target.value }))}
                placeholder="john@acmecorp.com"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Phone Number"
                fullWidth
                value={newProspectData.prospectPhone}
                onChange={(e) => setNewProspectData(prev => ({ ...prev, prospectPhone: e.target.value }))}
                placeholder="(555) 123-4567"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth required>
                <InputLabel>Customer Persona</InputLabel>
                <Select
                  value={newProspectData.customerPersona}
                  label="Customer Persona"
                  onChange={(e) => setNewProspectData(prev => ({ ...prev, customerPersona: e.target.value }))}
                >
                  <MenuItem value="homeowner">Homeowner</MenuItem>
                  <MenuItem value="interior_designer">Interior Designer</MenuItem>
                  <MenuItem value="builder">Builder</MenuItem>
                  <MenuItem value="architect">Architect</MenuItem>
                  <MenuItem value="business_owner">Business Owner</MenuItem>
                  <MenuItem value="cto_cio">CTO/CIO</MenuItem>
                  <MenuItem value="c_suite">C-Suite</MenuItem>
                  <MenuItem value="office_manager">Office Manager</MenuItem>
                  <MenuItem value="facilities_manager">Facilities Manager</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Lead Source</InputLabel>
                <Select
                  value={newProspectData.leadSource}
                  label="Lead Source"
                  onChange={(e) => setNewProspectData(prev => ({ ...prev, leadSource: e.target.value }))}
                >
                  <MenuItem value="website">Website</MenuItem>
                  <MenuItem value="referral">Referral</MenuItem>
                  <MenuItem value="advertising">Advertising</MenuItem>
                  <MenuItem value="social_media">Social Media</MenuItem>
                  <MenuItem value="trade_show">Trade Show</MenuItem>
                  <MenuItem value="cold_call">Cold Call</MenuItem>
                  <MenuItem value="other">Other</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Notes"
                fullWidth
                multiline
                rows={3}
                value={newProspectData.notes}
                onChange={(e) => setNewProspectData(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Initial conversation notes, requirements, etc."
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddProspectDialogOpen(false)} startIcon={<CloseIcon />}>
            Cancel
          </Button>
          <Button 
            onClick={handleSaveProspect} 
            variant="contained"
            startIcon={<SaveIcon />}
            disabled={!newProspectData.prospectName || !newProspectData.prospectEmail}
          >
            Add Prospect
          </Button>
        </DialogActions>
      </Dialog>

      {/* Action Menu */}
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => {
          if (selectedProspect) {
            router.push(`/prospects/${selectedProspect.id}`);
          }
          handleMenuClose();
        }}>
          <ViewIcon sx={{ mr: 1 }} fontSize="small" />
          View Details
        </MenuItem>
        <MenuItem onClick={() => handleStatusUpdate(selectedProspect?.id || '', 'contacted')}>
          <ContactPhoneIcon sx={{ mr: 1 }} fontSize="small" />
          Mark as Contacted
        </MenuItem>
        <MenuItem onClick={() => handleStatusUpdate(selectedProspect?.id || '', 'qualified')}>
          <TrendingUpIcon sx={{ mr: 1 }} fontSize="small" />
          Mark as Qualified
        </MenuItem>
        <MenuItem onClick={() => handleStatusUpdate(selectedProspect?.id || '', 'lost')}>
          <CloseIcon sx={{ mr: 1 }} fontSize="small" />
          Mark as Lost
        </MenuItem>
      </Menu>

      {/* Floating Action Button */}
      <Fab
        color="primary"
        aria-label="add prospect"
        sx={{
          position: 'fixed',
          bottom: 16,
          right: 16,
        }}
        onClick={handleAddProspect}
      >
        <PersonAddIcon />
      </Fab>

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
    </Container>
  );
} 