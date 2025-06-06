import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Button,
  Grid,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Card,
  CardContent,
  Alert,
  Autocomplete,
  InputAdornment,
  Divider,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
} from '@mui/material';
import {
  Assignment as AssignmentIcon,
  Person as PersonIcon,
  Schedule as ScheduleIcon,
  AttachMoney as MoneyIcon,
  CheckCircle as CheckIcon,
  Warning as WarningIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
} from '@mui/icons-material';
import { Employee } from '../utils/employeeStorage';
import {
  formatDate,
  formatDateForInput,
  formatShortDate,
} from '../utils/dateTimeFormatters';

interface ProjectAssignmentFormProps {
  employee: Employee;
  onAssign: (assignment: ProjectAssignment) => void;
  onCancel: () => void;
}

interface ProjectAssignment {
  projectId: string;
  employeeId: string;
  role: string;
  startDate: string;
  endDate?: string;
  hourlyRate: number;
  estimatedHours: number;
  priority: 'Low' | 'Medium' | 'High';
  notes?: string;
}

interface AvailableProject {
  id: string;
  name: string;
  client: string;
  status: 'Planning' | 'Active' | 'On Hold';
  startDate: string;
  endDate?: string;
  requiredSkills: string[];
  estimatedHours: number;
  description: string;
}

// Sample available projects - in real app, this would come from API
const AVAILABLE_PROJECTS: AvailableProject[] = [
  {
    id: 'proj-001',
    name: 'Smart Home Automation - 123 Oak Street',
    client: 'Johnson Family',
    status: 'Planning',
    startDate: '2024-02-01',
    endDate: '2024-02-15',
    requiredSkills: ['Control4', 'Lutron', 'Network Setup'],
    estimatedHours: 40,
    description: 'Complete smart home automation system with lighting, security, and entertainment integration.'
  },
  {
    id: 'proj-002',
    name: 'Home Theater Installation - 456 Pine Avenue',
    client: 'Williams Corporation',
    status: 'Active',
    startDate: '2024-01-25',
    endDate: '2024-02-10',
    requiredSkills: ['Audio Systems', 'Video Systems', 'Control4'],
    estimatedHours: 60,
    description: 'High-end home theater with immersive audio and 4K projection system.'
  },
  {
    id: 'proj-003',
    name: 'Security System Upgrade - 789 Maple Drive',
    client: 'Davis Residence',
    status: 'Planning',
    startDate: '2024-02-05',
    requiredSkills: ['Security Systems', 'Network Setup', 'Mobile Integration'],
    estimatedHours: 25,
    description: 'Upgrade existing security system with modern cameras and mobile app integration.'
  },
  {
    id: 'proj-004',
    name: 'Office Building Automation - Downtown Plaza',
    client: 'Metro Properties',
    status: 'Planning',
    startDate: '2024-03-01',
    endDate: '2024-04-15',
    requiredSkills: ['HVAC Integration', 'Lighting Control', 'Access Control'],
    estimatedHours: 120,
    description: 'Commercial building automation system for energy efficiency and security.'
  },
  {
    id: 'proj-005',
    name: 'Luxury Condo Smart Systems - Harbor View',
    client: 'Premium Living LLC',
    status: 'Active',
    startDate: '2024-01-20',
    endDate: '2024-03-30',
    requiredSkills: ['Sonos', 'Lutron', 'Control4', 'Network Setup'],
    estimatedHours: 80,
    description: 'Multi-unit luxury condominium with integrated smart home systems.'
  }
];

const PROJECT_ROLES = [
  'Lead Installer',
  'Installation Technician',
  'Audio/Video Specialist',
  'Network Specialist',
  'Security Specialist',
  'Project Coordinator',
  'Quality Inspector',
  'Customer Liaison'
];

const PRIORITY_OPTIONS = ['Low', 'Medium', 'High'] as const;

export default function ProjectAssignmentForm({ employee, onAssign, onCancel }: ProjectAssignmentFormProps) {
  const [selectedProject, setSelectedProject] = useState<AvailableProject | null>(null);
  const [formData, setFormData] = useState<Partial<ProjectAssignment>>({
    employeeId: employee?.employment?.employeeId || '',
    role: '',
    startDate: '',
    endDate: '',
    hourlyRate: employee?.compensation?.hourlyRate || 0,
    estimatedHours: 0,
    priority: 'Medium',
    notes: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [skillMatch, setSkillMatch] = useState<{ matches: string[], missing: string[] }>({ matches: [], missing: [] });

  // Safe access to employee properties with fallbacks
  const personalInfo = employee?.personalInfo || { firstName: 'Unknown', lastName: 'Employee', email: '', phone: '' };
  const employment = employee?.employment || { title: 'Unknown', department: 'Unknown', employeeId: '' };
  const skills = employee?.skills || { specialties: [] };
  const currentAssignments = employee?.currentAssignments || { activeProjects: [] };

  // Calculate skill match when project is selected
  useEffect(() => {
    if (selectedProject && employee) {
      const employeeSkills = skills.specialties || [];
      const requiredSkills = selectedProject.requiredSkills;
      
      const matches = requiredSkills.filter(skill => employeeSkills.includes(skill));
      const missing = requiredSkills.filter(skill => !employeeSkills.includes(skill));
      
      setSkillMatch({ matches, missing });
      
      // Auto-populate form data
      setFormData(prev => ({
        ...prev,
        projectId: selectedProject.id,
        startDate: selectedProject.startDate,
        endDate: selectedProject.endDate || '',
        estimatedHours: selectedProject.estimatedHours
      }));
    }
  }, [selectedProject, skills.specialties, employee]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!selectedProject) {
      newErrors.project = 'Please select a project';
    }
    if (!formData.role) {
      newErrors.role = 'Please select a role';
    }
    if (!formData.startDate) {
      newErrors.startDate = 'Start date is required';
    }
    if (!formData.hourlyRate || formData.hourlyRate <= 0) {
      newErrors.hourlyRate = 'Valid hourly rate is required';
    }
    if (!formData.estimatedHours || formData.estimatedHours <= 0) {
      newErrors.estimatedHours = 'Estimated hours must be greater than 0';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAssign = () => {
    if (validateForm() && selectedProject) {
      const assignment: ProjectAssignment = {
        projectId: selectedProject.id,
        employeeId: employee.employment.employeeId,
        role: formData.role!,
        startDate: formData.startDate!,
        endDate: formData.endDate,
        hourlyRate: formData.hourlyRate!,
        estimatedHours: formData.estimatedHours!,
        priority: formData.priority!,
        notes: formData.notes
      };
      
      onAssign(assignment);
    }
  };

  const updateFormData = (field: keyof ProjectAssignment, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const getProjectStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'success';
      case 'Planning': return 'info';
      case 'On Hold': return 'warning';
      default: return 'default';
    }
  };

  const getSkillMatchPercentage = () => {
    if (!selectedProject) return 0;
    return Math.round((skillMatch.matches.length / selectedProject.requiredSkills.length) * 100);
  };

  return (
    <Box sx={{ py: 2, minWidth: 600 }}>
      {/* Employee Summary */}
      <Card sx={{ mb: 3, bgcolor: 'grey.50' }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Employee Assignment Details
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <PersonIcon fontSize="small" color="action" />
                <Typography variant="body2">
                  {personalInfo.firstName} {personalInfo.lastName}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <AssignmentIcon fontSize="small" color="action" />
                <Typography variant="body2" color="text.secondary">
                  {employment.title} • {employment.department}
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Current Projects: {currentAssignments.activeProjects.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Status: {currentAssignments.activeProjects.length > 0 ? 'On Project' : 'Available'}
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Project Selection */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Select Project
        </Typography>
        <Autocomplete
          options={AVAILABLE_PROJECTS}
          getOptionLabel={(option) => `${option.name} - ${option.client}`}
          value={selectedProject}
          onChange={(e, value) => setSelectedProject(value)}
          renderInput={(params) => (
            <TextField 
              {...params} 
              label="Available Projects" 
              placeholder="Search and select a project..."
              error={!!errors.project}
              helperText={errors.project}
            />
          )}
          renderOption={(props, option) => (
            <Box component="li" {...props}>
              <Box sx={{ flex: 1 }}>
                <Typography variant="subtitle2">{option.name}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {option.client} • {option.estimatedHours}h • 
                  <Chip 
                    label={option.status} 
                    size="small" 
                    color={getProjectStatusColor(option.status) as any}
                    sx={{ ml: 1 }}
                  />
                </Typography>
              </Box>
            </Box>
          )}
        />
      </Box>

      {/* Project Details & Skill Match */}
      {selectedProject && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Project Details & Skill Match
            </Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12} md={8}>
                <Typography variant="subtitle2" gutterBottom>
                  Project Description
                </Typography>
                <Typography variant="body2" sx={{ mb: 2 }}>
                  {selectedProject.description}
                </Typography>
                
                <Typography variant="subtitle2" gutterBottom>
                  Timeline
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {formatDate(selectedProject.startDate)} {selectedProject.endDate && `to ${formatDate(selectedProject.endDate)}`}
                </Typography>
              </Grid>
              
              <Grid item xs={12} md={4}>
                <Typography variant="subtitle2" gutterBottom>
                  Skill Match: {getSkillMatchPercentage()}%
                </Typography>
                
                {skillMatch.matches.length > 0 && (
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="caption" color="success.main" gutterBottom sx={{ display: 'block' }}>
                      ✓ Matching Skills
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {skillMatch.matches.map((skill) => (
                        <Chip key={skill} label={skill} size="small" color="success" variant="outlined" />
                      ))}
                    </Box>
                  </Box>
                )}
                
                {skillMatch.missing.length > 0 && (
                  <Box>
                    <Typography variant="caption" color="warning.main" gutterBottom sx={{ display: 'block' }}>
                      ⚠ Missing Skills
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {skillMatch.missing.map((skill) => (
                        <Chip key={skill} label={skill} size="small" color="warning" variant="outlined" />
                      ))}
                    </Box>
                  </Box>
                )}
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* Assignment Configuration */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Assignment Configuration
        </Typography>
        
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth error={!!errors.role}>
              <InputLabel>Role on Project</InputLabel>
              <Select
                value={formData.role || ''}
                label="Role on Project"
                onChange={(e) => updateFormData('role', e.target.value)}
              >
                {PROJECT_ROLES.map((role) => (
                  <MenuItem key={role} value={role}>{role}</MenuItem>
                ))}
              </Select>
              {errors.role && (
                <Typography variant="caption" color="error" sx={{ mt: 0.5 }}>
                  {errors.role}
                </Typography>
              )}
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Priority</InputLabel>
              <Select
                value={formData.priority || 'Medium'}
                label="Priority"
                onChange={(e) => updateFormData('priority', e.target.value)}
              >
                {PRIORITY_OPTIONS.map((priority) => (
                  <MenuItem key={priority} value={priority}>{priority}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Start Date"
              type="date"
              value={formatDateForInput(formData.startDate || '')}
              onChange={(e) => updateFormData('startDate', e.target.value)}
              error={!!errors.startDate}
              helperText={errors.startDate}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="End Date (Optional)"
              type="date"
              value={formatDateForInput(formData.endDate || '')}
              onChange={(e) => updateFormData('endDate', e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Hourly Rate"
              type="number"
              value={formData.hourlyRate || ''}
              onChange={(e) => updateFormData('hourlyRate', parseFloat(e.target.value) || 0)}
              error={!!errors.hourlyRate}
              helperText={errors.hourlyRate}
              InputProps={{
                startAdornment: <InputAdornment position="start">$</InputAdornment>
              }}
              inputProps={{ min: 0, step: 0.01 }}
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Estimated Hours"
              type="number"
              value={formData.estimatedHours || ''}
              onChange={(e) => updateFormData('estimatedHours', parseInt(e.target.value) || 0)}
              error={!!errors.estimatedHours}
              helperText={errors.estimatedHours}
              inputProps={{ min: 1 }}
            />
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Notes (Optional)"
              multiline
              rows={3}
              value={formData.notes || ''}
              onChange={(e) => updateFormData('notes', e.target.value)}
              placeholder="Add any special instructions or notes for this assignment..."
            />
          </Grid>
        </Grid>
      </Box>

      {/* Form Actions */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'flex-end', 
        gap: 2, 
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
          onClick={handleAssign}
          disabled={!selectedProject || Object.keys(errors).length > 0}
          size="large"
        >
          Assign to Project
        </Button>
      </Box>
    </Box>
  );
} 