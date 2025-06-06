import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Stepper,
  Step,
  StepLabel,
  Box,
  Typography,
  TextField,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Card,
  CardContent,
  CardMedia,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Checkbox,
  Alert,
  Paper,
  Divider,
} from '@mui/material';
import {
  Campaign as CampaignIcon,
  Email as EmailIcon,
  Schedule as ScheduleIcon,
  Send as SendIcon,
  Preview as PreviewIcon,
  People as PeopleIcon,
} from '@mui/icons-material';
import EmailBuilder from './EmailBuilder';

const steps = ['Campaign Details', 'Select Template', 'Design Email', 'Audience', 'Schedule & Send'];

const emailTemplates = [
  {
    id: 1,
    name: 'Interior Designer Welcome',
    category: 'Interior Designers',
    description: 'Professional welcome email for interior design clients',
    thumbnail: '/templates/interior-welcome.jpg',
    subject: 'Transform Your Spaces with Smart Home Technology',
    previewText: 'Discover how smart home solutions can elevate your interior design projects...',
  },
  {
    id: 2,
    name: 'Architect Partnership',
    category: 'Architects',
    description: 'Partnership proposal template for architects',
    thumbnail: '/templates/architect-partnership.jpg',
    subject: 'Smart Building Solutions for Modern Architecture',
    previewText: 'Integrate cutting-edge smart home technology into your architectural designs...',
  },
  {
    id: 3,
    name: 'Builder Collaboration',
    category: 'Builders',
    description: 'Collaboration template for home builders',
    thumbnail: '/templates/builder-collab.jpg',
    subject: 'Enhance Your Builds with Smart Home Technology',
    previewText: 'Add value to your construction projects with integrated smart home systems...',
  },
  {
    id: 4,
    name: 'Property Manager Benefits',
    category: 'Property Management',
    description: 'Benefits-focused template for property managers',
    thumbnail: '/templates/property-benefits.jpg',
    subject: 'Reduce Costs & Increase Property Value',
    previewText: 'Smart home technology that pays for itself through energy savings...',
  },
  {
    id: 5,
    name: 'Case Study Showcase',
    category: 'General',
    description: 'Success story template with case studies',
    thumbnail: '/templates/case-study.jpg',
    subject: 'See Smart Home Success Stories',
    previewText: 'Real results from our smart home installations...',
  },
  {
    id: 6,
    name: 'Product Demo Invitation',
    category: 'Sales',
    description: 'Demo invitation with scheduling links',
    thumbnail: '/templates/demo-invite.jpg',
    subject: 'Experience Smart Home Technology Live',
    previewText: 'Schedule your personalized smart home demonstration...',
  },
];

const mockAudiences = [
  { id: 1, name: 'All Customers', count: 1247, type: 'All' },
  { id: 2, name: 'Active Customers', count: 342, type: 'Status' },
  { id: 3, name: 'Property Managers', count: 156, type: 'Industry' },
  { id: 4, name: 'Interior Designers', count: 89, type: 'Industry' },
  { id: 5, name: 'Architects', count: 67, type: 'Industry' },
  { id: 6, name: 'Home Builders', count: 234, type: 'Industry' },
  { id: 7, name: 'High Value Prospects', count: 78, type: 'Lead Score' },
  { id: 8, name: 'Recent Leads', count: 145, type: 'Date' },
];

interface CampaignWizardProps {
  open: boolean;
  onClose: () => void;
  onSave: (campaignData: any) => void;
  initialLeads?: any[];
}

export default function CampaignWizard({ open, onClose, onSave, initialLeads = [] }: CampaignWizardProps) {
  const [activeStep, setActiveStep] = useState(0);
  const [campaignData, setCampaignData] = useState({
    name: '',
    type: 'Email Sequence',
    description: '',
    subject: '',
    templateId: null,
    templateData: null,
    emailContent: '',
    selectedAudiences: initialLeads.length > 0 ? ['custom'] : [],
    customLeads: initialLeads,
    scheduleType: 'immediate',
    scheduledDate: '',
    scheduledTime: '',
  });

  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleReset = () => {
    setActiveStep(0);
    setCampaignData({
      name: '',
      type: 'Email Sequence',
      description: '',
      subject: '',
      templateId: null,
      templateData: null,
      emailContent: '',
      selectedAudiences: initialLeads.length > 0 ? ['custom'] : [],
      customLeads: initialLeads,
      scheduleType: 'immediate',
      scheduledDate: '',
      scheduledTime: '',
    });
    setSelectedTemplate(null);
  };

  const handleTemplateSelect = (template: any) => {
    setSelectedTemplate(template);
    setCampaignData(prev => ({
      ...prev,
      templateId: template.id,
      templateData: template,
      subject: template.subject,
    }));
  };

  const handleAudienceToggle = (audienceId: string) => {
    setCampaignData(prev => ({
      ...prev,
      selectedAudiences: prev.selectedAudiences.includes(audienceId)
        ? prev.selectedAudiences.filter(id => id !== audienceId)
        : [...prev.selectedAudiences, audienceId]
    }));
  };

  const getTotalRecipients = () => {
    if (campaignData.customLeads.length > 0) {
      return campaignData.customLeads.length;
    }
    
    return campaignData.selectedAudiences.reduce((total, audienceId) => {
      const audience = mockAudiences.find(a => a.id.toString() === audienceId);
      return total + (audience?.count || 0);
    }, 0);
  };

  const handleFinish = () => {
    const finalCampaignData = {
      ...campaignData,
      totalRecipients: getTotalRecipients(),
      createdAt: new Date().toISOString(),
      status: campaignData.scheduleType === 'immediate' ? 'Active' : 'Scheduled',
    };
    
    onSave(finalCampaignData);
    handleReset();
    onClose();
  };

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Campaign Name"
                value={campaignData.name}
                onChange={(e) => setCampaignData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., Spring 2024 Interior Designer Outreach"
                required
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Campaign Type</InputLabel>
                <Select
                  value={campaignData.type}
                  label="Campaign Type"
                  onChange={(e) => setCampaignData(prev => ({ ...prev, type: e.target.value }))}
                >
                  <MenuItem value="Email Sequence">Email Sequence</MenuItem>
                  <MenuItem value="Newsletter">Newsletter</MenuItem>
                  <MenuItem value="Drip Campaign">Drip Campaign</MenuItem>
                  <MenuItem value="Promotional">Promotional</MenuItem>
                  <MenuItem value="Follow-up">Follow-up</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Email Subject Line"
                value={campaignData.subject}
                onChange={(e) => setCampaignData(prev => ({ ...prev, subject: e.target.value }))}
                placeholder="Enter email subject line"
                required
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Campaign Description"
                value={campaignData.description}
                onChange={(e) => setCampaignData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe the purpose and goals of this campaign..."
              />
            </Grid>
          </Grid>
        );

      case 1:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Choose an Email Template
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Select a pre-designed template or start with a blank canvas
            </Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6} md={4}>
                <Card 
                  sx={{ 
                    cursor: 'pointer',
                    border: selectedTemplate?.id === 'blank' ? 2 : 1,
                    borderColor: selectedTemplate?.id === 'blank' ? 'primary.main' : 'divider',
                  }}
                  onClick={() => handleTemplateSelect({ id: 'blank', name: 'Blank Template', subject: campaignData.subject || 'Your Subject Here' })}
                >
                  <CardContent sx={{ textAlign: 'center', py: 4 }}>
                    <EmailIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
                    <Typography variant="h6">Blank Template</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Start from scratch with our email builder
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              
              {emailTemplates.map((template) => (
                <Grid item xs={12} sm={6} md={4} key={template.id}>
                  <Card 
                    sx={{ 
                      cursor: 'pointer',
                      border: selectedTemplate?.id === template.id ? 2 : 1,
                      borderColor: selectedTemplate?.id === template.id ? 'primary.main' : 'divider',
                    }}
                    onClick={() => handleTemplateSelect(template)}
                  >
                    <CardMedia
                      component="div"
                      sx={{ 
                        height: 120, 
                        bgcolor: 'grey.200',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'grey.600'
                      }}
                    >
                      Template Preview
                    </CardMedia>
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                        <Typography variant="subtitle1" fontWeight="bold">
                          {template.name}
                        </Typography>
                        <Chip label={template.category} size="small" />
                      </Box>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        {template.description}
                      </Typography>
                      <Typography variant="caption" color="primary">
                        Subject: {template.subject}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        );

      case 2:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Design Your Email
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Use our drag-and-drop editor to create your email content
            </Typography>
            
            {/* Simplified email builder for now - we'll add the full one back later */}
            <Paper sx={{ p: 3, minHeight: 400, bgcolor: 'grey.50' }}>
              <Typography variant="h6" gutterBottom>Email Content Builder</Typography>
              <TextField
                fullWidth
                multiline
                rows={10}
                label="Email Content"
                value={campaignData.emailContent}
                onChange={(e) => setCampaignData(prev => ({ ...prev, emailContent: e.target.value }))}
                placeholder="Enter your email content here..."
              />
              <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                📧 Full drag-and-drop email builder coming next!
              </Typography>
            </Paper>
          </Box>
        );

      case 3:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Select Your Audience
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Choose who will receive this campaign
            </Typography>

            {campaignData.customLeads.length > 0 && (
              <Alert severity="info" sx={{ mb: 3 }}>
                {campaignData.customLeads.length} leads have been pre-selected from Lead Generation
              </Alert>
            )}
            
            <List>
              {mockAudiences.map((audience) => (
                <ListItem key={audience.id}>
                  <ListItemText
                    primary={audience.name}
                    secondary={`${audience.count.toLocaleString()} recipients • ${audience.type}`}
                  />
                  <ListItemSecondaryAction>
                    <Checkbox
                      checked={campaignData.selectedAudiences.includes(audience.id.toString())}
                      onChange={() => handleAudienceToggle(audience.id.toString())}
                    />
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>

            <Divider sx={{ my: 2 }} />
            
            <Paper sx={{ p: 2, bgcolor: 'primary.50' }}>
              <Typography variant="h6" color="primary">
                Total Recipients: {getTotalRecipients().toLocaleString()}
              </Typography>
            </Paper>
          </Box>
        );

      case 4:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Schedule Your Campaign
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Choose when to send your campaign
            </Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Send Options</InputLabel>
                  <Select
                    value={campaignData.scheduleType}
                    label="Send Options"
                    onChange={(e) => setCampaignData(prev => ({ ...prev, scheduleType: e.target.value }))}
                  >
                    <MenuItem value="immediate">Send Immediately</MenuItem>
                    <MenuItem value="scheduled">Schedule for Later</MenuItem>
                    <MenuItem value="draft">Save as Draft</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              {campaignData.scheduleType === 'scheduled' && (
                <>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      type="date"
                      label="Send Date"
                      value={campaignData.scheduledDate}
                      onChange={(e) => setCampaignData(prev => ({ ...prev, scheduledDate: e.target.value }))}
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      type="time"
                      label="Send Time"
                      value={campaignData.scheduledTime}
                      onChange={(e) => setCampaignData(prev => ({ ...prev, scheduledTime: e.target.value }))}
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                </>
              )}
            </Grid>

            <Paper sx={{ p: 3, mt: 3 }}>
              <Typography variant="h6" gutterBottom>
                Campaign Summary
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2"><strong>Name:</strong> {campaignData.name}</Typography>
                  <Typography variant="body2"><strong>Type:</strong> {campaignData.type}</Typography>
                  <Typography variant="body2"><strong>Subject:</strong> {campaignData.subject}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2"><strong>Recipients:</strong> {getTotalRecipients().toLocaleString()}</Typography>
                  <Typography variant="body2"><strong>Template:</strong> {selectedTemplate?.name}</Typography>
                  <Typography variant="body2"><strong>Send:</strong> {campaignData.scheduleType === 'immediate' ? 'Immediately' : campaignData.scheduleType === 'scheduled' ? `${campaignData.scheduledDate} at ${campaignData.scheduledTime}` : 'Save as Draft'}</Typography>
                </Grid>
              </Grid>
            </Paper>
          </Box>
        );

      default:
        return 'Unknown step';
    }
  };

  const isStepComplete = (step: number) => {
    switch (step) {
      case 0:
        return campaignData.name && campaignData.subject;
      case 1:
        return selectedTemplate;
      case 2:
        return true; // Email builder step
      case 3:
        return getTotalRecipients() > 0;
      case 4:
        return campaignData.scheduleType && (
          campaignData.scheduleType !== 'scheduled' || 
          (campaignData.scheduledDate && campaignData.scheduledTime)
        );
      default:
        return false;
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <CampaignIcon sx={{ mr: 1 }} />
          Create Email Campaign
        </Box>
      </DialogTitle>
      
      <DialogContent>
        <Box sx={{ width: '100%', mb: 3 }}>
          <Stepper activeStep={activeStep} alternativeLabel>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
        </Box>

        <Box sx={{ mt: 2, mb: 1 }}>
          {renderStepContent(activeStep)}
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Box sx={{ flex: '1 1 auto' }} />
        
        {activeStep > 0 && (
          <Button onClick={handleBack}>
            Back
          </Button>
        )}
        
        {activeStep < steps.length - 1 ? (
          <Button
            variant="contained"
            onClick={handleNext}
            disabled={!isStepComplete(activeStep)}
          >
            Next
          </Button>
        ) : (
          <Button
            variant="contained"
            onClick={handleFinish}
            disabled={!isStepComplete(activeStep)}
            startIcon={campaignData.scheduleType === 'immediate' ? <SendIcon /> : <ScheduleIcon />}
          >
            {campaignData.scheduleType === 'immediate' ? 'Send Campaign' : 
             campaignData.scheduleType === 'scheduled' ? 'Schedule Campaign' : 'Save Draft'}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
} 