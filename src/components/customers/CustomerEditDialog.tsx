import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Box,
  Typography,
  Chip,
  Stack,
  Autocomplete,
} from '@mui/material';
import {
  Customer,
  CustomerType,
  CustomerStatus,
  CommunicationMethod,
  Address,
} from '../../types/customer';

interface CustomerEditDialogProps {
  open: boolean;
  customer?: Customer;
  onClose: () => void;
  onSave: (customer: Customer) => void;
}

const CUSTOMER_TYPES: CustomerType[] = ['residential', 'commercial', 'high-net-worth'];
const CUSTOMER_STATUSES: CustomerStatus[] = ['prospect', 'active', 'completed', 'inactive'];
const COMMUNICATION_METHODS: CommunicationMethod[] = ['email', 'phone', 'text', 'whatsapp'];
const COMMON_TAGS = [
  'VIP',
  'New Construction',
  'Renovation',
  'Maintenance',
  'Security',
  'Lighting',
  'Audio/Video',
  'Climate Control',
  'Networking',
];

export default function CustomerEditDialog({
  open,
  customer,
  onClose,
  onSave,
}: CustomerEditDialogProps) {
  const [formData, setFormData] = useState<Partial<Customer>>(
    customer || {
      type: 'residential',
      status: 'prospect',
      firstName: '',
      lastName: '',
      company: '',
      email: '',
      phone: '',
      preferredCommunication: 'email',
      billingAddress: {
        street: '',
        city: '',
        state: '',
        zipCode: '',
        country: 'USA',
      },
      properties: [],
      projects: [],
      interactions: [],
      tags: [],
      notes: '',
      metrics: {
        totalRevenue: 0,
        projectsCompleted: 0,
        avgResponseTime: 0,
      },
    }
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData as Customer);
  };

  const handleAddressChange = (field: keyof Address, value: string) => {
    setFormData((prev) => ({
      ...prev,
      billingAddress: {
        street: prev.billingAddress?.street || '',
        city: prev.billingAddress?.city || '',
        state: prev.billingAddress?.state || '',
        zipCode: prev.billingAddress?.zipCode || '',
        country: prev.billingAddress?.country || 'USA',
        [field]: value,
      },
    }));
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>
          {customer ? 'Edit Customer' : 'New Customer'}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            {/* Basic Information */}
            <Box>
              <Typography variant="subtitle1" gutterBottom>
                Basic Information
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Type</InputLabel>
                    <Select
                      value={formData.type}
                      label="Type"
                      onChange={(e) => setFormData({ ...formData, type: e.target.value as CustomerType })}
                    >
                      {CUSTOMER_TYPES.map((type) => (
                        <MenuItem key={type} value={type}>
                          {type.replace('-', ' ')}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Status</InputLabel>
                    <Select
                      value={formData.status}
                      label="Status"
                      onChange={(e) => setFormData({ ...formData, status: e.target.value as CustomerStatus })}
                    >
                      {CUSTOMER_STATUSES.map((status) => (
                        <MenuItem key={status} value={status}>
                          {status}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="First Name"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    fullWidth
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Last Name"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    fullWidth
                    required
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="Company"
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    fullWidth
                  />
                </Grid>
              </Grid>
            </Box>

            {/* Contact Information */}
            <Box>
              <Typography variant="subtitle1" gutterBottom>
                Contact Information
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    fullWidth
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    fullWidth
                    required
                  />
                </Grid>
                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <InputLabel>Preferred Communication</InputLabel>
                    <Select
                      value={formData.preferredCommunication}
                      label="Preferred Communication"
                      onChange={(e) => setFormData({ ...formData, preferredCommunication: e.target.value as CommunicationMethod })}
                    >
                      {COMMUNICATION_METHODS.map((method) => (
                        <MenuItem key={method} value={method}>
                          {method}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </Box>

            {/* Billing Address */}
            <Box>
              <Typography variant="subtitle1" gutterBottom>
                Billing Address
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    label="Street Address"
                    value={formData.billingAddress?.street}
                    onChange={(e) => handleAddressChange('street', e.target.value)}
                    fullWidth
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="City"
                    value={formData.billingAddress?.city}
                    onChange={(e) => handleAddressChange('city', e.target.value)}
                    fullWidth
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={3}>
                  <TextField
                    label="State"
                    value={formData.billingAddress?.state}
                    onChange={(e) => handleAddressChange('state', e.target.value)}
                    fullWidth
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={3}>
                  <TextField
                    label="ZIP Code"
                    value={formData.billingAddress?.zipCode}
                    onChange={(e) => handleAddressChange('zipCode', e.target.value)}
                    fullWidth
                    required
                  />
                </Grid>
              </Grid>
            </Box>

            {/* Tags */}
            <Box>
              <Typography variant="subtitle1" gutterBottom>
                Tags
              </Typography>
              <Autocomplete
                multiple
                options={COMMON_TAGS}
                value={formData.tags}
                onChange={(_, newValue) => setFormData({ ...formData, tags: newValue })}
                freeSolo
                renderTags={(value: readonly string[], getTagProps) =>
                  value.map((option: string, index: number) => (
                    <Chip
                      variant="outlined"
                      label={option}
                      {...getTagProps({ index })}
                    />
                  ))
                }
                renderInput={(params) => (
                  <TextField
                    {...params}
                    variant="outlined"
                    placeholder="Add tags..."
                  />
                )}
              />
            </Box>

            {/* Notes */}
            <Box>
              <Typography variant="subtitle1" gutterBottom>
                Notes
              </Typography>
              <TextField
                multiline
                rows={4}
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                fullWidth
                placeholder="Add any additional notes about the customer..."
              />
            </Box>
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