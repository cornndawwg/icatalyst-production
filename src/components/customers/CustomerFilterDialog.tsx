import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Box,
  Typography,
  TextField,
  SelectChangeEvent,
  OutlinedInput,
} from '@mui/material';
import { CustomerType, CustomerStatus, CustomerFilters } from '../../types/customer';

interface CustomerFilterDialogProps {
  open: boolean;
  filters: CustomerFilters;
  onClose: () => void;
  onApply: (filters: CustomerFilters) => void;
}

const CUSTOMER_TYPES: CustomerType[] = ['residential', 'commercial', 'high-net-worth'];
const CUSTOMER_STATUSES: CustomerStatus[] = ['prospect', 'active', 'completed', 'inactive'];
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

export default function CustomerFilterDialog({
  open,
  filters,
  onClose,
  onApply,
}: CustomerFilterDialogProps) {
  const [localFilters, setLocalFilters] = useState<CustomerFilters>(filters);

  const handleTypeChange = (event: SelectChangeEvent<CustomerType[]>) => {
    const value = event.target.value as CustomerType[];
    setLocalFilters((prev) => ({ ...prev, type: value }));
  };

  const handleStatusChange = (event: SelectChangeEvent<CustomerStatus[]>) => {
    const value = event.target.value as CustomerStatus[];
    setLocalFilters((prev) => ({ ...prev, status: value }));
  };

  const handleTagChange = (event: SelectChangeEvent<string[]>) => {
    const value = event.target.value as string[];
    setLocalFilters((prev) => ({ ...prev, tags: value }));
  };

  const handleDateRangeChange = (field: 'start' | 'end', value: string) => {
    setLocalFilters((prev) => ({
      ...prev,
      dateRange: {
        start: prev.dateRange?.start || '',
        end: prev.dateRange?.end || '',
        [field]: value,
      },
    }));
  };

  const handleApply = () => {
    onApply(localFilters);
  };

  const handleClear = () => {
    const emptyFilters: CustomerFilters = {};
    setLocalFilters(emptyFilters);
    onApply(emptyFilters);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Filter Customers</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
          {/* Customer Type Filter */}
          <FormControl>
            <InputLabel id="customer-type-label">Customer Type</InputLabel>
            <Select
              labelId="customer-type-label"
              multiple
              value={localFilters.type || []}
              onChange={handleTypeChange}
              input={<OutlinedInput label="Customer Type" />}
              renderValue={(selected) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {selected.map((value) => (
                    <Chip
                      key={value}
                      label={value.replace('-', ' ')}
                      size="small"
                    />
                  ))}
                </Box>
              )}
            >
              {CUSTOMER_TYPES.map((type) => (
                <MenuItem key={type} value={type}>
                  {type.replace('-', ' ')}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Customer Status Filter */}
          <FormControl>
            <InputLabel id="customer-status-label">Status</InputLabel>
            <Select
              labelId="customer-status-label"
              multiple
              value={localFilters.status || []}
              onChange={handleStatusChange}
              input={<OutlinedInput label="Status" />}
              renderValue={(selected) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {selected.map((value) => (
                    <Chip key={value} label={value} size="small" />
                  ))}
                </Box>
              )}
            >
              {CUSTOMER_STATUSES.map((status) => (
                <MenuItem key={status} value={status}>
                  {status}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Tags Filter */}
          <FormControl>
            <InputLabel id="customer-tags-label">Tags</InputLabel>
            <Select
              labelId="customer-tags-label"
              multiple
              value={localFilters.tags || []}
              onChange={handleTagChange}
              input={<OutlinedInput label="Tags" />}
              renderValue={(selected) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {selected.map((value) => (
                    <Chip key={value} label={value} size="small" />
                  ))}
                </Box>
              )}
            >
              {COMMON_TAGS.map((tag) => (
                <MenuItem key={tag} value={tag}>
                  {tag}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Date Range Filter */}
          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Date Range
            </Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                label="From"
                type="date"
                value={localFilters.dateRange?.start || ''}
                onChange={(e) => handleDateRangeChange('start', e.target.value)}
                InputLabelProps={{ shrink: true }}
                fullWidth
              />
              <TextField
                label="To"
                type="date"
                value={localFilters.dateRange?.end || ''}
                onChange={(e) => handleDateRangeChange('end', e.target.value)}
                InputLabelProps={{ shrink: true }}
                fullWidth
              />
            </Box>
          </Box>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClear}>Clear All</Button>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleApply} variant="contained">
          Apply Filters
        </Button>
      </DialogActions>
    </Dialog>
  );
} 