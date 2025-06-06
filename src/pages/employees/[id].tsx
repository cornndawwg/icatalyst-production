import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Grid,
  Card,
  CardContent,
  Button,
  Breadcrumbs,
  Link,
  Chip,
  Avatar,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tab,
  Tabs,
  Badge,
  Alert,
  Tooltip,
  LinearProgress,
  Menu,
  ListItemSecondaryAction,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
  Work as WorkIcon,
  School as SchoolIcon,
  Assignment as AssignmentIcon,
  Schedule as ScheduleIcon,
  Star as StarIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  MoreVert as MoreVertIcon,
  Business as BusinessIcon,
  CalendarToday as CalendarIcon,
  Group as GroupIcon,
  Task as TaskIcon,
  ContactPhone as ContactPhoneIcon,
  Notes as NotesIcon,
  History as HistoryIcon,
  Verified as VerifiedIcon,
  AccessTime as AccessTimeIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import NextLink from 'next/link';
import { useRouter } from 'next/router';
import {
  Employee,
  getEmployeeById,
  getEmployeeFullName,
  getEmployeeAvailability,
  saveEmployee,
} from '../../utils/employeeStorage';
import EmployeeEditForm from '../../components/EmployeeEditForm';
import ProjectAssignmentForm from '../../components/ProjectAssignmentForm';
import {
  formatDate,
  formatTime,
  formatTimeRange,
  formatRelativeDate,
  formatDateTime,
  formatShortDate,
} from '../../utils/dateTimeFormatters';

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
      id={`employee-tabpanel-${index}`}
      aria-labelledby={`employee-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

interface ProjectAssignment {
  projectId: string;
  projectName: string;
  role: string;
  status: 'Active' | 'Completed' | 'On Hold';
  startDate: string;
  endDate?: string;
  hoursWorked: number;
  hourlyRate: number;
}

interface EmployeeNote {
  id: string;
  date: string;
  author: string;
  type: 'Performance' | 'Training' | 'General' | 'Disciplinary' | 'Achievement';
  content: string;
  priority: 'Low' | 'Medium' | 'High';
}

export default function EmployeeDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tabValue, setTabValue] = useState(0);
  
  // Dialog states
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [assignProjectOpen, setAssignProjectOpen] = useState(false);
  const [addNoteOpen, setAddNoteOpen] = useState(false);
  const [notesDialogOpen, setNotesDialogOpen] = useState(false);
  
  // Menu states
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  
  // Sample project assignments - in real app, this would come from API
  const [projectAssignments] = useState<ProjectAssignment[]>([
    {
      projectId: 'proj1',
      projectName: 'Smart Home Installation - 123 Oak St',
      role: 'Lead Installer',
      status: 'Active',
      startDate: '2024-01-15',
      hoursWorked: 32,
      hourlyRate: 85,
    },
    {
      projectId: 'proj2',
      projectName: 'Theater System - 456 Pine Ave',
      role: 'Audio Specialist',
      status: 'Active',
      startDate: '2024-01-20',
      hoursWorked: 16,
      hourlyRate: 85,
    },
    {
      projectId: 'proj3',
      projectName: 'Security System - 789 Maple Dr',
      role: 'Lead Installer',
      status: 'Completed',
      startDate: '2023-12-01',
      endDate: '2024-01-10',
      hoursWorked: 45,
      hourlyRate: 80,
    },
  ]);

  // Notes management
  const [employeeNotes, setEmployeeNotes] = useState([
    {
      id: '1',
      date: '2024-01-20',
      author: 'Sarah Johnson',
      type: 'Performance',
      content: 'Excellent work on the Williams theater installation. Customer was very satisfied with the attention to detail.',
      priority: 'Medium'
    },
    {
      id: '2', 
      date: '2024-01-15',
      author: 'Mike Davis',
      type: 'Training',
      content: 'Completed advanced Control4 certification. Ready for more complex automation projects.',
      priority: 'High'
    }
  ]);

  // Load employee data
  useEffect(() => {
    const loadEmployee = async () => {
      if (!id || typeof id !== 'string') {
        setError('Invalid employee ID');
        setLoading(false);
        return;
      }
      
      setLoading(true);
      setError(null);
      
      try {
        const employeeData = getEmployeeById(id);
        if (employeeData) {
          // Validate employee data structure
          if (!employeeData.personalInfo || !employeeData.employment) {
            setError('Employee data is incomplete or corrupted');
          } else {
            setEmployee(employeeData);
          }
        } else {
          setError('Employee not found');
        }
      } catch (err) {
        setError('Error loading employee');
        console.error('Error loading employee:', err);
      } finally {
        setLoading(false);
      }
    };

    loadEmployee();
  }, [id]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'success';
      case 'Inactive': return 'default';
      case 'On Leave': return 'warning';
      case 'Terminated': return 'error';
      default: return 'default';
    }
  };

  const getDepartmentColor = (department: string) => {
    const colors: Record<string, string> = {
      'Installation': '#1976d2',
      'Sales': '#388e3c',
      'Service': '#f57c00',
      'Management': '#7b1fa2',
      'Admin': '#616161'
    };
    return colors[department] || '#616161';
  };

  const formatCurrency = (amount: number) => `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;

  const handleEditEmployee = () => {
    setEditDialogOpen(true);
    setMenuAnchor(null);
  };

  const handleContactEmployee = () => {
    if (employee?.personalInfo?.email) {
      window.location.href = `mailto:${employee.personalInfo.email}`;
    }
    setMenuAnchor(null);
  };

  const renderScheduleDay = (day: string, schedule: any) => {
    if (!schedule.available) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 1 }}>
          <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>
            {day}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Not Available
          </Typography>
        </Box>
      );
    }

    return (
      <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 1 }}>
        <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>
          {day}
        </Typography>
        <Typography variant="body2">
          {schedule.start} - {schedule.end}
        </Typography>
      </Box>
    );
  };

  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
          <Typography>Loading employee...</Typography>
        </Box>
      </Container>
    );
  }

  if (error || !employee) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Alert severity="error">
          {error || 'Employee not found'}
        </Alert>
        <Button 
          variant="outlined" 
          startIcon={<ArrowBackIcon />}
          onClick={() => router.push('/employees')}
          sx={{ mt: 2 }}
        >
          Back to Employees
        </Button>
      </Container>
    );
  }

  // Safely get employee data with fallbacks
  const employeeFullName = getEmployeeFullName(employee);
  const availability = getEmployeeAvailability(employee);
  const activeProjects = projectAssignments.filter(p => p.status === 'Active');
  const completedProjects = projectAssignments.filter(p => p.status === 'Completed');
  
  // Safe access to employee properties
  const personalInfo = employee.personalInfo || {};
  const employment = employee.employment || {};
  const skills = employee.skills || { specialties: [], certifications: [], yearsExperience: 0, skillLevel: 'Entry' };
  const performance = employee.performance || { completedProjects: 0, customerSatisfaction: 0, rating: 0 };
  const currentAssignments = employee.currentAssignments || { activeProjects: [], nextAvailable: '' };
  const compensation = employee.compensation || { payType: 'Hourly' };
  const availabilityData = employee.availability || { 
    schedule: {
      monday: { start: '09:00', end: '17:00', available: false },
      tuesday: { start: '09:00', end: '17:00', available: false },
      wednesday: { start: '09:00', end: '17:00', available: false },
      thursday: { start: '09:00', end: '17:00', available: false },
      friday: { start: '09:00', end: '17:00', available: false },
      saturday: { start: '09:00', end: '17:00', available: false },
      sunday: { start: '09:00', end: '17:00', available: false }
    },
    timeOff: [],
    availableForTravel: false
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Breadcrumbs */}
      <Breadcrumbs sx={{ mb: 2 }}>
        <Link component={NextLink} href="/" color="inherit" underline="hover">
          Dashboard
        </Link>
        <Link component={NextLink} href="/employees" color="inherit" underline="hover">
          Employees
        </Link>
        <Typography color="text.primary">{employeeFullName}</Typography>
      </Breadcrumbs>

      {/* Employee Header */}
      <Paper sx={{ p: 4, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
            <IconButton onClick={() => router.push('/employees')} sx={{ mr: 2, mt: 1 }}>
              <ArrowBackIcon />
            </IconButton>
            
            <Avatar
              src={personalInfo.avatar}
              sx={{ width: 120, height: 120, mr: 3 }}
            >
              {personalInfo.firstName[0]}{personalInfo.lastName[0]}
            </Avatar>
            
            <Box sx={{ flex: 1 }}>
              <Typography variant="h3" component="h1" gutterBottom>
                {employeeFullName}
              </Typography>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                {employment.title}
              </Typography>
              
              <Box sx={{ display: 'flex', gap: 1, mb: 3, flexWrap: 'wrap' }}>
                <Chip
                  label={employment.status}
                  color={getStatusColor(employment.status) as any}
                />
                <Chip
                  label={employment.department}
                  sx={{
                    bgcolor: getDepartmentColor(employment.department),
                    color: 'white',
                  }}
                />
                <Chip
                  label={availability}
                  color={availability === 'Available' ? 'success' : 'warning'}
                />
                <Chip
                  label={`${skills.yearsExperience} years experience`}
                  variant="outlined"
                />
              </Box>

              {/* Contact Information */}
              <Box sx={{ mt: 3, mb: 2 }}>
                <Grid container spacing={2}>
                  {/* Email */}
                  <Grid item xs={12} sm={6} md={3}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, py: 0.5, minHeight: 32 }}>
                      <EmailIcon fontSize="small" color="action" />
                      <Typography 
                        variant="body2"
                        sx={{ 
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          minWidth: 0,
                          flex: 1
                        }}
                      >
                        {personalInfo.email}
                      </Typography>
                    </Box>
                  </Grid>

                  {/* Phone */}
                  <Grid item xs={12} sm={6} md={3}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, py: 0.5, minHeight: 32 }}>
                      <PhoneIcon fontSize="small" color="action" />
                      <Typography variant="body2">
                        {personalInfo.phone}
                      </Typography>
                    </Box>
                  </Grid>

                  {/* Employee ID */}
                  <Grid item xs={12} sm={6} md={3}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, py: 0.5, minHeight: 32 }}>
                      <WorkIcon fontSize="small" color="action" />
                      <Typography variant="body2">
                        ID: {employment.employeeId}
                      </Typography>
                    </Box>
                  </Grid>

                  {/* Hire Date */}
                  <Grid item xs={12} sm={6} md={3}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, py: 0.5, minHeight: 32 }}>
                      <CalendarIcon fontSize="small" color="action" />
                      <Typography variant="body2">
                        Hired: {formatDate(employment.hireDate)}
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </Box>
            </Box>
          </Box>
          
          {/* Action Buttons */}
          <Box sx={{ display: 'flex', gap: 2, flexDirection: isMobile ? 'column' : 'row' }}>
            <Button 
              variant="contained" 
              startIcon={<EditIcon />}
              onClick={handleEditEmployee}
            >
              Edit Employee
            </Button>
            <Button 
              variant="outlined" 
              startIcon={<AssignmentIcon />}
              onClick={() => setAssignProjectOpen(true)}
            >
              Assign to Project
            </Button>
            <Button 
              variant="outlined" 
              startIcon={<ContactPhoneIcon />}
              onClick={handleContactEmployee}
            >
              Contact
            </Button>
            <IconButton onClick={(e) => setMenuAnchor(e.currentTarget)}>
              <MoreVertIcon />
            </IconButton>
          </Box>
        </Box>
      </Paper>

      {/* Quick Stats */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ textAlign: 'center', p: 2, bgcolor: 'primary.main', color: 'white' }}>
            <TaskIcon sx={{ fontSize: 40, mb: 1 }} />
            <Typography variant="h4">{performance.completedProjects}</Typography>
            <Typography variant="body2">Projects Completed</Typography>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ textAlign: 'center', p: 2, bgcolor: 'success.main', color: 'white' }}>
            <GroupIcon sx={{ fontSize: 40, mb: 1 }} />
            <Typography variant="h4">{activeProjects.length}</Typography>
            <Typography variant="body2">Active Projects</Typography>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ textAlign: 'center', p: 2, bgcolor: 'info.main', color: 'white' }}>
            <VerifiedIcon sx={{ fontSize: 40, mb: 1 }} />
            <Typography variant="h4">{skills.certifications.length}</Typography>
            <Typography variant="body2">Certifications</Typography>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ textAlign: 'center', p: 2, bgcolor: 'warning.main', color: 'white' }}>
            <StarIcon sx={{ fontSize: 40, mb: 1 }} />
            <Typography variant="h4">{skills.yearsExperience}</Typography>
            <Typography variant="body2">Years Experience</Typography>
          </Card>
        </Grid>
      </Grid>

      {/* Tabbed Content */}
      <Paper sx={{ mb: 3 }}>
        <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)} variant="scrollable" scrollButtons="auto">
          <Tab label="Overview" />
          <Tab label="Projects" />
          <Tab label="Skills & Certifications" />
          <Tab label="Schedule & Availability" />
          <Tab label="Employment Details" />
        </Tabs>

        {/* Overview Tab */}
        <TabPanel value={tabValue} index={0}>
          <Box sx={{ p: 3 }}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                {/* Current Project Assignments Section */}
                <Card sx={{ mb: 4 }}>
                  <CardContent sx={{ p: 3 }}>
                    <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
                      Current Project Assignments
                    </Typography>
                    
                    {activeProjects.length > 0 ? (
                      <Box>
                        {activeProjects.map((project) => (
                          <Box 
                            key={project.projectId} 
                            sx={{ 
                              mb: 3, 
                              p: 2, 
                              border: '1px solid #e0e0e0',
                              borderRadius: 1,
                              '&:last-child': { mb: 0 }
                            }}
                          >
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                              <Box sx={{ flex: 1, mr: 2 }}>
                                <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600 }}>
                                  {project.projectName}
                                </Typography>
                                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                  Role: {project.role} • Started: {formatDate(project.startDate)} • {project.hoursWorked}h worked
                                </Typography>
                              </Box>
                              <Chip label={project.status} color="primary" sx={{ ml: 2 }} />
                            </Box>
                          </Box>
                        ))}
                      </Box>
                    ) : (
                      <Box sx={{ 
                        textAlign: 'center', 
                        py: 4,
                        color: 'text.secondary'
                      }}>
                        <AssignmentIcon sx={{ fontSize: 48, mb: 2, opacity: 0.5 }} />
                        <Typography variant="body1">
                          No active project assignments
                        </Typography>
                      </Box>
                    )}
                  </CardContent>
                </Card>

                {/* Recent Activity Section */}
                <Card sx={{ mb: 4 }}>
                  <CardContent sx={{ p: 3 }}>
                    <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
                      Recent Activity
                    </Typography>
                    
                    <Box>
                      <Box sx={{ 
                        display: 'flex', 
                        alignItems: 'flex-start', 
                        mb: 3,
                        pb: 2,
                        borderBottom: '1px solid #f0f0f0'
                      }}>
                        <Avatar sx={{ mr: 2, mt: 0.5, bgcolor: 'success.main' }}>
                          <CheckCircleIcon />
                        </Avatar>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="body1" sx={{ mb: 0.5 }}>
                            Completed Project: Theater System Installation
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {formatRelativeDate('2024-01-18')}
                          </Typography>
                        </Box>
                      </Box>
                      
                      <Box sx={{ 
                        display: 'flex', 
                        alignItems: 'flex-start', 
                        mb: 3,
                        pb: 2,
                        borderBottom: '1px solid #f0f0f0'
                      }}>
                        <Avatar sx={{ mr: 2, mt: 0.5, bgcolor: 'info.main' }}>
                          <SchoolIcon />
                        </Avatar>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="body1" sx={{ mb: 0.5 }}>
                            Earned Control4 Certification
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {formatRelativeDate('2024-01-13')}
                          </Typography>
                        </Box>
                      </Box>
                      
                      <Box sx={{ 
                        display: 'flex', 
                        alignItems: 'flex-start',
                        mb: 0
                      }}>
                        <Avatar sx={{ mr: 2, mt: 0.5, bgcolor: 'primary.main' }}>
                          <AssignmentIcon />
                        </Avatar>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="body1" sx={{ mb: 0.5 }}>
                            Assigned to new project
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {formatRelativeDate('2024-01-06')}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={6}>
                {/* Top Specialties Section */}
                <Card sx={{ mb: 4 }}>
                  <CardContent sx={{ p: 3 }}>
                    <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
                      Top Specialties
                    </Typography>
                    
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5 }}>
                      {skills.specialties.map((specialty, index) => (
                        <Chip
                          key={index}
                          label={specialty}
                          color="primary"
                          variant="outlined"
                          sx={{ mb: 1 }}
                        />
                      ))}
                    </Box>
                  </CardContent>
                </Card>

                {/* Performance Summary */}
                <Card sx={{ mb: 4 }}>
                  <CardContent sx={{ p: 3 }}>
                    <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
                      Performance Summary
                    </Typography>
                    
                    <Grid container spacing={3}>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                          Projects Completed
                        </Typography>
                        <Typography variant="h4" color="primary.main">
                          {performance.completedProjects}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                          Customer Satisfaction
                        </Typography>
                        <Typography variant="h4" color="success.main">
                          {performance.customerSatisfaction}/5
                        </Typography>
                      </Grid>
                      <Grid item xs={12}>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                          Last Review
                        </Typography>
                        <Typography variant="body1">
                          {performance.lastReviewDate || 'No reviews yet'}
                        </Typography>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Box>
        </TabPanel>

        {/* Projects Tab */}
        <TabPanel value={tabValue} index={1}>
          <Box sx={{ p: 3 }}>
            {/* Active Projects Section */}
            <Box sx={{ mb: 4 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6">
                  Active Projects
                </Typography>
                <Button 
                  variant="contained" 
                  startIcon={<AddIcon />}
                  onClick={() => setAssignProjectOpen(true)}
                >
                  Assign to Project
                </Button>
              </Box>
              
              <Grid container spacing={3}>
                {activeProjects.map((project) => (
                  <Grid item xs={12} md={6} key={project.projectId}>
                    <Card sx={{ 
                      height: '100%',
                      p: 2,
                      border: '1px solid #e0e0e0'
                    }}>
                      <CardContent sx={{ p: 2 }}>
                        <Typography variant="h6" sx={{ mb: 2 }}>
                          {project.projectName}
                        </Typography>
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                            Role: {project.role}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                            Started: {formatDate(project.startDate)}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Hours Worked: {project.hoursWorked}h
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Chip 
                            label={project.status} 
                            color="primary" 
                            size="small"
                          />
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {formatCurrency(project.hoursWorked * project.hourlyRate)}
                          </Typography>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Box>

            {/* Project History Section */}
            <Box sx={{ mb: 4 }}>
              <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
                Project History
              </Typography>
              
              <TableContainer component={Paper} sx={{ mt: 2 }}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ pl: 3, py: 2 }}>Project</TableCell>
                      <TableCell sx={{ py: 2 }}>Role</TableCell>
                      <TableCell sx={{ py: 2 }}>Status</TableCell>
                      <TableCell sx={{ py: 2 }}>Duration</TableCell>
                      <TableCell sx={{ py: 2 }}>Hours</TableCell>
                      <TableCell sx={{ py: 2 }}>Rate</TableCell>
                      <TableCell sx={{ pr: 3, py: 2 }}>Total</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {projectAssignments.map((project) => (
                      <TableRow key={project.projectId}>
                        <TableCell sx={{ pl: 3, py: 2 }}>{project.projectName}</TableCell>
                        <TableCell sx={{ py: 2 }}>{project.role}</TableCell>
                        <TableCell sx={{ py: 2 }}>
                          <Chip 
                            label={project.status} 
                            size="small" 
                            color={project.status === 'Active' ? 'primary' : project.status === 'Completed' ? 'success' : 'default'}
                          />
                        </TableCell>
                        <TableCell sx={{ py: 2 }}>
                          {formatDate(project.startDate)} {project.endDate && `- ${formatDate(project.endDate)}`}
                        </TableCell>
                        <TableCell sx={{ py: 2 }}>{project.hoursWorked}h</TableCell>
                        <TableCell sx={{ py: 2 }}>{formatCurrency(project.hourlyRate)}/hr</TableCell>
                        <TableCell sx={{ pr: 3, py: 2, fontWeight: 'bold' }}>
                          {formatCurrency(project.hoursWorked * project.hourlyRate)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>

            {/* Project Summary */}
            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Card sx={{ p: 2, minWidth: 300 }}>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
                    Summary
                  </Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Typography variant="body1">Total Hours:</Typography>
                    <Typography variant="body1" fontWeight="bold">
                      {projectAssignments.reduce((sum, p) => sum + p.hoursWorked, 0)}h
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body1">Total Earnings:</Typography>
                    <Typography variant="body1" fontWeight="bold">
                      {formatCurrency(projectAssignments.reduce((sum, p) => sum + (p.hoursWorked * p.hourlyRate), 0))}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Box>
          </Box>
        </TabPanel>

        {/* Skills & Certifications Tab */}
        <TabPanel value={tabValue} index={2}>
          <Box sx={{ p: 3 }}>
            {/* Certifications Section */}
            <Box sx={{ mb: 4 }}>
              <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
                Certifications
              </Typography>
              
              <Grid container spacing={3}>
                {skills.certifications.map((cert, index) => (
                  <Grid item xs={12} sm={6} md={4} key={index}>
                    <Card sx={{ 
                      height: '100%',
                      p: 2,
                      textAlign: 'center'
                    }}>
                      <CardContent sx={{ p: 2 }}>
                        <Avatar sx={{ 
                          width: 60, 
                          height: 60, 
                          mx: 'auto', 
                          mb: 2,
                          bgcolor: 'success.main'
                        }}>
                          <VerifiedIcon />
                        </Avatar>
                        <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600 }}>
                          {cert}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                          Valid Certification
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Expires: N/A
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Box>

            {/* Technical Skills Section */}
            <Box sx={{ mb: 4 }}>
              <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
                Technical Skills
              </Typography>
              
              <Card sx={{ p: 2 }}>
                <CardContent sx={{ p: 3, bgcolor: 'grey.50', borderRadius: 1 }}>
                  <Grid container spacing={3}>
                    <Grid item xs={12} sm={6} md={4}>
                      <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
                        Smart Home Systems
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                        {skills.specialties.filter(skill => 
                          ['Control4', 'Lutron', 'Sonos'].includes(skill)
                        ).map((skill) => (
                          <Chip 
                            key={skill} 
                            label={skill} 
                            size="small" 
                            variant="outlined"
                            color="primary"
                            sx={{ mb: 1 }}
                          />
                        ))}
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                      <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
                        Technical Systems
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                        {skills.specialties.filter(skill => 
                          ['Network Setup', 'Security', 'Audio Systems'].includes(skill)
                        ).map((skill) => (
                          <Chip 
                            key={skill} 
                            label={skill} 
                            size="small" 
                            variant="outlined"
                            color="secondary"
                            sx={{ mb: 1 }}
                          />
                        ))}
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                      <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
                        Other Skills
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                        {skills.specialties.filter(skill => 
                          !['Control4', 'Lutron', 'Sonos', 'Network Setup', 'Security', 'Audio Systems'].includes(skill)
                        ).map((skill) => (
                          <Chip 
                            key={skill} 
                            label={skill} 
                            size="small" 
                            variant="outlined"
                            sx={{ mb: 1 }}
                          />
                        ))}
                      </Box>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Box>

            {/* Experience Level Section */}
            <Box sx={{ mb: 4 }}>
              <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
                Experience Level
              </Typography>
              
              <Card sx={{ p: 2 }}>
                <CardContent sx={{ p: 3 }}>
                  <Grid container spacing={3}>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        Skill Level
                      </Typography>
                      <Chip label={skills.skillLevel} color="primary" size="medium" />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        Years of Experience
                      </Typography>
                      <Typography variant="h5" sx={{ fontWeight: 600 }}>
                        {skills.yearsExperience} years
                      </Typography>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Box>
          </Box>
        </TabPanel>

        {/* Schedule & Availability Tab */}
        <TabPanel value={tabValue} index={3}>
          <Box sx={{ p: 3 }}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                {/* Work Schedule Section */}
                <Box sx={{ mb: 4 }}>
                  <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
                    Work Schedule
                  </Typography>
                  
                  <Card sx={{ p: 2 }}>
                    <CardContent sx={{ p: 3 }}>
                      <TableContainer>
                        <Table>
                          <TableBody>
                            {Object.entries(availabilityData.schedule).map(([day, schedule]) => (
                              <TableRow key={day}>
                                <TableCell sx={{ pl: 0, py: 2, border: 'none' }}>
                                  <Typography variant="body1" sx={{ fontWeight: 500, textTransform: 'capitalize' }}>
                                    {day}
                                  </Typography>
                                </TableCell>
                                <TableCell sx={{ pr: 0, py: 2, border: 'none' }} align="right">
                                  <Typography variant="body1">
                                    {schedule.available ? formatTimeRange(schedule.start, schedule.end) : 'Not Available'}
                                  </Typography>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </CardContent>
                  </Card>
                </Box>

                {/* Availability Settings */}
                <Box sx={{ mb: 4 }}>
                  <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
                    Availability Settings
                  </Typography>
                  
                  <Card sx={{ p: 2 }}>
                    <CardContent sx={{ p: 3 }}>
                      <Grid container spacing={3}>
                        <Grid item xs={12} sm={6}>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                            Available for Travel
                          </Typography>
                          <Typography variant="h6">
                            {availabilityData.availableForTravel ? 'Yes' : 'No'}
                          </Typography>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                            Current Status
                          </Typography>
                          <Chip 
                            label={currentAssignments.activeProjects.length > 0 ? 'On Project' : 'Available'} 
                            color={currentAssignments.activeProjects.length > 0 ? 'warning' : 'success'}
                            size="medium"
                          />
                        </Grid>
                        <Grid item xs={12}>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                            Next Available
                          </Typography>
                          <Typography variant="h6">
                            {formatDate(currentAssignments.nextAvailable)}
                          </Typography>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                </Box>
              </Grid>

              <Grid item xs={12} md={6}>
                {/* Current Projects */}
                <Box sx={{ mb: 4 }}>
                  <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
                    Current Projects
                  </Typography>
                  
                  <Card sx={{ p: 2 }}>
                    <CardContent sx={{ p: 3 }}>
                      <Box sx={{ textAlign: 'center', mb: 3 }}>
                        <Typography variant="h3" color="primary.main" sx={{ fontWeight: 600 }}>
                          {currentAssignments.activeProjects.length}
                        </Typography>
                        <Typography variant="body1" color="text.secondary">
                          Active Project{currentAssignments.activeProjects.length !== 1 ? 's' : ''}
                        </Typography>
                      </Box>
                      
                      <Box sx={{ textAlign: 'center', pt: 2, borderTop: '1px solid #f0f0f0' }}>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                          Total Completed Projects
                        </Typography>
                        <Typography variant="h4" sx={{ fontWeight: 600 }}>
                          {performance.completedProjects}
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Box>

                {/* Time Off Requests */}
                <Box sx={{ mb: 4 }}>
                  <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
                    Time Off Requests
                  </Typography>
                  
                  <Card sx={{ p: 2 }}>
                    <CardContent sx={{ p: 3 }}>
                      {availabilityData.timeOff.length === 0 ? (
                        <Box sx={{ 
                          textAlign: 'center', 
                          py: 4,
                          color: 'text.secondary'
                        }}>
                          <ScheduleIcon sx={{ fontSize: 48, mb: 2, opacity: 0.5 }} />
                          <Typography variant="body1">
                            No time off requests
                          </Typography>
                        </Box>
                      ) : (
                        <List>
                          {availabilityData.timeOff.map((timeOff) => (
                            <ListItem key={timeOff.id} divider sx={{ px: 0 }}>
                              <ListItemText
                                primary={`${timeOff.type} - ${formatDate(timeOff.startDate)} to ${formatDate(timeOff.endDate)}`}
                                secondary={`Status: ${timeOff.status} • ${timeOff.reason || 'No reason provided'}`}
                              />
                              <Chip 
                                label={timeOff.status} 
                                size="small" 
                                color={timeOff.status === 'Approved' ? 'success' : timeOff.status === 'Denied' ? 'error' : 'warning'}
                              />
                            </ListItem>
                          ))}
                        </List>
                      )}
                    </CardContent>
                  </Card>
                </Box>
              </Grid>
            </Grid>
          </Box>
        </TabPanel>

        {/* Employment Details Tab */}
        <TabPanel value={tabValue} index={4}>
          <Box sx={{ p: 3 }}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                {/* Personal Information */}
                <Box sx={{ mb: 4 }}>
                  <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
                    Personal Information
                  </Typography>
                  
                  <Card sx={{ p: 2 }}>
                    <CardContent sx={{ p: 3 }}>
                      <Grid container spacing={3}>
                        <Grid item xs={12}>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                            Full Name
                          </Typography>
                          <Typography variant="body1">
                            {employeeFullName}
                          </Typography>
                        </Grid>
                        <Grid item xs={12}>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                            Email Address
                          </Typography>
                          <Typography variant="body1">
                            {personalInfo.email}
                          </Typography>
                        </Grid>
                        <Grid item xs={12}>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                            Phone Number
                          </Typography>
                          <Typography variant="body1">
                            {personalInfo.phone}
                          </Typography>
                        </Grid>
                        {personalInfo.address && (
                          <Grid item xs={12}>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                              Address
                            </Typography>
                            <Typography variant="body1">
                              {personalInfo.address.street}<br />
                              {personalInfo.address.city}, {personalInfo.address.state} {personalInfo.address.zipCode}
                            </Typography>
                          </Grid>
                        )}
                        {personalInfo.emergencyContact && (
                          <Grid item xs={12}>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                              Emergency Contact
                            </Typography>
                            <Typography variant="body1">
                              {personalInfo.emergencyContact.name}<br />
                              {personalInfo.emergencyContact.relationship}<br />
                              {personalInfo.emergencyContact.phone}
                            </Typography>
                          </Grid>
                        )}
                      </Grid>
                    </CardContent>
                  </Card>
                </Box>
              </Grid>

              <Grid item xs={12} md={6}>
                {/* Employment Information */}
                <Box sx={{ mb: 4 }}>
                  <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
                    Employment Information
                  </Typography>
                  
                  <Card sx={{ p: 2 }}>
                    <CardContent sx={{ p: 3 }}>
                      <Grid container spacing={3}>
                        <Grid item xs={12} sm={6}>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                            Employee ID
                          </Typography>
                          <Typography variant="body1">
                            {employment.employeeId}
                          </Typography>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                            Job Title
                          </Typography>
                          <Typography variant="body1">
                            {employment.title}
                          </Typography>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                            Department
                          </Typography>
                          <Typography variant="body1">
                            {employment.department}
                          </Typography>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                            Role
                          </Typography>
                          <Typography variant="body1">
                            {employment.role}
                          </Typography>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                            Hire Date
                          </Typography>
                          <Typography variant="body1">
                            {employment.hireDate}
                          </Typography>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                            Employment Type
                          </Typography>
                          <Typography variant="body1">
                            {employment.employmentType}
                          </Typography>
                        </Grid>
                        <Grid item xs={12}>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                            Status
                          </Typography>
                          <Chip 
                            label={employment.status}
                            color={getStatusColor(employment.status) as any}
                          />
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                </Box>

                {/* Compensation */}
                <Box sx={{ mb: 4 }}>
                  <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
                    Compensation
                  </Typography>
                  
                  <Card sx={{ p: 2 }}>
                    <CardContent sx={{ p: 3 }}>
                      <Grid container spacing={3}>
                        <Grid item xs={12}>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                            Pay Type
                          </Typography>
                          <Typography variant="body1">
                            {compensation.payType}
                          </Typography>
                        </Grid>
                        {compensation.hourlyRate && (
                          <Grid item xs={12} sm={6}>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                              Hourly Rate
                            </Typography>
                            <Typography variant="body1" sx={{ fontWeight: 600 }}>
                              {formatCurrency(compensation.hourlyRate)}
                            </Typography>
                          </Grid>
                        )}
                        {compensation.salary && (
                          <Grid item xs={12} sm={6}>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                              Annual Salary
                            </Typography>
                            <Typography variant="body1" sx={{ fontWeight: 600 }}>
                              {formatCurrency(compensation.salary)}
                            </Typography>
                          </Grid>
                        )}
                        {compensation.overtimeRate && (
                          <Grid item xs={12} sm={6}>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                              Overtime Rate
                            </Typography>
                            <Typography variant="body1" sx={{ fontWeight: 600 }}>
                              {formatCurrency(compensation.overtimeRate)}
                            </Typography>
                          </Grid>
                        )}
                      </Grid>
                    </CardContent>
                  </Card>
                </Box>
              </Grid>
            </Grid>
          </Box>
        </TabPanel>
      </Paper>

      {/* Employee Menu */}
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={() => setMenuAnchor(null)}
      >
        <MenuItem onClick={() => setAddNoteOpen(true)}>
          <NotesIcon sx={{ mr: 2 }} />
          Add Note
        </MenuItem>
        <MenuItem>
          <HistoryIcon sx={{ mr: 2 }} />
          View History
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleEditEmployee}>
          <EditIcon sx={{ mr: 2 }} />
          Edit Employee
        </MenuItem>
      </Menu>

      {/* Edit Employee Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="lg" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="h6">Edit Employee - {employeeFullName}</Typography>
            <IconButton onClick={() => setEditDialogOpen(false)}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          <EmployeeEditForm 
            employee={employee} 
            onSave={(updatedEmployee: Employee) => {
              setEmployee(updatedEmployee);
              saveEmployee(updatedEmployee);
              setEditDialogOpen(false);
            }}
            onCancel={() => setEditDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Assign Project Dialog */}
      <Dialog open={assignProjectOpen} onClose={() => setAssignProjectOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="h6">Assign to Project - {employeeFullName}</Typography>
            <IconButton onClick={() => setAssignProjectOpen(false)}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          <ProjectAssignmentForm 
            employee={employee} 
            onAssign={(assignment: any) => {
              // TODO: Add to actual project assignments
              console.log('New assignment:', assignment);
              setAssignProjectOpen(false);
              // Show success message
              alert(`Successfully assigned ${employeeFullName} to project!`);
            }}
            onCancel={() => setAssignProjectOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </Container>
  );
} 