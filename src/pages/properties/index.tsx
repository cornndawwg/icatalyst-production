import React, { useState } from 'react';
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
  TextField,
  InputAdornment,
  Chip,
  Avatar,
  IconButton,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  Divider,
  Badge,
} from '@mui/material';
import {
  Search as SearchIcon,
  Add as AddIcon,
  FilterList as FilterIcon,
  MoreVert as MoreVertIcon,
  Home as HomeIcon,
  Business as BusinessIcon,
  LocationOn as LocationIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Star as StarIcon,
  Apartment as ApartmentIcon,
  Villa as VillaIcon,
  SquareFoot as SquareFootIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Settings as SettingsIcon,
  Router as RouterIcon,
  Security as SecurityIcon,
  Lightbulb as LightbulbIcon,
  Thermostat as ThermostatIcon,
  CameraAlt as CameraIcon,
  Lock as LockIcon,
  Wifi as WifiIcon,
} from '@mui/icons-material';
import NextLink from 'next/link';
import { useRouter } from 'next/router';

// Mock smart home systems data
const mockSmartHomeSystems = [
  {
    id: 1,
    customerName: 'Sarah & Michael Johnson',
    address: '1234 Oak Street, Beverly Hills, CA 90210',
    systemType: 'Luxury Estate System',
    status: 'All Systems Online',
    installationDate: '2023-08-15',
    connectedDevices: 24,
    activeZones: 6,
    systemBrands: ['Control4', 'Lutron', 'Nest', 'Ring'],
    devices: {
      security: 8,
      lighting: 12,
      climate: 4,
      entertainment: 6,
      networking: 2
    },
    systemHealth: 98,
    lastSystemCheck: '2024-01-15',
    maintenanceSchedule: '2024-03-15',
    monthlyServiceFee: '$199',
    description: 'Comprehensive smart home automation with security, lighting, and climate control.',
    tags: ['Premium Client', 'Full Automation', 'Security System'],
    alerts: [],
    responseTime: '24/7 monitoring'
  },
  {
    id: 2,
    customerName: 'David & Lisa Chen',
    address: '5678 Pine Avenue, Manhattan Beach, CA 90266',
    systemType: 'Modern Family System',
    status: 'All Systems Online',
    installationDate: '2023-12-10',
    connectedDevices: 16,
    activeZones: 4,
    systemBrands: ['Alarm.com', 'Ecobee', 'Philips Hue', 'Sonos'],
    devices: {
      security: 6,
      lighting: 8,
      climate: 2,
      entertainment: 4,
      networking: 1
    },
    systemHealth: 95,
    lastSystemCheck: '2024-01-14',
    maintenanceSchedule: '2024-06-10',
    monthlyServiceFee: '$149',
    description: 'Smart home system focused on security, energy efficiency, and convenience.',
    tags: ['Energy Efficient', 'Family Friendly', 'Voice Control'],
    alerts: [],
    responseTime: 'Business hours'
  },
  {
    id: 3,
    customerName: 'Thompson Investment Group',
    address: '9012 Business Blvd, Newport Beach, CA 92660',
    systemType: 'Commercial Office System',
    status: '2 Devices Need Attention',
    installationDate: '2023-06-20',
    connectedDevices: 32,
    activeZones: 8,
    systemBrands: ['Honeywell', 'Crestron', 'Cisco', 'Bosch'],
    devices: {
      security: 12,
      lighting: 16,
      climate: 6,
      entertainment: 2,
      networking: 4
    },
    systemHealth: 87,
    lastSystemCheck: '2024-01-10',
    maintenanceSchedule: '2024-02-20',
    monthlyServiceFee: '$299',
    description: 'Commercial-grade automation system for office building management.',
    tags: ['Commercial', 'High Capacity', 'Maintenance Required'],
    alerts: ['HVAC sensor offline', 'Network switch needs reset'],
    responseTime: '4-hour response'
  },
  {
    id: 4,
    customerName: 'Heritage Senior Living',
    address: '3456 Elder Lane, Santa Monica, CA 90401',
    systemType: 'Healthcare Facility System',
    status: 'All Systems Online',
    installationDate: '2023-03-01',
    connectedDevices: 45,
    activeZones: 12,
    systemBrands: ['Nurse Call Systems', 'Philips Healthcare', 'GE Healthcare', 'Cisco'],
    devices: {
      security: 15,
      lighting: 20,
      climate: 8,
      entertainment: 5,
      networking: 6
    },
    systemHealth: 99,
    lastSystemCheck: '2024-01-16',
    maintenanceSchedule: '2024-02-01',
    monthlyServiceFee: '$399',
    description: 'Healthcare-focused smart system with emergency response and patient monitoring.',
    tags: ['Healthcare', 'Emergency Response', 'High Reliability'],
    alerts: [],
    responseTime: 'Immediate response'
  },
  {
    id: 5,
    customerName: 'Rodriguez Family',
    address: '7890 University Drive, Irvine, CA 92612',
    systemType: 'Starter Home System',
    status: 'All Systems Online',
    installationDate: '2024-01-05',
    connectedDevices: 8,
    activeZones: 3,
    systemBrands: ['Ring', 'TP-Link Kasa', 'Google Nest', 'Amazon Echo'],
    devices: {
      security: 3,
      lighting: 4,
      climate: 1,
      entertainment: 2,
      networking: 1
    },
    systemHealth: 92,
    lastSystemCheck: '2024-01-16',
    maintenanceSchedule: '2024-07-05',
    monthlyServiceFee: '$79',
    description: 'Entry-level smart home system with essential security and automation features.',
    tags: ['New Customer', 'Starter Package', 'Growing System'],
    alerts: [],
    responseTime: 'Next business day'
  },
  {
    id: 6,
    customerName: 'Martinez Construction Office',
    address: '1111 Investment Blvd, Riverside, CA 92506',
    systemType: 'Small Business System',
    status: 'Maintenance Scheduled',
    installationDate: '2022-11-15',
    connectedDevices: 12,
    activeZones: 3,
    systemBrands: ['ADT', 'Honeywell', 'Ubiquiti'],
    devices: {
      security: 6,
      lighting: 4,
      climate: 2,
      entertainment: 0,
      networking: 2
    },
    systemHealth: 78,
    lastSystemCheck: '2024-01-08',
    maintenanceSchedule: '2024-01-20',
    monthlyServiceFee: '$129',
    description: 'Small business security and automation system for construction office.',
    tags: ['Small Business', 'Basic Package', 'Scheduled Maintenance'],
    alerts: ['Security camera offline', 'Router needs firmware update'],
    responseTime: 'Same day response'
  }
];

export default function PropertiesPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [selectedProperty, setSelectedProperty] = useState<any>(null);
  const [newSystemDialog, setNewSystemDialog] = useState(false);

  // Filter properties based on search and filters
  const filteredProperties = mockSmartHomeSystems.filter(property => {
    const matchesSearch = 
      property.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      property.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
      property.systemType.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'All' || property.status === statusFilter;
    const matchesType = typeFilter === 'All' || property.systemType === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, property: any) => {
    setMenuAnchor(event.currentTarget);
    setSelectedProperty(property);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
    setSelectedProperty(null);
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'all systems online': return 'success';
      case '2 devices need attention': return 'warning';
      case 'maintenance scheduled': return 'info';
      default: return 'default';
    }
  };

  const getSystemIcon = (type: string) => {
    switch (type) {
      case 'Luxury Estate System': return <HomeIcon />;
      case 'Modern Family System': return <VillaIcon />;
      case 'Commercial Office System': return <BusinessIcon />;
      case 'Healthcare Facility System': return <SecurityIcon />;
      case 'Starter Home System': return <HomeIcon />;
      case 'Small Business System': return <BusinessIcon />;
      default: return <SettingsIcon />;
    }
  };

  const getSystemStats = () => {
    const total = mockSmartHomeSystems.length;
    const online = mockSmartHomeSystems.filter(p => p.status === 'All Systems Online').length;
    const totalDevices = mockSmartHomeSystems.reduce((sum, p) => sum + p.connectedDevices, 0);
    const avgHealth = mockSmartHomeSystems.reduce((sum, p) => sum + p.systemHealth, 0) / mockSmartHomeSystems.length;
    
    return { total, online, totalDevices, avgHealth: Math.round(avgHealth) };
  };

  const stats = getSystemStats();

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Breadcrumbs */}
      <Breadcrumbs sx={{ mb: 2 }}>
        <Link component={NextLink} href="/" color="inherit" underline="hover">
          Dashboard
        </Link>
        <Typography color="text.primary">Smart Home Monitoring</Typography>
      </Breadcrumbs>

      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            Smart Home System Monitoring
            <Chip 
              label={`${filteredProperties.length} systems`} 
              size="small" 
              color="primary" 
              sx={{ ml: 2 }} 
            />
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Monitor and manage all installed smart home systems in real-time
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button variant="outlined" startIcon={<FilterIcon />}>
            System Diagnostics
          </Button>
          <Button 
            variant="contained" 
            startIcon={<AddIcon />}
            onClick={() => setNewSystemDialog(true)}
            size="large"
          >
            Add System
          </Button>
        </Box>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" color="primary">
                    {stats.total}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Systems
                  </Typography>
                </Box>
                <SettingsIcon sx={{ fontSize: 40, color: 'primary.main' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" color="success.main">
                    {stats.online}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Systems Online
                  </Typography>
                </Box>
                <Badge badgeContent={stats.online} color="success">
                  <CheckCircleIcon sx={{ fontSize: 40, color: 'success.main' }} />
                </Badge>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" color="info.main">
                    {stats.totalDevices}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Connected Devices
                  </Typography>
                </Box>
                <WifiIcon sx={{ fontSize: 40, color: 'info.main' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" color="warning.main">
                    {stats.avgHealth}%
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Avg. System Health
                  </Typography>
                </Box>
                <StarIcon sx={{ fontSize: 40, color: 'warning.main' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Search and Filters */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              placeholder="Search systems..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={statusFilter}
                label="Status"
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <MenuItem value="All">All Status</MenuItem>
                <MenuItem value="All Systems Online">All Systems Online</MenuItem>
                <MenuItem value="Maintenance Scheduled">Maintenance Scheduled</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>System Type</InputLabel>
              <Select
                value={typeFilter}
                label="System Type"
                onChange={(e) => setTypeFilter(e.target.value)}
              >
                <MenuItem value="All">All Types</MenuItem>
                <MenuItem value="Luxury Estate System">Luxury Estate System</MenuItem>
                <MenuItem value="Modern Family System">Modern Family System</MenuItem>
                <MenuItem value="Commercial Office System">Commercial Office System</MenuItem>
                <MenuItem value="Healthcare Facility System">Healthcare Facility System</MenuItem>
                <MenuItem value="Starter Home System">Starter Home System</MenuItem>
                <MenuItem value="Small Business System">Small Business System</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>

      {/* Property Cards */}
      <Paper sx={{ mb: 4 }}>
        <Box sx={{ p: 3, borderBottom: 1, borderColor: 'divider' }}>
          <Typography variant="h6">
            Systems ({filteredProperties.length})
          </Typography>
        </Box>
        
        <Grid container spacing={3} sx={{ p: 3 }}>
          {filteredProperties.map((property) => (
            <Grid item xs={12} md={6} lg={4} key={property.id}>
              <Card 
                sx={{ 
                  cursor: 'pointer',
                  '&:hover': { 
                    elevation: 4,
                    transform: 'translateY(-2px)',
                    transition: 'all 0.2s'
                  }
                }}
                onClick={() => router.push(`/properties/${property.id}`)}
              >
                {/* Property Image */}
                <Box
                  sx={{
                    height: 160,
                    backgroundColor: 'grey.200',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'grey.600'
                  }}
                >
                  {getSystemIcon(property.systemType)}
                  <Typography variant="caption" sx={{ ml: 1 }}>
                    {property.systemType}
                  </Typography>
                </Box>

                <CardContent>
                  {/* Property Header */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="h6" gutterBottom>
                        {property.customerName}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <LocationIcon sx={{ fontSize: 16, mr: 0.5, color: 'text.secondary' }} />
                        <Typography variant="body2" color="text.secondary">
                          {property.address}
                        </Typography>
                      </Box>
                    </Box>
                    <IconButton 
                      size="small" 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMenuOpen(e, property);
                      }}
                    >
                      <MoreVertIcon />
                    </IconButton>
                  </Box>

                  {/* Status and System Health */}
                  <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                    <Chip
                      label={property.status}
                      size="small"
                      color={getStatusColor(property.status) as any}
                      icon={property.status === 'All Systems Online' ? <CheckCircleIcon /> : <WarningIcon />}
                    />
                    <Chip
                      label={`${property.systemHealth}% System Health`}
                      size="small"
                      color={property.systemHealth > 90 ? 'success' : property.systemHealth > 75 ? 'warning' : 'error'}
                      icon={<StarIcon />}
                    />
                    {property.alerts.length > 0 && (
                      <Chip
                        label={`${property.alerts.length} Alert${property.alerts.length > 1 ? 's' : ''}`}
                        size="small"
                        color="error"
                        icon={<ErrorIcon />}
                      />
                    )}
                  </Box>

                  {/* System Details */}
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" sx={{ mb: 0.5 }}>
                      <strong>Installed:</strong> {property.installationDate} • <strong>Service:</strong> {property.monthlyServiceFee}
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 0.5 }}>
                      <strong>Brands:</strong> {property.systemBrands.slice(0, 2).join(', ')}
                      {property.systemBrands.length > 2 && ` +${property.systemBrands.length - 2} more`}
                    </Typography>
                  </Box>

                  {/* Device Stats */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h6" color="primary">
                        {property.connectedDevices}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Connected
                      </Typography>
                    </Box>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h6" color="success.main">
                        {property.activeZones}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Zones
                      </Typography>
                    </Box>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h6" color="info.main">
                        {property.devices.security}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Security
                      </Typography>
                    </Box>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h6" color="warning.main">
                        {property.devices.lighting}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Lighting
                      </Typography>
                    </Box>
                  </Box>

                  {/* Tags and Response Time */}
                  <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mb: 1 }}>
                    {property.tags.slice(0, 2).map((tag, index) => (
                      <Chip key={index} label={tag} size="small" variant="outlined" />
                    ))}
                    {property.tags.length > 2 && (
                      <Chip label={`+${property.tags.length - 2}`} size="small" variant="outlined" />
                    )}
                  </Box>

                  {/* Last System Check */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="caption" color="text.secondary">
                      Last check: {property.lastSystemCheck}
                    </Typography>
                    <Typography variant="caption" color="success.main" sx={{ fontWeight: 'medium' }}>
                      {property.responseTime}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Paper>

      {/* Context Menu */}
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => {
          router.push(`/properties/${selectedProperty?.id}`);
          handleMenuClose();
        }}>
          <ViewIcon sx={{ mr: 1 }} />
          View System Details
        </MenuItem>
        <MenuItem onClick={handleMenuClose}>
          <SettingsIcon sx={{ mr: 1 }} />
          System Diagnostics
        </MenuItem>
        <MenuItem onClick={handleMenuClose}>
          <RouterIcon sx={{ mr: 1 }} />
          Network Status
        </MenuItem>
        <MenuItem onClick={handleMenuClose}>
          <StarIcon sx={{ mr: 1 }} />
          Schedule Maintenance
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleMenuClose} sx={{ color: 'error.main' }}>
          <DeleteIcon sx={{ mr: 1 }} />
          Remove System
        </MenuItem>
      </Menu>

      {/* New Property Dialog */}
      <Dialog open={newSystemDialog} onClose={() => setNewSystemDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Add New System</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Add a new system to your monitoring system.
          </Typography>
          {/* Add form fields here */}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setNewSystemDialog(false)}>Cancel</Button>
          <Button variant="contained">Add System</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
} 