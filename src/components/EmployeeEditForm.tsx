import React, { useState, useEffect } from 'react';
import {
  Box,
  Tabs,
  Tab,
  TextField,
  Button,
  Grid,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Avatar,
  IconButton,
  Switch,
  FormControlLabel,
  Divider,
  Alert,
  Autocomplete,
  Stepper,
  Step,
  StepLabel,
  Card,
  CardContent,
  InputAdornment,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Upload as UploadIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
} from '@mui/icons-material';
import { Employee } from '../utils/employeeStorage';
import {
  formatDate,
  formatTime,
  formatTimeRange,
  formatDateForInput,
  formatTimeForInput,
} from '../utils/dateTimeFormatters';

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
      id={`edit-tabpanel-${index}`}
      aria-labelledby={`edit-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

interface EmployeeEditFormProps {
  employee: Employee;
  onSave: (employee: Employee) => void;
  onCancel: () => void;
}

const DEPARTMENT_OPTIONS = [
  'Installation',
  'Sales', 
  'Service',
  'Management',
  'Admin'
];

const STATUS_OPTIONS = [
  'Active',
  'Inactive',
  'On Leave',
  'Terminated'
];

const EMPLOYMENT_TYPE_OPTIONS = [
  'Full-time',
  'Part-time',
  'Contract',
  'Intern'
];

const SKILL_LEVEL_OPTIONS = [
  'Entry Level',
  'Intermediate', 
  'Advanced',
  'Expert'
];

const PAY_TYPE_OPTIONS = [
  'Hourly',
  'Salary',
  'Commission'
];

const AVAILABLE_SPECIALTIES = [
  'Control4',
  'Lutron',
  'Sonos',
  'Network Setup',
  'Security Systems',
  'Audio Systems',
  'Video Systems',
  'Smart Lighting',
  'HVAC Integration',
  'Home Theater',
  'Automation Programming',
  'Troubleshooting'
];

const AVAILABLE_CERTIFICATIONS = [
  'Control4 Certified',
  'Lutron Certified',
  'Sonos Professional',
  'Network+ Certified',
  'Security+ Certified',
  'Low Voltage License',
  'Electrical License',
  'AVIXA CTS',
  'Custom Electronics Certified'
];

export default function EmployeeEditForm({ employee, onSave, onCancel }: EmployeeEditFormProps) {
  const [tabValue, setTabValue] = useState(0);
  const [formData, setFormData] = useState<Employee>(employee);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isValid, setIsValid] = useState(true);

  // Form validation
  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Personal Info validation
    if (!formData.personalInfo.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }
    if (!formData.personalInfo.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }
    if (!formData.personalInfo.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.personalInfo.email)) {
      newErrors.email = 'Email is invalid';
    }
    if (!formData.personalInfo.phone.trim()) {
      newErrors.phone = 'Phone is required';
    }

    // Employment validation
    if (!formData.employment.title.trim()) {
      newErrors.title = 'Job title is required';
    }
    if (!formData.employment.department) {
      newErrors.department = 'Department is required';
    }

    // Compensation validation
    if (formData.compensation.payType === 'Hourly' && !formData.compensation.hourlyRate) {
      newErrors.hourlyRate = 'Hourly rate is required';
    }
    if (formData.compensation.payType === 'Salary' && !formData.compensation.salary) {
      newErrors.salary = 'Salary is required';
    }

    setErrors(newErrors);
    const valid = Object.keys(newErrors).length === 0;
    setIsValid(valid);
    return valid;
  };

  const handleSave = () => {
    if (validateForm()) {
      onSave(formData);
    }
  };

  const updateFormData = (path: string, value: any) => {
    const keys = path.split('.');
    const newData = { ...formData };
    let current: any = newData;
    
    for (let i = 0; i < keys.length - 1; i++) {
      current = current[keys[i]];
    }
    current[keys[keys.length - 1]] = value;
    
    setFormData(newData);
  };

  const addSpecialty = (specialty: string) => {
    if (specialty && !formData.skills.specialties.includes(specialty)) {
      updateFormData('skills.specialties', [...formData.skills.specialties, specialty]);
    }
  };

  const removeSpecialty = (index: number) => {
    const newSpecialties = formData.skills.specialties.filter((_, i) => i !== index);
    updateFormData('skills.specialties', newSpecialties);
  };

  const addCertification = (certification: string) => {
    if (certification && !formData.skills.certifications.includes(certification)) {
      updateFormData('skills.certifications', [...formData.skills.certifications, certification]);
    }
  };

  const removeCertification = (index: number) => {
    const newCertifications = formData.skills.certifications.filter((_, i) => i !== index);
    updateFormData('skills.certifications', newCertifications);
  };

  return (
    <Box sx={{ width: '100%', minHeight: 600 }}>
      {/* Form Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
        <Avatar
          src={formData.personalInfo.avatar}
          sx={{ width: 60, height: 60, mr: 2 }}
        >
          {formData.personalInfo.firstName[0]}{formData.personalInfo.lastName[0]}
        </Avatar>
        <Box sx={{ flex: 1 }}>
          <Typography variant="h6">
            {formData.personalInfo.firstName} {formData.personalInfo.lastName}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {formData.employment.title} • {formData.employment.department}
          </Typography>
        </Box>
        <Button
          variant="outlined"
          startIcon={<UploadIcon />}
          size="small"
          onClick={() => {
            // TODO: Implement photo upload
            alert('Photo upload functionality will be added');
          }}
        >
          Change Photo
        </Button>
      </Box>

      {/* Form Tabs */}
      <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)} variant="scrollable" scrollButtons="auto">
        <Tab label="Personal Info" />
        <Tab label="Employment" />
        <Tab label="Skills & Certifications" />
        <Tab label="Compensation" />
        <Tab label="Schedule" />
      </Tabs>

      {/* Personal Information Tab */}
      <TabPanel value={tabValue} index={0}>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="First Name"
              value={formData.personalInfo.firstName}
              onChange={(e) => updateFormData('personalInfo.firstName', e.target.value)}
              error={!!errors.firstName}
              helperText={errors.firstName}
              required
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Last Name"
              value={formData.personalInfo.lastName}
              onChange={(e) => updateFormData('personalInfo.lastName', e.target.value)}
              error={!!errors.lastName}
              helperText={errors.lastName}
              required
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Email"
              type="email"
              value={formData.personalInfo.email}
              onChange={(e) => updateFormData('personalInfo.email', e.target.value)}
              error={!!errors.email}
              helperText={errors.email}
              required
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Phone"
              value={formData.personalInfo.phone}
              onChange={(e) => updateFormData('personalInfo.phone', e.target.value)}
              error={!!errors.phone}
              helperText={errors.phone}
              required
            />
          </Grid>
          {formData.personalInfo.address && (
            <>
              <Grid item xs={12}>
                <Divider sx={{ my: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary">Address</Typography>
                </Divider>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Street Address"
                  value={formData.personalInfo.address.street}
                  onChange={(e) => updateFormData('personalInfo.address.street', e.target.value)}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="City"
                  value={formData.personalInfo.address.city}
                  onChange={(e) => updateFormData('personalInfo.address.city', e.target.value)}
                />
              </Grid>
              <Grid item xs={12} sm={3}>
                <TextField
                  fullWidth
                  label="State"
                  value={formData.personalInfo.address.state}
                  onChange={(e) => updateFormData('personalInfo.address.state', e.target.value)}
                />
              </Grid>
              <Grid item xs={12} sm={3}>
                <TextField
                  fullWidth
                  label="ZIP Code"
                  value={formData.personalInfo.address.zipCode}
                  onChange={(e) => updateFormData('personalInfo.address.zipCode', e.target.value)}
                />
              </Grid>
            </>
          )}
        </Grid>
      </TabPanel>

      {/* Employment Tab */}
      <TabPanel value={tabValue} index={1}>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Job Title"
              value={formData.employment.title}
              onChange={(e) => updateFormData('employment.title', e.target.value)}
              error={!!errors.title}
              helperText={errors.title}
              required
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth error={!!errors.department} required>
              <InputLabel>Department</InputLabel>
              <Select
                value={formData.employment.department}
                label="Department"
                onChange={(e) => updateFormData('employment.department', e.target.value)}
              >
                {DEPARTMENT_OPTIONS.map((dept) => (
                  <MenuItem key={dept} value={dept}>{dept}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Role"
              value={formData.employment.role}
              onChange={(e) => updateFormData('employment.role', e.target.value)}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Employment Status</InputLabel>
              <Select
                value={formData.employment.status}
                label="Employment Status"
                onChange={(e) => updateFormData('employment.status', e.target.value)}
              >
                {STATUS_OPTIONS.map((status) => (
                  <MenuItem key={status} value={status}>{status}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Employment Type</InputLabel>
              <Select
                value={formData.employment.employmentType}
                label="Employment Type"
                onChange={(e) => updateFormData('employment.employmentType', e.target.value)}
              >
                {EMPLOYMENT_TYPE_OPTIONS.map((type) => (
                  <MenuItem key={type} value={type}>{type}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Hire Date"
              type="date"
              value={formatDateForInput(formData.employment.hireDate)}
              onChange={(e) => updateFormData('employment.hireDate', e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
        </Grid>
      </TabPanel>

      {/* Skills & Certifications Tab */}
      <TabPanel value={tabValue} index={2}>
        <Grid container spacing={3}>
          {/* Specialties Section */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>Specialties</Typography>
            <Autocomplete
              options={AVAILABLE_SPECIALTIES}
              value=""
              onChange={(e, value) => value && addSpecialty(value)}
              renderInput={(params) => (
                <TextField 
                  {...params} 
                  label="Add Specialty" 
                  placeholder="Search and select specialties..."
                />
              )}
              sx={{ mb: 2 }}
            />
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {formData.skills.specialties.map((specialty, index) => (
                <Chip
                  key={index}
                  label={specialty}
                  onDelete={() => removeSpecialty(index)}
                  color="primary"
                  variant="outlined"
                />
              ))}
            </Box>
          </Grid>

          {/* Certifications Section */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>Certifications</Typography>
            <Autocomplete
              options={AVAILABLE_CERTIFICATIONS}
              value=""
              onChange={(e, value) => value && addCertification(value)}
              renderInput={(params) => (
                <TextField 
                  {...params} 
                  label="Add Certification" 
                  placeholder="Search and select certifications..."
                />
              )}
              sx={{ mb: 2 }}
            />
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {formData.skills.certifications.map((cert, index) => (
                <Chip
                  key={index}
                  label={cert}
                  onDelete={() => removeCertification(index)}
                  color="success"
                  variant="outlined"
                />
              ))}
            </Box>
          </Grid>

          {/* Skill Level & Experience */}
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Skill Level</InputLabel>
              <Select
                value={formData.skills.skillLevel}
                label="Skill Level"
                onChange={(e) => updateFormData('skills.skillLevel', e.target.value)}
              >
                {SKILL_LEVEL_OPTIONS.map((level) => (
                  <MenuItem key={level} value={level}>{level}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Years of Experience"
              type="number"
              value={formData.skills.yearsExperience}
              onChange={(e) => updateFormData('skills.yearsExperience', parseInt(e.target.value) || 0)}
              inputProps={{ min: 0, max: 50 }}
            />
          </Grid>
        </Grid>
      </TabPanel>

      {/* Compensation Tab */}
      <TabPanel value={tabValue} index={3}>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Pay Type</InputLabel>
              <Select
                value={formData.compensation.payType}
                label="Pay Type"
                onChange={(e) => updateFormData('compensation.payType', e.target.value)}
              >
                {PAY_TYPE_OPTIONS.map((type) => (
                  <MenuItem key={type} value={type}>{type}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          {formData.compensation.payType === 'Hourly' && (
            <>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Hourly Rate"
                  type="number"
                  value={formData.compensation.hourlyRate || ''}
                  onChange={(e) => updateFormData('compensation.hourlyRate', parseFloat(e.target.value) || 0)}
                  error={!!errors.hourlyRate}
                  helperText={errors.hourlyRate}
                  InputProps={{
                    startAdornment: <InputAdornment position="start">$</InputAdornment>
                  }}
                  inputProps={{ min: 0, step: 0.01 }}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Overtime Rate"
                  type="number"
                  value={formData.compensation.overtimeRate || ''}
                  onChange={(e) => updateFormData('compensation.overtimeRate', parseFloat(e.target.value) || 0)}
                  InputProps={{
                    startAdornment: <InputAdornment position="start">$</InputAdornment>
                  }}
                  inputProps={{ min: 0, step: 0.01 }}
                />
              </Grid>
            </>
          )}

          {formData.compensation.payType === 'Salary' && (
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Annual Salary"
                type="number"
                value={formData.compensation.salary || ''}
                onChange={(e) => updateFormData('compensation.salary', parseFloat(e.target.value) || 0)}
                error={!!errors.salary}
                helperText={errors.salary}
                InputProps={{
                  startAdornment: <InputAdornment position="start">$</InputAdornment>
                }}
                inputProps={{ min: 0 }}
                required
              />
            </Grid>
          )}
        </Grid>
      </TabPanel>

      {/* Schedule Tab */}
      <TabPanel value={tabValue} index={4}>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <FormControlLabel
              control={
                <Switch
                  checked={formData.availability.availableForTravel}
                  onChange={(e) => updateFormData('availability.availableForTravel', e.target.checked)}
                />
              }
              label="Available for Travel"
            />
          </Grid>
          
          {/* Weekly Schedule */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>Weekly Schedule</Typography>
            <Grid container spacing={2}>
              {Object.entries(formData.availability.schedule).map(([day, schedule]) => (
                <Grid item xs={12} key={day}>
                  <Card variant="outlined">
                    <CardContent sx={{ py: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Typography variant="subtitle2" sx={{ minWidth: 80, textTransform: 'capitalize' }}>
                          {day}
                        </Typography>
                        <FormControlLabel
                          control={
                            <Switch
                              checked={schedule.available}
                              onChange={(e) => updateFormData(`availability.schedule.${day}.available`, e.target.checked)}
                            />
                          }
                          label="Available"
                        />
                        {schedule.available && (
                          <>
                            <TextField
                              label="Start Time"
                              type="time"
                              value={formatTimeForInput(schedule.start)}
                              onChange={(e) => updateFormData(`availability.schedule.${day}.start`, e.target.value)}
                              InputLabelProps={{ shrink: true }}
                              size="small"
                            />
                            <TextField
                              label="End Time"
                              type="time"
                              value={formatTimeForInput(schedule.end)}
                              onChange={(e) => updateFormData(`availability.schedule.${day}.end`, e.target.value)}
                              InputLabelProps={{ shrink: true }}
                              size="small"
                            />
                          </>
                        )}
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Grid>
        </Grid>
      </TabPanel>

      {/* Form Actions */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'flex-end', 
        gap: 2, 
        mt: 4, 
        pt: 3, 
        borderTop: '1px solid',
        borderColor: 'divider'
      }}>
        <Button
          variant="outlined"
          startIcon={<CancelIcon />}
          onClick={onCancel}
          size="large"
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          startIcon={<SaveIcon />}
          onClick={handleSave}
          disabled={!isValid}
          size="large"
        >
          Save Changes
        </Button>
      </Box>

      {/* Validation Alert */}
      {Object.keys(errors).length > 0 && (
        <Alert severity="error" sx={{ mt: 2 }}>
          Please fix the following errors before saving:
          <ul>
            {Object.entries(errors).map(([field, error]) => (
              <li key={field}>{error}</li>
            ))}
          </ul>
        </Alert>
      )}
    </Box>
  );
} 