import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Stepper,
  Step,
  StepLabel,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Card,
  CardContent,
  Divider,
  InputAdornment,
  Switch,
  FormControlLabel,
  Autocomplete,
  Alert,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Checkbox,
  RadioGroup,
  Radio,
  FormLabel,
  Slider,
  Paper,
  Avatar,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  AttachMoney as MoneyIcon,
  Person as PersonIcon,
  Build as BuildIcon,
  Schedule as ScheduleIcon,
  Assignment as AssignmentIcon,
  FileUpload as FileUploadIcon,
  Business as BusinessIcon,
  Home as HomeIcon,
  Security as SecurityIcon,
  Lightbulb as LightIcon,
  Videocam as VideoIcon,
  Router as NetworkIcon,
  Add as AddIcon,
  Remove as RemoveIcon,
  CheckCircle as CheckIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
} from '@mui/icons-material';

const PROJECT_TYPES = [
  { value: 'full_automation', label: 'Full Home Automation', icon: <HomeIcon /> },
  { value: 'security', label: 'Security System', icon: <SecurityIcon /> },
  { value: 'lighting', label: 'Lighting Control', icon: <LightIcon /> },
  { value: 'av', label: 'Audio/Video', icon: <VideoIcon /> },
  { value: 'commercial', label: 'Commercial', icon: <BusinessIcon /> },
  { value: 'network', label: 'Network Infrastructure', icon: <NetworkIcon /> },
  { value: 'other', label: 'Other', icon: <BuildIcon /> },
];

const PRIORITY_LEVELS = [
  { value: 'high', label: 'High Priority', color: 'error' },
  { value: 'medium', label: 'Medium Priority', color: 'warning' },
  { value: 'low', label: 'Low Priority', color: 'success' },
];

const BUDGET_CATEGORIES = [
  { key: 'equipment', label: 'Equipment', description: 'Cameras, panels, sensors, devices' },
  { key: 'labor', label: 'Labor', description: 'Installation, programming, training' },
  { key: 'materials', label: 'Materials', description: 'Wiring, conduits, mounting hardware' },
  { key: 'subcontractors', label: 'Subcontractors', description: 'Electrical, networking, specialty work' },
  { key: 'travel', label: 'Travel/Misc', description: 'Transportation, lodging, misc costs' },
  { key: 'permits', label: 'Permits', description: 'Building permits, inspections' },
];

const TEAM_ROLES = [
  'Project Manager',
  'Lead Technician', 
  'Systems Engineer',
  'Installation Specialist',
  'Network Technician',
  'Security Specialist',
  'AV Specialist',
];

const MILESTONES = [
  { key: 'survey', label: 'Site Survey', description: 'Initial property assessment' },
  { key: 'design', label: 'Design Approval', description: 'System design and client approval' },
  { key: 'delivery', label: 'Equipment Delivery', description: 'Materials arrive on-site' },
  { key: 'installation', label: 'Installation Start', description: 'Begin physical installation' },
  { key: 'testing', label: 'Testing & Commissioning', description: 'System testing and optimization' },
  { key: 'completion', label: 'Project Completion', description: 'Final inspection and handover' },
];

// Mock customer data
const MOCK_CUSTOMERS = [
  { id: 1, name: 'Johnson Family', company: '', phone: '(555) 123-4567', email: 'johnson@email.com' },
  { id: 2, name: 'Smith Residence', company: '', phone: '(555) 234-5678', email: 'smith@email.com' },
  { id: 3, name: 'Green Valley Estates', company: 'Property Management Co.', phone: '(555) 345-6789', email: 'contact@greenvalley.com' },
];

// Mock team members
const MOCK_TEAM = [
  { id: 1, name: 'John Smith', role: 'Project Manager', avatar: 'JS', available: true },
  { id: 2, name: 'Maria Garcia', role: 'Lead Technician', avatar: 'MG', available: true },
  { id: 3, name: 'David Chen', role: 'Systems Engineer', avatar: 'DC', available: false },
  { id: 4, name: 'Sarah Wilson', role: 'Installation Specialist', avatar: 'SW', available: true },
  { id: 5, name: 'Mike Johnson', role: 'Network Technician', avatar: 'MJ', available: true },
];

interface NewProjectWizardProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (projectData: any) => void;
}

export default function NewProjectWizard({ open, onClose, onSubmit }: NewProjectWizardProps) {
  const [activeStep, setActiveStep] = useState(0);
  const [projectData, setProjectData] = useState({
    // Step 1: Project Basics
    name: '',
    type: '',
    description: '',
    priority: 'medium',
    startDate: '',
    endDate: '',
    
    // Step 2: Customer Information
    customerId: null as number | null,
    newCustomer: {
      name: '',
      company: '',
      phone: '',
      email: '',
      address: '',
      communicationPrefs: [] as string[],
      vipStatus: false,
    },
    propertyDetails: {
      address: '',
      squareFootage: '',
      propertyType: '',
    },
    
    // Step 3: Financial Planning
    contractAmount: '',
    paymentSchedule: {
      deposit: 25,
      progress: 50,
      final: 25,
    },
    budget: {
      equipment: '',
      labor: '',
      materials: '',
      subcontractors: '',
      travel: '',
      permits: '',
    },
    targetMargin: 35,
    contingencyFund: 10,
    
    // Step 4: Team & Resources
    projectManager: '',
    teamMembers: [] as number[],
    requiredSkills: [] as string[],
    subcontractors: [] as string[],
    specialRequirements: '',
    
    // Step 5: Project Planning
    milestones: MILESTONES.map(m => ({ ...m, date: '', completed: false })),
    dependencies: '',
    riskAssessment: '',
    clientExpectations: '',
    
    // Step 6: Documentation & Setup
    contractUploaded: false,
    designDocuments: false,
    permitsRequired: [] as string[],
    insuranceRequirements: '',
    specialInstructions: '',
  });

  const steps = [
    'Project Basics',
    'Customer Info',
    'Financial Planning',
    'Team & Resources',
    'Project Planning',
    'Documentation'
  ];

  // Calculate total budget
  const totalBudget = Object.values(projectData.budget).reduce((sum, value) => 
    sum + (parseFloat(value as string) || 0), 0
  );

  // Calculate profit margin
  const contractAmount = parseFloat(projectData.contractAmount) || 0;
  const expectedProfit = contractAmount - totalBudget;
  const actualMargin = contractAmount > 0 ? (expectedProfit / contractAmount) * 100 : 0;

  const handleNext = () => {
    if (activeStep < steps.length - 1) {
      setActiveStep(activeStep + 1);
    }
  };

  const handleBack = () => {
    if (activeStep > 0) {
      setActiveStep(activeStep - 1);
    }
  };

  const handleSubmit = () => {
    // Generate project ID and finalize data
    const finalProjectData = {
      ...projectData,
      id: Date.now(), // Simple ID generation
      createdDate: new Date().toISOString(),
      status: 'Planning',
      progress: 0,
    };
    
    onSubmit(finalProjectData);
    handleReset();
  };

  const handleReset = () => {
    setActiveStep(0);
    setProjectData({
      name: '',
      type: '',
      description: '',
      priority: 'medium',
      startDate: '',
      endDate: '',
      customerId: null as number | null,
      newCustomer: {
        name: '',
        company: '',
        phone: '',
        email: '',
        address: '',
        communicationPrefs: [] as string[],
        vipStatus: false,
      },
      propertyDetails: {
        address: '',
        squareFootage: '',
        propertyType: '',
      },
      contractAmount: '',
      paymentSchedule: { deposit: 25, progress: 50, final: 25 },
      budget: {
        equipment: '',
        labor: '',
        materials: '',
        subcontractors: '',
        travel: '',
        permits: '',
      },
      targetMargin: 35,
      contingencyFund: 10,
      projectManager: '',
      teamMembers: [] as number[],
      requiredSkills: [] as string[],
      subcontractors: [] as string[],
      specialRequirements: '',
      milestones: MILESTONES.map(m => ({ ...m, date: '', completed: false })),
      dependencies: '',
      riskAssessment: '',
      clientExpectations: '',
      contractUploaded: false,
      designDocuments: false,
      permitsRequired: [] as string[],
      insuranceRequirements: '',
      specialInstructions: '',
    });
  };

  const isStepValid = (step: number): boolean => {
    switch (step) {
      case 0:
        return !!(projectData.name && projectData.type && projectData.description && 
                 projectData.startDate && projectData.endDate);
      case 1:
        return !!(projectData.customerId || 
                 (projectData.newCustomer.name && projectData.newCustomer.email));
      case 2:
        return !!(projectData.contractAmount && totalBudget > 0);
      case 3:
        return !!(projectData.projectManager && projectData.teamMembers.length > 0);
      case 4:
        return projectData.milestones.filter(m => m.date).length >= 3;
      case 5:
        return true; // Documentation step is optional
      default:
        return false;
    }
  };

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Basic Project Information
              </Typography>
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Project Name"
                value={projectData.name}
                onChange={(e) => setProjectData({...projectData, name: e.target.value})}
                placeholder="e.g., Johnson Family Smart Home Installation"
                required
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth required>
                <InputLabel>Project Type</InputLabel>
                <Select
                  value={projectData.type}
                  label="Project Type"
                  onChange={(e) => setProjectData({...projectData, type: e.target.value})}
                >
                  {PROJECT_TYPES.map(type => (
                    <MenuItem key={type.value} value={type.value}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {type.icon}
                        {type.label}
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Priority Level</InputLabel>
                <Select
                  value={projectData.priority}
                  label="Priority Level"
                  onChange={(e) => setProjectData({...projectData, priority: e.target.value})}
                >
                  {PRIORITY_LEVELS.map(priority => (
                    <MenuItem key={priority.value} value={priority.value}>
                      <Chip 
                        label={priority.label} 
                        size="small" 
                        color={priority.color as any}
                      />
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Project Description"
                value={projectData.description}
                onChange={(e) => setProjectData({...projectData, description: e.target.value})}
                multiline
                rows={3}
                placeholder="Detailed scope of work, systems to be installed, special requirements..."
                required
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Expected Start Date"
                type="date"
                value={projectData.startDate}
                onChange={(e) => setProjectData({...projectData, startDate: e.target.value})}
                InputLabelProps={{ shrink: true }}
                required
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Estimated Completion Date"
                type="date"
                value={projectData.endDate}
                onChange={(e) => setProjectData({...projectData, endDate: e.target.value})}
                InputLabelProps={{ shrink: true }}
                required
              />
            </Grid>

            {projectData.startDate && projectData.endDate && (
              <Grid item xs={12}>
                <Alert severity="info">
                  Project duration: {Math.ceil((new Date(projectData.endDate).getTime() - new Date(projectData.startDate).getTime()) / (1000 * 60 * 60 * 24))} days
                </Alert>
              </Grid>
            )}
          </Grid>
        );

      case 1:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Customer Information
              </Typography>
            </Grid>

            <Grid item xs={12}>
              <FormControl fullWidth>
                <Autocomplete
                  options={MOCK_CUSTOMERS}
                  getOptionLabel={(customer) => `${customer.name}${customer.company ? ` (${customer.company})` : ''}`}
                  value={MOCK_CUSTOMERS.find(c => c.id === projectData.customerId) || null}
                  onChange={(_, customer) => setProjectData({...projectData, customerId: customer?.id || null})}
                  renderInput={(params) => (
                    <TextField {...params} label="Select Existing Customer" />
                  )}
                />
              </FormControl>
            </Grid>

            {!projectData.customerId && (
              <>
                <Grid item xs={12}>
                  <Divider>
                    <Typography variant="body2" color="text.secondary">
                      Or Create New Customer
                    </Typography>
                  </Divider>
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Customer Name"
                    value={projectData.newCustomer.name}
                    onChange={(e) => setProjectData({
                      ...projectData,
                      newCustomer: {...projectData.newCustomer, name: e.target.value}
                    })}
                    required={!projectData.customerId}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Company (Optional)"
                    value={projectData.newCustomer.company}
                    onChange={(e) => setProjectData({
                      ...projectData,
                      newCustomer: {...projectData.newCustomer, company: e.target.value}
                    })}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Phone Number"
                    value={projectData.newCustomer.phone}
                    onChange={(e) => setProjectData({
                      ...projectData,
                      newCustomer: {...projectData.newCustomer, phone: e.target.value}
                    })}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Email Address"
                    type="email"
                    value={projectData.newCustomer.email}
                    onChange={(e) => setProjectData({
                      ...projectData,
                      newCustomer: {...projectData.newCustomer, email: e.target.value}
                    })}
                    required={!projectData.customerId}
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Customer Address"
                    value={projectData.newCustomer.address}
                    onChange={(e) => setProjectData({
                      ...projectData,
                      newCustomer: {...projectData.newCustomer, address: e.target.value}
                    })}
                  />
                </Grid>

                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={projectData.newCustomer.vipStatus}
                        onChange={(e) => setProjectData({
                          ...projectData,
                          newCustomer: {...projectData.newCustomer, vipStatus: e.target.checked}
                        })}
                      />
                    }
                    label="VIP Customer"
                  />
                </Grid>
              </>
            )}

            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                Property Details
              </Typography>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Property Address"
                value={projectData.propertyDetails.address}
                onChange={(e) => setProjectData({
                  ...projectData,
                  propertyDetails: {...projectData.propertyDetails, address: e.target.value}
                })}
                placeholder="Installation site address (if different from customer address)"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Square Footage"
                type="number"
                value={projectData.propertyDetails.squareFootage}
                onChange={(e) => setProjectData({
                  ...projectData,
                  propertyDetails: {...projectData.propertyDetails, squareFootage: e.target.value}
                })}
                InputProps={{
                  endAdornment: <InputAdornment position="end">sq ft</InputAdornment>,
                }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Property Type</InputLabel>
                <Select
                  value={projectData.propertyDetails.propertyType}
                  label="Property Type"
                  onChange={(e) => setProjectData({
                    ...projectData,
                    propertyDetails: {...projectData.propertyDetails, propertyType: e.target.value}
                  })}
                >
                  <MenuItem value="single_family">Single Family Home</MenuItem>
                  <MenuItem value="townhouse">Townhouse</MenuItem>
                  <MenuItem value="condo">Condominium</MenuItem>
                  <MenuItem value="apartment">Apartment Complex</MenuItem>
                  <MenuItem value="commercial">Commercial Building</MenuItem>
                  <MenuItem value="office">Office Space</MenuItem>
                  <MenuItem value="retail">Retail Space</MenuItem>
                  <MenuItem value="other">Other</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        );

      case 2:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Financial Planning
              </Typography>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Contract Amount"
                type="number"
                value={projectData.contractAmount}
                onChange={(e) => setProjectData({...projectData, contractAmount: e.target.value})}
                InputProps={{
                  startAdornment: <InputAdornment position="start">$</InputAdornment>,
                }}
                required
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Profit Margin
                  </Typography>
                  <Typography variant="h5" color={actualMargin >= projectData.targetMargin ? 'success.main' : 'warning.main'}>
                    {actualMargin.toFixed(1)}%
                  </Typography>
                  <Typography variant="caption">
                    Target: {projectData.targetMargin}%
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                Budget Breakdown
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Allocate your project budget by category
              </Typography>
            </Grid>

            {BUDGET_CATEGORIES.map((category) => (
              <Grid item xs={12} md={6} key={category.key}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="subtitle1" gutterBottom>
                      {category.label}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      {category.description}
                    </Typography>
                    <TextField
                      fullWidth
                      type="number"
                      value={projectData.budget[category.key as keyof typeof projectData.budget]}
                      onChange={(e) => setProjectData({
                        ...projectData,
                        budget: {
                          ...projectData.budget,
                          [category.key]: e.target.value
                        }
                      })}
                      InputProps={{
                        startAdornment: <InputAdornment position="start">$</InputAdornment>,
                      }}
                      size="small"
                    />
                  </CardContent>
                </Card>
              </Grid>
            ))}

            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        Total Budget
                      </Typography>
                      <Typography variant="h6">
                        ${totalBudget.toLocaleString()}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        Expected Profit
                      </Typography>
                      <Typography variant="h6" color="success.main">
                        ${expectedProfit.toLocaleString()}
                      </Typography>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                Target Profit Margin: {projectData.targetMargin}%
              </Typography>
              <Slider
                value={projectData.targetMargin}
                onChange={(_, value) => setProjectData({...projectData, targetMargin: value as number})}
                min={10}
                max={60}
                marks={[
                  { value: 10, label: '10%' },
                  { value: 25, label: '25%' },
                  { value: 35, label: '35%' },
                  { value: 50, label: '50%' },
                ]}
                valueLabelDisplay="auto"
              />
            </Grid>
          </Grid>
        );

      case 3:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Team & Resources
              </Typography>
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth required>
                <InputLabel>Project Manager</InputLabel>
                <Select
                  value={projectData.projectManager}
                  label="Project Manager"
                  onChange={(e) => setProjectData({...projectData, projectManager: e.target.value})}
                >
                  {MOCK_TEAM.filter(member => member.role === 'Project Manager').map(member => (
                    <MenuItem key={member.id} value={member.id}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Avatar sx={{ width: 24, height: 24, fontSize: 12 }}>
                          {member.avatar}
                        </Avatar>
                        {member.name}
                        {!member.available && (
                          <Chip label="Busy" size="small" color="warning" />
                        )}
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                Team Members
              </Typography>
              <Paper variant="outlined" sx={{ p: 2 }}>
                {MOCK_TEAM.filter(member => member.role !== 'Project Manager').map(member => (
                  <Box key={member.id} sx={{ display: 'flex', alignItems: 'center', py: 1 }}>
                    <Checkbox
                      checked={projectData.teamMembers.includes(member.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setProjectData({
                            ...projectData,
                            teamMembers: [...projectData.teamMembers, member.id]
                          });
                        } else {
                          setProjectData({
                            ...projectData,
                            teamMembers: projectData.teamMembers.filter(id => id !== member.id)
                          });
                        }
                      }}
                    />
                    <Avatar sx={{ width: 32, height: 32, mx: 1 }}>
                      {member.avatar}
                    </Avatar>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="body2">{member.name}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {member.role}
                      </Typography>
                    </Box>
                    {!member.available && (
                      <Chip label="Busy" size="small" color="warning" />
                    )}
                  </Box>
                ))}
              </Paper>
            </Grid>

            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                Required Skills & Certifications
              </Typography>
              <Autocomplete
                multiple
                options={['Control4 Certified', 'Lutron Certified', 'Crestron Certified', 'Network+', 'Low Voltage License', 'OSHA Certified']}
                value={projectData.requiredSkills}
                onChange={(_, skills) => setProjectData({...projectData, requiredSkills: skills})}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => (
                    <Chip variant="outlined" label={option} {...getTagProps({ index })} />
                  ))
                }
                renderInput={(params) => (
                  <TextField {...params} placeholder="Select required certifications..." />
                )}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Special Requirements"
                value={projectData.specialRequirements}
                onChange={(e) => setProjectData({...projectData, specialRequirements: e.target.value})}
                multiline
                rows={3}
                placeholder="Access requirements, scheduling constraints, special equipment needs..."
              />
            </Grid>
          </Grid>
        );

      case 4:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Project Planning
              </Typography>
            </Grid>

            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                Project Milestones
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Set target dates for key project checkpoints
              </Typography>
            </Grid>

            {projectData.milestones.map((milestone, index) => (
              <Grid item xs={12} md={6} key={milestone.key}>
                <Card variant="outlined">
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <CheckIcon color={milestone.date ? 'success' : 'disabled'} />
                      <Typography variant="subtitle2">
                        {milestone.label}
                      </Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      {milestone.description}
                    </Typography>
                    <TextField
                      fullWidth
                      type="date"
                      value={milestone.date}
                      onChange={(e) => {
                        const updatedMilestones = [...projectData.milestones];
                        updatedMilestones[index].date = e.target.value;
                        setProjectData({...projectData, milestones: updatedMilestones});
                      }}
                      InputLabelProps={{ shrink: true }}
                      size="small"
                    />
                  </CardContent>
                </Card>
              </Grid>
            ))}

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Dependencies"
                value={projectData.dependencies}
                onChange={(e) => setProjectData({...projectData, dependencies: e.target.value})}
                multiline
                rows={2}
                placeholder="What needs to happen first? External dependencies, prerequisites..."
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Risk Assessment"
                value={projectData.riskAssessment}
                onChange={(e) => setProjectData({...projectData, riskAssessment: e.target.value})}
                multiline
                rows={2}
                placeholder="Potential challenges, weather concerns, access issues, technical risks..."
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Client Expectations"
                value={projectData.clientExpectations}
                onChange={(e) => setProjectData({...projectData, clientExpectations: e.target.value})}
                multiline
                rows={2}
                placeholder="Communication preferences, special requests, quality expectations..."
              />
            </Grid>
          </Grid>
        );

      case 5:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Documentation & Setup
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Optional documentation and project setup requirements
              </Typography>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="subtitle1" gutterBottom>
                    Contract Documentation
                  </Typography>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={projectData.contractUploaded}
                        onChange={(e) => setProjectData({...projectData, contractUploaded: e.target.checked})}
                      />
                    }
                    label="Signed contract uploaded"
                  />
                  <Box sx={{ mt: 1 }}>
                    <Button
                      variant="outlined"
                      startIcon={<FileUploadIcon />}
                      size="small"
                      fullWidth
                    >
                      Upload Contract
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="subtitle1" gutterBottom>
                    Design Documents
                  </Typography>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={projectData.designDocuments}
                        onChange={(e) => setProjectData({...projectData, designDocuments: e.target.checked})}
                      />
                    }
                    label="Design plans available"
                  />
                  <Box sx={{ mt: 1 }}>
                    <Button
                      variant="outlined"
                      startIcon={<FileUploadIcon />}
                      size="small"
                      fullWidth
                    >
                      Upload Plans
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                Permits Required
              </Typography>
              <Autocomplete
                multiple
                options={['Building Permit', 'Electrical Permit', 'Fire Safety Permit', 'Alarm Permit', 'Low Voltage Permit']}
                value={projectData.permitsRequired}
                onChange={(_, permits) => setProjectData({...projectData, permitsRequired: permits})}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => (
                    <Chip variant="outlined" label={option} {...getTagProps({ index })} />
                  ))
                }
                renderInput={(params) => (
                  <TextField {...params} placeholder="Select required permits..." />
                )}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Insurance Requirements"
                value={projectData.insuranceRequirements}
                onChange={(e) => setProjectData({...projectData, insuranceRequirements: e.target.value})}
                multiline
                rows={2}
                placeholder="Liability requirements, bonding needs, certificate of insurance..."
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Special Instructions"
                value={projectData.specialInstructions}
                onChange={(e) => setProjectData({...projectData, specialInstructions: e.target.value})}
                multiline
                rows={3}
                placeholder="Access codes, security info, pet information, scheduling notes..."
              />
            </Grid>

            <Grid item xs={12}>
              <Alert severity="success">
                <Typography variant="body2">
                  Ready to create project! Review the summary below and click "Create Project" to finalize.
                </Typography>
              </Alert>
            </Grid>

            {/* Project Summary */}
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Project Summary
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">Project Name</Typography>
                      <Typography variant="body1">{projectData.name}</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">Contract Value</Typography>
                      <Typography variant="body1">${parseFloat(projectData.contractAmount || '0').toLocaleString()}</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">Expected Profit</Typography>
                      <Typography variant="body1" color="success.main">${expectedProfit.toLocaleString()}</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">Profit Margin</Typography>
                      <Typography variant="body1" color="success.main">{actualMargin.toFixed(1)}%</Typography>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: { height: '90vh' }
      }}
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h5">Create New Project</Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Step {activeStep + 1} of {steps.length}
            </Typography>
            <LinearProgress 
              variant="determinate" 
              value={((activeStep + 1) / steps.length) * 100} 
              sx={{ width: 100, height: 6, borderRadius: 3 }}
            />
          </Box>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ px: 3 }}>
        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label, index) => (
            <Step key={label}>
              <StepLabel 
                error={index < activeStep && !isStepValid(index)}
              >
                {label}
              </StepLabel>
            </Step>
          ))}
        </Stepper>

        <Box sx={{ minHeight: 400 }}>
          {renderStepContent(activeStep)}
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button 
          onClick={onClose}
          color="inherit"
        >
          Cancel
        </Button>
        
        <Box sx={{ flex: 1 }} />
        
        <Button
          onClick={handleBack}
          disabled={activeStep === 0}
          sx={{ mr: 1 }}
        >
          Back
        </Button>
        
        {activeStep === steps.length - 1 ? (
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={!isStepValid(activeStep)}
            startIcon={<CheckIcon />}
          >
            Create Project
          </Button>
        ) : (
          <Button
            onClick={handleNext}
            variant="contained"
            disabled={!isStepValid(activeStep)}
          >
            Next
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
} 