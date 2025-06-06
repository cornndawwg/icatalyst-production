import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Paper,
  Tabs,
  Tab,
  Chip,
  IconButton,
  Divider,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import BusinessIcon from '@mui/icons-material/Business';
import HomeIcon from '@mui/icons-material/Home';
import StarIcon from '@mui/icons-material/Star';
import { useRouter } from 'next/router';
import CustomerEditDialog from '../../components/customers/CustomerEditDialog';
import PropertyCard from '../../components/customers/PropertyCard';
import ProjectCard from '../../components/customers/ProjectCard';
import InteractionList from '../../components/customers/InteractionList';
import LoadingState from '../../components/common/LoadingState';
import { useApi } from '../../hooks/useApi';
import { Customer, Project, CustomerInteraction } from '../../types/customer';
import { getApiUrl } from '../../lib/api';

// Define the API customer type (what comes from Prisma)
interface ApiCustomer {
  id: string;
  type: string;
  status: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  company?: string;
  preferredCommunication: string;
  notes?: string;
  createdAt: Date | string;
  updatedAt: Date | string;
  tags: { name: string }[] | string[];
  billingAddress?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  properties: {
    id: string;
    name: string;
    type: string;
    squareFootage: number;
    bedrooms?: number;
    bathrooms?: number;
    yearBuilt?: number;
    customerId: string;
    address?: {
      street: string;
      city: string;
      state: string;
      zipCode: string;
      country: string;
    };
    photos?: {
      id: string;
      url: string;
      uploadedAt: Date;
      uploadedBy: string;
    }[];
    documents?: {
      id: string;
      name: string;
      url: string;
      type: string;
      uploadedAt: Date;
      uploadedBy: string;
    }[];
  }[];
  projects: any[];
  interactions: any[];
  metrics?: {
    totalRevenue: number;
    projectsCompleted: number;
    avgResponseTime: number;
  };
}

// Type adapter functions
const adaptApiCustomerToCustomer = (apiCustomer: ApiCustomer): Customer => {
  const transformedTags = Array.isArray(apiCustomer.tags) && apiCustomer.tags.length > 0 && typeof apiCustomer.tags[0] === 'object' 
    ? (apiCustomer.tags as { name: string }[]).map(tag => tag.name)
    : apiCustomer.tags as string[];

  return {
    id: apiCustomer.id,
    type: apiCustomer.type as any,
    status: apiCustomer.status as any,
    firstName: apiCustomer.firstName,
    lastName: apiCustomer.lastName,
    company: apiCustomer.company,
    email: apiCustomer.email,
    phone: apiCustomer.phone,
    preferredCommunication: apiCustomer.preferredCommunication as any,
    billingAddress: apiCustomer.billingAddress || {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'USA',
    },
    properties: (apiCustomer.properties || []).map(prop => ({
      id: prop.id,
      name: prop.name,
      type: prop.type as any,
      address: prop.address || {
        street: '',
        city: '',
        state: '',
        zipCode: '',
        country: 'USA',
      },
      squareFootage: prop.squareFootage,
      bedrooms: prop.bedrooms,
      bathrooms: prop.bathrooms,
      yearBuilt: prop.yearBuilt,
      photos: (prop.photos || []).map(photo => photo.url),
      documents: (prop.documents || []).map(doc => ({
        id: doc.id,
        name: doc.name,
        url: doc.url,
        type: doc.type,
        uploadedAt: doc.uploadedAt.toString(),
        uploadedBy: doc.uploadedBy,
      })),
      systems: [],
      serviceHistory: [],
    })),
    projects: (apiCustomer.projects || []).map(proj => ({
      id: proj.id,
      name: proj.name || 'Untitled Project',
      description: proj.description || '',
      status: proj.status || 'planning',
      startDate: proj.startDate || new Date().toISOString(),
      endDate: proj.endDate || undefined,
      property: proj.property || apiCustomer.properties[0] || {
        id: 'temp',
        name: 'Default Property',
        type: 'residential',
        address: {
          street: '',
          city: '',
          state: '',
          zipCode: '',
          country: 'USA',
        },
        squareFootage: 0,
        photos: [],
        documents: [],
        systems: [],
        serviceHistory: [],
      },
      team: proj.teamMembers || [],
      milestones: proj.milestones || [],
      budget: proj.budget || {
        currency: 'USD',
        total: 0,
        spent: 0,
        remaining: 0,
        lineItems: [],
      },
      documents: proj.documents || [],
    })),
    interactions: (apiCustomer.interactions || []).map(interaction => ({
      id: interaction.id,
      type: interaction.type || 'other',
      date: interaction.date || new Date().toISOString(),
      summary: interaction.summary || '',
      details: interaction.details || '',
      followUpDate: interaction.followUpDate,
      followUpNotes: interaction.followUpNotes,
      createdBy: interaction.createdBy || 'system',
      createdAt: interaction.createdAt || new Date().toISOString(),
      updatedAt: interaction.updatedAt || new Date().toISOString(),
    })),
    tags: transformedTags,
    notes: apiCustomer.notes || '',
    metrics: apiCustomer.metrics || {
      totalRevenue: 0,
      projectsCompleted: 0,
      avgResponseTime: 0,
    },
    createdAt: apiCustomer.createdAt.toString(),
    updatedAt: apiCustomer.updatedAt.toString(),
  };
};

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
      id={`customer-tabpanel-${index}`}
      aria-labelledby={`customer-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ py: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

export default function CustomerDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const [tabValue, setTabValue] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);

  const {
    data: apiCustomer,
    loading,
    error,
    get: fetchCustomer,
  } = useApi<ApiCustomer>();

  // Convert API customer to component-compatible customer
  const customer = apiCustomer ? adaptApiCustomerToCustomer(apiCustomer) : null;

  useEffect(() => {
    if (id && typeof id === 'string') {
      fetchCustomer(getApiUrl(`/api/customers/${id}`));
    }
  }, [id, fetchCustomer]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const getCustomerTypeIcon = () => {
    if (!customer) return null;
    switch (customer.type) {
      case 'commercial':
        return <BusinessIcon />;
      case 'residential':
        return <HomeIcon />;
      case 'high-net-worth':
        return <StarIcon />;
      default:
        return <HomeIcon />;
    }
  };

  const handleSaveCustomer = async (updatedCustomer: Customer) => {
    try {
      // Here you would call your API to update the customer
      console.log('Saving customer:', updatedCustomer);
      setDialogOpen(false);
      // Refresh customer data
      if (id && typeof id === 'string') {
        fetchCustomer(getApiUrl(`/api/customers/${id}`));
      }
    } catch (error) {
      console.error('Error saving customer:', error);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <LoadingState loading={loading} error={error}>
        {customer && (
          <>
            {/* Header */}
            <Paper sx={{ p: 3, mb: 3 }}>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  mb: 3,
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  {getCustomerTypeIcon()}
                  <Box>
                    <Typography variant="h4" component="h1" gutterBottom>
                      {customer.firstName} {customer.lastName}
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                      {customer.company || 'Individual Customer'}
                    </Typography>
                  </Box>
                </Box>
                <Button
                  variant="outlined"
                  startIcon={<EditIcon />}
                  onClick={() => setDialogOpen(true)}
                >
                  Edit Customer
                </Button>
              </Box>

              <Grid container spacing={3}>
                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Type
                  </Typography>
                  <Typography variant="body1">{customer.type}</Typography>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Status
                  </Typography>
                  <Chip
                    label={customer.status}
                    color={
                      customer.status === 'active'
                        ? 'success'
                        : customer.status === 'prospect'
                        ? 'warning'
                        : 'default'
                    }
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Email
                  </Typography>
                  <Typography variant="body1">{customer.email}</Typography>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Phone
                  </Typography>
                  <Typography variant="body1">{customer.phone}</Typography>
                </Grid>
              </Grid>

              {customer.tags.length > 0 && (
                <>
                  <Divider sx={{ my: 2 }} />
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {customer.tags.map((tag, index) => (
                      <Chip key={index} label={tag} size="small" />
                    ))}
                  </Box>
                </>
              )}

              {customer.metrics && (
                <>
                  <Divider sx={{ my: 2 }} />
                  <Grid container spacing={3}>
                    <Grid item xs={12} sm={4}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Total Revenue
                      </Typography>
                      <Typography variant="h6">
                        ${customer.metrics.totalRevenue.toLocaleString()}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Projects Completed
                      </Typography>
                      <Typography variant="h6">{customer.metrics.projectsCompleted}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Avg Response Time
                      </Typography>
                      <Typography variant="h6">{customer.metrics.avgResponseTime}h</Typography>
                    </Grid>
                  </Grid>
                </>
              )}
            </Paper>

            {/* Tabs */}
            <Paper sx={{ mb: 3 }}>
              <Tabs value={tabValue} onChange={handleTabChange}>
                <Tab label="Properties" />
                <Tab label="Projects" />
                <Tab label="Interactions" />
                <Tab label="Documents" />
              </Tabs>
            </Paper>

            {/* Tab Panels */}
            <TabPanel value={tabValue} index={0}>
              <Grid container spacing={3}>
                {/* Use the original API properties for PropertyCard since it was designed for that structure */}
                {apiCustomer?.properties?.map((property) => (
                  <Grid key={property.id} item xs={12} sm={6} md={4}>
                    <PropertyCard
                      property={property}
                      onEdit={() => {}}
                      onDelete={() => {}}
                      onViewPhotos={() => {}}
                      onViewDocuments={() => {}}
                    />
                  </Grid>
                ))}
                {(!apiCustomer?.properties || apiCustomer.properties.length === 0) && (
                  <Grid item xs={12}>
                    <Typography variant="body1" color="text.secondary" align="center">
                      No properties found
                    </Typography>
                  </Grid>
                )}
              </Grid>
            </TabPanel>

            <TabPanel value={tabValue} index={1}>
              <Grid container spacing={3}>
                {customer.projects?.map((project) => (
                  <Grid key={project.id} item xs={12} sm={6} md={4}>
                    <ProjectCard 
                      project={project}
                      onEdit={() => {}}
                      onDelete={() => {}}
                      onViewDocuments={() => {}}
                    />
                  </Grid>
                ))}
                {(!customer.projects || customer.projects.length === 0) && (
                  <Grid item xs={12}>
                    <Typography variant="body1" color="text.secondary" align="center">
                      No projects found
                    </Typography>
                  </Grid>
                )}
              </Grid>
            </TabPanel>

            <TabPanel value={tabValue} index={2}>
              <InteractionList 
                interactions={customer.interactions || []} 
                onAdd={(interaction) => {
                  console.log('Adding interaction:', interaction);
                  // TODO: Implement add interaction API call
                }}
                onEdit={(interaction) => {
                  console.log('Editing interaction:', interaction);
                  // TODO: Implement edit interaction API call
                }}
                onDelete={(interaction) => {
                  console.log('Deleting interaction:', interaction);
                  // TODO: Implement delete interaction API call
                }}
              />
            </TabPanel>

            <TabPanel value={tabValue} index={3}>
              <Typography variant="body1" color="text.secondary" align="center">
                Documents feature coming soon
              </Typography>
            </TabPanel>

            {/* Edit Dialog */}
            <CustomerEditDialog
              open={dialogOpen}
              customer={customer}
              onClose={() => setDialogOpen(false)}
              onSave={handleSaveCustomer}
            />
          </>
        )}
      </LoadingState>
    </Container>
  );
} 