import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Divider,
  Chip,
  LinearProgress,
  IconButton,
  Stepper,
  Step,
  StepLabel,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Avatar,
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  AttachMoney as MoneyIcon,
  Person as PersonIcon,
  Assignment as ProjectIcon,
  Star as StarIcon,
  Close as CloseIcon,
  Warning as WarningIcon,
  TrendingUp as TrendingUpIcon,
} from '@mui/icons-material';
import { Project } from '../utils/dataStorage';

interface ProjectCompletionModalProps {
  open: boolean;
  project: Project | null;
  onClose: () => void;
  onComplete: (projectId: string, completionData: any) => void;
}

const ProjectCompletionModal: React.FC<ProjectCompletionModalProps> = ({
  open,
  project,
  onClose,
  onComplete
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [completionData, setCompletionData] = useState({
    finalCosts: '',
    actualEndDate: new Date().toISOString().split('T')[0],
    clientSatisfaction: 9,
    projectNotes: '',
    lessonLearned: '',
    followUpRequired: false,
    followUpNotes: '',
    warrantyPeriod: '12',
    maintenanceSchedule: 'quarterly',
    testimonialRequested: true,
    referralPotential: 'high',
  });

  const steps = ['Project Review', 'Financial Summary', 'Client Handover', 'Complete'];

  if (!project) return null;

  const handleInputChange = (field: string, value: any) => {
    setCompletionData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const calculateFinalProfit = () => {
    const budgetAmount = parseFloat(project.budget.replace(/[$,]/g, '')) || 0;
    const finalCosts = parseFloat(completionData.finalCosts) || parseFloat(project.spent.replace(/[$,]/g, '')) || 0;
    const contractAmount = project.projectData?.contractAmount || budgetAmount;
    
    return {
      revenue: contractAmount,
      costs: finalCosts,
      profit: contractAmount - finalCosts,
      margin: ((contractAmount - finalCosts) / contractAmount) * 100
    };
  };

  const financials = calculateFinalProfit();

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    const finalData = {
      ...completionData,
      finalCosts: completionData.finalCosts || project.spent,
      finalRevenue: financials.revenue,
      finalProfit: financials.profit,
      finalMargin: financials.margin,
      completedBy: 'Current User', // In real app, get from auth
      completionMethod: 'manual'
    };

    onComplete(project.id, finalData);
    onClose();
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0: // Project Review
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Project Summary
            </Typography>
            
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" color="text.secondary">Project Name</Typography>
                    <Typography variant="body1" fontWeight="bold">{project.name}</Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" color="text.secondary">Customer</Typography>
                    <Typography variant="body1">{project.customer}</Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" color="text.secondary">Project Type</Typography>
                    <Chip label={project.type.replace('_', ' ').toUpperCase()} size="small" />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" color="text.secondary">Priority</Typography>
                    <Chip 
                      label={`${project.priority} Priority`} 
                      size="small" 
                      color={project.priority === 'High' ? 'error' : project.priority === 'Medium' ? 'warning' : 'success'}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="text.secondary">Description</Typography>
                    <Typography variant="body2">{project.description}</Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            <Typography variant="h6" gutterBottom>
              Project Tasks Status
            </Typography>
            
            <Card>
              <CardContent>
                <List dense>
                  {project.tasks.map((task, index) => (
                    <ListItem key={index}>
                      <ListItemIcon>
                        <CheckCircleIcon color="success" />
                      </ListItemIcon>
                      <ListItemText 
                        primary={task.name}
                        secondary={`Status: ${task.status}`}
                      />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>

            <TextField
              fullWidth
              multiline
              rows={3}
              label="Project Completion Notes"
              value={completionData.projectNotes}
              onChange={(e) => handleInputChange('projectNotes', e.target.value)}
              sx={{ mt: 3 }}
              placeholder="Any final notes about the project completion..."
            />
          </Box>
        );

      case 1: // Financial Summary
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Financial Summary
            </Typography>

            <Grid container spacing={3} sx={{ mb: 3 }}>
              <Grid item xs={12} md={4}>
                <Card>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <MoneyIcon sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
                    <Typography variant="h4" color="primary">
                      ${financials.revenue.toLocaleString()}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total Revenue
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={4}>
                <Card>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <TrendingUpIcon sx={{ fontSize: 40, color: 'warning.main', mb: 1 }} />
                    <Typography variant="h4" color="warning.main">
                      ${financials.costs.toLocaleString()}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total Costs
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={4}>
                <Card>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <StarIcon sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
                    <Typography variant="h4" color="success.main">
                      ${financials.profit.toLocaleString()}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Net Profit ({financials.margin.toFixed(1)}%)
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="subtitle1" gutterBottom>
                  Profit Margin Analysis
                </Typography>
                <Box sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">Profit Margin</Typography>
                    <Typography variant="body2" color="primary">
                      {financials.margin.toFixed(1)}%
                    </Typography>
                  </Box>
                  <LinearProgress 
                    variant="determinate" 
                    value={Math.min(financials.margin, 100)} 
                    sx={{ height: 8, borderRadius: 4 }}
                    color={financials.margin >= 30 ? 'success' : financials.margin >= 20 ? 'warning' : 'error'}
                  />
                </Box>
                
                {financials.margin >= 30 && (
                  <Alert severity="success" sx={{ mt: 2 }}>
                    Excellent profit margin! This project exceeded expectations.
                  </Alert>
                )}
                {financials.margin >= 20 && financials.margin < 30 && (
                  <Alert severity="info" sx={{ mt: 2 }}>
                    Good profit margin achieved for this project.
                  </Alert>
                )}
                {financials.margin < 20 && (
                  <Alert severity="warning" sx={{ mt: 2 }}>
                    Lower than expected profit margin. Consider reviewing cost structure for future projects.
                  </Alert>
                )}
              </CardContent>
            </Card>

            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Final Project Costs"
                  value={completionData.finalCosts}
                  onChange={(e) => handleInputChange('finalCosts', e.target.value)}
                  placeholder={`Current: ${project.spent}`}
                  helperText="Update if different from tracked expenses"
                  InputProps={{
                    startAdornment: '$'
                  }}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  type="date"
                  label="Actual End Date"
                  value={completionData.actualEndDate}
                  onChange={(e) => handleInputChange('actualEndDate', e.target.value)}
                  InputLabelProps={{
                    shrink: true,
                  }}
                />
              </Grid>
            </Grid>

            <TextField
              fullWidth
              multiline
              rows={3}
              label="Lessons Learned"
              value={completionData.lessonLearned}
              onChange={(e) => handleInputChange('lessonLearned', e.target.value)}
              sx={{ mt: 2 }}
              placeholder="What did we learn from this project? Areas for improvement..."
            />
          </Box>
        );

      case 2: // Client Handover
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Client Handover & Satisfaction
            </Typography>

            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="subtitle1" gutterBottom>
                  Client Satisfaction Rating
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  <Typography variant="body2">Rating:</Typography>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((rating) => (
                      <IconButton
                        key={rating}
                        size="small"
                        onClick={() => handleInputChange('clientSatisfaction', rating)}
                        sx={{
                          color: rating <= completionData.clientSatisfaction ? 'gold' : 'grey.300',
                          p: 0.5
                        }}
                      >
                        <StarIcon fontSize="small" />
                      </IconButton>
                    ))}
                  </Box>
                  <Typography variant="h6" color="primary">
                    {completionData.clientSatisfaction}/10
                  </Typography>
                </Box>
                
                {completionData.clientSatisfaction >= 9 && (
                  <Alert severity="success">
                    Excellent satisfaction! Consider requesting a testimonial.
                  </Alert>
                )}
                {completionData.clientSatisfaction >= 7 && completionData.clientSatisfaction < 9 && (
                  <Alert severity="info">
                    Good satisfaction level. Follow up to ensure continued satisfaction.
                  </Alert>
                )}
                {completionData.clientSatisfaction < 7 && (
                  <Alert severity="warning">
                    Lower satisfaction detected. Schedule follow-up to address concerns.
                  </Alert>
                )}
              </CardContent>
            </Card>

            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Warranty Period</InputLabel>
                  <Select
                    value={completionData.warrantyPeriod}
                    label="Warranty Period"
                    onChange={(e) => handleInputChange('warrantyPeriod', e.target.value)}
                  >
                    <MenuItem value="6">6 Months</MenuItem>
                    <MenuItem value="12">1 Year</MenuItem>
                    <MenuItem value="24">2 Years</MenuItem>
                    <MenuItem value="36">3 Years</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Maintenance Schedule</InputLabel>
                  <Select
                    value={completionData.maintenanceSchedule}
                    label="Maintenance Schedule"
                    onChange={(e) => handleInputChange('maintenanceSchedule', e.target.value)}
                  >
                    <MenuItem value="monthly">Monthly</MenuItem>
                    <MenuItem value="quarterly">Quarterly</MenuItem>
                    <MenuItem value="biannual">Bi-Annual</MenuItem>
                    <MenuItem value="annual">Annual</MenuItem>
                    <MenuItem value="as_needed">As Needed</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>

            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Referral Potential</InputLabel>
                  <Select
                    value={completionData.referralPotential}
                    label="Referral Potential"
                    onChange={(e) => handleInputChange('referralPotential', e.target.value)}
                  >
                    <MenuItem value="high">High - Likely to refer</MenuItem>
                    <MenuItem value="medium">Medium - Possible referrals</MenuItem>
                    <MenuItem value="low">Low - Unlikely to refer</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>

            <Typography variant="subtitle1" gutterBottom sx={{ mt: 3 }}>
              Follow-up Actions
            </Typography>
            
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  <Button
                    variant={completionData.followUpRequired ? "contained" : "outlined"}
                    onClick={() => handleInputChange('followUpRequired', !completionData.followUpRequired)}
                  >
                    {completionData.followUpRequired ? 'Follow-up Scheduled' : 'No Follow-up Needed'}
                  </Button>
                  
                  <Button
                    variant={completionData.testimonialRequested ? "contained" : "outlined"}
                    onClick={() => handleInputChange('testimonialRequested', !completionData.testimonialRequested)}
                  >
                    {completionData.testimonialRequested ? 'Testimonial Requested' : 'No Testimonial'}
                  </Button>
                </Box>
                
                {completionData.followUpRequired && (
                  <TextField
                    fullWidth
                    multiline
                    rows={2}
                    label="Follow-up Notes"
                    value={completionData.followUpNotes}
                    onChange={(e) => handleInputChange('followUpNotes', e.target.value)}
                    placeholder="What follow-up actions are needed?"
                  />
                )}
              </CardContent>
            </Card>
          </Box>
        );

      case 3: // Complete
        return (
          <Box sx={{ textAlign: 'center' }}>
            <CheckCircleIcon sx={{ fontSize: 80, color: 'success.main', mb: 2 }} />
            
            <Typography variant="h5" gutterBottom>
              Ready to Complete Project
            </Typography>
            
            <Typography variant="body1" color="text.secondary" paragraph>
              This project will be marked as completed and the customer will be added to your customer database.
            </Typography>

            <Card sx={{ mb: 3, textAlign: 'left' }}>
              <CardContent>
                <Typography variant="subtitle1" gutterBottom>
                  Completion Summary:
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">Final Revenue:</Typography>
                    <Typography variant="body1" fontWeight="bold">${financials.revenue.toLocaleString()}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">Net Profit:</Typography>
                    <Typography variant="body1" fontWeight="bold" color="success.main">
                      ${financials.profit.toLocaleString()} ({financials.margin.toFixed(1)}%)
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">Client Satisfaction:</Typography>
                    <Typography variant="body1" fontWeight="bold">{completionData.clientSatisfaction}/10</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">Warranty Period:</Typography>
                    <Typography variant="body1" fontWeight="bold">{completionData.warrantyPeriod} months</Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            <Alert severity="info">
              Completing this project will:
              <br />• Move the project to "Completed" status
              <br />• Add the customer to your customer database
              <br />• Update financial analytics and reporting
              <br />• Set up warranty and maintenance schedules
            </Alert>
          </Box>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="md" 
      fullWidth
      PaperProps={{
        sx: { minHeight: '70vh' }
      }}
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <ProjectIcon />
            <Typography variant="h6">Complete Project</Typography>
          </Box>
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        <Stepper activeStep={currentStep} alternativeLabel sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {renderStepContent()}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        {currentStep > 0 && (
          <Button onClick={handleBack}>Back</Button>
        )}
        {currentStep < steps.length - 1 ? (
          <Button variant="contained" onClick={handleNext}>
            Next
          </Button>
        ) : (
          <Button 
            variant="contained" 
            onClick={handleComplete}
            color="success"
            startIcon={<CheckCircleIcon />}
          >
            Complete Project
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default ProjectCompletionModal; 