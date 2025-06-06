import React, { useState, useCallback } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Avatar,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  IconButton,
  Rating,
  Divider,
  Badge,
  Tooltip,
  FormControlLabel,
  Checkbox,
} from '@mui/material';
import {
  Person as PersonIcon,
  Search as SearchIcon,
  Close as CloseIcon,
  Check as CheckIcon,
  Schedule as ScheduleIcon,
  Star as StarIcon,
  Work as WorkIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
} from '@mui/icons-material';
import {
  Employee,
  getAllEmployees,
  getEmployeeFullName,
} from '../../utils/employeeStorage';

export interface EmployeeSelectorProps {
  open: boolean;
  onClose: () => void;
  onSelect: (employee: Employee, role?: string) => void;
  employees: Employee[];
  requiredSkills?: string[];
  projectId?: string;
  title?: string;
  subtitle?: string;
  allowMultiSelect?: boolean;
  selectedEmployees?: string[];
}

const EmployeeSelector: React.FC<EmployeeSelectorProps> = ({
  open,
  onClose,
  onSelect,
  employees,
  requiredSkills = [],
  projectId,
  title = 'Assign Team Member',
  subtitle,
  allowMultiSelect = false,
  selectedEmployees = [],
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [skillFilter, setSkillFilter] = useState('All');
  const [availabilityFilter, setAvailabilityFilter] = useState('All');
  const [rateFilter, setRateFilter] = useState('All');
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [assignmentRole, setAssignmentRole] = useState('Team Member');
  const [notifications, setNotifications] = useState({
    email: true,
    sms: true,
    push: true,
  });

  // Get all unique skills for filter - ADD DEFENSIVE PROGRAMMING
  const allSkills = Array.from(new Set(
    employees
      .filter(emp => emp?.skills?.specialties)
      .flatMap(emp => emp.skills.specialties)
  ));
  const availabilityOptions = ['Active', 'Inactive', 'On Leave', 'Terminated'];

  // Calculate skill match score - FIXED WITH NULL CHECKS
  const calculateSkillMatch = useCallback((employee: Employee | null | undefined, requiredSkills: string[]) => {
    // Add null/undefined checks for both parameters
    if (!employee || !employee.skills || !employee.skills.specialties) return 0;
    if (!requiredSkills || !Array.isArray(requiredSkills) || requiredSkills.length === 0) return 100;
    
    const employeeSkills = employee.skills.specialties;
    if (!Array.isArray(employeeSkills)) return 0;
    
    const matchedSkills = employeeSkills.filter(skill => 
      requiredSkills.some(required => 
        skill?.toLowerCase().includes(required?.toLowerCase()) ||
        required?.toLowerCase().includes(skill?.toLowerCase())
      )
    );
    
    return Math.round((matchedSkills.length / requiredSkills.length) * 100);
  }, []);

  // Filter and sort employees
  const filteredEmployees = employees
    .filter(emp => {
      // Safety check for employee object
      if (!emp || !emp.personalInfo || !emp.employment || !emp.skills) return false;
      
      // Search filter
      const fullName = getEmployeeFullName(emp);
      if (searchTerm && !fullName.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }
      
      // Skill filter - SAFE ACCESS
      if (skillFilter !== 'All' && emp.skills.specialties && !emp.skills.specialties.includes(skillFilter)) {
        return false;
      }
      
      // Availability filter
      if (availabilityFilter !== 'All' && emp.employment.status !== availabilityFilter) {
        return false;
      }
      
      // Rate filter - SAFE ACCESS
      if (rateFilter !== 'All') {
        const rate = emp.compensation?.hourlyRate || emp.compensation?.salary || 0;
        if (rateFilter === 'Under $50' && rate >= 50) return false;
        if (rateFilter === '$50-$75' && (rate < 50 || rate > 75)) return false;
        if (rateFilter === '$75-$100' && (rate < 75 || rate > 100)) return false;
        if (rateFilter === 'Over $100' && rate <= 100) return false;
      }
      
      return true;
    })
    .sort((a, b) => {
      // Sort by skill match score first
      const aSkillMatch = calculateSkillMatch(a, requiredSkills);
      const bSkillMatch = calculateSkillMatch(b, requiredSkills);
      
      if (aSkillMatch !== bSkillMatch) {
        return bSkillMatch - aSkillMatch;
      }
      
      // Then by availability
      const aStatus = a?.employment?.status || '';
      const bStatus = b?.employment?.status || '';
      if (aStatus !== bStatus) {
        const availabilityOrder = ['Active', 'Inactive', 'On Leave', 'Terminated'];
        return availabilityOrder.indexOf(aStatus) - availabilityOrder.indexOf(bStatus);
      }
      
      // Finally by performance rating
      const aRating = a?.performance?.rating || 0;
      const bRating = b?.performance?.rating || 0;
      return bRating - aRating;
    });

  const getAvailabilityColor = (status: string) => {
    if (status === 'Terminated' || status === 'Inactive') return 'error';
    return 'success';
  };

  const getAvailabilityStatus = (employee: Employee | null | undefined) => {
    if (!employee || !employee.employment) return 'Unknown';
    if (employee.employment.status === 'Terminated' || employee.employment.status === 'Inactive') return 'Unavailable';
    
    // Simplified availability without workload calculations
    const activeProjects = employee.currentAssignments?.activeProjects?.length || 0;
    if (activeProjects > 0) return 'On Project';
    return 'Available';
  };

  const handleEmployeeSelect = (employee: Employee) => {
    if (allowMultiSelect) {
      onSelect(employee, assignmentRole);
    } else {
      setSelectedEmployee(employee);
    }
  };

  const handleAssign = () => {
    if (selectedEmployee) {
      onSelect(selectedEmployee, assignmentRole);
      handleClose();
    }
  };

  const handleClose = () => {
    setSelectedEmployee(null);
    setSearchTerm('');
    setSkillFilter('All');
    setAvailabilityFilter('All');
    setRateFilter('All');
    onClose();
  };

  const renderEmployeeCard = (employee: Employee) => {
    // Safe access to employee properties with fallbacks
    const personalInfo = employee?.personalInfo || {};
    const employment = employee?.employment || {};
    const skills = employee?.skills || { specialties: [] };
    const performance = employee?.performance || { rating: 0, completedProjects: 0 };
    const compensation = employee?.compensation || {};
    const currentAssignments = employee?.currentAssignments || { activeProjects: [] };
    
    const skillMatch = calculateSkillMatch(employee, requiredSkills);
    const isSelected = selectedEmployees.includes(employee.id);
    const isCurrentlySelected = selectedEmployee?.id === employee.id;
    
    return (
      <Card
        key={employee.id}
        sx={{
          cursor: 'pointer',
          border: '2px solid',
          borderColor: isCurrentlySelected ? 'primary.main' : 'transparent',
          '&:hover': {
            borderColor: 'primary.light',
            elevation: 3,
          },
          opacity: isSelected ? 0.7 : 1,
        }}
        onClick={() => !isSelected && handleEmployeeSelect(employee)}
      >
        <CardContent sx={{ p: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
            <Avatar
              src={personalInfo.avatar}
              sx={{ width: 48, height: 48, mr: 2 }}
            >
              {getEmployeeFullName(employee).split(' ').map(n => n[0]).join('')}
            </Avatar>
            
            <Box sx={{ flex: 1 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                {getEmployeeFullName(employee)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {employment.title}
              </Typography>
              
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                <Rating
                  value={performance.rating}
                  readOnly
                  size="small"
                  precision={0.1}
                />
                <Typography variant="caption" sx={{ ml: 0.5 }}>
                  ({performance.completedProjects} projects)
                </Typography>
              </Box>
            </Box>
            
            <Box sx={{ textAlign: 'right' }}>
              <Chip
                label={getAvailabilityStatus(employee)}
                size="small"
                color={getAvailabilityColor(employment.status)}
              />
              {requiredSkills.length > 0 && (
                <Typography variant="caption" display="block" sx={{ mt: 0.5 }}>
                  {skillMatch}% skill match
                </Typography>
              )}
            </Box>
          </Box>

          {/* Skills */}
          <Box sx={{ mb: 2 }}>
            <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
              Skills:
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
              {skills.specialties.slice(0, 4).map((skill) => {
                const isRequired = requiredSkills.some(req => 
                  skill?.toLowerCase().includes(req?.toLowerCase()) ||
                  req?.toLowerCase().includes(skill?.toLowerCase())
                );
                
                return (
                  <Chip
                    key={skill}
                    label={skill}
                    size="small"
                    color={isRequired ? 'success' : 'default'}
                    icon={isRequired ? <CheckIcon sx={{ fontSize: 12 }} /> : undefined}
                    sx={{ fontSize: '0.7rem', height: 20 }}
                  />
                );
              })}
              {skills.specialties.length > 4 && (
                <Chip
                  label={`+${skills.specialties.length - 4} more`}
                  size="small"
                  variant="outlined"
                  sx={{ fontSize: '0.7rem', height: 20 }}
                />
              )}
            </Box>
          </Box>

          {/* Additional Info - SIMPLIFIED WITHOUT WORKLOAD */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Typography variant="caption" color="text.secondary">
                Active Projects: {currentAssignments.activeProjects.length}
              </Typography>
            </Box>
            {compensation.hourlyRate && (
              <Typography variant="caption" sx={{ fontWeight: 600 }}>
                ${compensation.hourlyRate}/hr
              </Typography>
            )}
          </Box>

          {isSelected && (
            <Box sx={{ mt: 1, p: 1, bgcolor: 'success.light', borderRadius: 1 }}>
              <Typography variant="caption" color="success.dark">
                Already assigned to this project
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="lg" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="h6">{title}</Typography>
            {subtitle && (
              <Typography variant="body2" color="text.secondary">
                {subtitle}
              </Typography>
            )}
            {requiredSkills.length > 0 && (
              <Typography variant="caption" color="text.secondary">
                Required Skills: {requiredSkills.join(', ')}
              </Typography>
            )}
          </Box>
          <IconButton onClick={handleClose}>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent>
        {/* Filters */}
        <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
          <TextField
            size="small"
            placeholder="Search employees..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: <SearchIcon sx={{ mr: 1, color: 'action.active' }} />,
            }}
            sx={{ minWidth: 200 }}
          />

          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Skills</InputLabel>
            <Select value={skillFilter} onChange={(e) => setSkillFilter(e.target.value)}>
              <MenuItem value="All">All Skills</MenuItem>
              {allSkills.map((skill) => (
                <MenuItem key={skill} value={skill}>
                  {skill}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Availability</InputLabel>
            <Select value={availabilityFilter} onChange={(e) => setAvailabilityFilter(e.target.value)}>
              <MenuItem value="All">All</MenuItem>
              {availabilityOptions.map((option) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Rate</InputLabel>
            <Select value={rateFilter} onChange={(e) => setRateFilter(e.target.value)}>
              <MenuItem value="All">All Rates</MenuItem>
              <MenuItem value="Under $50">Under $50</MenuItem>
              <MenuItem value="$50-$75">$50-$75</MenuItem>
              <MenuItem value="$75-$100">$75-$100</MenuItem>
              <MenuItem value="Over $100">Over $100</MenuItem>
            </Select>
          </FormControl>
        </Box>

        {/* Employee Grid */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          {filteredEmployees.map((employee) => (
            <Grid item xs={12} md={6} lg={4} key={employee.id}>
              {renderEmployeeCard(employee)}
            </Grid>
          ))}
        </Grid>

        {filteredEmployees.length === 0 && (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <PersonIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary">
              No employees found
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Try adjusting your filters or search terms
            </Typography>
          </Box>
        )}
      </DialogContent>

      {/* Assignment Details (only if single select and employee selected) */}
      {!allowMultiSelect && selectedEmployee && (
        <>
          <Divider />
          <DialogContent>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Assignment Details
            </Typography>
            
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Typography variant="body2">
                Selected: <strong>{getEmployeeFullName(selectedEmployee)}</strong>
              </Typography>
              
              <FormControl fullWidth>
                <InputLabel>Role</InputLabel>
                <Select
                  value={assignmentRole}
                  onChange={(e) => setAssignmentRole(e.target.value)}
                >
                  <MenuItem value="Project Manager">Project Manager</MenuItem>
                  <MenuItem value="Lead Installer">Lead Installer</MenuItem>
                  <MenuItem value="Installer">Installer</MenuItem>
                  <MenuItem value="Technician">Technician</MenuItem>
                  <MenuItem value="Team Member">Team Member</MenuItem>
                </Select>
              </FormControl>

              <Box>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                  Send Notifications:
                </Typography>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={notifications.email}
                      onChange={(e) => setNotifications({...notifications, email: e.target.checked})}
                    />
                  }
                  label="Email"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={notifications.sms}
                      onChange={(e) => setNotifications({...notifications, sms: e.target.checked})}
                    />
                  }
                  label="SMS"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={notifications.push}
                      onChange={(e) => setNotifications({...notifications, push: e.target.checked})}
                    />
                  }
                  label="Push"
                />
              </Box>
            </Box>
          </DialogContent>
        </>
      )}

      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        {allowMultiSelect ? (
          <Button onClick={handleClose} variant="contained">
            Done
          </Button>
        ) : (
          <Button 
            onClick={handleAssign} 
            variant="contained" 
            disabled={!selectedEmployee}
          >
            Assign to Project
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default EmployeeSelector; 