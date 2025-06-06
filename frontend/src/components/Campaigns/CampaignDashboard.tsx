import { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Button,
  Stack,
  Tooltip,
  Link,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Snackbar,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import DeleteIcon from '@mui/icons-material/Delete';
import BarChartIcon from '@mui/icons-material/BarChart';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store';
import { deleteCampaign, duplicateCampaign, clearLastAction, Campaign } from '../../store/slices/campaignSlice';

const getStatusColor = (status: string) => {
  switch (status) {
    case 'active':
      return 'success';
    case 'scheduled':
      return 'warning';
    case 'completed':
      return 'default';
    default:
      return 'primary';
  }
};

export default function CampaignDashboard() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const campaigns = useSelector((state: RootState) => state.campaigns.campaigns);
  const lastAction = useSelector((state: RootState) => state.campaigns.lastAction);
  
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [campaignToDelete, setCampaignToDelete] = useState<Campaign | null>(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  useEffect(() => {
    if (lastAction.type && lastAction.campaignName) {
      const messages = {
        create: `Campaign "${lastAction.campaignName}" created successfully`,
        update: `Campaign "${lastAction.campaignName}" updated successfully`,
        delete: `Campaign "${lastAction.campaignName}" deleted successfully`,
        duplicate: `Campaign "${lastAction.campaignName}" created from duplicate`,
      };
      setSnackbarMessage(messages[lastAction.type]);
      setSnackbarOpen(true);
      dispatch(clearLastAction());
    }
  }, [lastAction, dispatch]);

  const handleEditCampaign = (campaignId: string) => {
    navigate(`/campaigns/${campaignId}/edit`);
  };

  const handleDuplicateCampaign = (campaignId: string) => {
    dispatch(duplicateCampaign(campaignId));
  };

  const handleDeleteClick = (campaign: Campaign) => {
    setCampaignToDelete(campaign);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (campaignToDelete) {
      dispatch(deleteCampaign(campaignToDelete.id));
      setDeleteDialogOpen(false);
      setCampaignToDelete(null);
    }
  };

  const handleViewStats = (campaignId: string) => {
    navigate(`/campaigns/${campaignId}`);
  };

  const handleCreateCampaign = () => {
    navigate('/campaigns/new');
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h4" component="h1">
            Email Campaigns
          </Typography>
          <Button variant="contained" color="primary" onClick={handleCreateCampaign}>
            Create New Campaign
          </Button>
        </Box>

        {/* Campaign Statistics Overview */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {[
            { label: 'Active Campaigns', value: campaigns.filter(c => c.status === 'active').length },
            { label: 'Total Recipients', value: campaigns.reduce((acc, c) => acc + c.contacts.length, 0) },
            { label: 'Total Opens', value: campaigns.reduce((acc, c) => acc + c.stats.opened, 0) },
            { label: 'Average Open Rate', value: `${Math.round((campaigns.reduce((acc, c) => acc + (c.stats.opened / c.stats.sent * 100), 0) / campaigns.length))}%` },
          ].map((stat) => (
            <Grid item xs={12} sm={6} md={3} key={stat.label}>
              <Paper sx={{ p: 3, textAlign: 'center' }}>
                <Typography variant="h4" component="div" gutterBottom>
                  {stat.value}
                </Typography>
                <Typography variant="subtitle1" color="text.secondary">
                  {stat.label}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>

        {/* Campaigns Table */}
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Campaign Name</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Recipients</TableCell>
                <TableCell>Performance</TableCell>
                <TableCell>Scheduled</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {campaigns.map((campaign) => (
                <TableRow key={campaign.id} hover>
                  <TableCell>
                    <Link
                      component={RouterLink}
                      to={`/campaigns/${campaign.id}`}
                      color="inherit"
                      underline="hover"
                      sx={{ cursor: 'pointer' }}
                    >
                      <Typography variant="subtitle2">{campaign.name}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {campaign.subject}
                      </Typography>
                    </Link>
                  </TableCell>
                  <TableCell>{campaign.type}</TableCell>
                  <TableCell>
                    <Chip
                      label={campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
                      color={getStatusColor(campaign.status) as any}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {campaign.contacts.length} contacts
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={1}>
                      <Chip
                        label={`${Math.round(campaign.stats.opened / campaign.stats.sent * 100)}% Open`}
                        size="small"
                        variant="outlined"
                      />
                      <Chip
                        label={`${Math.round(campaign.stats.clicked / campaign.stats.sent * 100)}% Click`}
                        size="small"
                        variant="outlined"
                      />
                    </Stack>
                  </TableCell>
                  <TableCell>
                    {campaign.scheduledDate ? new Date(campaign.scheduledDate).toLocaleDateString() : '-'}
                  </TableCell>
                  <TableCell align="right">
                    <Stack direction="row" spacing={1} justifyContent="flex-end">
                      <Tooltip title="View Statistics">
                        <IconButton size="small" onClick={() => handleViewStats(campaign.id)}>
                          <BarChartIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Edit Campaign">
                        <IconButton size="small" onClick={() => handleEditCampaign(campaign.id)}>
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Duplicate Campaign">
                        <IconButton size="small" onClick={() => handleDuplicateCampaign(campaign.id)}>
                          <ContentCopyIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete Campaign">
                        <IconButton 
                          size="small" 
                          onClick={() => handleDeleteClick(campaign)}
                          color="error"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
              {campaigns.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    <Typography color="text.secondary" sx={{ py: 3 }}>
                      No campaigns found. Create your first campaign to get started.
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Delete Campaign</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete "{campaignToDelete?.name}"? This will remove all contacts and cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button 
            variant="contained" 
            color="error" 
            onClick={handleConfirmDelete}
          >
            Delete Campaign
          </Button>
        </DialogActions>
      </Dialog>

      {/* Success/Error Snackbar */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleSnackbarClose} 
          severity="success" 
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
} 
