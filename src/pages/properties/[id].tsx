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
  Divider,
  Alert,
  Snackbar,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemAvatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Tabs,
  Tab,
  Fab,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Home as HomeIcon,
  LocationOn as LocationIcon,
  Security as SecurityIcon,
  Lightbulb as LightbulbIcon,
  Thermostat as ThermostatIcon,
  Router as RouterIcon,
  Assessment as AssessmentIcon,
  Build as BuildIcon,
  Schedule as ScheduleIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Star as StarIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  Business as BusinessIcon,
  CalendarToday as CalendarIcon,
  AttachMoney as MoneyIcon,
  Description as DescriptionIcon,
  Add as AddIcon,
  Visibility as ViewIcon,
} from '@mui/icons-material';
import NextLink from 'next/link';
import { useRouter } from 'next/router';
import { useApi } from '../../hooks/useApi';
import { getApiUrl } from '../../lib/api';

// TypeScript interfaces
interface Address {
  id?: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
}

interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  company?: string;
  email: string;
  phone?: string;
  type: string;
}

interface SystemInstallation {
  id: string;
  type: string;
  details: string;
  installDate?: string;
  lastService?: string;
}

interface ServiceRecord {
  id: string;
  date: string;
  type: string;
  description: string;
  technician: string;
  cost: number;
}

interface Project {
  id: string;
  name: string;
  description: string;
  status: string;
  startDate: string;
  endDate?: string;
}

interface Proposal {
  id: string;
  name: string;
  description?: string;
  status: string;
  totalAmount: number;
  createdAt: string;
  customerPersona: string;
}

interface Property {
  id: string;
  name: string;
  type: string;
  squareFootage: number;
  bedrooms?: number;
  bathrooms?: number;
  yearBuilt?: number;
  address?: Address | string;
  customer: Customer;
  systems: SystemInstallation[];
  serviceHistory: ServiceRecord[];
  projects: Project[];
  proposals: Proposal[];
  
  // Mock data fields (for compatibility)
  customerName?: string;
  systemType?: string;
  status?: string;
  systemHealth?: number;
  alerts?: any[];
  installationDate?: string;
  monthlyServiceFee?: string;
  systemBrands?: string[];
  connectedDevices?: number;
  activeZones?: number;
  devices?: {
    security: number;
    lighting: number;
    climate: number;
    audio: number;
  };
  tags?: string[];
  lastSystemCheck?: string;
  responseTime?: string;
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
      id={`property-tabpanel-${index}`}
      aria-labelledby={`property-tab-${index}`}
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

export default function PropertyDetailPage() {
  const router = useRouter();
  const { id } = router.query;

  // State management
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [tabValue, setTabValue] = useState(0);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // Mock data fallback (in case real API fails)
  const mockProperty: Property = {
    id: id as string || 'mock-1',
    name: 'Smart Home System',
    type: 'single-family',
    squareFootage: 2500,
    bedrooms: 4,
    bathrooms: 3,
    yearBuilt: 2020,
    address: {
      street: '123 Main St',
      city: 'Anytown',
      state: 'CA',
      zipCode: '12345'
    },
    customer: {
      id: 'customer-1',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@email.com',
      phone: '(555) 123-4567',
      type: 'homeowner'
    },
    systems: [
      {
        id: 'system-1',
        type: 'Security System',
        details: 'Control4 Security with door/window sensors',
        installDate: '2023-01-15',
        lastService: '2023-12-01'
      },
      {
        id: 'system-2',
        type: 'Lighting Control',
        details: 'Lutron Caseta smart lighting throughout',
        installDate: '2023-01-20',
        lastService: '2023-11-15'
      }
    ],
    serviceHistory: [
      {
        id: 'service-1',
        date: '2023-12-01',
        type: 'Maintenance',
        description: 'Annual system check and software updates',
        technician: 'Mike Johnson',
        cost: 150
      },
      {
        id: 'service-2',
        date: '2023-11-15',
        type: 'Repair',
        description: 'Fixed motion sensor in living room',
        technician: 'Sarah Wilson',
        cost: 75
      }
    ],
    projects: [
      {
        id: 'project-1',
        name: 'Home Theater Installation',
        description: 'Complete home theater with surround sound',
        status: 'completed',
        startDate: '2023-03-01',
        endDate: '2023-03-15'
      }
    ],
    proposals: [
      {
        id: 'proposal-1',
        name: 'Kitchen Upgrade Proposal',
        description: 'Smart kitchen appliances and lighting',
        status: 'pending',
        totalAmount: 8500,
        createdAt: '2023-11-01',
        customerPersona: 'homeowner'
      }
    ],
    // Mock data compatibility fields
    customerName: 'John Doe',
    systemType: 'Complete Smart Home',
    status: 'All Systems Online',
    systemHealth: 95,
    alerts: [],
    installationDate: 'Jan 2023',
    monthlyServiceFee: '$89/month',
    systemBrands: ['Control4', 'Lutron', 'Nest'],
    connectedDevices: 45,
    activeZones: 8,
    devices: {
      security: 12,
      lighting: 18,
      climate: 8,
      audio: 7
    },
    tags: ['Premium', 'Commercial Grade', 'Energy Efficient'],
    lastSystemCheck: '2 hours ago',
    responseTime: '< 2s'
  };

  // API hooks
  const { get: fetchProperty } = useApi<Property>({
    onSuccess: (data) => {
      setProperty(data);
      setLoading(false);
    },
    onError: (error) => {
      console.error('Failed to load property from API, using mock data:', error);
      // Use mock data as fallback
      setProperty(mockProperty);
      setLoading(false);
    }
  });

  // Load property data
  useEffect(() => {
    if (id && typeof id === 'string') {
      // Try to fetch from API first
      fetchProperty(getApiUrl(`/api/properties/${id}`));
    }
  }, [id]);

  // Helper functions
  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'all systems online':
      case 'active':
      case 'completed':
        return 'success';
      case 'maintenance required':
      case 'pending':
      case 'in-progress':
        return 'warning';
      case 'offline':
      case 'error':
      case 'failed':
        return 'error';
      default:
        return 'default';
    }
  };

  const getSystemIcon = (type: string) => {
    switch (type?.toLowerCase()) {
      case 'security':
      case 'security system':
        return <SecurityIcon />;
      case 'lighting':
      case 'lighting control':
        return <LightbulbIcon />;
      case 'climate':
      case 'hvac':
        return <ThermostatIcon />;
      case 'network':
      case 'networking':
        return <RouterIcon />;
      default:
        return <HomeIcon />;
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
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
            Loading property details...
          </Typography>
        </Box>
      </Container>
    );
  }

  if (!property) {
    return (
      <Container maxWidth="lg">
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
          <Alert severity="error">
            Property not found or you don't have permission to view it.
          </Alert>
        </Box>
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
          <Link component={NextLink} href="/properties" color="inherit">
            Properties
          </Link>
          <Typography color="text.primary">
            {property.name || property.customerName || 'Property Details'}
          </Typography>
        </Breadcrumbs>
        
        <Box display="flex" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 2 }}>
          <Box>
            <Typography variant="h4" component="h1" gutterBottom>
              {property.name || property.customerName || 'Property Details'}
            </Typography>
            <Box display="flex" alignItems="center" gap={2} sx={{ mb: 2 }}>
              <Chip
                label={property.status || 'Active'}
                color={getStatusColor(property.status || 'active') as any}
                size="medium"
                icon={property.status === 'All Systems Online' ? <CheckCircleIcon /> : <WarningIcon />}
              />
              {property.systemHealth && (
                <Chip
                  label={`${property.systemHealth}% Health`}
                  color={property.systemHealth > 90 ? 'success' : property.systemHealth > 75 ? 'warning' : 'error'}
                  size="medium"
                />
              )}
              <Typography variant="body2" color="text.secondary">
                {property.type?.replace('-', ' ')} • {property.squareFootage?.toLocaleString()} sq ft
              </Typography>
            </Box>
          </Box>

          <Box display="flex" gap={1}>
            <Button
              startIcon={<ArrowBackIcon />}
              onClick={() => router.push('/properties')}
              variant="outlined"
            >
              Back to Properties
            </Button>
            <Button
              startIcon={<EditIcon />}
              onClick={() => setEditDialogOpen(true)}
              variant="outlined"
              color="primary"
            >
              Edit Property
            </Button>
            <IconButton
              color="error"
              onClick={() => setDeleteDialogOpen(true)}
            >
              <DeleteIcon />
            </IconButton>
          </Box>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {/* Main Content */}
        <Grid item xs={12} lg={8}>
          {/* Property Overview */}
          <Paper sx={{ mb: 3 }}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Tabs value={tabValue} onChange={handleTabChange}>
                <Tab label="Overview" />
                <Tab label="Systems" />
                <Tab label="Service History" />
                <Tab label="Projects" />
                <Tab label="Proposals" />
              </Tabs>
            </Box>

            {/* Overview Tab */}
            <TabPanel value={tabValue} index={0}>
              <Grid container spacing={3}>
                {/* Address Information */}
                <Grid item xs={12} md={6}>
                  <Box display="flex" alignItems="center" sx={{ mb: 2 }}>
                    <LocationIcon sx={{ mr: 1 }} />
                    <Typography variant="h6">Address</Typography>
                  </Box>
                  {property.address && typeof property.address === 'object' ? (
                    <Box>
                      <Typography variant="body1">{property.address.street}</Typography>
                      <Typography variant="body1">
                        {property.address.city}, {property.address.state} {property.address.zipCode}
                      </Typography>
                    </Box>
                  ) : (
                    <Typography variant="body1">{property.address || 'No address available'}</Typography>
                  )}
                </Grid>

                {/* Property Details */}
                <Grid item xs={12} md={6}>
                  <Box display="flex" alignItems="center" sx={{ mb: 2 }}>
                    <HomeIcon sx={{ mr: 1 }} />
                    <Typography variant="h6">Property Details</Typography>
                  </Box>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    <strong>Type:</strong> {property.type?.replace('-', ' ') || 'N/A'}
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    <strong>Square Footage:</strong> {property.squareFootage?.toLocaleString() || 'N/A'} sq ft
                  </Typography>
                  {property.bedrooms && (
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      <strong>Bedrooms:</strong> {property.bedrooms}
                    </Typography>
                  )}
                  {property.bathrooms && (
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      <strong>Bathrooms:</strong> {property.bathrooms}
                    </Typography>
                  )}
                  {property.yearBuilt && (
                    <Typography variant="body2">
                      <strong>Year Built:</strong> {property.yearBuilt}
                    </Typography>
                  )}
                </Grid>

                {/* System Statistics (if available) */}
                {property.connectedDevices && (
                  <Grid item xs={12}>
                    <Box display="flex" alignItems="center" sx={{ mb: 2 }}>
                      <AssessmentIcon sx={{ mr: 1 }} />
                      <Typography variant="h6">System Statistics</Typography>
                    </Box>
                    <Grid container spacing={2}>
                      <Grid item xs={6} md={3}>
                        <Paper variant="outlined" sx={{ p: 2, textAlign: 'center' }}>
                          <Typography variant="h4" color="primary">
                            {property.connectedDevices}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Connected Devices
                          </Typography>
                        </Paper>
                      </Grid>
                      <Grid item xs={6} md={3}>
                        <Paper variant="outlined" sx={{ p: 2, textAlign: 'center' }}>
                          <Typography variant="h4" color="success.main">
                            {property.activeZones}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Active Zones
                          </Typography>
                        </Paper>
                      </Grid>
                      <Grid item xs={6} md={3}>
                        <Paper variant="outlined" sx={{ p: 2, textAlign: 'center' }}>
                          <Typography variant="h4" color="info.main">
                            {property.devices?.security || 0}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Security Devices
                          </Typography>
                        </Paper>
                      </Grid>
                      <Grid item xs={6} md={3}>
                        <Paper variant="outlined" sx={{ p: 2, textAlign: 'center' }}>
                          <Typography variant="h4" color="warning.main">
                            {property.devices?.lighting || 0}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Lighting Controls
                          </Typography>
                        </Paper>
                      </Grid>
                    </Grid>
                  </Grid>
                )}
              </Grid>
            </TabPanel>

            {/* Systems Tab */}
            <TabPanel value={tabValue} index={1}>
              <Box display="flex" alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
                <Typography variant="h6">
                  Installed Systems ({property.systems?.length || 0})
                </Typography>
                <Button startIcon={<AddIcon />} variant="contained">
                  Add System
                </Button>
              </Box>

              {property.systems && property.systems.length > 0 ? (
                <Grid container spacing={2}>
                  {property.systems.map((system) => (
                    <Grid item xs={12} md={6} key={system.id}>
                      <Card variant="outlined">
                        <CardContent>
                          <Box display="flex" alignItems="center" sx={{ mb: 2 }}>
                            {getSystemIcon(system.type)}
                            <Typography variant="h6" sx={{ ml: 1 }}>
                              {system.type}
                            </Typography>
                          </Box>
                          <Typography variant="body2" sx={{ mb: 2 }}>
                            {system.details}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Installed: {system.installDate ? formatDate(system.installDate) : 'N/A'}
                          </Typography>
                          {system.lastService && (
                            <Typography variant="caption" color="text.secondary" sx={{ ml: 2 }}>
                              Last Service: {formatDate(system.lastService)}
                            </Typography>
                          )}
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              ) : (
                <Box textAlign="center" py={4}>
                  <BuildIcon color="disabled" sx={{ fontSize: 48, mb: 1 }} />
                  <Typography variant="body1" color="text.secondary">
                    No systems installed
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Add your first system to start monitoring
                  </Typography>
                </Box>
              )}
            </TabPanel>

            {/* Service History Tab */}
            <TabPanel value={tabValue} index={2}>
              <Box display="flex" alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
                <Typography variant="h6">
                  Service History ({property.serviceHistory?.length || 0})
                </Typography>
                <Button startIcon={<ScheduleIcon />} variant="contained">
                  Schedule Service
                </Button>
              </Box>

              {property.serviceHistory && property.serviceHistory.length > 0 ? (
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Date</TableCell>
                        <TableCell>Type</TableCell>
                        <TableCell>Description</TableCell>
                        <TableCell>Technician</TableCell>
                        <TableCell align="right">Cost</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {property.serviceHistory.map((record) => (
                        <TableRow key={record.id}>
                          <TableCell>{formatDate(record.date)}</TableCell>
                          <TableCell>
                            <Chip label={record.type} size="small" />
                          </TableCell>
                          <TableCell>{record.description}</TableCell>
                          <TableCell>{record.technician}</TableCell>
                          <TableCell align="right">
                            {formatCurrency(record.cost)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Box textAlign="center" py={4}>
                  <ScheduleIcon color="disabled" sx={{ fontSize: 48, mb: 1 }} />
                  <Typography variant="body1" color="text.secondary">
                    No service history
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Service records will appear here
                  </Typography>
                </Box>
              )}
            </TabPanel>

            {/* Projects Tab */}
            <TabPanel value={tabValue} index={3}>
              <Box display="flex" alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
                <Typography variant="h6">
                  Projects ({property.projects?.length || 0})
                </Typography>
                <Button startIcon={<AddIcon />} variant="contained">
                  New Project
                </Button>
              </Box>

              {property.projects && property.projects.length > 0 ? (
                <Grid container spacing={2}>
                  {property.projects.map((project) => (
                    <Grid item xs={12} md={6} key={project.id}>
                      <Card variant="outlined">
                        <CardContent>
                          <Box display="flex" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
                            <Typography variant="h6">{project.name}</Typography>
                            <Chip
                              label={project.status}
                              color={getStatusColor(project.status) as any}
                              size="small"
                            />
                          </Box>
                          <Typography variant="body2" sx={{ mb: 2 }}>
                            {project.description}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Started: {formatDate(project.startDate)}
                            {project.endDate && ` • Completed: ${formatDate(project.endDate)}`}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              ) : (
                <Box textAlign="center" py={4}>
                  <AssessmentIcon color="disabled" sx={{ fontSize: 48, mb: 1 }} />
                  <Typography variant="body1" color="text.secondary">
                    No projects
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Create a project to track installations and upgrades
                  </Typography>
                </Box>
              )}
            </TabPanel>

            {/* Proposals Tab */}
            <TabPanel value={tabValue} index={4}>
              <Box display="flex" alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
                <Typography variant="h6">
                  Proposals ({property.proposals?.length || 0})
                </Typography>
                <Button 
                  startIcon={<AddIcon />} 
                  variant="contained"
                  component={NextLink}
                  href="/proposals/create"
                >
                  Create Proposal
                </Button>
              </Box>

              {property.proposals && property.proposals.length > 0 ? (
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Proposal</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell align="right">Amount</TableCell>
                        <TableCell>Created</TableCell>
                        <TableCell align="center">Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {property.proposals.map((proposal) => (
                        <TableRow key={proposal.id}>
                          <TableCell>
                            <Box>
                              <Typography variant="body2" fontWeight="medium">
                                {proposal.name}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {proposal.customerPersona}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={proposal.status}
                              color={getStatusColor(proposal.status) as any}
                              size="small"
                            />
                          </TableCell>
                          <TableCell align="right">
                            {formatCurrency(proposal.totalAmount)}
                          </TableCell>
                          <TableCell>{formatDate(proposal.createdAt)}</TableCell>
                          <TableCell align="center">
                            <IconButton
                              size="small"
                              onClick={() => router.push(`/proposals/${proposal.id}`)}
                            >
                              <ViewIcon />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Box textAlign="center" py={4}>
                  <DescriptionIcon color="disabled" sx={{ fontSize: 48, mb: 1 }} />
                  <Typography variant="body1" color="text.secondary">
                    No proposals
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Create proposals for upgrades and new installations
                  </Typography>
                </Box>
              )}
            </TabPanel>
          </Paper>
        </Grid>

        {/* Sidebar */}
        <Grid item xs={12} lg={4}>
          {/* Customer Information */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Box display="flex" alignItems="center" sx={{ mb: 2 }}>
              <BusinessIcon sx={{ mr: 1 }} />
              <Typography variant="h6">Customer Information</Typography>
            </Box>
            
            <Box display="flex" alignItems="center" sx={{ mb: 2 }}>
              <Avatar sx={{ mr: 2 }}>
                {property.customer?.firstName?.charAt(0) || 'C'}{property.customer?.lastName?.charAt(0) || 'U'}
              </Avatar>
              <Box>
                <Typography variant="body1" fontWeight="medium">
                  {property.customer?.firstName} {property.customer?.lastName}
                </Typography>
                {property.customer?.company && (
                  <Typography variant="body2" color="text.secondary">
                    {property.customer.company}
                  </Typography>
                )}
              </Box>
            </Box>

            <Box display="flex" alignItems="center" sx={{ mb: 1 }}>
              <EmailIcon sx={{ mr: 1, fontSize: 16 }} />
              <Typography variant="body2">{property.customer?.email}</Typography>
            </Box>

            {property.customer?.phone && (
              <Box display="flex" alignItems="center" sx={{ mb: 1 }}>
                <PhoneIcon sx={{ mr: 1, fontSize: 16 }} />
                <Typography variant="body2">{property.customer.phone}</Typography>
              </Box>
            )}

            <Chip
              label={property.customer?.type?.toUpperCase() || 'CUSTOMER'}
              size="small"
              color="primary"
              variant="outlined"
              sx={{ mt: 1 }}
            />
          </Paper>

          {/* System Status */}
          {property.systemHealth !== undefined && (
            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                System Status
              </Typography>
              
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">System Health:</Typography>
                <Typography variant="h4" color={property.systemHealth > 90 ? 'success.main' : 'warning.main'}>
                  {property.systemHealth}%
                </Typography>
              </Box>

              {property.lastSystemCheck && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">Last Check:</Typography>
                  <Typography variant="body1">{property.lastSystemCheck}</Typography>
                </Box>
              )}

              {property.responseTime && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">Response Time:</Typography>
                  <Typography variant="body1" color="success.main">
                    {property.responseTime}
                  </Typography>
                </Box>
              )}

              {property.alerts && property.alerts.length > 0 && (
                <Alert severity="warning" sx={{ mt: 2 }}>
                  {property.alerts.length} active alert{property.alerts.length > 1 ? 's' : ''}
                </Alert>
              )}
            </Paper>
          )}

          {/* Quick Actions */}
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Quick Actions
            </Typography>
            
            <Box display="flex" flexDirection="column" gap={1}>
              <Button startIcon={<ScheduleIcon />} variant="outlined" fullWidth>
                Schedule Service
              </Button>
              <Button startIcon={<AssessmentIcon />} variant="outlined" fullWidth>
                System Diagnostics
              </Button>
              <Button startIcon={<BuildIcon />} variant="outlined" fullWidth>
                Add Equipment
              </Button>
              <Button 
                startIcon={<DescriptionIcon />} 
                variant="outlined" 
                fullWidth
                component={NextLink}
                href="/proposals/create"
              >
                Create Proposal
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Edit Property Dialog */}
      <Dialog
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Edit Property</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Update property information and details.
          </Typography>
          {/* Add edit form fields here */}
          <TextField
            fullWidth
            label="Property Name"
            defaultValue={property.name}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Square Footage"
            type="number"
            defaultValue={property.squareFootage}
            sx={{ mb: 2 }}
          />
          {/* Add more fields as needed */}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button variant="contained">Save Changes</Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Delete Property</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this property? This action cannot be undone and will remove all associated data.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button color="error" variant="contained">
            Delete Property
          </Button>
        </DialogActions>
      </Dialog>

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