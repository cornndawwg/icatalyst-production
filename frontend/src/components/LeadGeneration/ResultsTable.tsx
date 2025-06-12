import { useState, Fragment } from 'react';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Checkbox,
  Button,
  Typography,
  Chip,
  Stack,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Divider,
} from '@mui/material';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import AddIcon from '@mui/icons-material/Add';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store';
import { addContactsToCampaign, Campaign } from '../../store/slices/campaignSlice';

interface Professional {
  id: string;
  name: string;
  company: string;
  title: string;
  email: string;
  phone: string;
  linkedIn?: string;
  projects: number;
  specialties: string[];
}

interface ResultsTableProps {
  results: Professional[];
}

export default function ResultsTable({ results }: ResultsTableProps) {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [selected, setSelected] = useState<string[]>([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [campaignDialogOpen, setCampaignDialogOpen] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [selectedCampaignId, setSelectedCampaignId] = useState<string | null>(null);

  const campaigns = useSelector((state: RootState) => 
    state.campaigns.campaigns.filter((c: Campaign) => c.status === 'draft' || c.status === 'scheduled')
  );

  const handleSelectAllClick = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      const newSelected = results.map((n) => n.id);
      setSelected(newSelected);
      return;
    }
    setSelected([]);
  };

  const handleClick = (id: string) => {
    const selectedIndex = selected.indexOf(id);
    let newSelected: string[] = [];

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, id);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1));
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selected.slice(0, selectedIndex),
        selected.slice(selectedIndex + 1),
      );
    }

    setSelected(newSelected);
  };

  const handleChangePage = (_: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleAddToCampaign = () => {
    setCampaignDialogOpen(true);
  };

  const handleCreateNewCampaign = () => {
    // Pass selected contacts through state navigation
    navigate('/campaigns/new', { 
      state: { selectedContacts: results.filter(r => selected.includes(r.id)) }
    });
    setCampaignDialogOpen(false);
  };

  const handleAddToExistingCampaign = (campaignId: string) => {
    setSelectedCampaignId(campaignId);
    setConfirmDialogOpen(true);
    setCampaignDialogOpen(false);
  };

  const handleConfirmAdd = () => {
    if (selectedCampaignId) {
      const selectedContacts = results
        .filter(r => selected.includes(r.id))
        .map(contact => ({
          ...contact,
          dateAdded: new Date().toISOString(),
        }));
      dispatch(addContactsToCampaign({
        campaignId: selectedCampaignId,
        contacts: selectedContacts,
      }));
      navigate(`/campaigns/${selectedCampaignId}`);
    }
    setConfirmDialogOpen(false);
  };

  const isSelected = (id: string) => selected.indexOf(id) !== -1;

  const selectedCampaign = selectedCampaignId ? 
    campaigns.find((c: Campaign) => c.id === selectedCampaignId) : null;

  return (
    <Box>
      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6" component="div">
          {results.length} Professionals Found
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleAddToCampaign}
          disabled={selected.length === 0}
        >
          Add {selected.length} to Campaign
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 750 }} aria-labelledby="tableTitle">
          <TableHead>
            <TableRow>
              <TableCell padding="checkbox">
                <Checkbox
                  color="primary"
                  indeterminate={selected.length > 0 && selected.length < results.length}
                  checked={results.length > 0 && selected.length === results.length}
                  onChange={handleSelectAllClick}
                  inputProps={{
                    'aria-label': 'select all professionals',
                  }}
                />
              </TableCell>
              <TableCell>Professional</TableCell>
              <TableCell>Company</TableCell>
              <TableCell>Specialties</TableCell>
              <TableCell>Projects</TableCell>
              <TableCell align="right">Contact</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {results
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((row) => {
                const isItemSelected = isSelected(row.id);

                return (
                  <TableRow
                    hover
                    onClick={() => handleClick(row.id)}
                    role="checkbox"
                    aria-checked={isItemSelected}
                    tabIndex={-1}
                    key={row.id}
                    selected={isItemSelected}
                    sx={{ cursor: 'pointer' }}
                  >
                    <TableCell padding="checkbox">
                      <Checkbox
                        color="primary"
                        checked={isItemSelected}
                      />
                    </TableCell>
                    <TableCell component="th" scope="row">
                      <Box>
                        <Typography variant="subtitle2">{row.name}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          {row.title}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>{row.company}</TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={1}>
                        {row.specialties.map((specialty, index) => (
                          <Chip
                            key={index}
                            label={specialty}
                            size="small"
                            variant="outlined"
                          />
                        ))}
                      </Stack>
                    </TableCell>
                    <TableCell>{row.projects}</TableCell>
                    <TableCell align="right">
                      <Stack direction="row" spacing={1} justifyContent="flex-end">
                        <Tooltip title="Send Email">
                          <IconButton size="small" onClick={(e) => e.stopPropagation()}>
                            <EmailIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Call">
                          <IconButton size="small" onClick={(e) => e.stopPropagation()}>
                            <PhoneIcon />
                          </IconButton>
                        </Tooltip>
                        {row.linkedIn && (
                          <Tooltip title="View LinkedIn">
                            <IconButton size="small" onClick={(e) => e.stopPropagation()}>
                              <LinkedInIcon />
                            </IconButton>
                          </Tooltip>
                        )}
                      </Stack>
                    </TableCell>
                  </TableRow>
                );
              })}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={results.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </TableContainer>

      {/* Campaign Selection Dialog */}
      <Dialog
        open={campaignDialogOpen}
        onClose={() => setCampaignDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Add to Campaign</DialogTitle>
        <DialogContent>
          {campaigns.length > 0 ? (
            <List>
              {campaigns.map((campaign: Campaign, index: number) => (
                <Fragment key={campaign.id}>
                  {index > 0 && <Divider />}
                  <ListItem>
                    <ListItemText
                      primary={campaign.name}
                      secondary={`${campaign.contacts.length} contacts • ${campaign.status}`}
                    />
                    <ListItemSecondaryAction>
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => handleAddToExistingCampaign(campaign.id)}
                      >
                        Add
                      </Button>
                    </ListItemSecondaryAction>
                  </ListItem>
                </Fragment>
              ))}
            </List>
          ) : (
            <Typography color="text.secondary" sx={{ py: 2, textAlign: 'center' }}>
              No active campaigns found
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCampaignDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" color="primary" onClick={handleCreateNewCampaign}>
            Create New Campaign
          </Button>
        </DialogActions>
      </Dialog>

      {/* Confirmation Dialog */}
      <Dialog
        open={confirmDialogOpen}
        onClose={() => setConfirmDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Confirm Add to Campaign</DialogTitle>
        <DialogContent>
          <Typography>
            Add {selected.length} contact{selected.length !== 1 ? 's' : ''} to{' '}
            <strong>{selectedCampaign?.name}</strong>?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" color="primary" onClick={handleConfirmAdd}>
            Add Contacts
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
} 
