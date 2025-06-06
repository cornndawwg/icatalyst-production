import React, { useState } from 'react';
import {
  Box,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  IconButton,
  Typography,
  Chip,
  Button,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  Stack,
} from '@mui/material';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';
import MeetingRoomIcon from '@mui/icons-material/MeetingRoom';
import HomeIcon from '@mui/icons-material/Home';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { CustomerInteraction, InteractionType } from '../../types/customer';

interface InteractionListProps {
  interactions: CustomerInteraction[];
  onAdd: (interaction: Omit<CustomerInteraction, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'>) => void;
  onEdit: (interaction: CustomerInteraction) => void;
  onDelete: (interaction: CustomerInteraction) => void;
}

interface InteractionDialogProps {
  open: boolean;
  interaction?: CustomerInteraction;
  onClose: () => void;
  onSave: (interaction: Omit<CustomerInteraction, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'>) => void;
}

function InteractionDialog({ open, interaction, onClose, onSave }: InteractionDialogProps) {
  const [formData, setFormData] = useState<Partial<CustomerInteraction>>({
    type: interaction?.type || 'call',
    date: interaction?.date || new Date().toISOString().split('T')[0],
    summary: interaction?.summary || '',
    details: interaction?.details || '',
    followUpDate: interaction?.followUpDate,
    followUpNotes: interaction?.followUpNotes,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData as Omit<CustomerInteraction, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'>);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>
          {interaction ? 'Edit Interaction' : 'New Interaction'}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <FormControl fullWidth>
              <InputLabel>Type</InputLabel>
              <Select
                value={formData.type}
                label="Type"
                onChange={(e) => setFormData({ ...formData, type: e.target.value as InteractionType })}
              >
                <MenuItem value="call">Call</MenuItem>
                <MenuItem value="email">Email</MenuItem>
                <MenuItem value="meeting">Meeting</MenuItem>
                <MenuItem value="site-visit">Site Visit</MenuItem>
                <MenuItem value="other">Other</MenuItem>
              </Select>
            </FormControl>

            <TextField
              label="Date"
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              InputLabelProps={{ shrink: true }}
              fullWidth
            />

            <TextField
              label="Summary"
              value={formData.summary}
              onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
              fullWidth
            />

            <TextField
              label="Details"
              value={formData.details}
              onChange={(e) => setFormData({ ...formData, details: e.target.value })}
              multiline
              rows={4}
              fullWidth
            />

            <TextField
              label="Follow-up Date"
              type="date"
              value={formData.followUpDate}
              onChange={(e) => setFormData({ ...formData, followUpDate: e.target.value })}
              InputLabelProps={{ shrink: true }}
              fullWidth
            />

            <TextField
              label="Follow-up Notes"
              value={formData.followUpNotes}
              onChange={(e) => setFormData({ ...formData, followUpNotes: e.target.value })}
              multiline
              rows={2}
              fullWidth
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="contained">
            Save
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}

export default function InteractionList({
  interactions,
  onAdd,
  onEdit,
  onDelete,
}: InteractionListProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedInteraction, setSelectedInteraction] = useState<CustomerInteraction | undefined>();
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>, interaction: CustomerInteraction) => {
    setMenuAnchorEl(event.currentTarget);
    setSelectedInteraction(interaction);
  };

  const handleMenuClose = () => {
    setMenuAnchorEl(null);
    setSelectedInteraction(undefined);
  };

  const handleAction = (action: 'edit' | 'delete') => {
    if (!selectedInteraction) return;

    if (action === 'edit') {
      setDialogOpen(true);
    } else {
      onDelete(selectedInteraction);
    }

    handleMenuClose();
  };

  const getInteractionIcon = (type: InteractionType) => {
    switch (type) {
      case 'call':
        return <PhoneIcon />;
      case 'email':
        return <EmailIcon />;
      case 'meeting':
        return <MeetingRoomIcon />;
      case 'site-visit':
        return <HomeIcon />;
      default:
        return null;
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">Interactions</Typography>
        <Button
          startIcon={<AddIcon />}
          onClick={() => {
            setSelectedInteraction(undefined);
            setDialogOpen(true);
          }}
        >
          Add Interaction
        </Button>
      </Box>

      <List>
        {interactions.map((interaction) => (
          <ListItem
            key={interaction.id}
            sx={{
              bgcolor: 'background.paper',
              mb: 1,
              borderRadius: 1,
              border: '1px solid',
              borderColor: 'divider',
            }}
          >
            <ListItemIcon>
              {getInteractionIcon(interaction.type)}
            </ListItemIcon>
            <ListItemText
              primary={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="subtitle2">
                    {interaction.summary}
                  </Typography>
                  <Chip
                    label={interaction.type}
                    size="small"
                    variant="outlined"
                  />
                </Box>
              }
              secondary={
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    {interaction.details}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
                    <Typography variant="caption" color="text.secondary">
                      Date: {formatDate(interaction.date)}
                    </Typography>
                    {interaction.followUpDate && (
                      <Typography variant="caption" color="text.secondary">
                        Follow-up: {formatDate(interaction.followUpDate)}
                      </Typography>
                    )}
                  </Box>
                </Box>
              }
            />
            <ListItemSecondaryAction>
              <IconButton
                edge="end"
                onClick={(e) => handleMenuClick(e, interaction)}
              >
                <MoreVertIcon />
              </IconButton>
            </ListItemSecondaryAction>
          </ListItem>
        ))}
      </List>

      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => handleAction('edit')}>
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Edit</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleAction('delete')}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Delete</ListItemText>
        </MenuItem>
      </Menu>

      <InteractionDialog
        open={dialogOpen}
        interaction={selectedInteraction}
        onClose={() => {
          setDialogOpen(false);
          setSelectedInteraction(undefined);
        }}
        onSave={(data) => {
          if (selectedInteraction) {
            onEdit({ ...selectedInteraction, ...data });
          } else {
            onAdd(data);
          }
          setDialogOpen(false);
          setSelectedInteraction(undefined);
        }}
      />
    </Box>
  );
} 