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
  TextField,
  InputAdornment,
  Chip,
  Avatar,
  IconButton,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  Divider,
  Badge,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Alert,
  Snackbar,
} from '@mui/material';
import {
  Search as SearchIcon,
  Add as AddIcon,
  FilterList as FilterIcon,
  MoreVert as MoreVertIcon,
  Assignment as ProjectIcon,
  Person as PersonIcon,
  Build as BuildIcon,
  LocationOn as LocationIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Star as StarIcon,
  Schedule as ScheduleIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  PlayArrow as PlayArrowIcon,
  Pause as PauseIcon,
  AttachMoney as MoneyIcon,
  CalendarToday as CalendarIcon,
  Done as DoneIcon,
} from '@mui/icons-material';
import NextLink from 'next/link';
import { useRouter } from 'next/router';
import NewProjectWizard from '../../components/NewProjectWizard';
import ProjectCompletionModal from '../../components/ProjectCompletionModal';
import { 
  getProjects, 
  saveProject, 
  markProjectComplete,
  convertWizardDataToProject,
  initializeDataIfEmpty,
  Project
} from '../../utils/dataStorage';

// Mock projects data - will be merged with real data
const mockProjects: Project[] = [
  {
    id: 'proj_mock_001',
    name: 'Green Valley Smart Security System',
    type: 'security',
    description: 'Complete smart security system installation for 150-unit apartment complex',
    customer: 'Green Valley Estates',
    property: 'Green Valley Estates Complex',
    status: 'In Progress',
    priority: 'High',
    startDate: '2024-01-01',
    endDate: '2024-03-15',
    budget: '$125,000',
    spent: '$78,500',
    progress: 65,
    team: ['John Smith', 'Maria Garcia', 'David Chen'],
    tasks: [
      { name: 'Site Survey', status: 'Completed' },
      { name: 'Equipment Procurement', status: 'Completed' },
      { name: 'Installation Phase 1', status: 'In Progress' },
      { name: 'Testing & Commissioning', status: 'Pending' },
      { name: 'Training & Handover', status: 'Pending' }
    ],
    tags: ['Smart Security', 'Large Scale', 'Commercial'],
    lastUpdate: '2024-01-15',
    createdDate: '2024-01-01',
  },
  {
    id: 'proj_mock_002',
    name: 'Sunset Homes Energy Management',
    type: 'energy',
    description: 'Smart thermostats and energy monitoring system for 75 residential properties',
    customer: 'Sunset Residential Group',
    property: 'Sunset Residential Properties',
    status: 'Planning',
    priority: 'Medium',
    startDate: '2024-02-01',
    endDate: '2024-05-30',
    budget: '$89,000',
    spent: '$12,000',
    progress: 15,
    team: ['Sarah Wilson', 'Mike Johnson'],
    tasks: [
      { name: 'Requirements Analysis', status: 'In Progress' },
      { name: 'Vendor Selection', status: 'Pending' },
      { name: 'Installation Planning', status: 'Pending' },
      { name: 'Rollout Phase 1', status: 'Pending' },
      { name: 'System Integration', status: 'Pending' }
    ],
    tags: ['Energy Management', 'Residential', 'Multi-Property'],
    lastUpdate: '2024-01-14',
    createdDate: '2024-01-14',
  },
  {
    id: 'proj_mock_003',
    name: 'Riverside Office Smart Building',
    type: 'automation',
    description: 'Complete smart building automation for office complex renovation',
    customer: 'Riverside Commercial Inc.',
    property: 'Riverside Business Park',
    status: 'On Hold',
    priority: 'Low',
    startDate: '2024-03-01',
    endDate: '2024-08-15',
    budget: '$245,000',
    spent: '$0',
    progress: 0,
    team: ['Alex Rodriguez', 'Jennifer Liu', 'Tom Anderson'],
    tasks: [
      { name: 'Design Phase', status: 'Pending' },
      { name: 'Permit Applications', status: 'Pending' },
      { name: 'Infrastructure Upgrade', status: 'Pending' },
      { name: 'System Installation', status: 'Pending' },
      { name: 'Testing & Training', status: 'Pending' }
    ],
    tags: ['Commercial', 'Building Automation', 'On Hold'],
    lastUpdate: '2023-12-20',
    createdDate: '2023-12-20',
  },
  {
    id: 'proj_mock_004',
    name: 'University Smart Campus Access',
    type: 'access_control',
    description: 'Keyless entry and access control system for student housing complex',
    customer: 'University Housing Partners',
    property: 'University Heights Apartments',
    status: 'In Progress',
    priority: 'Medium',
    startDate: '2024-01-10',
    endDate: '2024-04-20',
    budget: '$67,000',
    spent: '$23,500',
    progress: 35,
    team: ['Ryan Kim', 'Amanda Torres'],
    tasks: [
      { name: 'Access Point Survey', status: 'Completed' },
      { name: 'Hardware Installation', status: 'In Progress' },
      { name: 'Software Configuration', status: 'Pending' },
      { name: 'User Registration', status: 'Pending' },
      { name: 'System Launch', status: 'Pending' }
    ],
    tags: ['Access Control', 'Student Housing', 'Campus'],
    lastUpdate: '2024-01-13',
    createdDate: '2024-01-10',
  },
  {
    id: 'proj_mock_005',
    name: 'Thompson Property Upgrade',
    type: 'smart_home',
    description: 'Basic smart home retrofits for mixed-use development',
    customer: 'Thompson Properties LLC',
    property: 'Thompson Investment Properties',
    status: 'Cancelled',
    priority: 'Low',
    startDate: '2023-11-01',
    endDate: '2024-02-28',
    budget: '$45,000',
    spent: '$8,500',
    progress: 10,
    team: ['Steve Thompson'],
    tasks: [
      { name: 'Property Assessment', status: 'Completed' },
      { name: 'Proposal Development', status: 'Completed' },
      { name: 'Client Approval', status: 'Cancelled' },
      { name: 'Installation', status: 'Cancelled' },
      { name: 'Testing', status: 'Cancelled' }
    ],
    tags: ['Retrofit', 'Cancelled', 'Budget Constraints'],
    lastUpdate: '2023-11-25',
    createdDate: '2023-11-01',
  },
];

export default function ProjectsPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [newProjectDialog, setNewProjectDialog] = useState(false);
  const [completionDialog, setCompletionDialog] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [allProjects, setAllProjects] = useState<Project[]>([]);

  // Load projects on component mount
  useEffect(() => {
    initializeDataIfEmpty();
    loadProjects();
  }, []);

  const loadProjects = () => {
    const storedProjects = getProjects();
    // Merge mock projects with stored projects (filter out duplicates)
    const combinedProjects = [
      ...storedProjects,
      ...mockProjects.filter(mockProject => 
        !storedProjects.some(stored => stored.id === mockProject.id)
      )
    ];
    setAllProjects(combinedProjects);
  };

  // Filter projects based on search and filters
  const filteredProjects = allProjects.filter(project => {
    const matchesSearch = 
      project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'All' || project.status === statusFilter;
    const matchesPriority = priorityFilter === 'All' || project.priority === priorityFilter;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, project: Project) => {
    setMenuAnchor(event.currentTarget);
    setSelectedProject(project);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
    setSelectedProject(null);
  };

  const handleProjectCreated = (projectData: any) => {
    console.log('New project created:', projectData);
    
    // Convert wizard data to project format
    const newProject = convertWizardDataToProject(projectData);
    
    // Save to localStorage
    saveProject(newProject);
    
    // Reload projects to show the new one
    loadProjects();
    
    // Close dialog and show success message
    setNewProjectDialog(false);
    setSuccessMessage(`Project "${newProject.name}" created successfully!`);
    
    // Optionally redirect to the new project page after a delay
    setTimeout(() => {
      if (window.confirm('Would you like to view the new project details?')) {
        router.push(`/projects/${newProject.id}`);
      }
    }, 2000);
  };

  const handleMarkComplete = (project: Project) => {
    setSelectedProject(project);
    setCompletionDialog(true);
    handleMenuClose();
  };

  const handleProjectCompleted = (projectId: string, completionData: any) => {
    const customer = markProjectComplete(projectId, completionData);
    
    // Reload projects to reflect the completion
    loadProjects();
    
    // Show success message
    const project = allProjects.find(p => p.id === projectId);
    setSuccessMessage(
      `Project "${project?.name}" completed successfully!${
        customer ? ` Customer "${customer.name}" added to your database.` : ''
      }`
    );
    
    setCompletionDialog(false);
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'in progress': return 'primary';
      case 'completed': return 'success';
      case 'planning': return 'info';
      case 'on hold': return 'warning';
      case 'cancelled': return 'error';
      default: return 'default';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'high': return 'error';
      case 'medium': return 'warning';
      case 'low': return 'success';
      default: return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'in progress': return <PlayArrowIcon />;
      case 'completed': return <CheckCircleIcon />;
      case 'planning': return <ScheduleIcon />;
      case 'on hold': return <PauseIcon />;
      case 'cancelled': return <WarningIcon />;
      default: return <ProjectIcon />;
    }
  };

  const getProjectStats = () => {
    const total = allProjects.length;
    const inProgress = allProjects.filter(p => p.status === 'In Progress').length;
    const completed = allProjects.filter(p => p.status === 'Completed').length;
    const totalBudget = allProjects.reduce((sum, p) => sum + parseFloat(p.budget.replace(/[$,]/g, '')), 0);
    
    return { total, inProgress, completed, totalBudget };
  };

  const stats = getProjectStats();

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Breadcrumbs */}
      <Breadcrumbs sx={{ mb: 2 }}>
        <Link component={NextLink} href="/" color="inherit" underline="hover">
          Dashboard
        </Link>
        <Typography color="text.primary">Projects</Typography>
      </Breadcrumbs>

      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            Project Management
            <Chip 
              label={`${filteredProjects.length} projects`} 
              size="small" 
              color="primary" 
              sx={{ ml: 2 }} 
            />
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Track and manage smart home installation projects
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button variant="outlined" startIcon={<FilterIcon />}>
            Advanced Filters
          </Button>
          <Button 
            variant="contained" 
            startIcon={<AddIcon />}
            onClick={() => setNewProjectDialog(true)}
            size="large"
          >
            New Project
          </Button>
        </Box>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" color="primary">
                    {stats.total}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Projects
                  </Typography>
                </Box>
                <ProjectIcon sx={{ fontSize: 40, color: 'primary.main' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" color="success.main">
                    {stats.inProgress}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    In Progress
                  </Typography>
                </Box>
                <Badge badgeContent={stats.inProgress} color="primary">
                  <PlayArrowIcon sx={{ fontSize: 40, color: 'success.main' }} />
                </Badge>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" color="info.main">
                    {stats.completed}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Completed
                  </Typography>
                </Box>
                <CheckCircleIcon sx={{ fontSize: 40, color: 'info.main' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" color="warning.main">
                    ${(stats.totalBudget / 1000).toFixed(0)}K
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Budget
                  </Typography>
                </Box>
                <MoneyIcon sx={{ fontSize: 40, color: 'warning.main' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Search and Filters */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              placeholder="Search projects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={statusFilter}
                label="Status"
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <MenuItem value="All">All Status</MenuItem>
                <MenuItem value="In Progress">In Progress</MenuItem>
                <MenuItem value="Planning">Planning</MenuItem>
                <MenuItem value="Completed">Completed</MenuItem>
                <MenuItem value="On Hold">On Hold</MenuItem>
                <MenuItem value="Cancelled">Cancelled</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>Priority</InputLabel>
              <Select
                value={priorityFilter}
                label="Priority"
                onChange={(e) => setPriorityFilter(e.target.value)}
              >
                <MenuItem value="All">All Priorities</MenuItem>
                <MenuItem value="High">High Priority</MenuItem>
                <MenuItem value="Medium">Medium Priority</MenuItem>
                <MenuItem value="Low">Low Priority</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>

      {/* Project Cards */}
      <Paper sx={{ mb: 4 }}>
        <Box sx={{ p: 3, borderBottom: 1, borderColor: 'divider' }}>
          <Typography variant="h6">
            Projects ({filteredProjects.length})
          </Typography>
        </Box>
        
        <Grid container spacing={3} sx={{ p: 3 }}>
          {filteredProjects.map((project) => (
            <Grid item xs={12} lg={6} key={project.id}>
              <Card 
                sx={{ 
                  cursor: 'pointer',
                  '&:hover': { 
                    elevation: 4,
                    transform: 'translateY(-2px)',
                    transition: 'all 0.2s'
                  }
                }}
                onClick={() => router.push(`/projects/${project.id}`)}
              >
                <CardContent>
                  {/* Project Header */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="h6" gutterBottom>
                        {project.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        {project.description}
                      </Typography>
                    </Box>
                    <IconButton 
                      size="small" 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMenuOpen(e, project);
                      }}
                    >
                      <MoreVertIcon />
                    </IconButton>
                  </Box>

                  {/* Status and Priority */}
                  <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                    <Chip
                      label={project.status}
                      size="small"
                      color={getStatusColor(project.status) as any}
                      icon={getStatusIcon(project.status)}
                    />
                    <Chip
                      label={`${project.priority} Priority`}
                      size="small"
                      color={getPriorityColor(project.priority) as any}
                    />
                  </Box>

                  {/* Project Details */}
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" sx={{ mb: 0.5 }}>
                      <strong>Customer:</strong> {project.customer}
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 0.5 }}>
                      <strong>Property:</strong> {project.property}
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 0.5 }}>
                      <strong>Timeline:</strong> {project.startDate} - {project.endDate}
                    </Typography>
                  </Box>

                  {/* Progress Bar */}
                  <Box sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2">Progress</Typography>
                      <Typography variant="body2" color="primary">
                        {project.progress}%
                      </Typography>
                    </Box>
                    <LinearProgress 
                      variant="determinate" 
                      value={project.progress} 
                      sx={{ height: 8, borderRadius: 4 }}
                      color={project.progress === 100 ? 'success' : 'primary'}
                    />
                  </Box>

                  {/* Budget Information */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h6" color="primary">
                        {project.budget}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Budget
                      </Typography>
                    </Box>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h6" color="warning.main">
                        {project.spent}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Spent
                      </Typography>
                    </Box>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h6" color="info.main">
                        {project.team.length}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Team Members
                      </Typography>
                    </Box>
                  </Box>

                  {/* Tags */}
                  <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mb: 1 }}>
                    {project.tags.slice(0, 3).map((tag, index) => (
                      <Chip key={index} label={tag} size="small" variant="outlined" />
                    ))}
                    {project.tags.length > 3 && (
                      <Chip label={`+${project.tags.length - 3}`} size="small" variant="outlined" />
                    )}
                  </Box>

                  {/* Last Update */}
                  <Typography variant="caption" color="text.secondary">
                    Last updated: {project.lastUpdate}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Paper>

      {/* Context Menu */}
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => {
          router.push(`/projects/${selectedProject?.id}`);
          handleMenuClose();
        }}>
          <ViewIcon sx={{ mr: 1 }} />
          View Details
        </MenuItem>
        <MenuItem onClick={handleMenuClose}>
          <EditIcon sx={{ mr: 1 }} />
          Edit Project
        </MenuItem>
        {selectedProject && selectedProject.status !== 'Completed' && selectedProject.status !== 'Cancelled' && (
          <MenuItem onClick={() => handleMarkComplete(selectedProject)}>
            <DoneIcon sx={{ mr: 1 }} />
            Mark Complete
          </MenuItem>
        )}
        <MenuItem onClick={handleMenuClose}>
          <CalendarIcon sx={{ mr: 1 }} />
          Update Timeline
        </MenuItem>
        <MenuItem onClick={handleMenuClose}>
          <PersonIcon sx={{ mr: 1 }} />
          Manage Team
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleMenuClose} sx={{ color: 'error.main' }}>
          <DeleteIcon sx={{ mr: 1 }} />
          Cancel Project
        </MenuItem>
      </Menu>

      {/* New Project Wizard */}
      <NewProjectWizard
        open={newProjectDialog}
        onClose={() => setNewProjectDialog(false)}
        onSubmit={handleProjectCreated}
      />

      {/* Project Completion Modal */}
      <ProjectCompletionModal
        open={completionDialog}
        project={selectedProject}
        onClose={() => setCompletionDialog(false)}
        onComplete={handleProjectCompleted}
      />

      {/* Success Message */}
      <Snackbar
        open={!!successMessage}
        autoHideDuration={6000}
        onClose={() => setSuccessMessage('')}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={() => setSuccessMessage('')} severity="success" sx={{ width: '100%' }}>
          {successMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
} 