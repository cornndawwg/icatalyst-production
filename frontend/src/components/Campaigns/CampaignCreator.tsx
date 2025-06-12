import { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  TextField,
  Button,
  Stack,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Stepper,
  Step,
  StepLabel,
  Alert,
  Breadcrumbs,
  Link,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import { useNavigate, useParams, Link as RouterLink } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store';
import { createCampaign, updateCampaign, Campaign } from '../../store/slices/campaignSlice';
import EmailBuilder from '../EmailBuilder/EmailBuilder';
import { EmailComponent } from '../EmailBuilder/types';
import { renderEmailComponent } from '../EmailBuilder/components';

const CAMPAIGN_TYPES = [
  'Interior Designer Outreach',
  'Architect Partnership',
  'Custom Builder Network',
  'General Newsletter',
];

const VERTICAL_TEMPLATES: Record<string, EmailComponent[]> = {
  'Interior Designer Outreach': [
    {
      id: 'header',
      type: 'text',
      props: {
        content: 'Partner with us for smart home integration',
        fontSize: 24,
        color: '#333333',
        align: 'center',
        fontFamily: 'Arial',
        bold: true,
      },
    },
    {
      id: 'intro',
      type: 'text',
      props: {
        content: 'Dear {firstName},\n\nWe noticed your exceptional work at {companyName} in creating beautiful interior spaces. Have you considered integrating smart home technology into your designs?',
        fontSize: 16,
        color: '#333333',
        align: 'left',
        fontFamily: 'Arial',
      },
    },
    {
      id: 'main',
      type: 'text',
      props: {
        content: 'Our smart home solutions can enhance your projects while maintaining the aesthetic integrity of your designs. We\'d love to discuss a potential partnership.',
        fontSize: 16,
        color: '#333333',
        align: 'left',
        fontFamily: 'Arial',
      },
    },
    {
      id: 'cta',
      type: 'button',
      props: {
        text: 'Schedule a Consultation',
        backgroundColor: '#4CAF50',
        textColor: '#ffffff',
        url: '#',
        borderRadius: 4,
        align: 'center',
      },
    },
  ],
  'Architect Partnership': [
    {
      id: 'header',
      type: 'text',
      props: {
        content: 'Smart home technology for your architectural projects',
        fontSize: 24,
        color: '#333333',
        align: 'center',
        fontFamily: 'Arial',
        bold: true,
      },
    },
    {
      id: 'intro',
      type: 'text',
      props: {
        content: 'Dear {firstName},\n\nYour architectural designs at {companyName} showcase innovation and creativity. We believe smart home technology could add another dimension to your projects.',
        fontSize: 16,
        color: '#333333',
        align: 'left',
        fontFamily: 'Arial',
      },
    },
    {
      id: 'image',
      type: 'image',
      props: {
        src: 'https://via.placeholder.com/600x300?text=Smart+Home+Integration',
        alt: 'Smart Home Integration Example',
        width: '100%',
        align: 'center',
      },
    },
    {
      id: 'main',
      type: 'text',
      props: {
        content: 'Would you be interested in learning how our solutions can complement your architectural vision? Our technology seamlessly integrates with modern design principles.',
        fontSize: 16,
        color: '#333333',
        align: 'left',
        fontFamily: 'Arial',
      },
    },
    {
      id: 'cta',
      type: 'button',
      props: {
        text: 'Explore Integration Options',
        backgroundColor: '#2196F3',
        textColor: '#ffffff',
        url: '#',
        borderRadius: 4,
        align: 'center',
      },
    },
  ],
  'Custom Builder Network': [
    {
      id: 'header',
      type: 'text',
      props: {
        content: 'Elevate your custom homes with smart technology',
        fontSize: 24,
        color: '#333333',
        align: 'center',
        fontFamily: 'Arial',
        bold: true,
      },
    },
    {
      id: 'intro',
      type: 'text',
      props: {
        content: 'Dear {firstName},\n\n{companyName}\'s reputation for building exceptional custom homes is well-known. We\'d like to explore how smart home technology could add value to your projects.',
        fontSize: 16,
        color: '#333333',
        align: 'left',
        fontFamily: 'Arial',
      },
    },
    {
      id: 'features',
      type: 'text',
      props: {
        content: '• Seamless integration during construction\n• Enhanced home value\n• Future-proof technology\n• Custom automation solutions',
        fontSize: 16,
        color: '#333333',
        align: 'left',
        fontFamily: 'Arial',
      },
    },
    {
      id: 'main',
      type: 'text',
      props: {
        content: 'Our solutions can be seamlessly integrated during the construction phase, offering your clients the ultimate in modern living.',
        fontSize: 16,
        color: '#333333',
        align: 'left',
        fontFamily: 'Arial',
      },
    },
    {
      id: 'cta',
      type: 'button',
      props: {
        text: 'Partner With Us',
        backgroundColor: '#FF5722',
        textColor: '#ffffff',
        url: '#',
        borderRadius: 4,
        align: 'center',
      },
    },
  ],
  'General Newsletter': [
    {
      id: 'header',
      type: 'text',
      props: {
        content: 'Stay updated with smart home innovations',
        fontSize: 24,
        color: '#333333',
        align: 'center',
        fontFamily: 'Arial',
        bold: true,
      },
    },
    {
      id: 'intro',
      type: 'text',
      props: {
        content: 'Dear {firstName},\n\nWe\'re excited to share the latest developments in smart home technology that could benefit your work at {companyName}.',
        fontSize: 16,
        color: '#333333',
        align: 'left',
        fontFamily: 'Arial',
      },
    },
    {
      id: 'divider1',
      type: 'divider',
      props: {
        style: 'solid',
        color: '#e0e0e0',
        spacing: 20,
      },
    },
    {
      id: 'updates',
      type: 'text',
      props: {
        content: 'Latest Updates:\n• New voice control features\n• Enhanced security systems\n• Energy management solutions\n• Mobile app improvements',
        fontSize: 16,
        color: '#333333',
        align: 'left',
        fontFamily: 'Arial',
      },
    },
    {
      id: 'divider2',
      type: 'divider',
      props: {
        style: 'solid',
        color: '#e0e0e0',
        spacing: 20,
      },
    },
    {
      id: 'cta',
      type: 'button',
      props: {
        text: 'Schedule a Demo',
        backgroundColor: '#9C27B0',
        textColor: '#ffffff',
        url: '#',
        borderRadius: 4,
        align: 'center',
      },
    },
    {
      id: 'social',
      type: 'social',
      props: {
        networks: ['facebook', 'twitter', 'linkedin'],
        size: 32,
        align: 'center',
      },
    },
  ],
};

const steps = ['Campaign Type', 'Campaign Details', 'Email Design', 'Review & Schedule'];

export default function CampaignCreator() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { id } = useParams<{ id: string }>();
  const existingCampaign = useSelector((state: RootState) =>
    state.campaigns.campaigns.find(c => c.id === id)
  );

  const [activeStep, setActiveStep] = useState(0);
  const [campaignData, setCampaignData] = useState<Partial<Campaign>>({
    name: '',
    type: '',
    status: 'draft',
    template: '',
    subject: '',
    content: '',
    scheduledDate: undefined,
  });
  const [emailComponents, setEmailComponents] = useState<EmailComponent[]>([]);
  const [testEmailDialogOpen, setTestEmailDialogOpen] = useState(false);
  const [testEmailAddress, setTestEmailAddress] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id && existingCampaign) {
      setCampaignData(existingCampaign);
      try {
        setEmailComponents(JSON.parse(existingCampaign.content));
      } catch {
        // If content is not JSON, create a text component with the content
        setEmailComponents([
          {
            id: 'content',
            type: 'text',
            props: {
              content: existingCampaign.content,
              fontSize: 16,
              color: '#333333',
              align: 'left',
              fontFamily: 'Arial',
            },
          },
        ]);
      }
      setActiveStep(1);
    }
  }, [id, existingCampaign]);

  const handleTypeChange = (type: string) => {
    setCampaignData(prev => ({
      ...prev,
      type,
      template: type,
    }));
    setEmailComponents(VERTICAL_TEMPLATES[type] || []);
  };

  const handleInputChange = (field: keyof Campaign, value: any) => {
    setCampaignData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const validateStep = () => {
    switch (activeStep) {
      case 0:
        if (!campaignData.type) {
          setError('Please select a campaign type');
          return false;
        }
        break;
      case 1:
        if (!campaignData.name) {
          setError('Please enter a campaign name');
          return false;
        }
        break;
      case 2:
        if (emailComponents.length === 0) {
          setError('Please add at least one component to your email');
          return false;
        }
        break;
    }
    setError(null);
    return true;
  };

  const handleNext = () => {
    if (validateStep()) {
      setActiveStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    setActiveStep(prev => prev - 1);
  };

  const handleSave = () => {
    if (validateStep()) {
      const emailContent = JSON.stringify(emailComponents);
      if (id) {
        // Update existing campaign
        dispatch(updateCampaign({
          id,
          updates: {
            name: campaignData.name,
            type: campaignData.type,
            template: campaignData.template,
            subject: campaignData.subject,
            content: emailContent,
            scheduledDate: campaignData.scheduledDate,
            status: campaignData.scheduledDate ? 'scheduled' : 'draft',
          },
        }));
      } else {
        // Create new campaign
        dispatch(createCampaign({
          name: campaignData.name!,
          type: campaignData.type!,
          status: campaignData.scheduledDate ? 'scheduled' : 'draft',
          template: campaignData.template!,
          subject: campaignData.subject!,
          content: emailContent,
          scheduledDate: campaignData.scheduledDate,
        }));
      }
      navigate('/campaigns');
    }
  };

  const handleSendTest = () => {
    // Implement test email sending functionality
    setTestEmailDialogOpen(false);
    // Show success message
  };

  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return (
          <FormControl fullWidth>
            <InputLabel>Campaign Type</InputLabel>
            <Select
              value={campaignData.type}
              label="Campaign Type"
              onChange={(e) => handleTypeChange(e.target.value)}
            >
              {CAMPAIGN_TYPES.map((type) => (
                <MenuItem key={type} value={type}>
                  {type}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        );
      case 1:
        return (
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <Stack spacing={3}>
              <TextField
                fullWidth
                label="Campaign Name"
                value={campaignData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
              />
              <TextField
                fullWidth
                label="Email Subject"
                value={campaignData.subject}
                onChange={(e) => handleInputChange('subject', e.target.value)}
              />
              <DateTimePicker
                label="Schedule Send (Optional)"
                value={campaignData.scheduledDate ? new Date(campaignData.scheduledDate) : null}
                onChange={(newValue: Date | null) => handleInputChange('scheduledDate', newValue?.toISOString() || null)}
                slots={{ textField: TextField }}
                slotProps={{ textField: { fullWidth: true } }}
              />
            </Stack>
          </LocalizationProvider>
        );
      case 2:
        return (
          <Box sx={{ height: 600 }}>
            <EmailBuilder
              value={emailComponents}
              onChange={setEmailComponents}
              onSendTest={() => setTestEmailDialogOpen(true)}
            />
          </Box>
        );
      case 3:
        return (
          <Stack spacing={3}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="subtitle2" gutterBottom>Campaign Type</Typography>
              <Typography>{campaignData.type}</Typography>
            </Paper>
            <Paper sx={{ p: 2 }}>
              <Typography variant="subtitle2" gutterBottom>Campaign Name</Typography>
              <Typography>{campaignData.name}</Typography>
            </Paper>
            <Paper sx={{ p: 2 }}>
              <Typography variant="subtitle2" gutterBottom>Email Subject</Typography>
              <Typography>{campaignData.subject}</Typography>
            </Paper>
            <Paper sx={{ p: 2 }}>
              <Typography variant="subtitle2" gutterBottom>Schedule</Typography>
              <Typography>
                {campaignData.scheduledDate
                  ? new Date(campaignData.scheduledDate).toLocaleString()
                  : 'Not scheduled (Draft)'}
              </Typography>
            </Paper>
            <Paper sx={{ p: 2 }}>
              <Typography variant="subtitle2" gutterBottom>Email Preview</Typography>
              <Box sx={{ mt: 2 }}>
                {emailComponents.map(component => (
                  <Box key={component.id} sx={{ mb: 2 }}>
                    {renderEmailComponent(component)}
                  </Box>
                ))}
              </Box>
            </Paper>
          </Stack>
        );
    }
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        {/* Breadcrumbs */}
        <Breadcrumbs 
          separator={<NavigateNextIcon fontSize="small" />}
          sx={{ mb: 3 }}
        >
          <Link
            component={RouterLink}
            to="/campaigns"
            color="inherit"
            underline="hover"
          >
            Campaigns
          </Link>
          <Typography color="text.primary">
            {id ? 'Edit Campaign' : 'New Campaign'}
          </Typography>
        </Breadcrumbs>

        <Typography variant="h4" gutterBottom>
          {id ? 'Edit Campaign' : 'Create New Campaign'}
        </Typography>

        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Paper sx={{ p: 3, mb: 3 }}>
          {renderStepContent()}
        </Paper>

        <Stack direction="row" spacing={2} justifyContent="flex-end">
          {activeStep > 0 && (
            <Button onClick={handleBack}>
              Back
            </Button>
          )}
          {activeStep === steps.length - 1 ? (
            <Button
              variant="contained"
              color="primary"
              onClick={handleSave}
            >
              {id ? 'Save Changes' : 'Create Campaign'}
            </Button>
          ) : (
            <Button
              variant="contained"
              color="primary"
              onClick={handleNext}
            >
              Next
            </Button>
          )}
        </Stack>
      </Box>

      {/* Test Email Dialog */}
      <Dialog
        open={testEmailDialogOpen}
        onClose={() => setTestEmailDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Send Test Email</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Email Address"
            type="email"
            value={testEmailAddress}
            onChange={(e) => setTestEmailAddress(e.target.value)}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setTestEmailDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handleSendTest}
            disabled={!testEmailAddress}
          >
            Send Test
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
} 