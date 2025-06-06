import React, { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Stepper,
  Step,
  StepLabel,
  Button,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  FormControlLabel,
  Chip,
  Avatar,
  Breadcrumbs,
  Link,
  Alert,
  Card,
  CardContent,
  Divider,
  InputAdornment,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  PhotoCamera as PhotoCameraIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
} from '@mui/icons-material';
import NextLink from 'next/link';
import { useRouter } from 'next/router';
import {
  Employee,
  generateEmployeeId,
  saveEmployee,
} from '../../utils/employeeStorage';

const steps = [
  'Personal Information',
  'Employment Details',
  'Skills & Certifications',
  'Compensation & Schedule',
  'Review & Confirm'
];

export default function NewEmployeePage() {
  const router = useRouter();
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState<Partial<Employee>>({
    personalInfo: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      address: {
        street: '',
        city: '',
        state: '',
        zipCode: '',
      },
      emergencyContact: {
        name: '',
        relationship: '',
        phone: '',
      }
    },
    employment: {
      employeeId: generateEmployeeId(),
      title: '',
      department: 'Installation',
      role: 'Installer',
      hireDate: new Date().toISOString().split('T')[0],
      employmentType: 'Full Time',
      status: 'Active'
    },
    skills: {
      certifications: [],
      specialties: [],
      skillLevel: 'Entry',
      yearsExperience: 0
    },
    compensation: {
      payType: 'Hourly',
      hourlyRate: 0,
    },
    availability: {
      schedule: {
        monday: { start: '08:00', end: '17:00', available: true },
        tuesday: { start: '08:00', end: '17:00', available: true },
        wednesday: { start: '08:00', end: '17:00', available: true },
        thursday: { start: '08:00', end: '17:00', available: true },
        friday: { start: '08:00', end: '17:00', available: true },
        saturday: { start: '00:00', end: '00:00', available: false },
        sunday: { start: '00:00', end: '00:00', available: false }
      },
      timeOff: [],
      availableForTravel: false
    },
    performance: {
      rating: 5,
      completedProjects: 0,
      customerSatisfaction: 5,
    },
    currentAssignments: {
      activeProjects: [],
      nextAvailable: new Date().toISOString().split('T')[0]
    }
  });

  const [newCertification, setNewCertification] = useState('');
  const [newSpecialty, setNewSpecialty] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleNext = () => {
    if (validateStep(activeStep)) {
      setActiveStep((prevActiveStep) => prevActiveStep + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    switch (step) {
      case 0: // Personal Information
        if (!formData.personalInfo?.firstName) newErrors.firstName = 'First name is required';
        if (!formData.personalInfo?.lastName) newErrors.lastName = 'Last name is required';
        if (!formData.personalInfo?.email) newErrors.email = 'Email is required';
        if (!formData.personalInfo?.phone) newErrors.phone = 'Phone is required';
        break;
      case 1: // Employment Details
        if (!formData.employment?.title) newErrors.title = 'Job title is required';
        break;
      case 3: // Compensation
        if (formData.compensation?.payType === 'Hourly' && !formData.compensation?.hourlyRate) {
          newErrors.hourlyRate = 'Hourly rate is required';
        }
        if (formData.compensation?.payType === 'Salary' && !formData.compensation?.salary) {
          newErrors.salary = 'Salary is required';
        }
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (section: keyof Employee, field: string, value: any) => {
    setFormData(prev => {
      const newData = { ...prev };
      if (!newData[section]) {
        newData[section] = {} as any;
      }
      (newData[section] as any)[field] = value;
      return newData;
    });
  };

  const handleAddCertification = () => {
    if (newCertification.trim()) {
      setFormData(prev => {
        const existingSkills = prev.skills || {
          certifications: [],
          specialties: [],
          skillLevel: 'Entry' as const,
          yearsExperience: 0
        };
        
        return {
          ...prev,
          skills: {
            ...existingSkills,
            certifications: [...existingSkills.certifications, newCertification.trim()]
          }
        };
      });
      setNewCertification('');
    }
  };

  const handleRemoveCertification = (index: number) => {
    setFormData(prev => {
      const existingSkills = prev.skills || {
        certifications: [],
        specialties: [],
        skillLevel: 'Entry' as const,
        yearsExperience: 0
      };
      
      return {
        ...prev,
        skills: {
          ...existingSkills,
          certifications: existingSkills.certifications.filter((_, i) => i !== index)
        }
      };
    });
  };

  const handleAddSpecialty = () => {
    if (newSpecialty.trim()) {
      setFormData(prev => {
        const existingSkills = prev.skills || {
          certifications: [],
          specialties: [],
          skillLevel: 'Entry' as const,
          yearsExperience: 0
        };
        
        return {
          ...prev,
          skills: {
            ...existingSkills,
            specialties: [...existingSkills.specialties, newSpecialty.trim()]
          }
        };
      });
      setNewSpecialty('');
    }
  };

  const handleRemoveSpecialty = (index: number) => {
    setFormData(prev => {
      const existingSkills = prev.skills || {
        certifications: [],
        specialties: [],
        skillLevel: 'Entry' as const,
        yearsExperience: 0
      };
      
      return {
        ...prev,
        skills: {
          ...existingSkills,
          specialties: existingSkills.specialties.filter((_, i) => i !== index)
        }
      };
    });
  };

  const handleScheduleChange = (day: string, field: string, value: any) => {
    setFormData(prev => {
      const newData = { ...prev };
      if (!newData.availability) {
        newData.availability = {
          schedule: {
            monday: { start: '08:00', end: '17:00', available: true },
            tuesday: { start: '08:00', end: '17:00', available: true },
            wednesday: { start: '08:00', end: '17:00', available: true },
            thursday: { start: '08:00', end: '17:00', available: true },
            friday: { start: '08:00', end: '17:00', available: true },
            saturday: { start: '00:00', end: '00:00', available: false },
            sunday: { start: '00:00', end: '00:00', available: false }
          },
          timeOff: [],
          availableForTravel: false
        };
      }
      if (!newData.availability.schedule) {
        newData.availability.schedule = {
          monday: { start: '08:00', end: '17:00', available: true },
          tuesday: { start: '08:00', end: '17:00', available: true },
          wednesday: { start: '08:00', end: '17:00', available: true },
          thursday: { start: '08:00', end: '17:00', available: true },
          friday: { start: '08:00', end: '17:00', available: true },
          saturday: { start: '00:00', end: '00:00', available: false },
          sunday: { start: '00:00', end: '00:00', available: false }
        };
      }
      if (!newData.availability.schedule[day as keyof typeof newData.availability.schedule]) {
        (newData.availability.schedule as any)[day] = { start: '08:00', end: '17:00', available: true };
      }
      ((newData.availability.schedule as any)[day] as any)[field] = value;
      return newData;
    });
  };

  const handleSubmit = async () => {
    if (!validateStep(activeStep)) return;

    try {
      const employee: Employee = {
        id: `emp${Date.now()}`,
        personalInfo: formData.personalInfo!,
        employment: formData.employment!,
        skills: formData.skills!,
        compensation: formData.compensation!,
        availability: formData.availability!,
        performance: formData.performance!,
        currentAssignments: formData.currentAssignments!,
        metadata: {
          createdAt: new Date().toISOString(),
          createdBy: 'current-user',
          lastModified: new Date().toISOString(),
          modifiedBy: 'current-user'
        }
      };

      saveEmployee(employee);
      router.push('/employees');
    } catch (error) {
      console.error('Error saving employee:', error);
    }
  };

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="First Name"
                value={formData.personalInfo?.firstName || ''}
                onChange={(e) => handleInputChange('personalInfo', 'firstName', e.target.value)}
                error={!!errors.firstName}
                helperText={errors.firstName}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Last Name"
                value={formData.personalInfo?.lastName || ''}
                onChange={(e) => handleInputChange('personalInfo', 'lastName', e.target.value)}
                error={!!errors.lastName}
                helperText={errors.lastName}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={formData.personalInfo?.email || ''}
                onChange={(e) => handleInputChange('personalInfo', 'email', e.target.value)}
                error={!!errors.email}
                helperText={errors.email}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Phone"
                value={formData.personalInfo?.phone || ''}
                onChange={(e) => handleInputChange('personalInfo', 'phone', e.target.value)}
                error={!!errors.phone}
                helperText={errors.phone}
                required
              />
            </Grid>

            {/* Address */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>Address</Typography>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Street Address"
                value={formData.personalInfo?.address?.street || ''}
                onChange={(e) => handleInputChange('personalInfo', 'address', {
                  ...formData.personalInfo?.address,
                  street: e.target.value
                })}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="City"
                value={formData.personalInfo?.address?.city || ''}
                onChange={(e) => handleInputChange('personalInfo', 'address', {
                  ...formData.personalInfo?.address,
                  city: e.target.value
                })}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="State"
                value={formData.personalInfo?.address?.state || ''}
                onChange={(e) => handleInputChange('personalInfo', 'address', {
                  ...formData.personalInfo?.address,
                  state: e.target.value
                })}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="ZIP Code"
                value={formData.personalInfo?.address?.zipCode || ''}
                onChange={(e) => handleInputChange('personalInfo', 'address', {
                  ...formData.personalInfo?.address,
                  zipCode: e.target.value
                })}
              />
            </Grid>

            {/* Emergency Contact */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>Emergency Contact</Typography>
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Contact Name"
                value={formData.personalInfo?.emergencyContact?.name || ''}
                onChange={(e) => handleInputChange('personalInfo', 'emergencyContact', {
                  ...formData.personalInfo?.emergencyContact,
                  name: e.target.value
                })}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Relationship"
                value={formData.personalInfo?.emergencyContact?.relationship || ''}
                onChange={(e) => handleInputChange('personalInfo', 'emergencyContact', {
                  ...formData.personalInfo?.emergencyContact,
                  relationship: e.target.value
                })}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Emergency Phone"
                value={formData.personalInfo?.emergencyContact?.phone || ''}
                onChange={(e) => handleInputChange('personalInfo', 'emergencyContact', {
                  ...formData.personalInfo?.emergencyContact,
                  phone: e.target.value
                })}
              />
            </Grid>
          </Grid>
        );

      case 1:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Employee ID"
                value={formData.employment?.employeeId || ''}
                disabled
                helperText="Auto-generated"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Job Title"
                value={formData.employment?.title || ''}
                onChange={(e) => handleInputChange('employment', 'title', e.target.value)}
                error={!!errors.title}
                helperText={errors.title}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Department</InputLabel>
                <Select
                  value={formData.employment?.department || 'Installation'}
                  label="Department"
                  onChange={(e) => handleInputChange('employment', 'department', e.target.value)}
                >
                  <MenuItem value="Installation">Installation</MenuItem>
                  <MenuItem value="Sales">Sales</MenuItem>
                  <MenuItem value="Service">Service</MenuItem>
                  <MenuItem value="Management">Management</MenuItem>
                  <MenuItem value="Admin">Admin</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Role</InputLabel>
                <Select
                  value={formData.employment?.role || 'Installer'}
                  label="Role"
                  onChange={(e) => handleInputChange('employment', 'role', e.target.value)}
                >
                  <MenuItem value="Project Manager">Project Manager</MenuItem>
                  <MenuItem value="Lead Installer">Lead Installer</MenuItem>
                  <MenuItem value="Installer">Installer</MenuItem>
                  <MenuItem value="Technician">Technician</MenuItem>
                  <MenuItem value="Sales Rep">Sales Rep</MenuItem>
                  <MenuItem value="Admin">Admin</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Hire Date"
                type="date"
                value={formData.employment?.hireDate || ''}
                onChange={(e) => handleInputChange('employment', 'hireDate', e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Employment Type</InputLabel>
                <Select
                  value={formData.employment?.employmentType || 'Full Time'}
                  label="Employment Type"
                  onChange={(e) => handleInputChange('employment', 'employmentType', e.target.value)}
                >
                  <MenuItem value="Full Time">Full Time</MenuItem>
                  <MenuItem value="Part Time">Part Time</MenuItem>
                  <MenuItem value="Contract">Contract</MenuItem>
                  <MenuItem value="Seasonal">Seasonal</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        );

      case 2:
        return (
          <Grid container spacing={3}>
            {/* Certifications */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>Certifications</Typography>
              <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                <TextField
                  fullWidth
                  label="Add Certification"
                  value={newCertification}
                  onChange={(e) => setNewCertification(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddCertification()}
                />
                <Button
                  variant="outlined"
                  startIcon={<AddIcon />}
                  onClick={handleAddCertification}
                >
                  Add
                </Button>
              </Box>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {formData.skills?.certifications?.map((cert, index) => (
                  <Chip
                    key={index}
                    label={cert}
                    onDelete={() => handleRemoveCertification(index)}
                    color="primary"
                    variant="outlined"
                  />
                ))}
              </Box>
            </Grid>

            {/* Specialties */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>Specialties</Typography>
              <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                <TextField
                  fullWidth
                  label="Add Specialty"
                  value={newSpecialty}
                  onChange={(e) => setNewSpecialty(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddSpecialty()}
                />
                <Button
                  variant="outlined"
                  startIcon={<AddIcon />}
                  onClick={handleAddSpecialty}
                >
                  Add
                </Button>
              </Box>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {formData.skills?.specialties?.map((specialty, index) => (
                  <Chip
                    key={index}
                    label={specialty}
                    onDelete={() => handleRemoveSpecialty(index)}
                    color="secondary"
                    variant="outlined"
                  />
                ))}
              </Box>
            </Grid>

            {/* Experience */}
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Skill Level</InputLabel>
                <Select
                  value={formData.skills?.skillLevel || 'Entry'}
                  label="Skill Level"
                  onChange={(e) => handleInputChange('skills', 'skillLevel', e.target.value)}
                >
                  <MenuItem value="Entry">Entry Level</MenuItem>
                  <MenuItem value="Intermediate">Intermediate</MenuItem>
                  <MenuItem value="Advanced">Advanced</MenuItem>
                  <MenuItem value="Expert">Expert</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Years of Experience"
                type="number"
                value={formData.skills?.yearsExperience || 0}
                onChange={(e) => handleInputChange('skills', 'yearsExperience', parseInt(e.target.value) || 0)}
                inputProps={{ min: 0, max: 50 }}
              />
            </Grid>
          </Grid>
        );

      case 3:
        return (
          <Grid container spacing={3}>
            {/* Compensation */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>Compensation</Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Pay Type</InputLabel>
                <Select
                  value={formData.compensation?.payType || 'Hourly'}
                  label="Pay Type"
                  onChange={(e) => handleInputChange('compensation', 'payType', e.target.value)}
                >
                  <MenuItem value="Hourly">Hourly</MenuItem>
                  <MenuItem value="Salary">Salary</MenuItem>
                  <MenuItem value="Commission">Commission</MenuItem>
                  <MenuItem value="Contract">Contract</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            {formData.compensation?.payType === 'Hourly' && (
              <>
                <Grid item xs={12} md={3}>
                  <TextField
                    fullWidth
                    label="Hourly Rate"
                    type="number"
                    value={formData.compensation?.hourlyRate || ''}
                    onChange={(e) => handleInputChange('compensation', 'hourlyRate', parseFloat(e.target.value) || 0)}
                    InputProps={{
                      startAdornment: <InputAdornment position="start">$</InputAdornment>,
                    }}
                    error={!!errors.hourlyRate}
                    helperText={errors.hourlyRate}
                  />
                </Grid>
                <Grid item xs={12} md={3}>
                  <TextField
                    fullWidth
                    label="Overtime Rate"
                    type="number"
                    value={formData.compensation?.overtimeRate || ''}
                    onChange={(e) => handleInputChange('compensation', 'overtimeRate', parseFloat(e.target.value) || 0)}
                    InputProps={{
                      startAdornment: <InputAdornment position="start">$</InputAdornment>,
                    }}
                  />
                </Grid>
              </>
            )}
            {formData.compensation?.payType === 'Salary' && (
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Annual Salary"
                  type="number"
                  value={formData.compensation?.salary || ''}
                  onChange={(e) => handleInputChange('compensation', 'salary', parseFloat(e.target.value) || 0)}
                  InputProps={{
                    startAdornment: <InputAdornment position="start">$</InputAdornment>,
                  }}
                  error={!!errors.salary}
                  helperText={errors.salary}
                />
              </Grid>
            )}

            {/* Schedule */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>Work Schedule</Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.availability?.availableForTravel || false}
                    onChange={(e) => handleInputChange('availability', 'availableForTravel', e.target.checked)}
                  />
                }
                label="Available for Travel"
              />
            </Grid>

            {/* Weekly Schedule */}
            <Grid item xs={12}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="subtitle1" gutterBottom>Weekly Availability</Typography>
                  {Object.entries(formData.availability?.schedule || {}).map(([day, schedule]) => (
                    <Box key={day} sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={schedule.available}
                            onChange={(e) => handleScheduleChange(day, 'available', e.target.checked)}
                          />
                        }
                        label={day.charAt(0).toUpperCase() + day.slice(1)}
                        sx={{ minWidth: 120 }}
                      />
                      {schedule.available && (
                        <>
                          <TextField
                            type="time"
                            label="Start"
                            size="small"
                            value={schedule.start}
                            onChange={(e) => handleScheduleChange(day, 'start', e.target.value)}
                            InputLabelProps={{ shrink: true }}
                          />
                          <TextField
                            type="time"
                            label="End"
                            size="small"
                            value={schedule.end}
                            onChange={(e) => handleScheduleChange(day, 'end', e.target.value)}
                            InputLabelProps={{ shrink: true }}
                          />
                        </>
                      )}
                    </Box>
                  ))}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        );

      case 4:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Alert severity="info" sx={{ mb: 3 }}>
                Please review all information before creating the employee record.
              </Alert>
            </Grid>

            {/* Personal Info Summary */}
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>Personal Information</Typography>
                  <Typography><strong>Name:</strong> {formData.personalInfo?.firstName} {formData.personalInfo?.lastName}</Typography>
                  <Typography><strong>Email:</strong> {formData.personalInfo?.email}</Typography>
                  <Typography><strong>Phone:</strong> {formData.personalInfo?.phone}</Typography>
                  {formData.personalInfo?.address?.street && (
                    <Typography><strong>Address:</strong> {formData.personalInfo.address.street}, {formData.personalInfo.address.city}, {formData.personalInfo.address.state} {formData.personalInfo.address.zipCode}</Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>

            {/* Employment Summary */}
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>Employment Details</Typography>
                  <Typography><strong>Employee ID:</strong> {formData.employment?.employeeId}</Typography>
                  <Typography><strong>Title:</strong> {formData.employment?.title}</Typography>
                  <Typography><strong>Department:</strong> {formData.employment?.department}</Typography>
                  <Typography><strong>Role:</strong> {formData.employment?.role}</Typography>
                  <Typography><strong>Employment Type:</strong> {formData.employment?.employmentType}</Typography>
                  <Typography><strong>Hire Date:</strong> {formData.employment?.hireDate}</Typography>
                </CardContent>
              </Card>
            </Grid>

            {/* Skills Summary */}
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>Skills & Experience</Typography>
                  <Typography><strong>Skill Level:</strong> {formData.skills?.skillLevel}</Typography>
                  <Typography><strong>Years Experience:</strong> {formData.skills?.yearsExperience}</Typography>
                  <Box sx={{ mt: 1 }}>
                    <Typography variant="body2" color="text.secondary">Certifications:</Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
                      {formData.skills?.certifications?.map((cert, index) => (
                        <Chip key={index} label={cert} size="small" color="primary" />
                      ))}
                    </Box>
                  </Box>
                  <Box sx={{ mt: 1 }}>
                    <Typography variant="body2" color="text.secondary">Specialties:</Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
                      {formData.skills?.specialties?.map((specialty, index) => (
                        <Chip key={index} label={specialty} size="small" color="secondary" />
                      ))}
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Compensation Summary */}
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>Compensation & Schedule</Typography>
                  <Typography><strong>Pay Type:</strong> {formData.compensation?.payType}</Typography>
                  {formData.compensation?.hourlyRate && (
                    <Typography><strong>Hourly Rate:</strong> ${formData.compensation.hourlyRate}</Typography>
                  )}
                  {formData.compensation?.salary && (
                    <Typography><strong>Annual Salary:</strong> ${formData.compensation.salary?.toLocaleString()}</Typography>
                  )}
                  <Typography><strong>Travel Available:</strong> {formData.availability?.availableForTravel ? 'Yes' : 'No'}</Typography>
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
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Breadcrumbs */}
      <Breadcrumbs sx={{ mb: 2 }}>
        <Link component={NextLink} href="/" color="inherit" underline="hover">
          Dashboard
        </Link>
        <Link component={NextLink} href="/employees" color="inherit" underline="hover">
          Employees
        </Link>
        <Typography color="text.primary">Add Employee</Typography>
      </Breadcrumbs>

      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
        <IconButton onClick={() => router.push('/employees')} sx={{ mr: 2 }}>
          <ArrowBackIcon />
        </IconButton>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            Add New Employee
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Complete the form below to add a new team member
          </Typography>
        </Box>
      </Box>

      {/* Stepper */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {/* Step Content */}
        <Box sx={{ mt: 4 }}>
          {renderStepContent(activeStep)}
        </Box>

        {/* Navigation Buttons */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
          <Button
            onClick={handleBack}
            disabled={activeStep === 0}
            startIcon={<ArrowBackIcon />}
          >
            Back
          </Button>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="outlined"
              onClick={() => router.push('/employees')}
              startIcon={<CancelIcon />}
            >
              Cancel
            </Button>
            {activeStep === steps.length - 1 ? (
              <Button
                variant="contained"
                onClick={handleSubmit}
                startIcon={<SaveIcon />}
              >
                Create Employee
              </Button>
            ) : (
              <Button
                variant="contained"
                onClick={handleNext}
              >
                Next
              </Button>
            )}
          </Box>
        </Box>
      </Paper>
    </Container>
  );
} 