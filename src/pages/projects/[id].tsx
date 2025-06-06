import React, { useState, useEffect, useMemo } from 'react';
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
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  CircularProgress,
  Alert,
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
  Fab,
  InputAdornment,
  Tooltip,
  Tab,
  Tabs,
  Menu,
  TableSortLabel,
  FormControlLabel,
  Switch,
  Badge,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  AttachMoney as MoneyIcon,
  TrendingUp as TrendingUpIcon,
  Person as PersonIcon,
  Schedule as ScheduleIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Assignment as AssignmentIcon,
  Business as BusinessIcon,
  LocationOn as LocationIcon,
  CalendarToday as CalendarIcon,
  Add as AddIcon,
  MoreVert as MoreVertIcon,
  Delete as DeleteIcon,
  Receipt as ReceiptIcon,
  PieChart as PieChartIcon,
  BarChart as BarChartIcon,
  FileDownload as FileDownloadIcon,
  FilterList as FilterListIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Group as GroupIcon,
  Task as TaskIcon,
} from '@mui/icons-material';
import NextLink from 'next/link';
import { useRouter } from 'next/router';
import { getProjectById, Project, saveProject, generateId } from '../../utils/dataStorage';
import InlineEditField from '../../components/common/InlineEditField';
import TaskManager, { Task } from '../../components/common/TaskManager';
import EmployeeSelector from '../../components/common/EmployeeSelector';
import { Employee } from '../../utils/employeeStorage';

interface Expense {
  id: string;
  date: string;
  description: string;
  category: 'Equipment' | 'Labor' | 'Materials' | 'Subcontractors' | 'Travel' | 'Permits' | 'Other';
  amount: number;
  vendor: string;
  receiptNumber?: string;
  approved: boolean;
  notes?: string;
}

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
      id={`project-tabpanel-${index}`}
      aria-labelledby={`project-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

export default function ProjectDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tabValue, setTabValue] = useState(0);
  
  // Edit mode state
  const [isEditMode, setIsEditMode] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  
  // Dialog states
  const [addExpenseOpen, setAddExpenseOpen] = useState(false);
  const [editProjectOpen, setEditProjectOpen] = useState(false);
  const [editExpenseOpen, setEditExpenseOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
  const [employeeSelectorOpen, setEmployeeSelectorOpen] = useState(false);
  
  // Menu states
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [expenseMenuAnchor, setExpenseMenuAnchor] = useState<null | HTMLElement>(null);
  const [selectedExpenseId, setSelectedExpenseId] = useState<string>('');
  
  // Filter states
  const [expenseFilter, setExpenseFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [showApprovedOnly, setShowApprovedOnly] = useState(false);
  
  // Form states
  const [newExpense, setNewExpense] = useState<Partial<Expense>>({
    description: '',
    category: 'Materials',
    amount: 0,
    vendor: '',
    receiptNumber: '',
    notes: '',
  });

  // Sample employees data - in real app, this would come from API
  const [employees] = useState<Employee[]>([
    {
      id: 'emp1',
      personalInfo: {
        firstName: 'Sarah',
        lastName: 'Williams',
        email: 'sarah@company.com',
        phone: '(555) 0123',
      },
      employment: {
        employeeId: 'EMP001',
        title: 'Lead Installer',
        department: 'Installation',
        role: 'Lead Installer',
        hireDate: '2022-03-15',
        employmentType: 'Full Time',
        status: 'Active'
      },
      compensation: {
        hourlyRate: 85,
        payType: 'Hourly'
      },
      skills: {
        certifications: ['Control4 Certified', 'Lutron Certified'],
        specialties: ['Control4', 'Lutron', 'Network Setup', 'Audio Systems', 'Security'],
        skillLevel: 'Expert',
        yearsExperience: 8
      },
      availability: {
        schedule: {
          monday: { start: '08:00', end: '17:00', available: true },
          tuesday: { start: '08:00', end: '17:00', available: true },
          wednesday: { start: '08:00', end: '17:00', available: true },
          thursday: { start: '08:00', end: '17:00', available: true },
          friday: { start: '08:00', end: '17:00', available: true },
          saturday: { start: '09:00', end: '15:00', available: true },
          sunday: { start: '00:00', end: '00:00', available: false }
        },
        timeOff: [],
        availableForTravel: true
      },
      performance: {
        rating: 4.9,
        completedProjects: 127,
        customerSatisfaction: 4.8
      },
      currentAssignments: {
        activeProjects: ['proj1', 'proj2'],
        nextAvailable: '2024-02-15'
      },
      metadata: {
        createdAt: '2022-03-15T10:00:00Z',
        createdBy: 'admin',
        lastModified: '2024-01-15T14:30:00Z',
        modifiedBy: 'admin'
      }
    },
    {
      id: 'emp2',
      personalInfo: {
        firstName: 'Mike',
        lastName: 'Chen',
        email: 'mike@company.com',
        phone: '(555) 0456',
      },
      employment: {
        employeeId: 'EMP002',
        title: 'Project Manager',
        department: 'Management',
        role: 'Project Manager',
        hireDate: '2021-08-01',
        employmentType: 'Full Time',
        status: 'Active'
      },
      compensation: {
        salary: 95000,
        payType: 'Salary'
      },
      skills: {
        certifications: ['PMP Certified', 'Control4 Certified'],
        specialties: ['Project Management', 'Control4', 'Network Setup', 'Client Relations'],
        skillLevel: 'Expert',
        yearsExperience: 12
      },
      availability: {
        schedule: {
          monday: { start: '07:30', end: '17:30', available: true },
          tuesday: { start: '07:30', end: '17:30', available: true },
          wednesday: { start: '07:30', end: '17:30', available: true },
          thursday: { start: '07:30', end: '17:30', available: true },
          friday: { start: '07:30', end: '17:30', available: true },
          saturday: { start: '00:00', end: '00:00', available: false },
          sunday: { start: '00:00', end: '00:00', available: false }
        },
        timeOff: [],
        availableForTravel: true
      },
      performance: {
        rating: 4.7,
        completedProjects: 89,
        customerSatisfaction: 4.6
      },
      currentAssignments: {
        activeProjects: ['proj1', 'proj3', 'proj4'],
        nextAvailable: '2024-02-20'
      },
      metadata: {
        createdAt: '2021-08-01T09:00:00Z',
        createdBy: 'admin',
        lastModified: '2024-01-10T16:20:00Z',
        modifiedBy: 'admin'
      }
    },
    {
      id: 'emp3',
      personalInfo: {
        firstName: 'Tom',
        lastName: 'Rodriguez',
        email: 'tom@company.com',
        phone: '(555) 0789',
      },
      employment: {
        employeeId: 'EMP003',
        title: 'Audio Specialist',
        department: 'Installation',
        role: 'Technician',
        hireDate: '2023-01-10',
        employmentType: 'Part Time',
        status: 'Active'
      },
      compensation: {
        hourlyRate: 75,
        payType: 'Hourly'
      },
      skills: {
        certifications: ['Audio Engineering', 'Sonos Certified'],
        specialties: ['Audio Systems', 'Theater Systems', 'Sonos', 'Speaker Installation'],
        skillLevel: 'Advanced',
        yearsExperience: 5
      },
      availability: {
        schedule: {
          monday: { start: '10:00', end: '18:00', available: true },
          tuesday: { start: '10:00', end: '18:00', available: true },
          wednesday: { start: '10:00', end: '18:00', available: true },
          thursday: { start: '00:00', end: '00:00', available: false },
          friday: { start: '10:00', end: '18:00', available: true },
          saturday: { start: '09:00', end: '15:00', available: true },
          sunday: { start: '00:00', end: '00:00', available: false }
        },
        timeOff: [],
        availableForTravel: false
      },
      performance: {
        rating: 4.8,
        completedProjects: 45,
        customerSatisfaction: 4.9
      },
      currentAssignments: {
        activeProjects: ['proj1'],
        nextAvailable: '2024-02-05'
      },
      metadata: {
        createdAt: '2023-01-10T11:00:00Z',
        createdBy: 'admin',
        lastModified: '2024-01-05T15:45:00Z',
        modifiedBy: 'admin'
      }
    },
  ]);

  // Sample tasks data - in real app, this would come from project data
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: 'task1',
      name: 'Site survey and planning',
      description: 'Initial site visit and system planning',
      category: 'Planning',
      status: 'Complete',
      priority: 'High',
      assignedTo: 'emp2',
      assignedToName: 'Mike Chen',
      dueDate: '2024-01-15',
      estimatedHours: 4,
      actualHours: 3.5,
      progress: 100,
      createdAt: '2024-01-10',
      completedAt: '2024-01-15',
    },
    {
      id: 'task2',
      name: 'Install bedroom speakers',
      description: 'Install and configure speakers in master bedroom',
      category: 'Installation',
      status: 'Not Started',
      priority: 'High',
      assignedTo: 'emp3',
      assignedToName: 'Tom Rodriguez',
      dueDate: '2024-01-25',
      estimatedHours: 2,
      createdAt: '2024-01-20',
    },
    {
      id: 'task3',
      name: 'Configure Control4 system',
      description: 'Set up and configure main control system',
      category: 'Installation',
      status: 'In Progress',
      priority: 'Medium',
      assignedTo: 'emp1',
      assignedToName: 'Sarah Williams',
      dueDate: '2024-01-30',
      estimatedHours: 6,
      actualHours: 2,
      progress: 45,
      createdAt: '2024-01-18',
    },
  ]);

  // Sample expenses data - in real app, this would come from the project data
  const [expenses, setExpenses] = useState<Expense[]>([
    {
      id: 'exp1',
      date: '2024-01-15',
      description: 'Smart Home Hub Installation',
      category: 'Equipment',
      amount: 1250.00,
      vendor: 'SmartTech Solutions',
      receiptNumber: 'STS-2024-001',
      approved: true,
      notes: 'Main control hub for automation system'
    },
    {
      id: 'exp2',
      date: '2024-01-18',
      description: 'Electrical Wiring Installation',
      category: 'Labor',
      amount: 2800.00,
      vendor: 'Elite Electrical',
      receiptNumber: 'EE-INV-445',
      approved: true,
      notes: 'Wiring for smart switches and outlets'
    },
    {
      id: 'exp3',
      date: '2024-01-20',
      description: 'Smart Lighting System',
      category: 'Equipment',
      amount: 1850.00,
      vendor: 'Illumination Pro',
      receiptNumber: 'IP-2024-078',
      approved: false,
      notes: 'LED smart bulbs and dimmer switches'
    },
    {
      id: 'exp4',
      date: '2024-01-22',
      description: 'Security Camera Installation',
      category: 'Subcontractors',
      amount: 3200.00,
      vendor: 'SecureView Systems',
      receiptNumber: 'SVS-445-2024',
      approved: true,
      notes: '8-camera security system installation'
    },
  ]);

  // Load project data
  useEffect(() => {
    const loadProject = async () => {
      if (!id || typeof id !== 'string') return;
      
      setLoading(true);
      setError(null);
      
      try {
        const projectData = getProjectById(id);
        if (projectData) {
          setProject(projectData);
        } else {
          setError('Project not found');
        }
      } catch (err) {
        setError('Error loading project');
        console.error('Error loading project:', err);
      } finally {
        setLoading(false);
      }
    };

    loadProject();
  }, [id]);

  // Financial calculations
  const financialMetrics = useMemo(() => {
    if (!project || !expenses) return null;

    const contractAmount = project.projectData?.contractAmount || 0;
    const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);
    const approvedExpenses = expenses.filter(exp => exp.approved).reduce((sum, exp) => sum + exp.amount, 0);
    const pendingExpenses = expenses.filter(exp => !exp.approved).reduce((sum, exp) => sum + exp.amount, 0);
    
    const grossProfit = contractAmount - approvedExpenses;
    const profitMargin = contractAmount > 0 ? (grossProfit / contractAmount) * 100 : 0;

    // Category breakdown
    const categoryTotals = expenses.reduce((acc, exp) => {
      acc[exp.category] = (acc[exp.category] || 0) + exp.amount;
      return acc;
    }, {} as Record<string, number>);

    return {
      contractAmount,
      totalExpenses,
      approvedExpenses,
      pendingExpenses,
      grossProfit,
      profitMargin,
      categoryTotals,
    };
  }, [project, expenses]);

  // Filtered expenses
  const filteredExpenses = useMemo(() => {
    return expenses.filter(expense => {
      const matchesFilter = expenseFilter === 'All' || expense.category === expenseFilter;
      const matchesSearch = expense.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          expense.vendor.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesApproval = !showApprovedOnly || expense.approved;
      
      return matchesFilter && matchesSearch && matchesApproval;
    });
  }, [expenses, expenseFilter, searchTerm, showApprovedOnly]);

  const handleAddExpense = () => {
    if (!newExpense.description || !newExpense.amount) return;
    
    const expense: Expense = {
      id: generateId('exp'),
      date: new Date().toISOString().split('T')[0],
      description: newExpense.description,
      category: newExpense.category as Expense['category'],
      amount: newExpense.amount,
      vendor: newExpense.vendor || '',
      receiptNumber: newExpense.receiptNumber,
      approved: false,
      notes: newExpense.notes,
    };
    
    setExpenses([...expenses, expense]);
    setNewExpense({
      description: '',
      category: 'Materials',
      amount: 0,
      vendor: '',
      receiptNumber: '',
      notes: '',
    });
    setAddExpenseOpen(false);
  };

  const handleDeleteExpense = (expenseId: string) => {
    setExpenses(expenses.filter(exp => exp.id !== expenseId));
    setExpenseMenuAnchor(null);
  };

  const handleApproveExpense = (expenseId: string) => {
    setExpenses(expenses.map(exp => 
      exp.id === expenseId ? { ...exp, approved: !exp.approved } : exp
    ));
    setExpenseMenuAnchor(null);
  };

  const formatCurrency = (amount: number) => `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Complete': return 'success';
      case 'Not Started': return 'info';
      case 'In Progress': return 'primary';
      case 'On Hold': return 'warning';
      case 'Cancelled': return 'error';
      default: return 'default';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return 'error';
      case 'Medium': return 'warning';
      case 'Low': return 'success';
      default: return 'default';
    }
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'Equipment': '#1976d2',
      'Labor': '#388e3c',
      'Materials': '#f57c00',
      'Subcontractors': '#7b1fa2',
      'Travel': '#0288d1',
      'Permits': '#5d4037',
      'Other': '#616161'
    };
    return colors[category] || '#616161';
  };

  // Project editing functions
  const handleProjectSave = async (field: string, value: string | number) => {
    if (!project) return;
    
    setIsSaving(true);
    try {
      const updatedProject = {
        ...project,
        [field]: value,
        lastUpdate: new Date().toISOString().split('T')[0],
      };
      
      setProject(updatedProject);
      saveProject(updatedProject);
      setLastSaved(new Date());
      setHasUnsavedChanges(false);
    } catch (error) {
      console.error('Error saving project:', error);
      throw error;
    } finally {
      setIsSaving(false);
    }
  };

  const handleEditModeToggle = () => {
    if (isEditMode && hasUnsavedChanges) {
      // Show confirmation dialog if there are unsaved changes
      const confirmLeave = window.confirm('You have unsaved changes. Are you sure you want to exit edit mode?');
      if (!confirmLeave) return;
    }
    setIsEditMode(!isEditMode);
    setHasUnsavedChanges(false);
  };

  // Task management functions
  const handleTaskUpdate = async (task: Task) => {
    setTasks(tasks.map(t => t.id === task.id ? task : t));
  };

  const handleTaskCreate = async (taskData: Omit<Task, 'id' | 'createdAt'>) => {
    const newTask: Task = {
      ...taskData,
      id: generateId('task'),
      createdAt: new Date().toISOString(),
    };
    setTasks([...tasks, newTask]);
  };

  const handleTaskDelete = async (taskId: string) => {
    setTasks(tasks.filter(t => t.id !== taskId));
  };

  const handleTaskReorder = async (reorderedTasks: Task[]) => {
    setTasks(reorderedTasks);
  };

  // Employee assignment functions
  const handleEmployeeAssign = (employee: Employee, role?: string) => {
    if (!project) return;
    
    const updatedProject = {
      ...project,
      team: [...project.team, employee.id],
      lastUpdate: new Date().toISOString().split('T')[0],
    };
    
    setProject(updatedProject);
    saveProject(updatedProject);
    setEmployeeSelectorOpen(false);
  };

  const validateProjectField = (field: string, value: string | number): string | null => {
    switch (field) {
      case 'name':
        return !value || value.toString().trim() === '' ? 'Project name is required' : null;
      case 'budget':
        return typeof value === 'number' && value < 0 ? 'Budget cannot be negative' : null;
      case 'endDate':
        if (project?.startDate && value) {
          const startDate = new Date(project.startDate);
          const endDate = new Date(value.toString());
          return endDate < startDate ? 'End date cannot be before start date' : null;
        }
        return null;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error || !project) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Alert severity="error">
          {error || 'Project not found'}
        </Alert>
        <Button 
          variant="outlined" 
          startIcon={<ArrowBackIcon />}
          onClick={() => router.push('/projects')}
          sx={{ mt: 2 }}
        >
          Back to Projects
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Breadcrumbs */}
      <Breadcrumbs sx={{ mb: 2 }}>
        <Link component={NextLink} href="/" color="inherit" underline="hover">
          Dashboard
        </Link>
        <Link component={NextLink} href="/projects" color="inherit" underline="hover">
          Projects
        </Link>
        <Typography color="text.primary">{project.name}</Typography>
      </Breadcrumbs>

      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 4 }}>
        <Box sx={{ flex: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <IconButton onClick={() => router.push('/projects')} sx={{ mr: 2 }}>
              <ArrowBackIcon />
            </IconButton>
            <Box sx={{ flex: 1 }}>
              {isEditMode ? (
                <InlineEditField
                  value={project.name}
                  onSave={(value) => handleProjectSave('name', value)}
                  type="text"
                  placeholder="Project name"
                  validation={(value) => validateProjectField('name', value)}
                  required
                />
              ) : (
                <Typography variant="h4" component="h1" gutterBottom>
                  {project.name}
                </Typography>
              )}
              
              {isEditMode ? (
                <InlineEditField
                  value={project.description}
                  onSave={(value) => handleProjectSave('description', value)}
                  type="multiline"
                  placeholder="Project description"
                  maxRows={3}
                />
              ) : (
                <Typography variant="body1" color="text.secondary" gutterBottom>
                  {project.description}
                </Typography>
              )}
              
              <Box sx={{ display: 'flex', gap: 1, mt: 1, alignItems: 'center' }}>
                {isEditMode ? (
                  <>
                    <InlineEditField
                      value={project.status}
                      onSave={(value) => handleProjectSave('status', value)}
                      type="select"
                      options={['Planning', 'In Progress', 'Completed', 'On Hold', 'Cancelled']}
                    />
                    <InlineEditField
                      value={project.priority}
                      onSave={(value) => handleProjectSave('priority', value)}
                      type="select"
                      options={['High', 'Medium', 'Low']}
                    />
                  </>
                ) : (
                  <>
                    <Chip
                      label={project.status}
                      size="small"
                      color={getStatusColor(project.status) as any}
                    />
                    <Chip
                      label={`${project.priority} Priority`}
                      size="small"
                      color={getPriorityColor(project.priority) as any}
                    />
                  </>
                )}
                
                {/* Edit mode indicators */}
                {isEditMode && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, ml: 2 }}>
                    {isSaving && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <CircularProgress size={16} />
                        <Typography variant="caption" color="text.secondary">
                          Saving...
                        </Typography>
                      </Box>
                    )}
                    {lastSaved && !isSaving && (
                      <Typography variant="caption" color="success.main">
                        Saved {lastSaved.toLocaleTimeString()}
                      </Typography>
                    )}
                  </Box>
                )}
              </Box>
            </Box>
          </Box>
        </Box>
        
        <Box sx={{ display: 'flex', gap: 2 }}>
          {isEditMode ? (
            <>
              <Button 
                variant="contained" 
                color="success"
                startIcon={<SaveIcon />}
                onClick={handleEditModeToggle}
                disabled={isSaving}
              >
                Save & Exit
              </Button>
              <Button 
                variant="outlined" 
                startIcon={<CancelIcon />}
                onClick={handleEditModeToggle}
                disabled={isSaving}
              >
                Cancel
              </Button>
            </>
          ) : (
            <>
              <Button 
                variant="outlined" 
                startIcon={<EditIcon />} 
                onClick={handleEditModeToggle}
              >
                Edit Project
              </Button>
              <Button
                variant="outlined"
                startIcon={<GroupIcon />}
                onClick={() => setEmployeeSelectorOpen(true)}
              >
                Add Team Member
              </Button>
            </>
          )}
          <IconButton onClick={(e) => setMenuAnchor(e.currentTarget)}>
            <MoreVertIcon />
          </IconButton>
        </Box>
      </Box>

      {/* Financial Summary Cards */}
      {financialMetrics && (
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ textAlign: 'center', p: 2, bgcolor: 'primary.main', color: 'white' }}>
              <MoneyIcon sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h5">
                {formatCurrency(financialMetrics.contractAmount)}
              </Typography>
              <Typography variant="body2">
                Contract Value
              </Typography>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ textAlign: 'center', p: 2, bgcolor: 'warning.main', color: 'white' }}>
              <TrendingUpIcon sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h5">
                {formatCurrency(financialMetrics.approvedExpenses)}
              </Typography>
              <Typography variant="body2">
                Approved Expenses
              </Typography>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ textAlign: 'center', p: 2, bgcolor: financialMetrics.grossProfit >= 0 ? 'success.main' : 'error.main', color: 'white' }}>
              <AssignmentIcon sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h5">
                {formatCurrency(financialMetrics.grossProfit)}
              </Typography>
              <Typography variant="body2">
                Current Profit ({financialMetrics.profitMargin.toFixed(1)}%)
              </Typography>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ textAlign: 'center', p: 2, bgcolor: financialMetrics.pendingExpenses > 0 ? 'info.main' : 'success.main', color: 'white' }}>
              <WarningIcon sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h5">
                {formatCurrency(financialMetrics.pendingExpenses)}
              </Typography>
              <Typography variant="body2">
                Pending Approval
              </Typography>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Progress Bar */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
          <Typography variant="h6">Project Progress</Typography>
          <Typography variant="h6" color="primary">
            {project.progress}%
          </Typography>
        </Box>
        <LinearProgress 
          variant="determinate" 
          value={project.progress} 
          sx={{ height: 12, borderRadius: 6 }}
          color={project.progress === 100 ? 'success' : 'primary'}
        />
      </Paper>

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
          <Tab label="Overview" />
          <Tab label="Tasks & Team" />
          <Tab label="Expense Tracking" />
          <Tab label="Financial Analysis" />
        </Tabs>

        {/* Overview Tab */}
        <TabPanel value={tabValue} index={0}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>
                Project Details
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <PersonIcon sx={{ mr: 2 }} />
                <Box sx={{ flex: 1 }}>
                  <Typography variant="subtitle2" color="text.secondary">Customer</Typography>
                  {isEditMode ? (
                    <InlineEditField
                      value={project.customer}
                      onSave={(value) => handleProjectSave('customer', value)}
                      type="text"
                      placeholder="Customer name"
                    />
                  ) : (
                    <Typography variant="body1">{project.customer}</Typography>
                  )}
                </Box>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <LocationIcon sx={{ mr: 2 }} />
                <Box sx={{ flex: 1 }}>
                  <Typography variant="subtitle2" color="text.secondary">Property</Typography>
                  {isEditMode ? (
                    <InlineEditField
                      value={project.property}
                      onSave={(value) => handleProjectSave('property', value)}
                      type="text"
                      placeholder="Property address"
                    />
                  ) : (
                    <Typography variant="body1">{project.property}</Typography>
                  )}
                </Box>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <CalendarIcon sx={{ mr: 2 }} />
                <Box sx={{ flex: 1 }}>
                  <Typography variant="subtitle2" color="text.secondary">Timeline</Typography>
                  {isEditMode ? (
                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                      <InlineEditField
                        value={project.startDate}
                        onSave={(value) => handleProjectSave('startDate', value)}
                        type="text"
                        placeholder="Start date"
                      />
                      <Typography variant="body2">to</Typography>
                      <InlineEditField
                        value={project.endDate}
                        onSave={(value) => handleProjectSave('endDate', value)}
                        type="text"
                        placeholder="End date"
                        validation={(value) => validateProjectField('endDate', value)}
                      />
                    </Box>
                  ) : (
                    <Typography variant="body1">{project.startDate} - {project.endDate}</Typography>
                  )}
                </Box>
              </Box>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>
                Budget Overview
              </Typography>
              {isEditMode ? (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                    Contract Amount
                  </Typography>
                  <InlineEditField
                    value={project.projectData?.contractAmount || 0}
                    onSave={(value) => handleProjectSave('budget', value)}
                    type="currency"
                    placeholder="Contract amount"
                    validation={(value) => validateProjectField('budget', value)}
                  />
                </Box>
              ) : (
                financialMetrics && Object.entries(financialMetrics.categoryTotals).map(([category, amount]) => (
                  <Box key={category} sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Box 
                        sx={{ 
                          width: 12, 
                          height: 12, 
                          borderRadius: '50%', 
                          bgcolor: getCategoryColor(category),
                          mr: 1 
                        }} 
                      />
                      <Typography variant="body2">{category}</Typography>
                    </Box>
                    <Typography variant="body2" fontWeight="bold">
                      {formatCurrency(amount)}
                    </Typography>
                  </Box>
                ))
              )}
            </Grid>
          </Grid>
        </TabPanel>

        {/* Tasks & Team Tab */}
        <TabPanel value={tabValue} index={1}>
          <TaskManager
            projectId={project.id}
            tasks={tasks}
            onTaskUpdate={handleTaskUpdate}
            onTaskCreate={handleTaskCreate}
            onTaskDelete={handleTaskDelete}
            onTaskReorder={handleTaskReorder}
            employees={employees.map(emp => ({
              id: emp.id,
              name: `${emp.personalInfo.firstName} ${emp.personalInfo.lastName}`,
              avatar: emp.personalInfo.avatar
            }))}
            readonly={false}
          />
        </TabPanel>

        {/* Expense Tracking Tab */}
        <TabPanel value={tabValue} index={2}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6">Expense Ledger</Typography>
            <Button 
              variant="contained" 
              startIcon={<AddIcon />}
              onClick={() => setAddExpenseOpen(true)}
            >
              Add Expense
            </Button>
          </Box>

          {/* Filters */}
          <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
            <TextField
              size="small"
              placeholder="Search expenses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <FilterListIcon />
                  </InputAdornment>
                ),
              }}
            />
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Category</InputLabel>
              <Select
                value={expenseFilter}
                label="Category"
                onChange={(e) => setExpenseFilter(e.target.value)}
              >
                <MenuItem value="All">All</MenuItem>
                <MenuItem value="Equipment">Equipment</MenuItem>
                <MenuItem value="Labor">Labor</MenuItem>
                <MenuItem value="Materials">Materials</MenuItem>
                <MenuItem value="Subcontractors">Subcontractors</MenuItem>
                <MenuItem value="Travel">Travel</MenuItem>
                <MenuItem value="Permits">Permits</MenuItem>
                <MenuItem value="Other">Other</MenuItem>
              </Select>
            </FormControl>
            <FormControlLabel
              control={
                <Switch 
                  checked={showApprovedOnly}
                  onChange={(e) => setShowApprovedOnly(e.target.checked)}
                />
              }
              label="Approved Only"
            />
          </Box>

          {/* Expense Table */}
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Date</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell>Category</TableCell>
                  <TableCell>Vendor</TableCell>
                  <TableCell>Amount</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredExpenses.map((expense) => (
                  <TableRow key={expense.id}>
                    <TableCell>{expense.date}</TableCell>
                    <TableCell>{expense.description}</TableCell>
                    <TableCell>
                      <Chip 
                        size="small" 
                        label={expense.category}
                        sx={{ bgcolor: getCategoryColor(expense.category), color: 'white' }}
                      />
                    </TableCell>
                    <TableCell>{expense.vendor}</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>{formatCurrency(expense.amount)}</TableCell>
                    <TableCell>
                      <Chip 
                        size="small" 
                        label={expense.approved ? 'Approved' : 'Pending'}
                        color={expense.approved ? 'success' : 'warning'}
                      />
                    </TableCell>
                    <TableCell>
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          setSelectedExpenseId(expense.id);
                          setExpenseMenuAnchor(e.currentTarget);
                        }}
                      >
                        <MoreVertIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Expense Summary */}
          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
            <Paper sx={{ p: 2, minWidth: 300 }}>
              <Typography variant="h6" gutterBottom>Expense Summary</Typography>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography>Total Expenses:</Typography>
                <Typography fontWeight="bold">{formatCurrency(filteredExpenses.reduce((sum, exp) => sum + exp.amount, 0))}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography>Approved:</Typography>
                <Typography color="success.main" fontWeight="bold">
                  {formatCurrency(filteredExpenses.filter(exp => exp.approved).reduce((sum, exp) => sum + exp.amount, 0))}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography>Pending:</Typography>
                <Typography color="warning.main" fontWeight="bold">
                  {formatCurrency(filteredExpenses.filter(exp => !exp.approved).reduce((sum, exp) => sum + exp.amount, 0))}
                </Typography>
              </Box>
            </Paper>
          </Box>
        </TabPanel>

        {/* Financial Analysis Tab */}
        <TabPanel value={tabValue} index={3}>
          <Typography variant="h6" gutterBottom>
            Financial Performance
          </Typography>
          
          {financialMetrics && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom>Profit Analysis</Typography>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">Current Profit Margin</Typography>
                    <Typography variant="h4" color={financialMetrics.profitMargin >= 0 ? 'success.main' : 'error.main'}>
                      {financialMetrics.profitMargin.toFixed(1)}%
                    </Typography>
                  </Box>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">Projected Margin (with pending)</Typography>
                    <Typography variant="h5" color={financialMetrics.profitMargin >= 0 ? 'success.main' : 'error.main'}>
                      {financialMetrics.profitMargin.toFixed(1)}%
                    </Typography>
                  </Box>
                  <Divider sx={{ my: 2 }} />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography>Revenue:</Typography>
                    <Typography fontWeight="bold">{formatCurrency(financialMetrics.contractAmount)}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography>Current Costs:</Typography>
                    <Typography fontWeight="bold">{formatCurrency(financialMetrics.approvedExpenses)}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography>Projected Costs:</Typography>
                    <Typography fontWeight="bold">{formatCurrency(financialMetrics.totalExpenses)}</Typography>
                  </Box>
                </Paper>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom>Cost Breakdown</Typography>
                  {Object.entries(financialMetrics.categoryTotals).map(([category, amount]) => {
                    const percentage = (amount / financialMetrics.totalExpenses) * 100;
                    return (
                      <Box key={category} sx={{ mb: 2 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                          <Typography variant="body2">{category}</Typography>
                          <Typography variant="body2" fontWeight="bold">
                            {formatCurrency(amount)} ({percentage.toFixed(1)}%)
                          </Typography>
                        </Box>
                        <LinearProgress 
                          variant="determinate" 
                          value={percentage} 
                          sx={{ 
                            height: 8, 
                            borderRadius: 4,
                            '& .MuiLinearProgress-bar': {
                              backgroundColor: getCategoryColor(category)
                            }
                          }}
                        />
                      </Box>
                    );
                  })}
                </Paper>
              </Grid>
            </Grid>
          )}
        </TabPanel>
      </Paper>

      {/* Add Expense Dialog */}
      <Dialog open={addExpenseOpen} onClose={() => setAddExpenseOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Add New Expense</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Description"
                value={newExpense.description}
                onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Category</InputLabel>
                <Select
                  value={newExpense.category}
                  label="Category"
                  onChange={(e) => setNewExpense({ ...newExpense, category: e.target.value as Expense['category'] })}
                >
                  <MenuItem value="Equipment">Equipment</MenuItem>
                  <MenuItem value="Labor">Labor</MenuItem>
                  <MenuItem value="Materials">Materials</MenuItem>
                  <MenuItem value="Subcontractors">Subcontractors</MenuItem>
                  <MenuItem value="Travel">Travel</MenuItem>
                  <MenuItem value="Permits">Permits</MenuItem>
                  <MenuItem value="Other">Other</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Amount"
                type="number"
                value={newExpense.amount}
                onChange={(e) => setNewExpense({ ...newExpense, amount: parseFloat(e.target.value) || 0 })}
                InputProps={{
                  startAdornment: <InputAdornment position="start">$</InputAdornment>,
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Vendor"
                value={newExpense.vendor}
                onChange={(e) => setNewExpense({ ...newExpense, vendor: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Receipt Number"
                value={newExpense.receiptNumber}
                onChange={(e) => setNewExpense({ ...newExpense, receiptNumber: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Notes"
                multiline
                rows={3}
                value={newExpense.notes}
                onChange={(e) => setNewExpense({ ...newExpense, notes: e.target.value })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddExpenseOpen(false)}>Cancel</Button>
          <Button onClick={handleAddExpense} variant="contained">Add Expense</Button>
        </DialogActions>
      </Dialog>

      {/* Expense Menu */}
      <Menu
        anchorEl={expenseMenuAnchor}
        open={Boolean(expenseMenuAnchor)}
        onClose={() => setExpenseMenuAnchor(null)}
      >
        <MenuItem onClick={() => handleApproveExpense(selectedExpenseId)}>
          <CheckCircleIcon sx={{ mr: 2 }} />
          {expenses.find(exp => exp.id === selectedExpenseId)?.approved ? 'Uncomplete' : 'Complete'}
        </MenuItem>
        <MenuItem onClick={() => setEditExpenseOpen(true)}>
          <EditIcon sx={{ mr: 2 }} />
          Edit
        </MenuItem>
        <MenuItem onClick={() => handleDeleteExpense(selectedExpenseId)} sx={{ color: 'error.main' }}>
          <DeleteIcon sx={{ mr: 2 }} />
          Delete
        </MenuItem>
      </Menu>

      {/* Project Menu */}
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={() => setMenuAnchor(null)}
      >
        <MenuItem onClick={() => setEditProjectOpen(true)}>
          <EditIcon sx={{ mr: 2 }} />
          Edit Project
        </MenuItem>
        <MenuItem>
          <FileDownloadIcon sx={{ mr: 2 }} />
          Export Report
        </MenuItem>
        <MenuItem>
          <CheckCircleIcon sx={{ mr: 2 }} />
          Mark Complete
        </MenuItem>
      </Menu>

      {/* Floating Action Button */}
      <Fab
        color="primary"
        aria-label="add expense"
        sx={{ position: 'fixed', bottom: 16, right: 16 }}
        onClick={() => setAddExpenseOpen(true)}
      >
        <AddIcon />
      </Fab>

      {/* Employee Selector */}
      <EmployeeSelector
        open={employeeSelectorOpen}
        onClose={() => setEmployeeSelectorOpen(false)}
        onSelect={handleEmployeeAssign}
        employees={employees}
        requiredSkills={['Control4', 'Lutron', 'Audio', 'Network']}
        projectId={project?.id}
        title="Assign Team Member"
        subtitle={`Project: ${project?.name}`}
        selectedEmployees={project?.team || []}
      />
    </Container>
  );
} 