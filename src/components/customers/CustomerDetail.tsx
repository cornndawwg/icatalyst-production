import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Tabs,
  Tab,
  Divider,
  Button,
  IconButton,
  Grid,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Avatar,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import BusinessIcon from '@mui/icons-material/Business';
import HomeIcon from '@mui/icons-material/Home';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import { Customer, Property, Project, CustomerInteraction } from '../../types/customer';
import PropertyCard from './PropertyCard';
import ProjectCard from './ProjectCard';
import InteractionList from './InteractionList';
import CustomerEditDialog from './CustomerEditDialog';

interface CustomerDetailProps {
  customer: Customer;
  onUpdate: (customer: Customer) => void;
  onDelete: () => void;
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

export default function CustomerDetail({
  customer,
  onUpdate,
  onDelete,
}: CustomerDetailProps) {
  const [tabValue, setTabValue] = useState(0);
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const getCustomerTypeIcon = () => {
    switch (customer.type) {
      case 'commercial':
        return <BusinessIcon />;
      case 'residential':
        return <HomeIcon />;
      default:
        return null;
    }
  };

  const formatAddress = (address: { street: string; city: string; state: string; zipCode: string }) => {
    return `${address.street}, ${address.city}, ${address.state} ${address.zipCode}`;
  };

  const activeProjects = customer.projects.filter(p => p.status === 'in-progress');
  const completedProjects = customer.projects.filter(p => p.status === 'completed');

  return (
    <Box>
      {/* Header */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar sx={{ bgcolor: 'primary.main', width: 64, height: 64 }}>
              {getCustomerTypeIcon()}
            </Avatar>
            <Box>
              <Typography variant="h4">
                {customer.firstName} {customer.lastName}
              </Typography>
              {customer.company && (
                <Typography variant="subtitle1" color="text.secondary">
                  {customer.company}
                </Typography>
              )}
              <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                <Chip
                  size="small"
                  label={customer.type.replace('-', ' ')}
                  color="primary"
                  variant="outlined"
                />
                <Chip
                  size="small"
                  label={customer.status}
                  color={
                    customer.status === 'active' ? 'success' :
                    customer.status === 'prospect' ? 'warning' :
                    'default'
                  }
                />
              </Box>
            </Box>
          </Box>
          <Box>
            <IconButton onClick={() => setEditDialogOpen(true)}>
              <EditIcon />
            </IconButton>
            <IconButton onClick={onDelete} color="error">
              <DeleteIcon />
            </IconButton>
          </Box>
        </Box>

        <Grid container spacing={3} sx={{ mt: 3 }}>
          <Grid item xs={12} md={4}>
            <List dense>
              <ListItem>
                <ListItemText
                  primary="Email"
                  secondary={customer.email}
                  primaryTypographyProps={{ variant: 'caption', color: 'text.secondary' }}
                />
                <ListItemSecondaryAction>
                  <IconButton size="small" href={`mailto:${customer.email}`}>
                    <EmailIcon fontSize="small" />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="Phone"
                  secondary={customer.phone}
                  primaryTypographyProps={{ variant: 'caption', color: 'text.secondary' }}
                />
                <ListItemSecondaryAction>
                  <IconButton size="small" href={`tel:${customer.phone}`}>
                    <PhoneIcon fontSize="small" />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="Address"
                  secondary={formatAddress(customer.billingAddress)}
                  primaryTypographyProps={{ variant: 'caption', color: 'text.secondary' }}
                />
                <ListItemSecondaryAction>
                  <IconButton
                    size="small"
                    href={`https://maps.google.com/?q=${encodeURIComponent(
                      formatAddress(customer.billingAddress)
                    )}`}
                    target="_blank"
                  >
                    <LocationOnIcon fontSize="small" />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            </List>
          </Grid>
          <Grid item xs={12} md={8}>
            <Box sx={{ display: 'flex', gap: 3 }}>
              <Box sx={{ textAlign: 'center', flex: 1 }}>
                <Typography variant="h4" color="primary">
                  {customer.properties.length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Properties
                </Typography>
              </Box>
              <Box sx={{ textAlign: 'center', flex: 1 }}>
                <Typography variant="h4" color="primary">
                  {activeProjects.length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Active Projects
                </Typography>
              </Box>
              <Box sx={{ textAlign: 'center', flex: 1 }}>
                <Typography variant="h4" color="primary">
                  ${customer.metrics.totalRevenue.toLocaleString()}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Revenue
                </Typography>
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab label="Properties" />
          <Tab label="Projects" />
          <Tab label="Interactions" />
          <Tab label="Notes & Documents" />
        </Tabs>
        <Divider />

        <TabPanel value={tabValue} index={0}>
          <Grid container spacing={3}>
            {customer.properties.map((property) => {
              // Convert property to PrismaProperty format
              const prismaProperty = {
                ...property,
                customerId: customer.id,
                photos: property.photos.map((photoUrl, index) => ({
                  id: `photo-${property.id}-${index}`,
                  url: photoUrl,
                  uploadedAt: new Date(),
                  uploadedBy: 'system',
                })),
                documents: property.documents.map((doc) => ({
                  id: doc.id,
                  name: doc.name,
                  url: doc.url,
                  type: doc.type,
                  uploadedAt: new Date(doc.uploadedAt),
                  uploadedBy: doc.uploadedBy,
                })),
              };
              
              return (
                <Grid item xs={12} md={6} key={property.id}>
                  <PropertyCard property={prismaProperty} />
                </Grid>
              );
            })}
          </Grid>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Active Projects
            </Typography>
            <Grid container spacing={3}>
              {activeProjects.map((project) => (
                <Grid item xs={12} md={6} key={project.id}>
                  <ProjectCard project={project} />
                </Grid>
              ))}
            </Grid>
          </Box>

          {completedProjects.length > 0 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Completed Projects
              </Typography>
              <Grid container spacing={3}>
                {completedProjects.map((project) => (
                  <Grid item xs={12} md={6} key={project.id}>
                    <ProjectCard project={project} />
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <InteractionList
            interactions={customer.interactions}
            onAdd={() => {}}
            onEdit={() => {}}
            onDelete={() => {}}
          />
        </TabPanel>

        <TabPanel value={tabValue} index={3}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>
                Notes
              </Typography>
              <Paper variant="outlined" sx={{ p: 2, minHeight: 200 }}>
                <Typography variant="body2">
                  {customer.notes || 'No notes available.'}
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>
                Tags
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {customer.tags.map((tag) => (
                  <Chip
                    key={tag}
                    label={tag}
                    variant="outlined"
                    size="small"
                  />
                ))}
              </Box>
            </Grid>
          </Grid>
        </TabPanel>
      </Paper>

      <CustomerEditDialog
        open={editDialogOpen}
        customer={customer}
        onClose={() => setEditDialogOpen(false)}
        onSave={(updatedCustomer) => {
          onUpdate(updatedCustomer);
          setEditDialogOpen(false);
        }}
      />
    </Box>
  );
} 