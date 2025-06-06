import { useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
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
  Breadcrumbs,
  Link,
  Alert,
  Grid,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import { useParams, useNavigate, Link as RouterLink } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store';
import {
  selectCampaign,
  removeContactFromCampaign,
  clearRecentlyAddedContacts,
} from '../../store/slices/campaignSlice';

export default function CampaignDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const campaign = useSelector((state: RootState) => 
    state.campaigns.campaigns.find((c) => c.id === id)
  );
  const recentlyAddedContacts = useSelector((state: RootState) => 
    state.campaigns.recentlyAddedContacts
  );

  useEffect(() => {
    if (id) {
      dispatch(selectCampaign(id));
    }
  }, [id, dispatch]);

  useEffect(() => {
    // Clear recently added contacts after 5 seconds
    if (recentlyAddedContacts.length > 0) {
      const timer = setTimeout(() => {
        dispatch(clearRecentlyAddedContacts());
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [recentlyAddedContacts, dispatch]);

  const handleRemoveContact = (contactId: string) => {
    if (campaign) {
      dispatch(removeContactFromCampaign({ campaignId: campaign.id, contactId }));
    }
  };

  if (!campaign) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ py: 4 }}>
          <Typography>Campaign not found</Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        {/* Breadcrumbs */}
        <Breadcrumbs 
          separator={<NavigateNextIcon fontSize="small" />}
          sx={{ mb: 3 }}
        >
          <Link
            component={RouterLink}
            to="/campaigns"
            color="inherit"
            underline="hover"
          >
            Campaigns
          </Link>
          <Typography color="text.primary">{campaign.name}</Typography>
        </Breadcrumbs>

        {/* Campaign Header */}
        <Box sx={{ mb: 4 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h4" component="h1">
              {campaign.name}
            </Typography>
            <Button
              variant="contained"
              onClick={() => navigate(`/campaigns/${campaign.id}/edit`)}
            >
              Edit Campaign
            </Button>
          </Stack>
          <Stack direction="row" spacing={2} alignItems="center">
            <Chip
              label={campaign.type.charAt(0).toUpperCase() + campaign.type.slice(1)}
              color="primary"
              variant="outlined"
            />
            <Chip
              label={campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
              color={
                campaign.status === 'active' ? 'success' :
                campaign.status === 'scheduled' ? 'warning' :
                campaign.status === 'completed' ? 'default' : 'primary'
              }
            />
            <Typography variant="body2" color="text.secondary">
              Created {new Date(campaign.createdAt).toLocaleDateString()}
            </Typography>
          </Stack>
        </Box>

        {/* Recently Added Contacts Alert */}
        {recentlyAddedContacts.length > 0 && (
          <Alert 
            severity="success" 
            sx={{ mb: 3 }}
            onClose={() => dispatch(clearRecentlyAddedContacts())}
          >
            Successfully added {recentlyAddedContacts.length} contacts to this campaign
          </Alert>
        )}

        {/* Campaign Stats */}
        <Paper sx={{ p: 3, mb: 4 }}>
          <Typography variant="h6" gutterBottom>Campaign Overview</Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={3}>
              <Typography variant="subtitle2" color="text.secondary">
                Total Contacts
              </Typography>
              <Typography variant="h4">
                {campaign.contacts.length}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Typography variant="subtitle2" color="text.secondary">
                Emails Sent
              </Typography>
              <Typography variant="h4">
                {campaign.stats.sent}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Typography variant="subtitle2" color="text.secondary">
                Open Rate
              </Typography>
              <Typography variant="h4">
                {campaign.stats.sent ? 
                  `${Math.round((campaign.stats.opened / campaign.stats.sent) * 100)}%` :
                  '0%'
                }
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Typography variant="subtitle2" color="text.secondary">
                Click Rate
              </Typography>
              <Typography variant="h4">
                {campaign.stats.sent ?
                  `${Math.round((campaign.stats.clicked / campaign.stats.sent) * 100)}%` :
                  '0%'
                }
              </Typography>
            </Grid>
          </Grid>
        </Paper>

        {/* Contacts Table */}
        <Paper>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Contact</TableCell>
                  <TableCell>Company</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Phone</TableCell>
                  <TableCell>Date Added</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {campaign.contacts.map((contact) => (
                  <TableRow
                    key={contact.id}
                    sx={{
                      backgroundColor: recentlyAddedContacts.some(c => c.id === contact.id)
                        ? 'success.light'
                        : 'inherit',
                    }}
                  >
                    <TableCell>
                      <Box>
                        <Typography variant="subtitle2">{contact.name}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          {contact.title}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>{contact.company}</TableCell>
                    <TableCell>{contact.email}</TableCell>
                    <TableCell>{contact.phone}</TableCell>
                    <TableCell>
                      {new Date(contact.dateAdded).toLocaleDateString()}
                    </TableCell>
                    <TableCell align="right">
                      <IconButton
                        size="small"
                        onClick={() => handleRemoveContact(contact.id)}
                        color="error"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
                {campaign.contacts.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      <Typography color="text.secondary" sx={{ py: 3 }}>
                        No contacts in this campaign yet
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </Box>
    </Container>
  );
} 
