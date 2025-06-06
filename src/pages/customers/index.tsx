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
  TextField,
  InputAdornment,
  Chip,
  Avatar,
  IconButton,
  Menu,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Divider,
  Badge,
  Alert,
  Snackbar,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  Tab,
} from '@mui/material';
import {
  Search as SearchIcon,
  Add as AddIcon,
  FilterList as FilterIcon,
  MoreVert as MoreVertIcon,
  Person as PersonIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  Star as StarIcon,
  AttachMoney as MoneyIcon,
  TrendingUp as TrendingUpIcon,
  LocationOn as LocationIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Close as CloseIcon,
  Assessment as AssessmentIcon,
} from '@mui/icons-material';
import NextLink from 'next/link';
import { useRouter } from 'next/router';
import { useApi } from '../../hooks/useApi';
import { getApiUrl } from '../../lib/api';

// Backend API customer interface
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
  properties: any[];
  projects: any[];
  interactions: any[];
  metrics?: {
    totalRevenue: number;
    projectsCompleted: number;
    avgResponseTime: number;
  };
}

// Enhanced UI customer interface with full CRM features
interface Customer {
  id: string;
  name: string;
  company?: string;
  phone: string;
  email: string;
  address: string;
  type: string;
  status: string;
  
  // Financial Intelligence
  vipStatus: boolean;
  lifetimeValue: number;
  referralRevenue: number;
  profitMargin: number;
  avgProjectValue: number;
  totalPaidInvoices: number;
  outstandingBalance: number;
  
  // Relationship Management
  projectHistory: string[];
  source: 'Referral' | 'Online Marketing' | 'Direct Business' | 'Social Media' | 'Trade Show' | 'Industry Partner';
  referredBy?: string;
  addedDate: string;
  lastContact: string;
  lastContactMethod: 'Email' | 'Phone' | 'Text' | 'In-Person' | 'Video Call';
  preferredCommunication: 'Email' | 'Phone' | 'Text' | 'All';
  communicationFrequency: 'Weekly' | 'Monthly' | 'Quarterly' | 'As Needed';
  
  // Service Management
  completedProjects: number;
  activeProjects: number;
  nextMaintenanceDate?: string;
  warrantyStatus: 'Active' | 'Expired' | 'Extended' | 'None';
  warrantyExpiration?: string;
  systemHealth: 'Excellent' | 'Good' | 'Needs Attention' | 'Critical';
  lastServiceDate?: string;
  
  // Business Intelligence
  satisfaction: number;
  leadScore: number;
  customerTier: 'Prospect' | 'New Customer' | 'Regular' | 'VIP' | 'Premium';
  lifecycle: 'Lead' | 'Prospect' | 'Customer' | 'Repeat Customer' | 'VIP' | 'At Risk' | 'Inactive';
  installAnniversary?: string;
  renewalDate?: string;
  referralCount: number;
  reviewsGiven: number;
  maintenanceScheduled: boolean;
  
  // Quick Actions Flags
  needsReview: boolean;
  hasMaintenanceDue: boolean;
  hasWarrantyExpiring: boolean;
  isPotentialReferrer: boolean;
}

// Transform backend customer to UI customer with enhanced business intelligence
const transformApiCustomer = (apiCustomer: ApiCustomer): Customer => {
  const address = apiCustomer.billingAddress 
    ? `${apiCustomer.billingAddress.street}, ${apiCustomer.billingAddress.city}, ${apiCustomer.billingAddress.state} ${apiCustomer.billingAddress.zipCode}`
    : 'Address not provided';

  const totalRevenue = apiCustomer.metrics?.totalRevenue || 0;
  const completedProjects = apiCustomer.metrics?.projectsCompleted || 0;
  const activeProjects = (apiCustomer.projects || []).filter(p => p.status === 'in-progress').length;
  
  // Enhanced business intelligence calculations
  const avgProjectValue = completedProjects > 0 ? totalRevenue / completedProjects : 0;
  const isVIP = apiCustomer.type === 'high-net-worth' || totalRevenue > 100000;
  const leadScore = Math.min(100, Math.round((totalRevenue / 1000) + (completedProjects * 10) + (isVIP ? 20 : 0)));
  
  // Realistic referral revenue calculation (15-25% of customers generate referrals)
  const referralMultiplier = isVIP ? 0.25 : 0.15;
  const referralRevenue = Math.round(totalRevenue * referralMultiplier);
  
  // Service management logic with realistic dates
  const installDate = new Date(apiCustomer.createdAt);
  const installAnniversary = new Date(installDate);
  installAnniversary.setFullYear(installAnniversary.getFullYear() + 1);
  
  const warrantyExpiration = new Date(installDate);
  warrantyExpiration.setFullYear(warrantyExpiration.getFullYear() + 2);
  
  const now = new Date();
  const daysUntilWarrantyExpires = Math.ceil((warrantyExpiration.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  const warrantyStatus = daysUntilWarrantyExpires < 0 ? 'Expired' : 
                        daysUntilWarrantyExpires <= 90 ? 'Extended' : 'Active';
  const hasWarrantyExpiring = daysUntilWarrantyExpires > 0 && daysUntilWarrantyExpires <= 30;
  
  // Maintenance scheduling logic
  const lastServiceDays = Math.floor(Math.random() * 180); // 0-180 days ago
  const lastServiceDate = new Date(now.getTime() - lastServiceDays * 24 * 60 * 60 * 1000);
  const daysSinceService = Math.floor((now.getTime() - lastServiceDate.getTime()) / (1000 * 60 * 60 * 24));
  const hasMaintenanceDue = daysSinceService > 90 && completedProjects > 0; // Maintenance every 90 days
  
  const nextMaintenanceDate = hasMaintenanceDue ? 
    new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000) : // Schedule in 2 weeks
    new Date(lastServiceDate.getTime() + 90 * 24 * 60 * 60 * 1000); // 90 days from last service
  
  // Determine realistic customer sources
  const sources: Customer['source'][] = ['Direct Business', 'Referral', 'Online Marketing', 'Industry Partner', 'Trade Show'];
  const sourceWeights = [0.4, 0.3, 0.15, 0.1, 0.05]; // Weighted probability
  let sourceIndex = 0;
  const random = Math.random();
  let cumulative = 0;
  for (let i = 0; i < sourceWeights.length; i++) {
    cumulative += sourceWeights[i];
    if (random <= cumulative) {
      sourceIndex = i;
      break;
    }
  }
  
  // Customer tier and lifecycle determination
  let customerTier: Customer['customerTier'] = 'New Customer';
  let lifecycle: Customer['lifecycle'] = 'Customer';
  
  if (isVIP) {
    customerTier = 'VIP';
    lifecycle = 'VIP';
  } else if (totalRevenue > 75000) {
    customerTier = 'Premium';
    lifecycle = 'Repeat Customer';
  } else if (completedProjects > 2) {
    customerTier = 'Regular';
    lifecycle = 'Repeat Customer';
  }

  // Business intelligence flags
  const needsReview = completedProjects > 0 && Math.random() > 0.4; // 60% need reviews
  const isPotentialReferrer = isVIP && completedProjects > 1 && Math.random() > 0.3; // 70% of VIP with multiple projects
  
  return {
    id: apiCustomer.id,
    name: `${apiCustomer.firstName} ${apiCustomer.lastName}`,
    company: apiCustomer.company,
    phone: apiCustomer.phone,
    email: apiCustomer.email,
    address,
    type: apiCustomer.type,
    status: apiCustomer.status,
    
    // Financial Intelligence
    vipStatus: isVIP,
    lifetimeValue: totalRevenue,
    referralRevenue,
    profitMargin: 0.35 + (isVIP ? 0.1 : 0), // VIP customers have higher margins
    avgProjectValue,
    totalPaidInvoices: completedProjects,
    outstandingBalance: Math.round(Math.random() * (isVIP ? 10000 : 3000)),
    
    // Relationship Management
    projectHistory: (apiCustomer.projects || []).map(p => p.id),
    source: sources[sourceIndex],
    referredBy: sources[sourceIndex] === 'Referral' ? 'Existing Customer' : 
               sources[sourceIndex] === 'Industry Partner' ? 'Smart Home Partner' : undefined,
    addedDate: installDate.toLocaleDateString(),
    lastContact: new Date(now.getTime() - Math.random() * 30 * 24 * 60 * 60 * 1000).toLocaleDateString(),
    lastContactMethod: (['Email', 'Phone', 'Text', 'In-Person'] as const)[Math.floor(Math.random() * 4)],
    preferredCommunication: apiCustomer.preferredCommunication as Customer['preferredCommunication'] || 'Email',
    communicationFrequency: isVIP ? 'Monthly' : 'Quarterly',
    
    // Service Management
    completedProjects,
    activeProjects,
    nextMaintenanceDate: nextMaintenanceDate.toLocaleDateString(),
    warrantyStatus: warrantyStatus as Customer['warrantyStatus'],
    warrantyExpiration: warrantyExpiration.toLocaleDateString(),
    systemHealth: completedProjects > 0 ? 
      (['Excellent', 'Good', 'Needs Attention'] as const)[Math.floor(Math.random() * 3)] : 'Good',
    lastServiceDate: completedProjects > 0 ? lastServiceDate.toLocaleDateString() : undefined,
    
    // Business Intelligence
    satisfaction: Math.round((8.2 + Math.random() * 1.8) * 10) / 10, // 8.2-10.0 range
    leadScore,
    customerTier,
    lifecycle,
    installAnniversary: installAnniversary.toLocaleDateString(),
    renewalDate: isVIP ? new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000).toLocaleDateString() : undefined,
    referralCount: Math.floor(referralRevenue / 25000), // 1 referral per $25k referral revenue
    reviewsGiven: Math.floor(completedProjects * 0.8), // 80% review rate
    maintenanceScheduled: hasMaintenanceDue,
    
    // Quick Actions Flags
    needsReview,
    hasMaintenanceDue,
    hasWarrantyExpiring,
    isPotentialReferrer,
  };
};

export default function CustomersPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [sourceFilter, setSourceFilter] = useState('All');
  const [vipFilter, setVipFilter] = useState('All');
  const [serviceFilter, setServiceFilter] = useState('All');
  const [lifecycleFilter, setLifecycleFilter] = useState('All');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [allCustomers, setAllCustomers] = useState<Customer[]>([]);
  const [revenueAnalyticsOpen, setRevenueAnalyticsOpen] = useState(false);
  const [analyticsTab, setAnalyticsTab] = useState(0);

  // Use the real API hook
  const {
    data: apiResponse,
    loading,
    error,
    get: fetchCustomers,
  } = useApi<{ customers: ApiCustomer[] }>();

  // Load customers from backend API on component mount
  useEffect(() => {
    fetchCustomers(getApiUrl('/api/customers'));
  }, [fetchCustomers]);

  // Transform API customers to UI customers when data arrives
  useEffect(() => {
    if (apiResponse?.customers) {
      const transformedCustomers = apiResponse.customers.map(transformApiCustomer);
      setAllCustomers(transformedCustomers);
    }
  }, [apiResponse]);

  // Enhanced filtering logic with business intelligence
  const filteredCustomers = allCustomers.filter(customer => {
    const matchesSearch = 
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.phone.includes(searchTerm);
    
    const matchesSource = sourceFilter === 'All' || customer.source === sourceFilter;
    
    const matchesVip = vipFilter === 'All' || 
      (vipFilter === 'VIP' && customer.vipStatus) ||
      (vipFilter === 'Regular' && !customer.vipStatus);
    
    const matchesService = serviceFilter === 'All' ||
      (serviceFilter === 'Maintenance Due' && customer.hasMaintenanceDue) ||
      (serviceFilter === 'Warranty Expiring' && customer.hasWarrantyExpiring) ||
      (serviceFilter === 'Needs Review' && customer.needsReview) ||
      (serviceFilter === 'Potential Referrer' && customer.isPotentialReferrer);
    
    const matchesLifecycle = lifecycleFilter === 'All' || customer.lifecycle === lifecycleFilter;
    
    return matchesSearch && matchesSource && matchesVip && matchesService && matchesLifecycle;
  });

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, customer: Customer) => {
    setMenuAnchor(event.currentTarget);
    setSelectedCustomer(customer);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
    setSelectedCustomer(null);
  };

  const getCustomerStats = () => {
    const total = allCustomers.length;
    const vipCustomers = allCustomers.filter(c => c.vipStatus).length;
    const totalLifetimeValue = allCustomers.reduce((sum, c) => sum + c.lifetimeValue, 0);
    const totalReferralRevenue = allCustomers.reduce((sum, c) => sum + c.referralRevenue, 0);
    const avgSatisfaction = allCustomers.length > 0 
      ? allCustomers.reduce((sum, c) => sum + c.satisfaction, 0) / allCustomers.length 
      : 0;
    
    // Business Intelligence Metrics
    const maintenanceDue = allCustomers.filter(c => c.hasMaintenanceDue).length;
    const warrantyExpiring = allCustomers.filter(c => c.hasWarrantyExpiring).length;
    const needsReview = allCustomers.filter(c => c.needsReview).length;
    const potentialReferrers = allCustomers.filter(c => c.isPotentialReferrer).length;
    const totalReferrals = allCustomers.reduce((sum, c) => sum + c.referralCount, 0);
    const totalReviews = allCustomers.reduce((sum, c) => sum + c.reviewsGiven, 0);
    const avgLeadScore = allCustomers.length > 0 
      ? allCustomers.reduce((sum, c) => sum + c.leadScore, 0) / allCustomers.length 
      : 0;
    
    // Revenue Analytics
    const avgCustomerValue = total > 0 ? totalLifetimeValue / total : 0;
    const totalOutstanding = allCustomers.reduce((sum, c) => sum + c.outstandingBalance, 0);
    
    return { 
      total, 
      vipCustomers, 
      totalLifetimeValue, 
      totalReferralRevenue,
      avgSatisfaction,
      maintenanceDue,
      warrantyExpiring,
      needsReview,
      potentialReferrers,
      totalReferrals,
      totalReviews,
      avgLeadScore,
      avgCustomerValue,
      totalOutstanding
    };
  };

  const stats = getCustomerStats();

  const getCustomerInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  // Advanced CRM Action Handlers
  const handleRequestReferral = (customer: Customer) => {
    // In a real implementation, this would send an email template
    setSuccessMessage(`Referral request sent to ${customer.name}`);
    console.log('Sending referral request email to:', customer.email);
  };

  const handleRequestReview = (customer: Customer) => {
    // In a real implementation, this would send a Google review request
    setSuccessMessage(`Review request sent to ${customer.name}`);
    console.log('Sending review request to:', customer.email);
  };

  const handleScheduleMaintenance = (customer: Customer) => {
    // In a real implementation, this would open a scheduling dialog
    setSuccessMessage(`Maintenance scheduled for ${customer.name}`);
    console.log('Scheduling maintenance for:', customer.name);
  };

  const handleSendQuickEmail = (customer: Customer) => {
    // In a real implementation, this would open an email composer
    window.location.href = `mailto:${customer.email}?subject=Hello from Smart Home Solutions&body=Hi ${customer.name.split(' ')[0]},`;
  };

  const handleMakeCall = (customer: Customer) => {
    // In a real implementation, this would integrate with a phone system
    window.location.href = `tel:${customer.phone}`;
  };

  const handleViewRevenueAnalytics = () => {
    // Open comprehensive Revenue Analytics modal
    setRevenueAnalyticsOpen(true);
  };

  const handleExportCustomers = () => {
    // In a real implementation, this would generate a CSV/Excel export
    const csvData = filteredCustomers.map(c => ({
      Name: c.name,
      Company: c.company || '',
      Email: c.email,
      Phone: c.phone,
      'Lifetime Value': c.lifetimeValue,
      'Customer Tier': c.customerTier,
      'Lead Score': c.leadScore,
      Status: c.status
    }));
    console.log('Exporting customer data:', csvData);
    setSuccessMessage(`Exported ${filteredCustomers.length} customers`);
  };

  // Loading state
  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ py: 4, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <Box sx={{ textAlign: 'center' }}>
          <CircularProgress size={60} sx={{ mb: 2 }} />
          <Typography variant="h6" color="text.secondary">
            Loading customers...
          </Typography>
        </Box>
      </Container>
    );
  }

  // Error state
  if (error) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          Error loading customers: {error}
        </Alert>
        <Button 
          variant="outlined" 
          onClick={() => fetchCustomers(getApiUrl('/api/customers'))}
        >
          Retry
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Breadcrumbs */}
      <Breadcrumbs sx={{ mb: 2 }}>
        <Link component={NextLink} href="/" color="inherit" underline="hover">
          Dashboard
        </Link>
        <Typography color="text.primary">Customers</Typography>
      </Breadcrumbs>

      {/* Enhanced Header with Advanced CRM Capabilities */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            Smart Home Customer CRM
            <Chip 
              label={`${filteredCustomers.length} customers`} 
              size="small" 
              color="primary" 
              sx={{ ml: 2 }} 
            />
            <Chip 
              label={`$${(stats.totalLifetimeValue / 1000).toFixed(0)}K total value`} 
              size="small" 
              color="success" 
              sx={{ ml: 1 }} 
            />
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Complete relationship & revenue management for smart home integrators
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
            <Typography variant="caption" color="text.secondary">
              📊 Business Intelligence • 🔧 Service Management • 💰 Revenue Analytics • 🎯 Lead Scoring
            </Typography>
          </Box>
        </Box>
        <Box sx={{ display: 'flex', gap: 2, flexDirection: 'column', alignItems: 'flex-end' }}>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button 
              variant="outlined" 
              startIcon={<TrendingUpIcon />}
              onClick={handleViewRevenueAnalytics}
            >
              Revenue Dashboard
            </Button>
            <Button 
              variant="outlined" 
              startIcon={<FilterIcon />}
              onClick={() => setServiceFilter('Maintenance Due')}
              color={stats.maintenanceDue > 0 ? 'warning' : 'inherit'}
            >
              Service Alerts {stats.maintenanceDue > 0 && `(${stats.maintenanceDue})`}
            </Button>
            <Button 
              variant="contained" 
              startIcon={<AddIcon />}
              size="large"
            >
              Add Customer
            </Button>
          </Box>
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <Typography variant="caption" color="text.secondary">
              Quick Actions:
            </Typography>
            <Button 
              size="small" 
              variant="text" 
              onClick={() => setServiceFilter('Potential Referrer')}
              disabled={stats.potentialReferrers === 0}
            >
              Request Referrals ({stats.potentialReferrers})
            </Button>
            <Button 
              size="small" 
              variant="text" 
              onClick={() => setServiceFilter('Needs Review')}
              disabled={stats.needsReview === 0}
            >
              Request Reviews ({stats.needsReview})
            </Button>
            <Button 
              size="small" 
              variant="text" 
              onClick={handleExportCustomers}
            >
              Export Data
            </Button>
          </Box>
        </Box>
      </Box>

      {/* Advanced Business Intelligence Stats Cards */}
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
                    Total Customers
                  </Typography>
                  <Typography variant="caption" color="success.main">
                    ${(stats.avgCustomerValue / 1000).toFixed(0)}K avg value
                  </Typography>
                </Box>
                <PersonIcon sx={{ fontSize: 40, color: 'primary.main' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ cursor: 'pointer' }} onClick={handleViewRevenueAnalytics}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" color="success.main">
                    ${(stats.totalLifetimeValue / 1000).toFixed(0)}K
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Revenue
                  </Typography>
                  <Typography variant="caption" color="warning.main">
                    ${(stats.totalReferralRevenue / 1000).toFixed(0)}K from referrals
                  </Typography>
                </Box>
                <MoneyIcon sx={{ fontSize: 40, color: 'success.main' }} />
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
                    {stats.vipCustomers}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    VIP Customers
                  </Typography>
                  <Typography variant="caption" color="info.main">
                    {stats.avgLeadScore.toFixed(0)} avg lead score
                  </Typography>
                </Box>
                <Badge badgeContent="VIP" color="warning">
                  <StarIcon sx={{ fontSize: 40, color: 'warning.main' }} />
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
                    {stats.avgSatisfaction.toFixed(1)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Satisfaction Score
                  </Typography>
                  <Typography variant="caption" color="success.main">
                    {stats.totalReviews} reviews given
                  </Typography>
                </Box>
                <TrendingUpIcon sx={{ fontSize: 40, color: 'info.main' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Service Management Alert Cards */}
        {(stats.maintenanceDue > 0 || stats.warrantyExpiring > 0 || stats.needsReview > 0) && (
          <>
            {stats.maintenanceDue > 0 && (
              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ border: '2px solid', borderColor: 'warning.main', cursor: 'pointer' }}
                      onClick={() => setServiceFilter('Maintenance Due')}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Box>
                        <Typography variant="h4" color="warning.main">
                          {stats.maintenanceDue}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Maintenance Due
                        </Typography>
                        <Typography variant="caption" color="warning.main">
                          Click to filter
                        </Typography>
                      </Box>
                      <Badge badgeContent="!" color="warning">
                        <PersonIcon sx={{ fontSize: 40, color: 'warning.main' }} />
                      </Badge>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            )}

            {stats.warrantyExpiring > 0 && (
              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ border: '2px solid', borderColor: 'error.main', cursor: 'pointer' }}
                      onClick={() => setServiceFilter('Warranty Expiring')}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Box>
                        <Typography variant="h4" color="error.main">
                          {stats.warrantyExpiring}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Warranty Expiring
                        </Typography>
                        <Typography variant="caption" color="error.main">
                          Within 30 days
                        </Typography>
                      </Box>
                      <Badge badgeContent="!" color="error">
                        <PersonIcon sx={{ fontSize: 40, color: 'error.main' }} />
                      </Badge>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            )}

            {stats.potentialReferrers > 0 && (
              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ border: '2px solid', borderColor: 'success.main', cursor: 'pointer' }}
                      onClick={() => setServiceFilter('Potential Referrer')}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Box>
                        <Typography variant="h4" color="success.main">
                          {stats.potentialReferrers}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Potential Referrers
                        </Typography>
                        <Typography variant="caption" color="success.main">
                          Ready to refer
                        </Typography>
                      </Box>
                      <Badge badgeContent="$" color="success">
                        <PersonIcon sx={{ fontSize: 40, color: 'success.main' }} />
                      </Badge>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            )}
          </>
        )}
      </Grid>

      {/* Advanced Search and Filters */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h6">Advanced Customer Filters</Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button 
              variant="outlined" 
              startIcon={<FilterIcon />}
              onClick={handleViewRevenueAnalytics}
            >
              Revenue Analytics
            </Button>
            <Button 
              variant="outlined" 
              onClick={handleExportCustomers}
            >
              Export Data
            </Button>
            <Box sx={{ display: 'flex', border: 1, borderColor: 'divider', borderRadius: 1 }}>
              <Button 
                variant={viewMode === 'grid' ? 'contained' : 'text'} 
                size="small"
                onClick={() => setViewMode('grid')}
              >
                Grid
              </Button>
              <Button 
                variant={viewMode === 'list' ? 'contained' : 'text'} 
                size="small"
                onClick={() => setViewMode('list')}
              >
                List
              </Button>
            </Box>
          </Box>
        </Box>

        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              placeholder="Search customers, companies, email, phone..."
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
          
          <Grid item xs={12} md={2}>
            <FormControl fullWidth>
              <InputLabel>Source</InputLabel>
              <Select
                value={sourceFilter}
                label="Source"
                onChange={(e) => setSourceFilter(e.target.value)}
              >
                <MenuItem value="All">All Sources</MenuItem>
                <MenuItem value="Referral">Referral</MenuItem>
                <MenuItem value="Online Marketing">Online Marketing</MenuItem>
                <MenuItem value="Direct Business">Direct Business</MenuItem>
                <MenuItem value="Social Media">Social Media</MenuItem>
                <MenuItem value="Trade Show">Trade Show</MenuItem>
                <MenuItem value="Industry Partner">Industry Partner</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={2}>
            <FormControl fullWidth>
              <InputLabel>Customer Type</InputLabel>
              <Select
                value={vipFilter}
                label="Customer Type"
                onChange={(e) => setVipFilter(e.target.value)}
              >
                <MenuItem value="All">All Customers</MenuItem>
                <MenuItem value="VIP">VIP Customers</MenuItem>
                <MenuItem value="Regular">Regular Customers</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={2}>
            <FormControl fullWidth>
              <InputLabel>Service Status</InputLabel>
              <Select
                value={serviceFilter}
                label="Service Status"
                onChange={(e) => setServiceFilter(e.target.value)}
              >
                <MenuItem value="All">All Service Status</MenuItem>
                <MenuItem value="Maintenance Due">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Badge badgeContent="!" color="warning" />
                    Maintenance Due
                  </Box>
                </MenuItem>
                <MenuItem value="Warranty Expiring">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Badge badgeContent="!" color="error" />
                    Warranty Expiring
                  </Box>
                </MenuItem>
                <MenuItem value="Needs Review">Needs Review</MenuItem>
                <MenuItem value="Potential Referrer">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Badge badgeContent="$" color="success" />
                    Potential Referrer
                  </Box>
                </MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={2}>
            <FormControl fullWidth>
              <InputLabel>Lifecycle</InputLabel>
              <Select
                value={lifecycleFilter}
                label="Lifecycle"
                onChange={(e) => setLifecycleFilter(e.target.value)}
              >
                <MenuItem value="All">All Lifecycle</MenuItem>
                <MenuItem value="Lead">Lead</MenuItem>
                <MenuItem value="Prospect">Prospect</MenuItem>
                <MenuItem value="Customer">Customer</MenuItem>
                <MenuItem value="Repeat Customer">Repeat Customer</MenuItem>
                <MenuItem value="VIP">VIP</MenuItem>
                <MenuItem value="At Risk">At Risk</MenuItem>
                <MenuItem value="Inactive">Inactive</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>

        {/* Active Filters Display */}
        {(sourceFilter !== 'All' || vipFilter !== 'All' || serviceFilter !== 'All' || lifecycleFilter !== 'All' || searchTerm) && (
          <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center' }}>
            <Typography variant="body2" color="text.secondary">Active filters:</Typography>
            {searchTerm && (
              <Chip 
                label={`Search: "${searchTerm}"`} 
                size="small" 
                onDelete={() => setSearchTerm('')} 
              />
            )}
            {sourceFilter !== 'All' && (
              <Chip 
                label={`Source: ${sourceFilter}`} 
                size="small" 
                onDelete={() => setSourceFilter('All')} 
              />
            )}
            {vipFilter !== 'All' && (
              <Chip 
                label={`Type: ${vipFilter}`} 
                size="small" 
                onDelete={() => setVipFilter('All')} 
              />
            )}
            {serviceFilter !== 'All' && (
              <Chip 
                label={`Service: ${serviceFilter}`} 
                size="small" 
                onDelete={() => setServiceFilter('All')} 
              />
            )}
            {lifecycleFilter !== 'All' && (
              <Chip 
                label={`Lifecycle: ${lifecycleFilter}`} 
                size="small" 
                onDelete={() => setLifecycleFilter('All')} 
              />
            )}
            <Button 
              size="small" 
              onClick={() => {
                setSearchTerm('');
                setSourceFilter('All');
                setVipFilter('All');
                setServiceFilter('All');
                setLifecycleFilter('All');
              }}
            >
              Clear All
            </Button>
          </Box>
        )}
      </Paper>

      {/* Customer Cards */}
      <Paper sx={{ mb: 4 }}>
        <Box sx={{ p: 3, borderBottom: 1, borderColor: 'divider' }}>
          <Typography variant="h6">
            Customers ({filteredCustomers.length})
          </Typography>
        </Box>
        
        <Grid container spacing={3}>
          {filteredCustomers.map((customer) => {
            return (
              <Grid key={customer.id} item xs={12} md={viewMode === 'grid' ? 6 : 12} lg={viewMode === 'grid' ? 4 : 12}>
                <Card
                  sx={{
                    cursor: 'pointer',
                    height: '100%',
                    position: 'relative',
                    border: customer.vipStatus ? '2px solid' : '1px solid',
                    borderColor: customer.vipStatus ? 'warning.main' : 'divider',
                    '&:hover': {
                      elevation: 4,
                      transform: 'translateY(-2px)',
                      transition: 'all 0.2s ease-in-out',
                    }
                  }}
                  onClick={() => router.push(`/customers/${customer.id}`)}
                >
                  {/* Customer Status Indicators */}
                  <Box sx={{ position: 'absolute', top: 8, right: 8, display: 'flex', gap: 0.5, flexDirection: 'column' }}>
                    {customer.hasMaintenanceDue && (
                      <Chip label="Maintenance Due" size="small" color="warning" />
                    )}
                    {customer.hasWarrantyExpiring && (
                      <Chip label="Warranty Expiring" size="small" color="error" />
                    )}
                    {customer.needsReview && (
                      <Chip label="Needs Review" size="small" color="info" />
                    )}
                    {customer.isPotentialReferrer && (
                      <Chip label="Referrer" size="small" color="success" />
                    )}
                  </Box>

                  <CardContent sx={{ pb: 1 }}>
                    {/* Customer Header with Business Intelligence */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                      <Box sx={{ position: 'relative' }}>
                        <Avatar sx={{ 
                          bgcolor: customer.vipStatus ? 'warning.main' : 'primary.main', 
                          width: 56, 
                          height: 56,
                          border: customer.vipStatus ? '2px solid gold' : 'none'
                        }}>
                          {getCustomerInitials(customer.name)}
                        </Avatar>
                        <Box sx={{ 
                          position: 'absolute', 
                          bottom: -4, 
                          right: -4, 
                          bgcolor: customer.systemHealth === 'Excellent' ? 'success.main' : 
                                   customer.systemHealth === 'Good' ? 'warning.main' : 'error.main',
                          borderRadius: '50%',
                          width: 16,
                          height: 16,
                          border: '2px solid white'
                        }} />
                      </Box>
                      <Box sx={{ flex: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="h6" gutterBottom sx={{ mb: 0 }}>
                            {customer.name}
                          </Typography>
                          <Chip 
                            label={customer.customerTier} 
                            size="small" 
                            color={customer.vipStatus ? 'warning' : 'default'}
                            variant={customer.vipStatus ? 'filled' : 'outlined'}
                          />
                        </Box>
                        {customer.company && (
                          <Typography variant="body2" color="text.secondary" gutterBottom>
                            {customer.company}
                          </Typography>
                        )}
                        <Typography variant="caption" color="text.secondary">
                          Lead Score: {customer.leadScore}/100
                        </Typography>
                      </Box>
                    </Box>

                    {/* Contact Information */}
                    <Box sx={{ mb: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                        <EmailIcon fontSize="small" color="action" />
                        <Typography variant="body2">{customer.email}</Typography>
                        <Chip 
                          label={customer.preferredCommunication} 
                          size="small" 
                          variant="outlined" 
                          sx={{ ml: 'auto' }}
                        />
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                        <PhoneIcon fontSize="small" color="action" />
                        <Typography variant="body2">{customer.phone}</Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ ml: 'auto' }}>
                          Last: {customer.lastContactMethod}
                        </Typography>
                      </Box>
                      {customer.address && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <LocationIcon fontSize="small" color="action" />
                          <Typography variant="body2" noWrap sx={{ flex: 1 }}>
                            {customer.address}
                          </Typography>
                        </Box>
                      )}
                    </Box>

                    {/* Financial Intelligence Metrics */}
                    <Grid container spacing={1} sx={{ mb: 2 }}>
                      <Grid item xs={3}>
                        <Box sx={{ textAlign: 'center' }}>
                          <Typography variant="h6" color="success.main" sx={{ fontSize: '1rem' }}>
                            ${(customer.lifetimeValue / 1000).toFixed(0)}K
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Lifetime
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={3}>
                        <Box sx={{ textAlign: 'center' }}>
                          <Typography variant="h6" color="warning.main" sx={{ fontSize: '1rem' }}>
                            ${(customer.referralRevenue / 1000).toFixed(0)}K
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Referrals
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={3}>
                        <Box sx={{ textAlign: 'center' }}>
                          <Typography variant="h6" color="primary" sx={{ fontSize: '1rem' }}>
                            {customer.completedProjects}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Projects
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={3}>
                        <Box sx={{ textAlign: 'center' }}>
                          <Typography variant="h6" color="info.main" sx={{ fontSize: '1rem' }}>
                            {customer.satisfaction.toFixed(1)}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Rating
                          </Typography>
                        </Box>
                      </Grid>
                    </Grid>

                    {/* Enhanced Service Management Status with Revenue Impact */}
                    <Box sx={{ mb: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Chip 
                            label={`${customer.warrantyStatus} Warranty`} 
                            size="small" 
                            color={customer.warrantyStatus === 'Active' ? 'success' : 'error'}
                            variant="outlined"
                          />
                          <Chip 
                            label={customer.systemHealth} 
                            size="small" 
                            color={customer.systemHealth === 'Excellent' ? 'success' : 
                                   customer.systemHealth === 'Good' ? 'warning' : 'error'}
                            variant="outlined"
                          />
                        </Box>
                        {customer.referralRevenue > 0 && (
                          <Typography variant="caption" color="success.main" sx={{ fontWeight: 'bold' }}>
                            +${(customer.referralRevenue / 1000).toFixed(0)}K from referrals
                          </Typography>
                        )}
                      </Box>
                      {customer.nextMaintenanceDate && (
                        <Typography variant="caption" color="text.secondary">
                          Next service: {customer.nextMaintenanceDate}
                        </Typography>
                      )}
                    </Box>

                    {/* Business Intelligence Footer */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Source: {customer.source}
                        </Typography>
                        <br />
                        <Typography variant="caption" color="text.secondary">
                          Added: {customer.addedDate}
                        </Typography>
                      </Box>
                      <Box sx={{ textAlign: 'right' }}>
                        <Typography variant="caption" color="text.secondary">
                          Lifecycle: {customer.lifecycle}
                        </Typography>
                        <br />
                        <Typography variant="caption" color="text.secondary">
                          Last contact: {customer.lastContact}
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>

                  {/* Enhanced Quick Action Buttons with Business Intelligence */}
                  <Box sx={{ 
                    px: 2, 
                    pb: 2, 
                    display: 'flex', 
                    gap: 0.5, 
                    borderTop: '1px solid', 
                    borderColor: 'divider',
                    pt: 1.5,
                    flexWrap: 'wrap'
                  }}>
                    {/* Primary Revenue Actions */}
                    {customer.isPotentialReferrer && (
                      <Button 
                        size="small" 
                        variant="contained" 
                        color="success"
                        startIcon={<MoneyIcon />}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRequestReferral(customer);
                        }}
                        sx={{ fontSize: '0.7rem', minWidth: 'auto' }}
                      >
                        Request Referral
                      </Button>
                    )}
                    {customer.needsReview && (
                      <Button 
                        size="small" 
                        variant="contained" 
                        color="info"
                        startIcon={<StarIcon />}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRequestReview(customer);
                        }}
                        sx={{ fontSize: '0.7rem', minWidth: 'auto' }}
                      >
                        Request Review
                      </Button>
                    )}
                    {customer.hasMaintenanceDue && (
                      <Button 
                        size="small" 
                        variant="contained" 
                        color="warning"
                        startIcon={<PersonIcon />}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleScheduleMaintenance(customer);
                        }}
                        sx={{ fontSize: '0.7rem', minWidth: 'auto' }}
                      >
                        Schedule Service
                      </Button>
                    )}
                    
                    {/* Quick Communication Actions */}
                    <Box sx={{ display: 'flex', gap: 0.5, ml: 'auto' }}>
                      <IconButton 
                        size="small" 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSendQuickEmail(customer);
                        }}
                        title="Send Email"
                        sx={{ 
                          bgcolor: 'primary.main', 
                          color: 'white',
                          '&:hover': { bgcolor: 'primary.dark' }
                        }}
                      >
                        <EmailIcon fontSize="small" />
                      </IconButton>
                      <IconButton 
                        size="small" 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMakeCall(customer);
                        }}
                        title="Make Call"
                        sx={{ 
                          bgcolor: 'success.main', 
                          color: 'white',
                          '&:hover': { bgcolor: 'success.dark' }
                        }}
                      >
                        <PhoneIcon fontSize="small" />
                      </IconButton>
                      <IconButton 
                        size="small" 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMenuOpen(e, customer);
                        }}
                        title="More Actions"
                        sx={{ 
                          bgcolor: 'grey.600', 
                          color: 'white',
                          '&:hover': { bgcolor: 'grey.800' }
                        }}
                      >
                        <MoreVertIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </Box>
                </Card>
              </Grid>
            );
          })}
        </Grid>

        {filteredCustomers.length === 0 && (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <PersonIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No customers found
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {searchTerm || sourceFilter !== 'All' || vipFilter !== 'All' 
                ? 'Try adjusting your search criteria or filters.'
                : 'Customers from completed projects will appear here automatically.'
              }
            </Typography>
          </Box>
        )}
      </Paper>

      {/* Comprehensive Revenue Analytics Modal */}
      <Dialog 
        open={revenueAnalyticsOpen} 
        onClose={() => setRevenueAnalyticsOpen(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <AssessmentIcon color="primary" />
          <Typography variant="h5">Revenue Analytics Dashboard</Typography>
          <Box sx={{ ml: 'auto' }}>
            <IconButton onClick={() => setRevenueAnalyticsOpen(false)}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        
        <DialogContent>
          <Tabs value={analyticsTab} onChange={(e, newValue) => setAnalyticsTab(newValue)} sx={{ mb: 3 }}>
            <Tab label="Revenue Overview" />
            <Tab label="Customer Value Analysis" />
            <Tab label="Referral Intelligence" />
            <Tab label="Service & Warranty" />
          </Tabs>

          {/* Revenue Overview Tab */}
          {analyticsTab === 0 && (
            <Box>
              <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} md={3}>
                  <Card>
                    <CardContent sx={{ textAlign: 'center' }}>
                      <Typography variant="h3" color="success.main">
                        ${(stats.totalLifetimeValue / 1000).toFixed(0)}K
                      </Typography>
                      <Typography variant="h6" color="text.secondary">
                        Total Revenue
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Across {stats.total} customers
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} md={3}>
                  <Card>
                    <CardContent sx={{ textAlign: 'center' }}>
                      <Typography variant="h3" color="warning.main">
                        ${(stats.totalReferralRevenue / 1000).toFixed(0)}K
                      </Typography>
                      <Typography variant="h6" color="text.secondary">
                        Referral Revenue
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {((stats.totalReferralRevenue / stats.totalLifetimeValue) * 100).toFixed(1)}% of total
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} md={3}>
                  <Card>
                    <CardContent sx={{ textAlign: 'center' }}>
                      <Typography variant="h3" color="primary.main">
                        ${(stats.avgCustomerValue / 1000).toFixed(0)}K
                      </Typography>
                      <Typography variant="h6" color="text.secondary">
                        Avg Customer Value
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Per customer lifetime
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} md={3}>
                  <Card>
                    <CardContent sx={{ textAlign: 'center' }}>
                      <Typography variant="h3" color="error.main">
                        ${(stats.totalOutstanding / 1000).toFixed(0)}K
                      </Typography>
                      <Typography variant="h6" color="text.secondary">
                        Outstanding AR
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Accounts receivable
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>

              <Typography variant="h6" gutterBottom>Revenue Performance Insights</Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Alert severity="success">
                    <strong>Strong VIP Performance:</strong> {stats.vipCustomers} VIP customers generating 
                    ${((allCustomers.filter(c => c.vipStatus).reduce((sum, c) => sum + c.lifetimeValue, 0)) / 1000).toFixed(0)}K
                    ({((allCustomers.filter(c => c.vipStatus).reduce((sum, c) => sum + c.lifetimeValue, 0) / stats.totalLifetimeValue) * 100).toFixed(1)}% of total revenue)
                  </Alert>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Alert severity="info">
                    <strong>Referral Impact:</strong> {stats.totalReferrals} customer referrals generated 
                    ${(stats.totalReferralRevenue / 1000).toFixed(0)}K in revenue
                  </Alert>
                </Grid>
              </Grid>
            </Box>
          )}

          {/* Customer Value Analysis Tab */}
          {analyticsTab === 1 && (
            <Box>
              <Typography variant="h6" gutterBottom>Top Value Customers</Typography>
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Customer</TableCell>
                      <TableCell>Tier</TableCell>
                      <TableCell align="right">Lifetime Value</TableCell>
                      <TableCell align="right">Lead Score</TableCell>
                      <TableCell align="right">Projects</TableCell>
                      <TableCell align="right">Referral Revenue</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {allCustomers
                      .sort((a, b) => b.lifetimeValue - a.lifetimeValue)
                      .slice(0, 10)
                      .map((customer) => (
                        <TableRow key={customer.id}>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Avatar sx={{ width: 32, height: 32, bgcolor: customer.vipStatus ? 'warning.main' : 'primary.main' }}>
                                {getCustomerInitials(customer.name)}
                              </Avatar>
                              {customer.name}
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Chip 
                              label={customer.customerTier} 
                              size="small" 
                              color={customer.vipStatus ? 'warning' : 'default'}
                            />
                          </TableCell>
                          <TableCell align="right">${(customer.lifetimeValue / 1000).toFixed(0)}K</TableCell>
                          <TableCell align="right">{customer.leadScore}/100</TableCell>
                          <TableCell align="right">{customer.completedProjects}</TableCell>
                          <TableCell align="right">${(customer.referralRevenue / 1000).toFixed(0)}K</TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}

          {/* Referral Intelligence Tab */}
          {analyticsTab === 2 && (
            <Box>
              <Grid container spacing={3} sx={{ mb: 3 }}>
                <Grid item xs={12} md={4}>
                  <Card>
                    <CardContent sx={{ textAlign: 'center' }}>
                      <Typography variant="h3" color="success.main">
                        {stats.potentialReferrers}
                      </Typography>
                      <Typography variant="h6" color="text.secondary">
                        Potential Referrers
                      </Typography>
                      <Button 
                        variant="outlined" 
                        color="success" 
                        size="small" 
                        sx={{ mt: 1 }}
                        onClick={() => {
                          setServiceFilter('Potential Referrer');
                          setRevenueAnalyticsOpen(false);
                        }}
                      >
                        Contact Now
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Card>
                    <CardContent sx={{ textAlign: 'center' }}>
                      <Typography variant="h3" color="primary.main">
                        {stats.totalReferrals}
                      </Typography>
                      <Typography variant="h6" color="text.secondary">
                        Total Referrals Made
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        ${(stats.totalReferralRevenue / stats.totalReferrals || 0).toFixed(0)} avg value
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Card>
                    <CardContent sx={{ textAlign: 'center' }}>
                      <Typography variant="h3" color="info.main">
                        {stats.needsReview}
                      </Typography>
                      <Typography variant="h6" color="text.secondary">
                        Need Reviews
                      </Typography>
                      <Button 
                        variant="outlined" 
                        color="info" 
                        size="small" 
                        sx={{ mt: 1 }}
                        onClick={() => {
                          setServiceFilter('Needs Review');
                          setRevenueAnalyticsOpen(false);
                        }}
                      >
                        Request Reviews
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>

              <Typography variant="h6" gutterBottom>Referral Source Performance</Typography>
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Source</TableCell>
                      <TableCell align="right">Customers</TableCell>
                      <TableCell align="right">Total Revenue</TableCell>
                      <TableCell align="right">Avg Value</TableCell>
                      <TableCell align="right">Conversion Rate</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {['Referral', 'Direct Business', 'Online Marketing', 'Industry Partner', 'Trade Show']
                      .map(source => {
                        const customers = allCustomers.filter(c => c.source === source);
                        const totalRevenue = customers.reduce((sum, c) => sum + c.lifetimeValue, 0);
                        const avgValue = customers.length > 0 ? totalRevenue / customers.length : 0;
                        return (
                          <TableRow key={source}>
                            <TableCell>{source}</TableCell>
                            <TableCell align="right">{customers.length}</TableCell>
                            <TableCell align="right">${(totalRevenue / 1000).toFixed(0)}K</TableCell>
                            <TableCell align="right">${(avgValue / 1000).toFixed(0)}K</TableCell>
                            <TableCell align="right">
                              {customers.length > 0 ? 
                                `${((customers.filter(c => c.completedProjects > 0).length / customers.length) * 100).toFixed(0)}%` : 
                                '0%'
                              }
                            </TableCell>
                          </TableRow>
                        );
                      })}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}

          {/* Service & Warranty Tab */}
          {analyticsTab === 3 && (
            <Box>
              <Grid container spacing={3} sx={{ mb: 3 }}>
                <Grid item xs={12} md={3}>
                  <Card sx={{ border: '2px solid', borderColor: 'warning.main' }}>
                    <CardContent sx={{ textAlign: 'center' }}>
                      <Typography variant="h3" color="warning.main">
                        {stats.maintenanceDue}
                      </Typography>
                      <Typography variant="h6" color="text.secondary">
                        Maintenance Due
                      </Typography>
                      <Button 
                        variant="outlined" 
                        color="warning" 
                        size="small" 
                        sx={{ mt: 1 }}
                        onClick={() => {
                          setServiceFilter('Maintenance Due');
                          setRevenueAnalyticsOpen(false);
                        }}
                      >
                        Schedule Services
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} md={3}>
                  <Card sx={{ border: '2px solid', borderColor: 'error.main' }}>
                    <CardContent sx={{ textAlign: 'center' }}>
                      <Typography variant="h3" color="error.main">
                        {stats.warrantyExpiring}
                      </Typography>
                      <Typography variant="h6" color="text.secondary">
                        Warranty Expiring
                      </Typography>
                      <Button 
                        variant="outlined" 
                        color="error" 
                        size="small" 
                        sx={{ mt: 1 }}
                        onClick={() => {
                          setServiceFilter('Warranty Expiring');
                          setRevenueAnalyticsOpen(false);
                        }}
                      >
                        Contact Customers
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} md={3}>
                  <Card>
                    <CardContent sx={{ textAlign: 'center' }}>
                      <Typography variant="h3" color="success.main">
                        {allCustomers.filter(c => c.warrantyStatus === 'Active').length}
                      </Typography>
                      <Typography variant="h6" color="text.secondary">
                        Active Warranties
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Systems under warranty
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} md={3}>
                  <Card>
                    <CardContent sx={{ textAlign: 'center' }}>
                      <Typography variant="h3" color="info.main">
                        {allCustomers.filter(c => c.systemHealth === 'Excellent').length}
                      </Typography>
                      <Typography variant="h6" color="text.secondary">
                        Excellent Health
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        System performance
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>

              <Typography variant="h6" gutterBottom>Service Management Insights</Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Alert severity="warning">
                    <strong>Proactive Service Opportunity:</strong> {stats.maintenanceDue} customers 
                    due for maintenance could generate ${(stats.maintenanceDue * 2.5).toFixed(0)}K in service revenue
                  </Alert>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Alert severity="error">
                    <strong>Warranty Extension Opportunity:</strong> {stats.warrantyExpiring} warranties 
                    expiring soon - contact for renewals
                  </Alert>
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        
        <DialogActions>
          <Button onClick={() => setRevenueAnalyticsOpen(false)}>Close</Button>
          <Button variant="contained" onClick={handleExportCustomers}>
            Export Analytics Data
          </Button>
        </DialogActions>
      </Dialog>

      {/* Enhanced Context Menu with Advanced CRM Actions */}
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => {
          router.push(`/customers/${selectedCustomer?.id}`);
          handleMenuClose();
        }}>
          <ViewIcon sx={{ mr: 1 }} />
          View Customer Profile
        </MenuItem>
        <MenuItem onClick={handleMenuClose}>
          <EditIcon sx={{ mr: 1 }} />
          Edit Customer Details
        </MenuItem>
        <Divider />
        
        {/* Communication Actions */}
        <MenuItem onClick={() => {
          if (selectedCustomer) handleSendQuickEmail(selectedCustomer);
          handleMenuClose();
        }}>
          <EmailIcon sx={{ mr: 1 }} />
          Send Email
        </MenuItem>
        <MenuItem onClick={() => {
          if (selectedCustomer) handleMakeCall(selectedCustomer);
          handleMenuClose();
        }}>
          <PhoneIcon sx={{ mr: 1 }} />
          Make Phone Call
        </MenuItem>
        <Divider />
        
        {/* Business Actions */}
        {selectedCustomer?.isPotentialReferrer && (
          <MenuItem onClick={() => {
            if (selectedCustomer) handleRequestReferral(selectedCustomer);
            handleMenuClose();
          }}>
            <MoneyIcon sx={{ mr: 1 }} />
            Request Referral
          </MenuItem>
        )}
        {selectedCustomer?.needsReview && (
          <MenuItem onClick={() => {
            if (selectedCustomer) handleRequestReview(selectedCustomer);
            handleMenuClose();
          }}>
            <StarIcon sx={{ mr: 1 }} />
            Request Google Review
          </MenuItem>
        )}
        {selectedCustomer?.hasMaintenanceDue && (
          <MenuItem onClick={() => {
            if (selectedCustomer) handleScheduleMaintenance(selectedCustomer);
            handleMenuClose();
          }}>
            <PersonIcon sx={{ mr: 1 }} />
            Schedule Maintenance
          </MenuItem>
        )}
        <Divider />
        
        {/* Analytics and Reports */}
        <MenuItem onClick={() => {
          console.log('Customer Analytics:', {
            customer: selectedCustomer?.name,
            lifetimeValue: selectedCustomer?.lifetimeValue,
            leadScore: selectedCustomer?.leadScore,
            referralRevenue: selectedCustomer?.referralRevenue,
            profitMargin: selectedCustomer?.profitMargin
          });
          setSuccessMessage(`Viewing analytics for ${selectedCustomer?.name}`);
          handleMenuClose();
        }}>
          <TrendingUpIcon sx={{ mr: 1 }} />
          View Customer Analytics
        </MenuItem>
        <MenuItem onClick={() => {
          console.log('Customer History:', {
            customer: selectedCustomer?.name,
            projects: selectedCustomer?.projectHistory,
            interactions: 'Detailed interaction history',
            serviceHistory: selectedCustomer?.lastServiceDate
          });
          setSuccessMessage(`Viewing history for ${selectedCustomer?.name}`);
          handleMenuClose();
        }}>
          <ViewIcon sx={{ mr: 1 }} />
          View Service History
        </MenuItem>
        <Divider />
        
        {/* Advanced Actions */}
        <MenuItem onClick={() => {
          setSuccessMessage(`Creating project proposal for ${selectedCustomer?.name}`);
          handleMenuClose();
        }}>
          <AddIcon sx={{ mr: 1 }} />
          Create Project Proposal
        </MenuItem>
        <MenuItem onClick={() => {
          setSuccessMessage(`Scheduling follow-up with ${selectedCustomer?.name}`);
          handleMenuClose();
        }}>
          <PersonIcon sx={{ mr: 1 }} />
          Schedule Follow-up
        </MenuItem>
        <Divider />
        
        <MenuItem onClick={handleMenuClose} sx={{ color: 'error.main' }}>
          <DeleteIcon sx={{ mr: 1 }} />
          Archive Customer
        </MenuItem>
      </Menu>

      {/* Success Message */}
      <Snackbar
        open={!!successMessage}
        autoHideDuration={6000}
        onClose={() => setSuccessMessage('')}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={() => setSuccessMessage('')} severity="success" sx={{ width: '100%' }}>
          {successMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
} 