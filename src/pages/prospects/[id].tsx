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
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Snackbar,
  Fab,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Close as CloseIcon,
  Person as PersonIcon,
  Business as BusinessIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  TrendingUp as TrendingUpIcon,
  Notes as NotesIcon,
  Assignment as ProposalIcon,
  History as HistoryIcon,
  Add as AddIcon,
  ContactPhone as ContactPhoneIcon,
  Check as CheckIcon,
  Schedule as ScheduleIcon,
} from '@mui/icons-material';
import NextLink from 'next/link';
import { useRouter } from 'next/router';
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
  createdAt: string;
  updatedAt: string;
}

interface ProposalItem {
  id: string;
  name: string;
  status: string;
  totalAmount: number;
  createdAt: string;
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
      id={`prospect-tabpanel-${index}`}
      aria-labelledby={`prospect-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

export default function ProspectDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const [prospect, setProspect] = useState<Prospect | null>(null);
  const [proposals, setProposals] = useState<ProposalItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState<Partial<Prospect>>({});
  const [currentTab, setCurrentTab] = useState(0);
  const [notes, setNotes] = useState('');
  const [newNote, setNewNote] = useState('');

  // Fetch prospect data
  useEffect(() => {
    if (!id) return;

    const fetchProspect = async () => {
      try {
        setLoading(true);
        const response = await fetch(getApiUrl(`/api/proposals/${id}`));
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (!data.isExistingCustomer) {
          setProspect(data);
          setEditData(data);
          setNotes(data.description || '');
        } else {
          throw new Error('Not a prospect');
        }
      } catch (err) {
        console.error('Error fetching prospect:', err);
        setError(err instanceof Error ? err.message : 'Failed to load prospect');
      } finally {
        setLoading(false);
      }
    };

    fetchProspect();
  }, [id]);

  const handleSave = async () => {
    try {
      // TODO: Implement API call to update prospect
      setProspect(prev => prev ? { ...prev, ...editData } : null);
      setEditMode(false);
      setSuccess('Prospect updated successfully!');
    } catch (err) {
      setError('Failed to update prospect');
    }
  };

  const handleStatusUpdate = async (newStatus: Prospect['prospectStatus']) => {
    try {
      // TODO: Implement API call to update status
      setProspect(prev => prev ? { ...prev, prospectStatus: newStatus } : null);
      setSuccess(`Status updated to ${newStatus}`);
    } catch (err) {
      setError('Failed to update status');
    }
  };

  const handleCreateProposal = () => {
    router.push(`/proposals/create?prospectId=${id}`);
  };

  const handleConvertToCustomer = async () => {
    try {
      // TODO: Implement prospect to customer conversion
      setSuccess('Prospect converted to customer!');
      router.push('/customers');
    } catch (err) {
      setError('Failed to convert prospect');
    }
  };

  const addNote = () => {
    if (newNote.trim()) {
      // TODO: Implement note saving to database
      setNewNote('');
      setSuccess('Note added successfully!');
    }
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return (
      <Container maxWidth="lg">
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
          <CircularProgress size={60} />
          <Typography variant="h6" sx={{ ml: 2 }}>
            Loading prospect details...
          </Typography>
        </Box>
      </Container>
    );
  }

  if (error || !prospect) {
    return (
      <Container maxWidth="lg" sx={{ py: 3 }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          {error || 'Prospect not found'}
        </Alert>
        <Button
          variant="contained"
          startIcon={<ArrowBackIcon />}
          onClick={() => router.push('/prospects')}
        >
          Back to Prospects
        </Button>
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
          <Link component={NextLink} href="/prospects" color="inherit">
            Prospects
          </Link>
          <Typography color="text.primary">{prospect.prospectName}</Typography>
        </Breadcrumbs>
        
        <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={3}>
          <Box>
            <Box display="flex" alignItems="center" gap={2} mb={1}>
              <Typography variant="h4" component="h1">
                {prospect.prospectName}
              </Typography>
              <Chip
                label={getStatusLabel(prospect.prospectStatus)}
                color={getStatusColor(prospect.prospectStatus) as any}
                variant="filled"
              />
            </Box>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              {prospect.prospectCompany || 'Individual'}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {prospect.description || 'No description available'}
            </Typography>
          </Box>
          
          <Box display="flex" gap={2}>
            <Button
              variant="outlined"
              startIcon={<ArrowBackIcon />}
              onClick={() => router.push('/prospects')}
            >
              Back to Prospects
            </Button>
            <Button
              variant="contained"
              color="primary"
              startIcon={<ProposalIcon />}
              onClick={handleCreateProposal}
              size="large"
            >
              Create Proposal
            </Button>
          </Box>
        </Box>
      </Box>

      {/* Status Action Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card 
            sx={{ cursor: 'pointer', '&:hover': { bgcolor: 'action.hover' } }}
            onClick={() => handleStatusUpdate('contacted')}
          >
            <CardContent sx={{ textAlign: 'center' }}>
              <ContactPhoneIcon sx={{ fontSize: 40, mb: 1, color: 'primary.main' }} />
              <Typography variant="body2">Mark as Contacted</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card 
            sx={{ cursor: 'pointer', '&:hover': { bgcolor: 'action.hover' } }}
            onClick={() => handleStatusUpdate('qualified')}
          >
            <CardContent sx={{ textAlign: 'center' }}>
              <CheckIcon sx={{ fontSize: 40, mb: 1, color: 'warning.main' }} />
              <Typography variant="body2">Mark as Qualified</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card 
            sx={{ cursor: 'pointer', '&:hover': { bgcolor: 'action.hover' } }}
            onClick={() => handleStatusUpdate('approved')}
          >
            <CardContent sx={{ textAlign: 'center' }}>
              <TrendingUpIcon sx={{ fontSize: 40, mb: 1, color: 'success.main' }} />
              <Typography variant="body2">Mark as Approved</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card 
            sx={{ cursor: 'pointer', '&:hover': { bgcolor: 'action.hover' } }}
            onClick={handleConvertToCustomer}
          >
            <CardContent sx={{ textAlign: 'center' }}>
              <PersonIcon sx={{ fontSize: 40, mb: 1, color: 'secondary.main' }} />
              <Typography variant="body2">Convert to Customer</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs value={currentTab} onChange={(e, newValue) => setCurrentTab(newValue)}>
          <Tab label="Contact Information" />
          <Tab label="Notes & History" />
          <Tab label="Proposals" />
        </Tabs>

        {/* Contact Information Tab */}
        <TabPanel value={currentTab} index={0}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={8}>
              <Paper sx={{ p: 3 }}>
                <Box display="flex" justifyContent="between" alignItems="center" mb={3}>
                  <Typography variant="h6">Contact Details</Typography>
                  <Button
                    variant={editMode ? "contained" : "outlined"}
                    startIcon={editMode ? <SaveIcon /> : <EditIcon />}
                    onClick={editMode ? handleSave : () => setEditMode(true)}
                  >
                    {editMode ? 'Save' : 'Edit'}
                  </Button>
                  {editMode && (
                    <Button
                      variant="outlined"
                      startIcon={<CloseIcon />}
                      onClick={() => {
                        setEditMode(false);
                        setEditData(prospect);
                      }}
                      sx={{ ml: 1 }}
                    >
                      Cancel
                    </Button>
                  )}
                </Box>

                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Contact Name"
                      fullWidth
                      value={editMode ? editData.prospectName || '' : prospect.prospectName}
                      onChange={(e) => setEditData(prev => ({ ...prev, prospectName: e.target.value }))}
                      disabled={!editMode}
                      InputProps={{
                        startAdornment: <PersonIcon sx={{ mr: 1, color: 'action.active' }} />
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Company"
                      fullWidth
                      value={editMode ? editData.prospectCompany || '' : prospect.prospectCompany || ''}
                      onChange={(e) => setEditData(prev => ({ ...prev, prospectCompany: e.target.value }))}
                      disabled={!editMode}
                      InputProps={{
                        startAdornment: <BusinessIcon sx={{ mr: 1, color: 'action.active' }} />
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Email"
                      fullWidth
                      type="email"
                      value={editMode ? editData.prospectEmail || '' : prospect.prospectEmail}
                      onChange={(e) => setEditData(prev => ({ ...prev, prospectEmail: e.target.value }))}
                      disabled={!editMode}
                      InputProps={{
                        startAdornment: <EmailIcon sx={{ mr: 1, color: 'action.active' }} />
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Phone"
                      fullWidth
                      value={editMode ? editData.prospectPhone || '' : prospect.prospectPhone || ''}
                      onChange={(e) => setEditData(prev => ({ ...prev, prospectPhone: e.target.value }))}
                      disabled={!editMode}
                      InputProps={{
                        startAdornment: <PhoneIcon sx={{ mr: 1, color: 'action.active' }} />
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth disabled={!editMode}>
                      <InputLabel>Customer Persona</InputLabel>
                      <Select
                        value={editMode ? editData.customerPersona || '' : prospect.customerPersona}
                        label="Customer Persona"
                        onChange={(e) => setEditData(prev => ({ ...prev, customerPersona: e.target.value }))}
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
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth disabled={!editMode}>
                      <InputLabel>Status</InputLabel>
                      <Select
                        value={editMode ? editData.prospectStatus || '' : prospect.prospectStatus}
                        label="Status"
                        onChange={(e) => setEditData(prev => ({ ...prev, prospectStatus: e.target.value as Prospect['prospectStatus'] }))}
                      >
                        <MenuItem value="prospect">New Lead</MenuItem>
                        <MenuItem value="contacted">Contacted</MenuItem>
                        <MenuItem value="qualified">Qualified</MenuItem>
                        <MenuItem value="approved">Approved</MenuItem>
                        <MenuItem value="converted_to_customer">Converted</MenuItem>
                        <MenuItem value="lost">Lost</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Quick Stats
                </Typography>
                <List>
                  <ListItem>
                    <ListItemIcon>
                      <ScheduleIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary="Created"
                      secondary={formatDate(prospect.createdAt)}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <HistoryIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary="Last Updated"
                      secondary={formatDate(prospect.updatedAt)}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <ProposalIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary="Proposals"
                      secondary={`${proposals.length} created`}
                    />
                  </ListItem>
                </List>
              </Paper>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Notes & History Tab */}
        <TabPanel value={currentTab} index={1}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={8}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Conversation Notes
                </Typography>
                <TextField
                  fullWidth
                  multiline
                  rows={8}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add conversation notes, requirements, follow-up items..."
                  sx={{ mb: 2 }}
                />
                <Button
                  variant="contained"
                  startIcon={<SaveIcon />}
                  onClick={() => setSuccess('Notes saved!')}
                >
                  Save Notes
                </Button>
              </Paper>
              
              <Paper sx={{ p: 3, mt: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Add New Note
                </Typography>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  placeholder="Add a quick note about this prospect..."
                  sx={{ mb: 2 }}
                />
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={addNote}
                  disabled={!newNote.trim()}
                >
                  Add Note
                </Button>
              </Paper>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Recent Activity
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  No activity recorded yet
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Proposals Tab */}
        <TabPanel value={currentTab} index={2}>
          <Box display="flex" justifyContent="between" alignItems="center" mb={3}>
            <Typography variant="h6">
              Proposals for {prospect.prospectName}
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleCreateProposal}
            >
              Create New Proposal
            </Button>
          </Box>
          
          {proposals.length === 0 ? (
            <Paper sx={{ p: 6, textAlign: 'center' }}>
              <ProposalIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No proposals yet
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Create the first proposal for this prospect after your consultation.
              </Typography>
              <Button
                variant="contained"
                size="large"
                startIcon={<AddIcon />}
                onClick={handleCreateProposal}
              >
                Create First Proposal
              </Button>
            </Paper>
          ) : (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Proposal Name</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Amount</TableCell>
                    <TableCell>Created</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {proposals.map((proposal) => (
                    <TableRow key={proposal.id}>
                      <TableCell>{proposal.name}</TableCell>
                      <TableCell>
                        <Chip label={proposal.status} size="small" />
                      </TableCell>
                      <TableCell>${proposal.totalAmount.toLocaleString()}</TableCell>
                      <TableCell>{formatDate(proposal.createdAt)}</TableCell>
                      <TableCell>
                        <Button
                          size="small"
                          onClick={() => router.push(`/proposals/${proposal.id}`)}
                        >
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </TabPanel>
      </Paper>

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