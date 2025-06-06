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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
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

        {/* Security Settings */}
        <TabPanel value={tabValue} index={2}>
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

        {/* Preferences */}
        <TabPanel value={tabValue} index={3}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.darkMode}
                    onChange={(e) => handleSettingChange('darkMode', e.target.checked)}
                  />
                }
                label="Dark Mode"
              />
              <Typography variant="body2" color="text.secondary">
                Use dark theme for better viewing in low light
              </Typography>
            </Grid>
            
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
        <TabPanel value={tabValue} index={4}>
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
        <TabPanel value={tabValue} index={5}>
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
    </Container>
  );
} 