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
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
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
  LinearProgress,
  Avatar,
  Tooltip,
  Divider,
  Alert,
  Snackbar,
} from '@mui/material';
import {
  Campaign as CampaignIcon,
  Add as AddIcon,
  Email as EmailIcon,
  Analytics as AnalyticsIcon,
  MoreVert as MoreVertIcon,
  PlayArrow as PlayIcon,
  Pause as PauseIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  People as PeopleIcon,
  TrendingUp as TrendingUpIcon,
  Schedule as ScheduleIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';
import NextLink from 'next/link';
import CampaignWizard from '../../components/campaigns/CampaignWizard';
import TemplateManager from '../../components/campaigns/TemplateManager';

// Mock campaign data
const defaultCampaigns = [
  {
    id: 1,
    name: "Q1 Property Managers Outreach",
    status: "Active",
    type: "Email Sequence",
    recipients: 847,
    opened: 312,
    clicked: 89,
    replied: 23,
    sent: 847,
    scheduled: "2024-01-01",
    lastActivity: "2 hours ago",
    budget: "$1,200",
    conversion: 2.7,
    description: "Targeted outreach to property managers for smart home solutions"
  },
  {
    id: 2,
    name: "Smart Home Newsletter - January",
    status: "Scheduled",
    type: "Newsletter",
    recipients: 1234,
    opened: 0,
    clicked: 0,
    replied: 0,
    sent: 0,
    scheduled: "2024-01-15",
    lastActivity: "Scheduled for tomorrow",
    budget: "$800",
    conversion: 0,
    description: "Monthly newsletter featuring smart home trends and case studies"
  },
  {
    id: 3,
    name: "Commercial Real Estate Campaign",
    status: "Active",
    type: "Drip Campaign",
    recipients: 523,
    opened: 445,
    clicked: 167,
    replied: 34,
    sent: 523,
    scheduled: "2023-12-15",
    lastActivity: "5 minutes ago",
    budget: "$2,500",
    conversion: 6.5,
    description: "Multi-touch campaign targeting commercial property developers"
  },
  {
    id: 4,
    name: "Holiday Season Promotion",
    status: "Completed",
    type: "Promotional",
    recipients: 2156,
    opened: 1543,
    clicked: 432,
    replied: 89,
    sent: 2156,
    scheduled: "2023-12-01",
    lastActivity: "Completed",
    budget: "$1,800",
    conversion: 4.1,
    description: "Year-end promotional campaign with special pricing offers"
  },
  {
    id: 5,
    name: "New Customer Onboarding",
    status: "Draft",
    type: "Automation",
    recipients: 0,
    opened: 0,
    clicked: 0,
    replied: 0,
    sent: 0,
    scheduled: "Not scheduled",
    lastActivity: "Draft created",
    budget: "$600",
    conversion: 0,
    description: "Automated welcome series for new customers"
  }
];

const defaultTemplates = [
  { id: 1, name: "Property Manager Introduction", category: "Outreach", usage: 45, description: "Professional introduction for property managers", subject: "Smart Home Solutions for Your Properties", isCustom: false, lastModified: "2024-01-10", content: "Hello! We specialize in smart home solutions..." },
  { id: 2, name: "Smart Home Benefits", category: "Educational", usage: 32, description: "Educational content about smart home benefits", subject: "The Future of Property Management is Smart", isCustom: false, lastModified: "2024-01-08", content: "Smart home technology offers incredible benefits..." },
  { id: 3, name: "Case Study Showcase", category: "Social Proof", usage: 28, description: "Success stories and case studies", subject: "See Real Smart Home Success Stories", isCustom: false, lastModified: "2024-01-05", content: "Our clients have seen amazing results..." },
  { id: 4, name: "Product Demo Invitation", category: "Sales", usage: 67, description: "Invitation to product demonstrations", subject: "Experience Smart Home Technology Live", isCustom: false, lastModified: "2024-01-12", content: "Join us for a live demonstration..." },
];

export default function CampaignsPage() {
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [selectedCampaign, setSelectedCampaign] = useState<any>(null);
  const [campaignWizardOpen, setCampaignWizardOpen] = useState(false);
  const [templateManagerOpen, setTemplateManagerOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [isHydrated, setIsHydrated] = useState(false);
  
  // Initialize with empty arrays to prevent hydration mismatch
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [templates, setTemplates] = useState<any[]>([]);

  // Load data from localStorage only after hydration
  React.useEffect(() => {
    // Load campaigns
    const savedCampaigns = localStorage.getItem('smart-home-campaigns');
    if (savedCampaigns) {
      setCampaigns(JSON.parse(savedCampaigns));
    } else {
      setCampaigns(defaultCampaigns);
    }

    // Load templates
    const savedTemplates = localStorage.getItem('smart-home-templates');
    if (savedTemplates) {
      setTemplates(JSON.parse(savedTemplates));
    } else {
      setTemplates(defaultTemplates);
    }

    setIsHydrated(true);
  }, []);

  // Save to localStorage whenever campaigns or templates change (only after hydration)
  React.useEffect(() => {
    if (isHydrated) {
      localStorage.setItem('smart-home-campaigns', JSON.stringify(campaigns));
    }
  }, [campaigns, isHydrated]);

  React.useEffect(() => {
    if (isHydrated) {
      localStorage.setItem('smart-home-templates', JSON.stringify(templates));
    }
  }, [templates, isHydrated]);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, campaign: any) => {
    setMenuAnchor(event.currentTarget);
    setSelectedCampaign(campaign);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
    setSelectedCampaign(null);
  };

  const handleEditCampaign = () => {
    if (selectedCampaign) {
      // TODO: Open campaign editor (for now, just show alert)
      alert(`Edit Campaign: ${selectedCampaign.name}\n\nCampaign editing functionality coming soon!`);
    }
    handleMenuClose();
  };

  const handleToggleCampaign = () => {
    if (selectedCampaign) {
      const newStatus = selectedCampaign.status === 'Active' ? 'Paused' : 'Active';
      setCampaigns(prev => prev.map(campaign => 
        campaign.id === selectedCampaign.id 
          ? { ...campaign, status: newStatus, lastActivity: `${newStatus} just now` }
          : campaign
      ));
      setSuccessMessage(`Campaign "${selectedCampaign.name}" ${newStatus.toLowerCase()} successfully!`);
    }
    handleMenuClose();
  };

  const handleDeleteCampaign = () => {
    if (selectedCampaign) {
      if (window.confirm(`Are you sure you want to delete "${selectedCampaign.name}"?\n\nThis action cannot be undone.`)) {
        setCampaigns(prev => prev.filter(campaign => campaign.id !== selectedCampaign.id));
        setSuccessMessage(`Campaign "${selectedCampaign.name}" deleted successfully!`);
      }
    }
    handleMenuClose();
  };

  const handleViewAnalytics = () => {
    if (selectedCampaign) {
      alert(`Analytics for: ${selectedCampaign.name}\n\nOpened: ${selectedCampaign.opened}\nClicked: ${selectedCampaign.clicked}\nReplied: ${selectedCampaign.replied}\n\nDetailed analytics coming soon!`);
    }
    handleMenuClose();
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active': return 'success';
      case 'scheduled': return 'info';
      case 'completed': return 'default';
      case 'draft': return 'warning';
      case 'paused': return 'error';
      default: return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active': return <PlayIcon />;
      case 'scheduled': return <ScheduleIcon />;
      case 'completed': return <CheckCircleIcon />;
      case 'draft': return <EditIcon />;
      case 'paused': return <PauseIcon />;
      default: return <CampaignIcon />;
    }
  };

  const calculateOpenRate = (opened: number, sent: number) => {
    return sent > 0 ? ((opened / sent) * 100).toFixed(1) : '0.0';
  };

  const calculateClickRate = (clicked: number, opened: number) => {
    return opened > 0 ? ((clicked / opened) * 100).toFixed(1) : '0.0';
  };

  const handleCreateCampaign = (campaignData: any) => {
    const newCampaign = {
      id: Date.now(),
      name: campaignData.name,
      status: campaignData.status,
      type: campaignData.type,
      recipients: campaignData.totalRecipients,
      opened: 0,
      clicked: 0,
      replied: 0,
      sent: campaignData.status === 'Active' ? campaignData.totalRecipients : 0,
      scheduled: campaignData.scheduleType === 'scheduled' ? `${campaignData.scheduledDate}` : 'Now',
      lastActivity: campaignData.status === 'Active' ? 'Just sent' : 'Scheduled',
      budget: '$500', // Default budget
      conversion: 0,
      description: campaignData.description,
    };

    setCampaigns(prev => [newCampaign, ...prev]);
    setSuccessMessage(`Campaign "${campaignData.name}" ${campaignData.status === 'Active' ? 'sent' : 'created'} successfully!`);
  };

  const handleTemplateUpdate = (updatedTemplates: any[]) => {
    setTemplates(updatedTemplates);
  };

  // Show loading skeleton while hydrating
  if (!isHydrated) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Breadcrumbs sx={{ mb: 2 }}>
          <Link component={NextLink} href="/" color="inherit" underline="hover">
            Dashboard
          </Link>
          <Typography color="text.primary">Email Campaigns</Typography>
        </Breadcrumbs>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Box>
            <Typography variant="h4" component="h1" gutterBottom>
              Email Marketing Campaigns
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Loading campaigns...
            </Typography>
          </Box>
        </Box>

        {/* Loading skeleton for performance cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {[1, 2, 3, 4].map((index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card>
                <CardContent>
                  <Box sx={{ height: 100, bgcolor: 'grey.100', borderRadius: 1 }} />
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Loading skeleton for campaigns table */}
        <Paper sx={{ mb: 4 }}>
          <Box sx={{ p: 3, borderBottom: 1, borderColor: 'divider' }}>
            <Typography variant="h6">Loading Campaigns...</Typography>
          </Box>
          <Box sx={{ p: 3 }}>
            {[1, 2, 3].map((index) => (
              <Box key={index} sx={{ height: 60, bgcolor: 'grey.100', borderRadius: 1, mb: 2 }} />
            ))}
          </Box>
        </Paper>
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
        <Typography color="text.primary">Email Campaigns</Typography>
      </Breadcrumbs>

      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            Email Marketing Campaigns
            <Chip 
              label={`${campaigns.filter(c => c.status === 'Active').length} Active`} 
              size="small" 
              color="success" 
              sx={{ ml: 2 }} 
            />
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Create, manage, and track email marketing campaigns and automations
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button variant="outlined" startIcon={<AnalyticsIcon />}>
            View Analytics
          </Button>
          <Button 
            variant="contained" 
            startIcon={<AddIcon />}
            onClick={() => {
              console.log('Opening Campaign Wizard...');
              setCampaignWizardOpen(true);
            }}
            size="large"
          >
            New Campaign
          </Button>
        </Box>
      </Box>

      {/* Performance Overview */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <CampaignIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">Total Campaigns</Typography>
              </Box>
              <Typography variant="h4" color="primary">
                {campaigns.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {campaigns.filter(c => c.status === 'Active').length} active campaigns
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <EmailIcon color="info" sx={{ mr: 1 }} />
                <Typography variant="h6">Emails Sent</Typography>
              </Box>
              <Typography variant="h4" color="info.main">
                {campaigns.reduce((sum, c) => sum + c.sent, 0).toLocaleString()}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                This month
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <TrendingUpIcon color="success" sx={{ mr: 1 }} />
                <Typography variant="h6">Open Rate</Typography>
              </Box>
              <Typography variant="h4" color="success.main">
                {(() => {
                  const totalSent = campaigns.reduce((sum, c) => sum + c.sent, 0);
                  const totalOpened = campaigns.reduce((sum, c) => sum + c.opened, 0);
                  return calculateOpenRate(totalOpened, totalSent);
                })()}%
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Average across all campaigns
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <PeopleIcon color="warning" sx={{ mr: 1 }} />
                <Typography variant="h6">Conversions</Typography>
              </Box>
              <Typography variant="h4" color="warning.main">
                {campaigns.reduce((sum, c) => sum + c.replied, 0)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total responses received
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Campaign List */}
      <Paper sx={{ mb: 4 }}>
        <Box sx={{ p: 3, borderBottom: 1, borderColor: 'divider' }}>
          <Typography variant="h6">Active Campaigns</Typography>
        </Box>
        
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Campaign</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Recipients</TableCell>
                <TableCell>Performance</TableCell>
                <TableCell>Conversion</TableCell>
                <TableCell>Last Activity</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {campaigns.map((campaign) => (
                <TableRow key={campaign.id} hover>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                        {getStatusIcon(campaign.status)}
                      </Avatar>
                      <Box>
                        <Typography variant="subtitle2" fontWeight="bold">
                          {campaign.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {campaign.type} • {campaign.description}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={campaign.status}
                      size="small"
                      color={getStatusColor(campaign.status) as any}
                      icon={getStatusIcon(campaign.status)}
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {campaign.recipients.toLocaleString()}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {campaign.sent > 0 ? `${campaign.sent} sent` : 'Not sent'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box>
                      <Typography variant="body2">
                        {calculateOpenRate(campaign.opened, campaign.sent)}% open • {calculateClickRate(campaign.clicked, campaign.opened)}% click
                      </Typography>
                      <LinearProgress
                        variant="determinate"
                        value={campaign.sent > 0 ? (campaign.opened / campaign.sent) * 100 : 0}
                        sx={{ mt: 1, height: 4, borderRadius: 2 }}
                        color="primary"
                      />
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color={campaign.conversion > 5 ? 'success.main' : campaign.conversion > 2 ? 'warning.main' : 'text.secondary'}>
                      {campaign.conversion}%
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {campaign.replied} responses
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{campaign.lastActivity}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {campaign.scheduled}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <IconButton 
                      onClick={(e) => handleMenuOpen(e, campaign)}
                      size="small"
                    >
                      <MoreVertIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Email Templates Section */}
      <Paper sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h6">Email Templates</Typography>
          <Button 
            variant="outlined" 
            startIcon={<AddIcon />}
            onClick={() => {
              console.log('Opening Template Manager...');
              setTemplateManagerOpen(true);
            }}
          >
            New Template
          </Button>
        </Box>
        
        <Grid container spacing={2}>
          {templates.map((template) => (
            <Grid item xs={12} sm={6} md={3} key={template.id}>
              <Card sx={{ cursor: 'pointer', '&:hover': { elevation: 4 } }}>
                <CardContent>
                  <Typography variant="subtitle1" gutterBottom>
                    {template.name}
                  </Typography>
                  <Chip label={template.category} size="small" sx={{ mb: 1 }} />
                  <Typography variant="body2" color="text.secondary">
                    Used in {template.usage} campaigns
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Paper>

      {/* Campaign Menu */}
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleEditCampaign}>
          <EditIcon sx={{ mr: 1 }} />
          Edit Campaign
        </MenuItem>
        <MenuItem onClick={handleViewAnalytics}>
          <AnalyticsIcon sx={{ mr: 1 }} />
          View Analytics
        </MenuItem>
        <MenuItem onClick={handleToggleCampaign}>
          <PlayIcon sx={{ mr: 1 }} />
          {selectedCampaign?.status === 'Active' ? 'Pause' : 'Start'} Campaign
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleDeleteCampaign} sx={{ color: 'error.main' }}>
          <DeleteIcon sx={{ mr: 1 }} />
          Delete Campaign
        </MenuItem>
      </Menu>

      {/* Template Manager */}
      <TemplateManager
        open={templateManagerOpen}
        onClose={() => setTemplateManagerOpen(false)}
        onUpdate={handleTemplateUpdate}
        initialTemplates={templates}
      />

      {/* Campaign Wizard */}
      <CampaignWizard
        open={campaignWizardOpen}
        onClose={() => setCampaignWizardOpen(false)}
        onSave={handleCreateCampaign}
      />

      {/* Success Message */}
      <Snackbar
        open={!!successMessage}
        autoHideDuration={6000}
        onClose={() => setSuccessMessage('')}
      >
        <Alert onClose={() => setSuccessMessage('')} severity="success">
          {successMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
} 