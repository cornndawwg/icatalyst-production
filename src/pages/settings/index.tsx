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
  Switch,
  FormControlLabel,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Chip,
  Avatar,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  Tab,
  Tabs,
  Alert,
  AlertTitle,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  IconButton,
} from '@mui/material';
import {
  Settings as SettingsIcon,
  Person as PersonIcon,
  Security as SecurityIcon,
  Notifications as NotificationsIcon,
  Palette as PaletteIcon,
  Business as BusinessIcon,
  Storage as StorageIcon,
  Backup as BackupIcon,
  CloudSync as CloudSyncIcon,
  Email as EmailIcon,
  Sms as SmsIcon,
  Phone as PhoneIcon,
  Save as SaveIcon,
  Edit as EditIcon,
  Lock as LockIcon,
  Key as KeyIcon,
  MailOutline as MailOutlineIcon,
  Google as GoogleIcon,
  Microsoft as MicrosoftIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Send as SendIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import NextLink from 'next/link';

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
      id={`settings-tabpanel-${index}`}
      aria-labelledby={`settings-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

export default function SettingsPage() {
  const [tabValue, setTabValue] = useState(0);
  const [settings, setSettings] = useState({
    // Profile Settings
    firstName: 'John',
    lastName: 'Smith',
    email: 'john.smith@smarthomecrm.com',
    phone: '(555) 123-4567',
    company: 'Smart Home Solutions Inc.',
    title: 'Project Manager',
    
    // Notification Settings
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    projectUpdates: true,
    customerMessages: true,
    systemAlerts: true,
    weeklyReports: false,
    
    // System Settings
    darkMode: false,
    language: 'English',
    timezone: 'Pacific Standard Time',
    dateFormat: 'MM/DD/YYYY',
    currency: 'USD',
    
    // Security Settings
    twoFactorAuth: false,
    sessionTimeout: 30,
    passwordExpiry: 90,
  });

  // SMTP Configuration State
  const [smtpConfig, setSmtpConfig] = useState({
    provider: '', // 'gmail', 'microsoft', 'custom'
    smtpHost: '',
    smtpPort: 587,
    smtpUser: '',
    smtpPassword: '',
    smtpSecure: true,
    encryptionType: 'tls', // 'tls', 'ssl', 'none'
    fromEmail: '',
    fromName: '',
    replyToEmail: '',
    companyName: settings.company,
    primaryColor: '#1976d2',
    isConfigured: false,
    connectionStatus: 'not_tested', // 'not_tested', 'testing', 'success', 'error'
    lastTested: null as string | null,
  });

  const [smtpDialogs, setSmtpDialogs] = useState({
    providerSelection: false,
    oauthInProgress: false,
    testEmail: false,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [testEmailAddress, setTestEmailAddress] = useState('');
  const [smtpErrors, setSmtpErrors] = useState<string[]>([]);
  
  const [changePasswordDialog, setChangePasswordDialog] = useState(false);
  const [unsavedChanges, setUnsavedChanges] = useState(false);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleSettingChange = (setting: string, value: any) => {
    setSettings(prev => ({ ...prev, [setting]: value }));
    setUnsavedChanges(true);
  };

  const handleSaveSettings = () => {
    // Here you would save to API
    console.log('Saving settings:', settings);
    setUnsavedChanges(false);
    // Show success message
  };

  // SMTP Configuration Functions
  const handleSmtpConfigChange = (field: string, value: any) => {
    setSmtpConfig(prev => ({ ...prev, [field]: value }));
    setUnsavedChanges(true);
  };

  const handleProviderSelect = (provider: string) => {
    setSmtpErrors([]);
    
    if (provider === 'gmail') {
      setSmtpConfig(prev => ({
        ...prev,
        provider: 'gmail',
        smtpHost: 'smtp.gmail.com',
        smtpPort: 587,
        smtpSecure: true,
      }));
      handleGmailOAuth();
    } else if (provider === 'microsoft') {
      setSmtpConfig(prev => ({
        ...prev,
        provider: 'microsoft',
        smtpHost: 'smtp-mail.outlook.com',
        smtpPort: 587,
        smtpSecure: true,
      }));
      handleMicrosoftOAuth();
    } else {
      setSmtpConfig(prev => ({
        ...prev,
        provider: 'custom',
        smtpHost: '',
        smtpPort: 587,
        smtpSecure: true,
      }));
    }
    
    setSmtpDialogs(prev => ({ ...prev, providerSelection: false }));
  };

  const handleGmailOAuth = async () => {
    try {
      setSmtpDialogs(prev => ({ ...prev, oauthInProgress: true }));
      setSmtpErrors([]);
      
      console.log('🔐 Initiating Gmail OAuth flow...');
      
      // Get OAuth URL from backend
      const response = await fetch('/api/oauth/google/auth');
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to initiate OAuth');
      }
      
      // Open OAuth popup
      const popup = window.open(
        result.authUrl,
        'google-oauth',
        'width=500,height=600,scrollbars=yes,resizable=yes'
      );
      
      // Listen for OAuth completion
      const handleMessage = (event: MessageEvent) => {
        if (event.data.type === 'OAUTH_SUCCESS' && event.data.provider === 'google') {
          const config = event.data.config;
          
          setSmtpConfig(prev => ({
            ...prev,
            ...config,
            companyName: settings.company,
            isConfigured: true,
            connectionStatus: 'success',
            lastTested: new Date().toISOString(),
          }));
          
          setSmtpDialogs(prev => ({ ...prev, oauthInProgress: false }));
          console.log('✅ Gmail OAuth completed successfully');
          
          window.removeEventListener('message', handleMessage);
          if (popup) popup.close();
        }
      };
      
      window.addEventListener('message', handleMessage);
      
      // Handle popup closed manually
      const checkClosed = setInterval(() => {
        if (popup?.closed) {
          clearInterval(checkClosed);
          setSmtpDialogs(prev => ({ ...prev, oauthInProgress: false }));
          window.removeEventListener('message', handleMessage);
        }
      }, 1000);
      
    } catch (error) {
      console.error('❌ Gmail OAuth failed:', error);
      setSmtpErrors(['Gmail OAuth authentication failed. Please try again.']);
      setSmtpDialogs(prev => ({ ...prev, oauthInProgress: false }));
    }
  };

  const handleMicrosoftOAuth = async () => {
    try {
      setSmtpDialogs(prev => ({ ...prev, oauthInProgress: true }));
      setSmtpErrors([]);
      
      console.log('🔐 Initiating Microsoft OAuth flow...');
      
      // Get OAuth URL from backend
      const response = await fetch('/api/oauth/microsoft/auth');
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to initiate OAuth');
      }
      
      // Open OAuth popup
      const popup = window.open(
        result.authUrl,
        'microsoft-oauth',
        'width=500,height=600,scrollbars=yes,resizable=yes'
      );
      
      // Listen for OAuth completion
      const handleMessage = (event: MessageEvent) => {
        if (event.data.type === 'OAUTH_SUCCESS' && event.data.provider === 'microsoft') {
          const config = event.data.config;
          
          setSmtpConfig(prev => ({
            ...prev,
            ...config,
            companyName: settings.company,
            isConfigured: true,
            connectionStatus: 'success',
            lastTested: new Date().toISOString(),
          }));
          
          setSmtpDialogs(prev => ({ ...prev, oauthInProgress: false }));
          console.log('✅ Microsoft OAuth completed successfully');
          
          window.removeEventListener('message', handleMessage);
          if (popup) popup.close();
        }
      };
      
      window.addEventListener('message', handleMessage);
      
      // Handle popup closed manually
      const checkClosed = setInterval(() => {
        if (popup?.closed) {
          clearInterval(checkClosed);
          setSmtpDialogs(prev => ({ ...prev, oauthInProgress: false }));
          window.removeEventListener('message', handleMessage);
        }
      }, 1000);
      
    } catch (error) {
      console.error('❌ Microsoft OAuth failed:', error);
      setSmtpErrors(['Microsoft OAuth authentication failed. Please try again.']);
      setSmtpDialogs(prev => ({ ...prev, oauthInProgress: false }));
    }
  };

  const handleTestSmtpConnection = async () => {
    try {
      setSmtpConfig(prev => ({ ...prev, connectionStatus: 'testing' }));
      setSmtpErrors([]);

      // Validate configuration
      const errors = [];
      if (!smtpConfig.smtpHost) errors.push('SMTP Host is required');
      if (!smtpConfig.smtpUser) errors.push('SMTP Username is required');
      if (!smtpConfig.smtpPassword && smtpConfig.provider === 'custom') errors.push('SMTP Password is required');
      if (!smtpConfig.fromEmail) errors.push('From Email is required');

      if (errors.length > 0) {
        setSmtpErrors(errors);
        setSmtpConfig(prev => ({ ...prev, connectionStatus: 'error' }));
        return;
      }

      // Test SMTP connection via API
      const response = await fetch('/api/email/test-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ config: smtpConfig }),
      });

      const result = await response.json();

      if (result.success) {
        setSmtpConfig(prev => ({
          ...prev,
          connectionStatus: 'success',
          lastTested: new Date().toISOString(),
          isConfigured: true,
        }));
        console.log('✅ SMTP connection test successful');
      } else {
        setSmtpConfig(prev => ({ ...prev, connectionStatus: 'error' }));
        setSmtpErrors([result.error || 'SMTP connection test failed']);
        console.error('❌ SMTP connection test failed:', result.error);
      }

    } catch (error) {
      console.error('❌ SMTP connection test error:', error);
      setSmtpConfig(prev => ({ ...prev, connectionStatus: 'error' }));
      setSmtpErrors(['Failed to test SMTP connection. Please check your settings.']);
    }
  };

  const handleSendTestEmail = async () => {
    try {
      if (!testEmailAddress) {
        setSmtpErrors(['Test email address is required']);
        return;
      }

      const response = await fetch('/api/email/send-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          config: smtpConfig,
          testEmail: testEmailAddress,
        }),
      });

      const result = await response.json();

      if (result.success) {
        console.log('✅ Test email sent successfully');
        setSmtpDialogs(prev => ({ ...prev, testEmail: false }));
        setTestEmailAddress('');
      } else {
        setSmtpErrors([result.error || 'Failed to send test email']);
        console.error('❌ Test email failed:', result.error);
      }

    } catch (error) {
      console.error('❌ Test email error:', error);
      setSmtpErrors(['Failed to send test email. Please try again.']);
    }
  };

  const getConnectionStatusIcon = () => {
    switch (smtpConfig.connectionStatus) {
      case 'success':
        return <CheckCircleIcon color="success" />;
      case 'error':
        return <ErrorIcon color="error" />;
      case 'testing':
        return <RefreshIcon className="animate-spin" />;
      default:
        return <MailOutlineIcon color="disabled" />;
    }
  };

  const getConnectionStatusText = () => {
    switch (smtpConfig.connectionStatus) {
      case 'success':
        return `Connected successfully${smtpConfig.lastTested ? ` (${new Date(smtpConfig.lastTested).toLocaleString()})` : ''}`;
      case 'error':
        return 'Connection failed';
      case 'testing':
        return 'Testing connection...';
      default:
        return 'Not tested';
    }
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Breadcrumbs */}
      <Breadcrumbs sx={{ mb: 2 }}>
        <Link component={NextLink} href="/" color="inherit" underline="hover">
          Dashboard
        </Link>
        <Typography color="text.primary">Settings</Typography>
      </Breadcrumbs>

      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            Account & System Settings
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage your account preferences and system configuration
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          {unsavedChanges && (
            <Chip 
              label="Unsaved Changes" 
              color="warning" 
              size="small" 
            />
          )}
          <Button 
            variant="contained" 
            startIcon={<SaveIcon />}
            onClick={handleSaveSettings}
            disabled={!unsavedChanges}
          >
            Save Changes
          </Button>
        </Box>
      </Box>

      {/* Settings Tabs */}
      <Paper sx={{ mb: 4 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="settings tabs">
            <Tab icon={<PersonIcon />} label="Profile" />
            <Tab icon={<NotificationsIcon />} label="Notifications" />
            <Tab icon={<MailOutlineIcon />} label="Email Setup" />
            <Tab icon={<SecurityIcon />} label="Security" />
            <Tab icon={<PaletteIcon />} label="Preferences" />
            <Tab icon={<BusinessIcon />} label="Company" />
            <Tab icon={<StorageIcon />} label="Data & Backup" />
          </Tabs>
        </Box>

        {/* Profile Settings */}
        <TabPanel value={tabValue} index={0}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Box sx={{ textAlign: 'center', mb: 3 }}>
                <Avatar 
                  sx={{ 
                    width: 120, 
                    height: 120, 
                    mx: 'auto', 
                    mb: 2,
                    bgcolor: 'primary.main',
                    fontSize: '2rem'
                  }}
                >
                  {settings.firstName[0]}{settings.lastName[0]}
                </Avatar>
                <Button variant="outlined" startIcon={<EditIcon />}>
                  Change Photo
                </Button>
              </Box>
            </Grid>
            
            <Grid item xs={12} md={8}>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="First Name"
                    value={settings.firstName}
                    onChange={(e) => handleSettingChange('firstName', e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Last Name"
                    value={settings.lastName}
                    onChange={(e) => handleSettingChange('lastName', e.target.value)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Email Address"
                    type="email"
                    value={settings.email}
                    onChange={(e) => handleSettingChange('email', e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Phone Number"
                    value={settings.phone}
                    onChange={(e) => handleSettingChange('phone', e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Job Title"
                    value={settings.title}
                    onChange={(e) => handleSettingChange('title', e.target.value)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Company"
                    value={settings.company}
                    onChange={(e) => handleSettingChange('company', e.target.value)}
                  />
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Notification Settings */}
        <TabPanel value={tabValue} index={1}>
          <Typography variant="h6" gutterBottom>
            Email Notifications
          </Typography>
          <List>
            <ListItem>
              <ListItemIcon>
                <EmailIcon />
              </ListItemIcon>
              <ListItemText 
                primary="Email Notifications" 
                secondary="Receive notifications via email"
              />
              <ListItemSecondaryAction>
                <Switch
                  checked={settings.emailNotifications}
                  onChange={(e) => handleSettingChange('emailNotifications', e.target.checked)}
                />
              </ListItemSecondaryAction>
            </ListItem>
            
            <ListItem>
              <ListItemIcon>
                <SmsIcon />
              </ListItemIcon>
              <ListItemText 
                primary="SMS Notifications" 
                secondary="Receive critical alerts via SMS"
              />
              <ListItemSecondaryAction>
                <Switch
                  checked={settings.smsNotifications}
                  onChange={(e) => handleSettingChange('smsNotifications', e.target.checked)}
                />
              </ListItemSecondaryAction>
            </ListItem>
          </List>

          <Divider sx={{ my: 3 }} />

          <Typography variant="h6" gutterBottom>
            Notification Types
          </Typography>
          <List>
            <ListItem>
              <ListItemText 
                primary="Project Updates" 
                secondary="Notifications about project status changes"
              />
              <ListItemSecondaryAction>
                <Switch
                  checked={settings.projectUpdates}
                  onChange={(e) => handleSettingChange('projectUpdates', e.target.checked)}
                />
              </ListItemSecondaryAction>
            </ListItem>
            
            <ListItem>
              <ListItemText 
                primary="Customer Messages" 
                secondary="New messages from customers"
              />
              <ListItemSecondaryAction>
                <Switch
                  checked={settings.customerMessages}
                  onChange={(e) => handleSettingChange('customerMessages', e.target.checked)}
                />
              </ListItemSecondaryAction>
            </ListItem>
            
            <ListItem>
              <ListItemText 
                primary="System Alerts" 
                secondary="Important system notifications"
              />
              <ListItemSecondaryAction>
                <Switch
                  checked={settings.systemAlerts}
                  onChange={(e) => handleSettingChange('systemAlerts', e.target.checked)}
                />
              </ListItemSecondaryAction>
            </ListItem>
            
            <ListItem>
              <ListItemText 
                primary="Weekly Reports" 
                secondary="Weekly performance and activity reports"
              />
              <ListItemSecondaryAction>
                <Switch
                  checked={settings.weeklyReports}
                  onChange={(e) => handleSettingChange('weeklyReports', e.target.checked)}
                />
              </ListItemSecondaryAction>
            </ListItem>
          </List>
        </TabPanel>

        {/* Email Setup */}
        <TabPanel value={tabValue} index={2}>
          <Box sx={{ mb: 4 }}>
            <Typography variant="h5" gutterBottom>
              Email Configuration
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              Configure your SMTP settings to send professional emails from your own email server.
            </Typography>

            {/* Connection Status */}
            {smtpConfig.isConfigured && (
              <Alert 
                severity={smtpConfig.connectionStatus === 'success' ? 'success' : 'warning'} 
                sx={{ mb: 3 }}
                icon={getConnectionStatusIcon()}
              >
                <Typography variant="subtitle2">
                  {getConnectionStatusText()}
                </Typography>
                {smtpConfig.fromEmail && (
                  <Typography variant="body2">
                    Sending emails from: {smtpConfig.fromEmail}
                  </Typography>
                )}
              </Alert>
            )}

            {/* Error Messages */}
            {smtpErrors.length > 0 && (
              <Alert severity="error" sx={{ mb: 3 }}>
                <Typography variant="subtitle2">Configuration Errors:</Typography>
                <ul style={{ margin: '8px 0', paddingLeft: '20px' }}>
                  {smtpErrors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </Alert>
            )}

            {/* Provider Selection */}
            {!smtpConfig.isConfigured && (
              <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom>
                    Choose Your Email Provider
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Select your email provider for automatic configuration or choose custom SMTP.
                  </Typography>
                </Grid>

                {/* Gmail OAuth */}
                <Grid item xs={12} md={4}>
                  <Card 
                    sx={{ 
                      cursor: 'pointer',
                      '&:hover': { elevation: 4 },
                      border: smtpConfig.provider === 'gmail' ? '2px solid #1976d2' : '1px solid #e0e0e0'
                    }}
                    onClick={() => handleProviderSelect('gmail')}
                  >
                    <CardContent sx={{ textAlign: 'center', py: 3 }}>
                      <GoogleIcon sx={{ fontSize: 48, color: '#4285f4', mb: 2 }} />
                      <Typography variant="h6" gutterBottom>
                        Gmail / Google Workspace
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        One-click setup with OAuth authentication
                      </Typography>
                      <Chip label="Recommended" color="primary" size="small" />
                    </CardContent>
                  </Card>
                </Grid>

                {/* Microsoft OAuth */}
                <Grid item xs={12} md={4}>
                  <Card 
                    sx={{ 
                      cursor: 'pointer',
                      '&:hover': { elevation: 4 },
                      border: smtpConfig.provider === 'microsoft' ? '2px solid #1976d2' : '1px solid #e0e0e0'
                    }}
                    onClick={() => handleProviderSelect('microsoft')}
                  >
                    <CardContent sx={{ textAlign: 'center', py: 3 }}>
                      <MicrosoftIcon sx={{ fontSize: 48, color: '#0078d4', mb: 2 }} />
                      <Typography variant="h6" gutterBottom>
                        Microsoft 365 / Outlook
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        Automatic setup with Microsoft authentication
                      </Typography>
                      <Chip label="Enterprise" color="secondary" size="small" />
                    </CardContent>
                  </Card>
                </Grid>

                {/* Custom SMTP */}
                <Grid item xs={12} md={4}>
                  <Card 
                    sx={{ 
                      cursor: 'pointer',
                      '&:hover': { elevation: 4 },
                      border: smtpConfig.provider === 'custom' ? '2px solid #1976d2' : '1px solid #e0e0e0'
                    }}
                    onClick={() => handleProviderSelect('custom')}
                  >
                    <CardContent sx={{ textAlign: 'center', py: 3 }}>
                      <SettingsIcon sx={{ fontSize: 48, color: '#666', mb: 2 }} />
                      <Typography variant="h6" gutterBottom>
                        Custom SMTP Server
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        Manual configuration for any email provider
                      </Typography>
                      <Chip label="Advanced" color="default" size="small" />
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            )}

            {/* OAuth Progress */}
            {smtpDialogs.oauthInProgress && (
              <Card sx={{ mb: 4 }}>
                <CardContent sx={{ textAlign: 'center', py: 4 }}>
                  <CircularProgress sx={{ mb: 2 }} />
                  <Typography variant="h6" gutterBottom>
                    Authenticating with {smtpConfig.provider === 'gmail' ? 'Google' : 'Microsoft'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Please complete the authentication in the popup window...
                  </Typography>
                </CardContent>
              </Card>
            )}

            {/* Manual SMTP Configuration */}
            {smtpConfig.provider === 'custom' && (
              <Card sx={{ mb: 4 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    SMTP Server Configuration
                  </Typography>
                  
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="SMTP Host"
                        placeholder="smtp.yourprovider.com"
                        value={smtpConfig.smtpHost}
                        onChange={(e) => handleSmtpConfigChange('smtpHost', e.target.value)}
                        helperText="Your email provider's SMTP server"
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="SMTP Port"
                        type="number"
                        value={smtpConfig.smtpPort}
                        onChange={(e) => {
                          const port = parseInt(e.target.value);
                          handleSmtpConfigChange('smtpPort', port);
                          
                          // Auto-suggest encryption type based on port
                          if (port === 465) {
                            handleSmtpConfigChange('encryptionType', 'ssl');
                          } else if (port === 587 || port === 2525) {
                            handleSmtpConfigChange('encryptionType', 'tls');
                          } else if (port === 25) {
                            handleSmtpConfigChange('encryptionType', 'none');
                          }
                        }}
                        helperText="Common ports: 587 (TLS), 465 (SSL), 25 (None)"
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <FormControl fullWidth>
                        <InputLabel>Encryption Type</InputLabel>
                        <Select
                          value={smtpConfig.encryptionType || 'tls'}
                          onChange={(e) => handleSmtpConfigChange('encryptionType', e.target.value)}
                          label="Encryption Type"
                        >
                          <MenuItem value="tls">
                            <Box>
                              <Typography variant="body2" fontWeight="bold">TLS/STARTTLS</Typography>
                              <Typography variant="caption" color="text.secondary">
                                Secure, widely supported (port 587)
                              </Typography>
                            </Box>
                          </MenuItem>
                          <MenuItem value="ssl">
                            <Box>
                              <Typography variant="body2" fontWeight="bold">SSL</Typography>
                              <Typography variant="caption" color="text.secondary">
                                Direct SSL connection (port 465)
                              </Typography>
                            </Box>
                          </MenuItem>
                          <MenuItem value="none">
                            <Box>
                              <Typography variant="body2" fontWeight="bold">None</Typography>
                              <Typography variant="caption" color="text.secondary">
                                No encryption - not recommended (port 25)
                              </Typography>
                            </Box>
                          </MenuItem>
                        </Select>
                        <FormHelperText>
                          {smtpConfig.encryptionType === 'tls' && 'Recommended for most providers'}
                          {smtpConfig.encryptionType === 'ssl' && 'Direct SSL - good for legacy systems'}
                          {smtpConfig.encryptionType === 'none' && 'Not secure - only for testing'}
                        </FormHelperText>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Username"
                        value={smtpConfig.smtpUser}
                        onChange={(e) => handleSmtpConfigChange('smtpUser', e.target.value)}
                        helperText="Your email address"
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Password"
                        type={showPassword ? 'text' : 'password'}
                        value={smtpConfig.smtpPassword}
                        onChange={(e) => handleSmtpConfigChange('smtpPassword', e.target.value)}
                        helperText="Your email password or app password"
                        InputProps={{
                          endAdornment: (
                            <IconButton
                              onClick={() => setShowPassword(!showPassword)}
                              edge="end"
                            >
                              {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                            </IconButton>
                          ),
                        }}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <Alert severity="info" icon={<SecurityIcon />}>
                        <AlertTitle>SSL/TLS Security</AlertTitle>
                        <Box sx={{ mt: 1 }}>
                          <Typography variant="body2" gutterBottom>
                            <strong>TLS/STARTTLS (Port 587):</strong> Most secure and widely supported option
                          </Typography>
                          <Typography variant="body2" gutterBottom>
                            <strong>SSL (Port 465):</strong> Direct SSL connection, good for legacy systems
                          </Typography>
                          <Typography variant="body2">
                            <strong>None (Port 25):</strong> No encryption - only use for testing
                          </Typography>
                        </Box>
                      </Alert>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            )}

            {/* Email Branding Configuration */}
            {(smtpConfig.provider && smtpConfig.provider !== '') && (
              <Card sx={{ mb: 4 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Email Branding
                  </Typography>
                  
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="From Email"
                        type="email"
                        value={smtpConfig.fromEmail}
                        onChange={(e) => handleSmtpConfigChange('fromEmail', e.target.value)}
                        helperText="Email address that appears in the 'From' field"
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="From Name"
                        value={smtpConfig.fromName}
                        onChange={(e) => handleSmtpConfigChange('fromName', e.target.value)}
                        helperText="Name that appears in the 'From' field"
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Reply-To Email"
                        type="email"
                        value={smtpConfig.replyToEmail}
                        onChange={(e) => handleSmtpConfigChange('replyToEmail', e.target.value)}
                        helperText="Email address for replies (optional)"
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Company Name"
                        value={smtpConfig.companyName}
                        onChange={(e) => handleSmtpConfigChange('companyName', e.target.value)}
                        helperText="Your company name for email templates"
                      />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            )}

            {/* Action Buttons */}
            {smtpConfig.provider && (
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Button
                  variant="contained"
                  startIcon={<RefreshIcon />}
                  onClick={handleTestSmtpConnection}
                  disabled={smtpConfig.connectionStatus === 'testing'}
                >
                  {smtpConfig.connectionStatus === 'testing' ? 'Testing...' : 'Test Connection'}
                </Button>

                {smtpConfig.connectionStatus === 'success' && (
                  <Button
                    variant="outlined"
                    startIcon={<SendIcon />}
                    onClick={() => setSmtpDialogs(prev => ({ ...prev, testEmail: true }))}
                  >
                    Send Test Email
                  </Button>
                )}

                {smtpConfig.isConfigured && (
                  <Button
                    variant="outlined"
                    color="error"
                    onClick={() => {
                      setSmtpConfig({
                        provider: '',
                        smtpHost: '',
                        smtpPort: 587,
                        smtpUser: '',
                        smtpPassword: '',
                        smtpSecure: true,
                        encryptionType: 'tls',
                        fromEmail: '',
                        fromName: '',
                        replyToEmail: '',
                        companyName: settings.company,
                        primaryColor: '#1976d2',
                        isConfigured: false,
                        connectionStatus: 'not_tested',
                        lastTested: null,
                      });
                      setSmtpErrors([]);
                    }}
                  >
                    Reset Configuration
                  </Button>
                )}
              </Box>
            )}
          </Box>
        </TabPanel>

        {/* Security Settings */}
        <TabPanel value={tabValue} index={3}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Alert severity="info" sx={{ mb: 3 }}>
                Keep your account secure by using strong passwords and enabling two-factor authentication.
              </Alert>
            </Grid>
            
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                      <Typography variant="h6">Password</Typography>
                      <Typography variant="body2" color="text.secondary">
                        Last changed 45 days ago
                      </Typography>
                    </Box>
                    <Button 
                      variant="outlined" 
                      startIcon={<LockIcon />}
                      onClick={() => setChangePasswordDialog(true)}
                    >
                      Change Password
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                      <Typography variant="h6">Two-Factor Authentication</Typography>
                      <Typography variant="body2" color="text.secondary">
                        Add an extra layer of security to your account
                      </Typography>
                    </Box>
                    <Switch
                      checked={settings.twoFactorAuth}
                      onChange={(e) => handleSettingChange('twoFactorAuth', e.target.checked)}
                    />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Session Timeout (minutes)"
                type="number"
                value={settings.sessionTimeout}
                onChange={(e) => handleSettingChange('sessionTimeout', parseInt(e.target.value))}
                helperText="Automatically log out after period of inactivity"
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Password Expiry (days)"
                type="number"
                value={settings.passwordExpiry}
                onChange={(e) => handleSettingChange('passwordExpiry', parseInt(e.target.value))}
                helperText="Require password change after this period"
              />
            </Grid>
          </Grid>
        </TabPanel>

        {/* Preferences Settings */}
        <TabPanel value={tabValue} index={4}>
          <Typography variant="h6" gutterBottom>
            Display & Interface
          </Typography>
          <List>
            <ListItem>
              <ListItemText 
                primary="Dark Mode" 
                secondary="Switch to dark theme"
              />
              <ListItemSecondaryAction>
                <Switch
                  checked={settings.darkMode}
                  onChange={(e) => handleSettingChange('darkMode', e.target.checked)}
                />
              </ListItemSecondaryAction>
            </ListItem>
          </List>

          <Divider sx={{ my: 3 }} />

          <Typography variant="h6" gutterBottom>
            Regional Settings
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                select
                label="Language"
                value={settings.language}
                onChange={(e) => handleSettingChange('language', e.target.value)}
                SelectProps={{ native: true }}
              >
                <option value="English">English</option>
                <option value="Spanish">Spanish</option>
                <option value="French">French</option>
                <option value="German">German</option>
              </TextField>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                select
                label="Timezone"
                value={settings.timezone}
                onChange={(e) => handleSettingChange('timezone', e.target.value)}
                SelectProps={{ native: true }}
              >
                <option value="Pacific Standard Time">Pacific Standard Time</option>
                <option value="Mountain Standard Time">Mountain Standard Time</option>
                <option value="Central Standard Time">Central Standard Time</option>
                <option value="Eastern Standard Time">Eastern Standard Time</option>
              </TextField>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                select
                label="Date Format"
                value={settings.dateFormat}
                onChange={(e) => handleSettingChange('dateFormat', e.target.value)}
                SelectProps={{ native: true }}
              >
                <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                <option value="YYYY-MM-DD">YYYY-MM-DD</option>
              </TextField>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                select
                label="Currency"
                value={settings.currency}
                onChange={(e) => handleSettingChange('currency', e.target.value)}
                SelectProps={{ native: true }}
              >
                <option value="USD">USD - US Dollar</option>
                <option value="EUR">EUR - Euro</option>
                <option value="GBP">GBP - British Pound</option>
                <option value="CAD">CAD - Canadian Dollar</option>
              </TextField>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Company Settings */}
        <TabPanel value={tabValue} index={5}>
          <Typography variant="h6" gutterBottom>
            Company Information
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Company Name"
                value="Smart Home Solutions Inc."
                disabled
                helperText="Contact administrator to change company information"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Industry"
                value="Smart Home Technology"
                disabled
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Company Size"
                value="50-100 employees"
                disabled
              />
            </Grid>
          </Grid>
        </TabPanel>

        {/* Data & Backup */}
        <TabPanel value={tabValue} index={6}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Data Management
              </Typography>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <BackupIcon sx={{ mr: 1 }} />
                    <Typography variant="h6">Backup</Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Download a backup of your data including customers, projects, and settings.
                  </Typography>
                  <Button variant="outlined" fullWidth>
                    Download Backup
                  </Button>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <CloudSyncIcon sx={{ mr: 1 }} />
                    <Typography variant="h6">Cloud Sync</Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Automatically sync your data to the cloud for backup and access across devices.
                  </Typography>
                  <FormControlLabel
                    control={<Switch defaultChecked />}
                    label="Enable Cloud Sync"
                  />
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12}>
              <Alert severity="warning">
                <Typography variant="h6">Data Deletion</Typography>
                <Typography variant="body2">
                  Permanently delete your account and all associated data. This action cannot be undone.
                </Typography>
                <Button color="error" sx={{ mt: 1 }}>
                  Request Account Deletion
                </Button>
              </Alert>
            </Grid>
          </Grid>
        </TabPanel>
      </Paper>

      {/* Change Password Dialog */}
      <Dialog open={changePasswordDialog} onClose={() => setChangePasswordDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <LockIcon sx={{ mr: 1 }} />
            Change Password
          </Box>
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                type="password"
                label="Current Password"
                placeholder="Enter your current password"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                type="password"
                label="New Password"
                placeholder="Enter your new password"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                type="password"
                label="Confirm New Password"
                placeholder="Confirm your new password"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setChangePasswordDialog(false)}>Cancel</Button>
          <Button variant="contained">Change Password</Button>
        </DialogActions>
      </Dialog>

      {/* Test Email Dialog */}
      <Dialog 
        open={smtpDialogs.testEmail} 
        onClose={() => setSmtpDialogs(prev => ({ ...prev, testEmail: false }))} 
        maxWidth="sm" 
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <SendIcon sx={{ mr: 1 }} />
            Send Test Email
          </Box>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Send a test email to verify your SMTP configuration is working correctly.
          </Typography>
          
          <TextField
            fullWidth
            type="email"
            label="Test Email Address"
            placeholder="Enter email address to send test to"
            value={testEmailAddress}
            onChange={(e) => setTestEmailAddress(e.target.value)}
            helperText="We'll send a test email to this address"
            sx={{ mb: 2 }}
          />

          {smtpErrors.length > 0 && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {smtpErrors.map((error, index) => (
                <Typography key={index} variant="body2">{error}</Typography>
              ))}
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setSmtpDialogs(prev => ({ ...prev, testEmail: false }));
            setTestEmailAddress('');
            setSmtpErrors([]);
          }}>
            Cancel
          </Button>
          <Button 
            variant="contained" 
            onClick={handleSendTestEmail}
            disabled={!testEmailAddress}
          >
            Send Test Email
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
} 