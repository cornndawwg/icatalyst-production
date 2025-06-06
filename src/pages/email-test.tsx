/**
 * Email Integration Testing Page
 * 
 * SAFETY: This is a NEW page for testing email functionality independently.
 * It doesn't modify or interfere with any existing portal or proposal features.
 */

import React, { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Tabs,
  Tab,
  Card,
  CardContent,
  Button,
  TextField,
  Grid,
  Alert,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip
} from '@mui/material';
import {
  Email as EmailIcon,
  Settings as SettingsIcon,
  Preview as PreviewIcon,
  Send as SendIcon,
  CheckCircle as CheckIcon,
  Error as ErrorIcon
} from '@mui/icons-material';
import EmailConfigurationForm from '../components/Email/EmailConfigurationForm';
import { EmailService } from '../services/emailService';

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
      id={`email-tabpanel-${index}`}
      aria-labelledby={`email-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

export default function EmailTestPage() {
  const [activeTab, setActiveTab] = useState(0);
  const [testEmail, setTestEmail] = useState({
    toEmail: '',
    toName: '',
    subject: 'Test Email from Smart Home CRM',
    message: 'This is a test email to verify the email integration is working correctly.'
  });
  const [sending, setSending] = useState(false);
  const [sendResult, setSendResult] = useState<{ success: boolean; message: string } | null>(null);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleSendTestEmail = async () => {
    setSending(true);
    setSendResult(null);

    try {
      // Simulate sending test email
      console.log('Would send test email:', testEmail);
      
      // For now, simulate success
      setTimeout(() => {
        setSendResult({
          success: true,
          message: 'Test email sent successfully! (This is a simulation)'
        });
        setSending(false);
      }, 2000);

    } catch (error) {
      setSendResult({
        success: false,
        message: `Failed to send test email: ${(error as Error).message}`
      });
      setSending(false);
    }
  };

  const features = [
    {
      title: 'SMTP Configuration',
      description: 'Set up your email server settings',
      status: 'ready',
      icon: <SettingsIcon />
    },
    {
      title: 'Email Templates',
      description: 'Professional email designs',
      status: 'pending',
      icon: <PreviewIcon />
    },
    {
      title: 'Portal Link Delivery',
      description: 'Automated email sending',
      status: 'pending',
      icon: <SendIcon />
    },
    {
      title: 'Email Tracking',
      description: 'Open and click analytics',
      status: 'pending',
      icon: <EmailIcon />
    }
  ];

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Paper sx={{ p: 4, mb: 4 }}>
        <Box display="flex" alignItems="center" mb={2}>
          <EmailIcon sx={{ mr: 2, fontSize: 40, color: 'primary.main' }} />
          <Box>
            <Typography variant="h3" component="h1" gutterBottom>
              Email Integration Testing
            </Typography>
            <Typography variant="h6" color="text.secondary">
              Configure and test email functionality for your Smart Home CRM
            </Typography>
          </Box>
        </Box>

        <Alert severity="info" sx={{ mt: 3 }}>
          <Typography variant="body1">
            <strong>Safety First:</strong> This email system is completely separate from your existing 
            proposal and portal functionality. Test everything here before enabling automation.
          </Typography>
        </Alert>
      </Paper>

      {/* Feature Status */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h5" gutterBottom>
          Email Integration Features
        </Typography>
        
        <Grid container spacing={2}>
          {features.map((feature, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card variant="outlined">
                <CardContent sx={{ textAlign: 'center', py: 2 }}>
                  <Box sx={{ color: feature.status === 'ready' ? 'success.main' : 'text.secondary', mb: 1 }}>
                    {feature.icon}
                  </Box>
                  <Typography variant="subtitle2" gutterBottom>
                    {feature.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    {feature.description}
                  </Typography>
                  <Chip 
                    label={feature.status === 'ready' ? 'Ready' : 'Coming Soon'}
                    color={feature.status === 'ready' ? 'success' : 'default'}
                    size="small"
                  />
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Paper>

      {/* Tabs */}
      <Paper sx={{ mb: 4 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={activeTab} onChange={handleTabChange}>
            <Tab label="Email Configuration" />
            <Tab label="Send Test Email" />
            <Tab label="Templates" disabled />
            <Tab label="Analytics" disabled />
          </Tabs>
        </Box>

        {/* Configuration Tab */}
        <TabPanel value={activeTab} index={0}>
          <EmailConfigurationForm />
        </TabPanel>

        {/* Test Email Tab */}
        <TabPanel value={activeTab} index={1}>
          <Box maxWidth="600px" mx="auto">
            <Typography variant="h5" gutterBottom>
              Send Test Email
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              Test your email configuration by sending a test email.
            </Typography>

            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="To Email"
                  type="email"
                  value={testEmail.toEmail}
                  onChange={(e) => setTestEmail(prev => ({ ...prev, toEmail: e.target.value }))}
                  placeholder="test@example.com"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="To Name"
                  value={testEmail.toName}
                  onChange={(e) => setTestEmail(prev => ({ ...prev, toName: e.target.value }))}
                  placeholder="Test User"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Subject"
                  value={testEmail.subject}
                  onChange={(e) => setTestEmail(prev => ({ ...prev, subject: e.target.value }))}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  label="Message"
                  value={testEmail.message}
                  onChange={(e) => setTestEmail(prev => ({ ...prev, message: e.target.value }))}
                />
              </Grid>
            </Grid>

            <Box mt={3}>
              <Button
                variant="contained"
                size="large"
                onClick={handleSendTestEmail}
                disabled={sending || !testEmail.toEmail || !testEmail.subject}
                startIcon={sending ? <EmailIcon /> : <SendIcon />}
              >
                {sending ? 'Sending Test Email...' : 'Send Test Email'}
              </Button>
            </Box>

            {sendResult && (
              <Alert 
                severity={sendResult.success ? 'success' : 'error'} 
                sx={{ mt: 3 }}
                icon={sendResult.success ? <CheckIcon /> : <ErrorIcon />}
              >
                {sendResult.message}
              </Alert>
            )}
          </Box>
        </TabPanel>

        {/* Templates Tab (Coming Soon) */}
        <TabPanel value={activeTab} index={2}>
          <Box textAlign="center" py={8}>
            <PreviewIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h5" gutterBottom>
              Email Templates
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Professional email templates for portal links and notifications. Coming soon!
            </Typography>
          </Box>
        </TabPanel>

        {/* Analytics Tab (Coming Soon) */}
        <TabPanel value={activeTab} index={3}>
          <Box textAlign="center" py={8}>
            <EmailIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h5" gutterBottom>
              Email Analytics
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Track email opens, clicks, and delivery rates. Coming soon!
            </Typography>
          </Box>
        </TabPanel>
      </Paper>

      {/* Next Steps */}
      <Paper sx={{ p: 4 }}>
        <Typography variant="h5" gutterBottom>
          Getting Started
        </Typography>
        
        <List>
          <ListItem>
            <ListItemIcon>
              <CheckIcon color="primary" />
            </ListItemIcon>
            <ListItemText
              primary="1. Configure SMTP Settings"
              secondary="Set up your email server configuration in the Configuration tab"
            />
          </ListItem>
          <ListItem>
            <ListItemIcon>
              <CheckIcon color="primary" />
            </ListItemIcon>
            <ListItemText
              primary="2. Test Email Delivery"
              secondary="Send a test email to verify your configuration works"
            />
          </ListItem>
          <ListItem>
            <ListItemIcon>
              <SettingsIcon color="action" />
            </ListItemIcon>
            <ListItemText
              primary="3. Integration with Portal System"
              secondary="Once tested, email functionality can be integrated with portal link generation"
            />
          </ListItem>
        </List>

        <Alert severity="warning" sx={{ mt: 3 }}>
          <Typography variant="body2">
            <strong>Important:</strong> Email automation is disabled by default. 
            Your existing proposal and portal systems will continue working normally 
            until you explicitly enable email integration.
          </Typography>
        </Alert>
      </Paper>
    </Container>
  );
} 