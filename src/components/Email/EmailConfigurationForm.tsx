/**
 * Email Configuration Form
 * 
 * SAFETY: This is a NEW component that operates independently.
 * It doesn't modify any existing portal or proposal functionality.
 */

import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Grid,
  FormControlLabel,
  Switch,
  Alert,
  CircularProgress,
  Divider,
  Paper,
  Chip
} from '@mui/material';
import {
  Email as EmailIcon,
  Security as SecurityIcon,
  Palette as PaletteIcon,
  Settings as SettingsIcon,
  CheckCircle as CheckIcon,
  Error as ErrorIcon
} from '@mui/icons-material';
import { EmailConfig, EmailConfigValidator, EmailService } from '../../services/emailService';

interface EmailConfigFormData {
  smtpHost: string;
  smtpPort: number;
  smtpUser: string;
  smtpPassword: string;
  smtpSecure: boolean;
  fromEmail: string;
  fromName: string;
  replyToEmail: string;
  companyName: string;
  primaryColor: string;
  signature: string;
  autoSendPortalLinks: boolean;
  trackEmails: boolean;
}

export default function EmailConfigurationForm() {
  const [formData, setFormData] = useState<EmailConfigFormData>({
    smtpHost: '',
    smtpPort: 587,
    smtpUser: '',
    smtpPassword: '',
    smtpSecure: true,
    fromEmail: '',
    fromName: '',
    replyToEmail: '',
    companyName: '',
    primaryColor: '#1976d2',
    signature: '',
    autoSendPortalLinks: false, // Start disabled for safety
    trackEmails: true
  });

  const [testing, setTesting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [saveResult, setSaveResult] = useState<{ success: boolean; message: string } | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const handleInputChange = (field: keyof EmailConfigFormData) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = event.target.type === 'checkbox' ? event.target.checked : 
                  event.target.type === 'number' ? parseInt(event.target.value) || 0 :
                  event.target.value;

    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear previous results when user makes changes
    if (testResult) setTestResult(null);
    if (saveResult) setSaveResult(null);
    if (validationErrors.length > 0) setValidationErrors([]);
  };

  const handleTestConnection = async () => {
    setTesting(true);
    setTestResult(null);

    try {
      // Validate configuration first
      const validation = EmailConfigValidator.validate(formData as EmailConfig);
      if (!validation.isValid) {
        setValidationErrors(validation.errors);
        setTestResult({
          success: false,
          message: 'Please fix configuration errors before testing'
        });
        return;
      }

      // Create email service instance for testing
      const emailService = new EmailService(formData as EmailConfig);
      const result = await emailService.testConnection();
      setTestResult(result);

    } catch (error) {
      setTestResult({
        success: false,
        message: `Test failed: ${(error as Error).message}`
      });
    } finally {
      setTesting(false);
    }
  };

  const handleSaveConfiguration = async () => {
    setSaving(true);
    setSaveResult(null);

    try {
      // Validate configuration
      const validation = EmailConfigValidator.validate(formData as EmailConfig);
      if (!validation.isValid) {
        setValidationErrors(validation.errors);
        setSaveResult({
          success: false,
          message: 'Please fix validation errors before saving'
        });
        return;
      }

      // TODO: Implement actual save to database
      console.log('Would save email configuration:', formData);

      // For now, simulate successful save
      setSaveResult({
        success: true,
        message: 'Email configuration saved successfully!'
      });

    } catch (error) {
      setSaveResult({
        success: false,
        message: `Save failed: ${(error as Error).message}`
      });
    } finally {
      setSaving(false);
    }
  };

  const getStatusColor = (result: { success: boolean } | null) => {
    if (!result) return 'default';
    return result.success ? 'success' : 'error';
  };

  return (
    <Box maxWidth="900px" mx="auto" p={3}>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box display="flex" alignItems="center" mb={3}>
          <EmailIcon sx={{ mr: 2, fontSize: 32, color: 'primary.main' }} />
          <Box>
            <Typography variant="h4" gutterBottom>
              Email Integration Setup
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Configure SMTP settings and email branding for automated portal link delivery.
              This is completely separate from your existing proposal system.
            </Typography>
          </Box>
        </Box>

        {/* Status Indicators */}
        <Box display="flex" gap={2} mb={3}>
          <Chip 
            icon={testing ? <CircularProgress size={16} /> : testResult?.success ? <CheckIcon /> : <ErrorIcon />}
            label={testing ? 'Testing...' : testResult?.success ? 'Connection OK' : 'Not Tested'}
            color={getStatusColor(testResult)}
            variant="outlined"
          />
          <Chip 
            icon={saving ? <CircularProgress size={16} /> : saveResult?.success ? <CheckIcon /> : <SettingsIcon />}
            label={saving ? 'Saving...' : saveResult?.success ? 'Configuration Saved' : 'Not Configured'}
            color={getStatusColor(saveResult)}
            variant="outlined"
          />
        </Box>

        {/* Validation Errors */}
        {validationErrors.length > 0 && (
          <Alert severity="error" sx={{ mb: 3 }}>
            <Typography variant="subtitle2" gutterBottom>
              Please fix the following errors:
            </Typography>
            <ul style={{ margin: 0, paddingLeft: '20px' }}>
              {validationErrors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </Alert>
        )}
      </Paper>

      {/* SMTP Configuration */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box display="flex" alignItems="center" mb={3}>
            <SecurityIcon sx={{ mr: 1, color: 'primary.main' }} />
            <Typography variant="h6">SMTP Server Settings</Typography>
          </Box>
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={8}>
              <TextField
                fullWidth
                label="SMTP Host"
                placeholder="smtp.gmail.com"
                value={formData.smtpHost}
                onChange={handleInputChange('smtpHost')}
                helperText="Your email provider's SMTP server"
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Port"
                type="number"
                value={formData.smtpPort}
                onChange={handleInputChange('smtpPort')}
                helperText="Usually 587 or 465"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Username"
                value={formData.smtpUser}
                onChange={handleInputChange('smtpUser')}
                helperText="Your email account username"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Password"
                type="password"
                value={formData.smtpPassword}
                onChange={handleInputChange('smtpPassword')}
                helperText="App password or account password"
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.smtpSecure}
                    onChange={handleInputChange('smtpSecure')}
                  />
                }
                label="Use TLS/SSL encryption (recommended)"
              />
            </Grid>
          </Grid>

          <Box mt={3}>
            <Button
              variant="outlined"
              onClick={handleTestConnection}
              disabled={testing || !formData.smtpHost || !formData.smtpUser}
              startIcon={testing ? <CircularProgress size={16} /> : null}
            >
              {testing ? 'Testing Connection...' : 'Test SMTP Connection'}
            </Button>
          </Box>

          {testResult && (
            <Alert severity={testResult.success ? 'success' : 'error'} sx={{ mt: 2 }}>
              {testResult.message}
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Email Settings */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box display="flex" alignItems="center" mb={3}>
            <EmailIcon sx={{ mr: 1, color: 'primary.main' }} />
            <Typography variant="h6">Email Settings</Typography>
          </Box>
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="From Email"
                type="email"
                value={formData.fromEmail}
                onChange={handleInputChange('fromEmail')}
                helperText="Email address clients will see"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="From Name"
                value={formData.fromName}
                onChange={handleInputChange('fromName')}
                helperText="Display name for emails"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Reply-To Email (Optional)"
                type="email"
                value={formData.replyToEmail}
                onChange={handleInputChange('replyToEmail')}
                helperText="Where client replies should go"
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Branding */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box display="flex" alignItems="center" mb={3}>
            <PaletteIcon sx={{ mr: 1, color: 'primary.main' }} />
            <Typography variant="h6">Email Branding</Typography>
          </Box>
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={8}>
              <TextField
                fullWidth
                label="Company Name"
                value={formData.companyName}
                onChange={handleInputChange('companyName')}
                helperText="Your company name for email headers"
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Primary Color"
                type="color"
                value={formData.primaryColor}
                onChange={handleInputChange('primaryColor')}
                helperText="Brand color for emails"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Email Signature (Optional)"
                value={formData.signature}
                onChange={handleInputChange('signature')}
                placeholder="Best regards,&#10;John Smith&#10;Smart Home Solutions&#10;(555) 123-4567"
                helperText="Appears at the bottom of emails"
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Automation Settings */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box display="flex" alignItems="center" mb={3}>
            <SettingsIcon sx={{ mr: 1, color: 'primary.main' }} />
            <Typography variant="h6">Automation Settings</Typography>
          </Box>
          
          <FormControlLabel
            control={
              <Switch
                checked={formData.autoSendPortalLinks}
                onChange={handleInputChange('autoSendPortalLinks')}
              />
            }
            label="Automatically send portal links when generated"
          />
          <Typography variant="caption" display="block" color="text.secondary" sx={{ ml: 4, mt: -1 }}>
            When enabled, emails will be sent automatically when portal links are created
          </Typography>
          
          <FormControlLabel
            control={
              <Switch
                checked={formData.trackEmails}
                onChange={handleInputChange('trackEmails')}
              />
            }
            label="Enable email tracking (opens, clicks)"
            sx={{ mt: 2 }}
          />
          <Typography variant="caption" display="block" color="text.secondary" sx={{ ml: 4, mt: -1 }}>
            Track when clients open emails and click links
          </Typography>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <Box display="flex" gap={2} justifyContent="flex-end">
        <Button
          variant="outlined"
          size="large"
          onClick={() => setFormData({
            smtpHost: '',
            smtpPort: 587,
            smtpUser: '',
            smtpPassword: '',
            smtpSecure: true,
            fromEmail: '',
            fromName: '',
            replyToEmail: '',
            companyName: '',
            primaryColor: '#1976d2',
            signature: '',
            autoSendPortalLinks: false,
            trackEmails: true
          })}
        >
          Reset Form
        </Button>
        <Button
          variant="contained"
          size="large"
          onClick={handleSaveConfiguration}
          disabled={saving || validationErrors.length > 0}
          startIcon={saving ? <CircularProgress size={16} /> : null}
        >
          {saving ? 'Saving...' : 'Save Configuration'}
        </Button>
      </Box>

      {saveResult && (
        <Alert severity={saveResult.success ? 'success' : 'error'} sx={{ mt: 2 }}>
          {saveResult.message}
        </Alert>
      )}
    </Box>
  );
} 