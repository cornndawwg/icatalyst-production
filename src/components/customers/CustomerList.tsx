import React, { useEffect, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
  Button,
  IconButton,
  Tooltip,
  Chip,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
} from '@mui/icons-material';
import { useRouter } from 'next/router';
import CustomerFilterDialog from './CustomerFilterDialog';
import CustomerEditDialog from './CustomerEditDialog';
import LoadingState from '../common/LoadingState';
import { useApi } from '../../hooks/useApi';
import { Customer, CustomerType, CustomerStatus, CustomerFilters } from '../../types/customer';
import { getApiUrl } from '../../lib/api';

interface CustomerListProps {
  onCustomerSelect?: (customer: Customer) => void;
}

export default function CustomerList({ onCustomerSelect }: CustomerListProps) {
  const router = useRouter();
  const [filters, setFilters] = useState<CustomerFilters>({
    type: [],
    status: [],
    search: '',
  });
  const [filterDialogOpen, setFilterDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | undefined>(undefined);

  const {
    data: response,
    loading,
    error,
    get: fetchCustomers,
    delete: deleteCustomer,
  } = useApi<{
    customers: Customer[];
    total: number;
    page: number;
    totalPages: number;
    metrics: any;
  }>();

  useEffect(() => {
    const queryParams = new URLSearchParams();
    if (filters.type?.length) {
      filters.type.forEach(type => queryParams.append('type', type));
    }
    if (filters.status?.length) {
      filters.status.forEach(status => queryParams.append('status', status));
    }
    if (filters.search) {
      queryParams.append('search', filters.search);
    }
    queryParams.append('page', '1');
    queryParams.append('limit', '10');
    fetchCustomers(getApiUrl(`/api/customers?${queryParams}`));
  }, [filters, fetchCustomers]);

  const handleFilterChange = (newFilters: CustomerFilters) => {
    setFilters(newFilters);
    setFilterDialogOpen(false);
  };

  const handleCustomerClick = (customer: Customer) => {
    if (onCustomerSelect) {
      onCustomerSelect(customer);
    } else {
      router.push(`/customers/${customer.id}`);
    }
  };

  const handleEditClick = (
    event: React.MouseEvent,
    customer: Customer
  ) => {
    event.stopPropagation();
    setSelectedCustomer(customer);
    setEditDialogOpen(true);
  };

  const handleDeleteClick = async (
    event: React.MouseEvent,
    customerId: string
  ) => {
    event.stopPropagation();
    if (
      window.confirm('Are you sure you want to delete this customer?')
    ) {
      try {
        await deleteCustomer(getApiUrl(`/api/customers/${customerId}`));
        const queryParams = new URLSearchParams();
        if (filters.type?.length) {
          filters.type.forEach(type => queryParams.append('type', type));
        }
        if (filters.status?.length) {
          filters.status.forEach(status => queryParams.append('status', status));
        }
        if (filters.search) {
          queryParams.append('search', filters.search);
        }
        fetchCustomers(getApiUrl(`/api/customers?${queryParams}`));
      } catch (error) {
        console.error('Error deleting customer:', error);
      }
    }
  };

  const handleEditComplete = () => {
    setEditDialogOpen(false);
    setSelectedCustomer(undefined);
    const queryParams = new URLSearchParams();
    if (filters.type?.length) {
      filters.type.forEach(type => queryParams.append('type', type));
    }
    if (filters.status?.length) {
      filters.status.forEach(status => queryParams.append('status', status));
    }
    if (filters.search) {
      queryParams.append('search', filters.search);
    }
    fetchCustomers(getApiUrl(`/api/customers?${queryParams}`));
  };

  return (
    <Box>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 3,
        }}
      >
        <Typography variant="h5" component="h2">
          Customers
        </Typography>
        <Box>
          <Button
            variant="outlined"
            onClick={() => setFilterDialogOpen(true)}
            sx={{ mr: 1 }}
          >
            Filters
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => {
              setSelectedCustomer(undefined);
              setEditDialogOpen(true);
            }}
          >
            Add Customer
          </Button>
        </Box>
      </Box>

      <LoadingState loading={loading} error={error} variant="skeleton">
        <Grid container spacing={3}>
          {response?.customers.map(customer => (
            <Grid item xs={12} sm={6} md={4} key={customer.id}>
              <Card
                sx={{
                  cursor: 'pointer',
                  '&:hover': {
                    boxShadow: theme => theme.shadows[4],
                  },
                }}
                onClick={() => handleCustomerClick(customer)}
              >
                <CardContent>
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      mb: 2,
                    }}
                  >
                    <Typography variant="h6" component="h3" gutterBottom>
                      {customer.firstName} {customer.lastName}
                    </Typography>
                    <Box>
                      <Tooltip title="View Details">
                        <IconButton
                          size="small"
                          onClick={e => {
                            e.stopPropagation();
                            handleCustomerClick(customer);
                          }}
                        >
                          <VisibilityIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Edit">
                        <IconButton
                          size="small"
                          onClick={e => handleEditClick(e, customer)}
                        >
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton
                          size="small"
                          onClick={e => handleDeleteClick(e, customer.id)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Box>

                  <Typography color="textSecondary" gutterBottom>
                    {customer.company || 'Individual Customer'}
                  </Typography>

                  <Box sx={{ mb: 1 }}>
                    <Chip
                      label={customer.type}
                      size="small"
                      sx={{ mr: 1 }}
                    />
                    <Chip
                      label={customer.status}
                      size="small"
                      color={
                        customer.status === 'active'
                          ? 'success'
                          : customer.status === 'prospect'
                          ? 'warning'
                          : 'default'
                      }
                    />
                  </Box>

                  <Typography variant="body2" color="textSecondary">
                    {customer.email}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {customer.phone}
                  </Typography>

                  {customer.tags.length > 0 && (
                    <Box sx={{ mt: 2 }}>
                      {customer.tags.map((tag, index) => (
                        <Chip
                          key={index}
                          label={tag}
                          size="small"
                          sx={{ mr: 0.5, mb: 0.5 }}
                        />
                      ))}
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </LoadingState>

      <CustomerFilterDialog
        open={filterDialogOpen}
        onClose={() => setFilterDialogOpen(false)}
        filters={filters}
        onApply={handleFilterChange}
      />

      <CustomerEditDialog
        open={editDialogOpen}
        onClose={() => {
          setEditDialogOpen(false);
          setSelectedCustomer(undefined);
        }}
        customer={selectedCustomer}
        onSave={handleEditComplete}
      />
    </Box>
  );
} 