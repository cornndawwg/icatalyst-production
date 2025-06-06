import React, { useState, useEffect, useMemo } from 'react';
import {
  Container,
  Typography,
  Box,
  Button,
  Grid,
  Card,
  CardContent,
  Avatar,
  Chip,
  IconButton,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Breadcrumbs,
  Link,
  Fab,
  Badge,
  Rating,
  LinearProgress,
  Menu,
  ListItemIcon,
  ListItemText,
  MenuItem as MenuItemComponent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  Tooltip,
  useMediaQuery,
  useTheme,
  InputAdornment,
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  ViewModule as ViewModuleIcon,
  ViewList as ViewListIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Work as WorkIcon,
  Schedule as ScheduleIcon,
  Star as StarIcon,
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Assignment as AssignmentIcon,
  ContactPhone as ContactPhoneIcon,
  Group as GroupIcon,
  Business as BusinessIcon,
  TrendingUp as TrendingUpIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import NextLink from 'next/link';
import { useRouter } from 'next/router';
import {
  Employee,
  getAllEmployees,
  deleteEmployee,
  getEmployeeFullName,
  getEmployeeAvailability,
  searchEmployees,
} from '../../utils/employeeStorage';

export default function EmployeesPage() {
  const router = useRouter();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  
  // Search and filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('All');
  const [roleFilter, setRoleFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [availabilityFilter, setAvailabilityFilter] = useState('All');
  
  // Menu state
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>('');
  
  // Dialog states
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [employeeToDelete, setEmployeeToDelete] = useState<Employee | null>(null);

  // Load employees
  useEffect(() => {
    const loadEmployees = () => {
      try {
        const allEmployees = getAllEmployees();
        setEmployees(allEmployees);
      } catch (error) {
        console.error('Error loading employees:', error);
      } finally {
        setLoading(false);
      }
    };

    loadEmployees();
  }, []);

  // Filter employees
  const filteredEmployees = useMemo(() => {
    let filtered = employees;

    // Search filter
    if (searchTerm.trim()) {
      filtered = searchEmployees(searchTerm);
    }

    // Department filter
    if (departmentFilter !== 'All') {
      filtered = filtered.filter(emp => emp.employment.department === departmentFilter);
    }

    // Role filter
    if (roleFilter !== 'All') {
      filtered = filtered.filter(emp => emp.employment.role === roleFilter);
    }

    // Status filter
    if (statusFilter !== 'All') {
      filtered = filtered.filter(emp => emp.employment.status === statusFilter);
    }

    // Availability filter
    if (availabilityFilter !== 'All') {
      filtered = filtered.filter(emp => {
        const availability = getEmployeeAvailability(emp);
        return availability === availabilityFilter;
      });
    }

    return filtered;
  }, [employees, searchTerm, departmentFilter, roleFilter, statusFilter, availabilityFilter]);

  // Employee statistics
  const employeeStats = useMemo(() => {
    const total = employees.length;
    const active = employees.filter(emp => emp.employment.status === 'Active').length;
    const available = employees.filter(emp => getEmployeeAvailability(emp) === 'Available').length;
    const onProjects = employees.filter(emp => emp.currentAssignments.activeProjects.length > 0).length;

    return { total, active, available, onProjects };
  }, [employees]);

  // Get unique values for filters
  const departments = Array.from(new Set(employees.map(emp => emp.employment.department)));
  const roles = Array.from(new Set(employees.map(emp => emp.employment.role)));

  const handleDeleteEmployee = async (employee: Employee) => {
    setEmployeeToDelete(employee);
    setDeleteDialogOpen(true);
    setMenuAnchor(null);
  };

  const confirmDeleteEmployee = async () => {
    if (employeeToDelete) {
      try {
        deleteEmployee(employeeToDelete.id);
        setEmployees(getAllEmployees());
        setDeleteDialogOpen(false);
        setEmployeeToDelete(null);
      } catch (error) {
        console.error('Error deleting employee:', error);
      }
    }
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, employeeId: string) => {
    setMenuAnchor(event.currentTarget);
    setSelectedEmployeeId(employeeId);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'success';
      case 'Inactive': return 'default';
      case 'On Leave': return 'warning';
      case 'Terminated': return 'error';
      default: return 'default';
    }
  };

  const getAvailabilityColor = (availability: string) => {
    switch (availability) {
      case 'Available': return 'success';
      case 'Unavailable': return 'error';
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

  const renderEmployeeCard = (employee: Employee) => {
    const availability = getEmployeeAvailability(employee);

    return (
      <Card
        key={employee.id}
        sx={{
          height: '100%',
          cursor: 'pointer',
          '&:hover': {
            elevation: 3,
            transform: 'translateY(-2px)',
          },
          transition: 'all 0.2s ease-in-out',
        }}
        onClick={() => router.push(`/employees/${employee.id}`)}
      >
        <CardContent sx={{ p: 3 }}>
          {/* Header */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Avatar
                src={employee.personalInfo.avatar}
                sx={{ width: 56, height: 56, mr: 2, bgcolor: 'primary.main' }}
              >
                {employee.personalInfo.firstName[0]}{employee.personalInfo.lastName[0]}
              </Avatar>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                  {getEmployeeFullName(employee)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {employee.employment.title}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  ID: {employee.employment.employeeId}
                </Typography>
              </Box>
            </Box>
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                handleMenuOpen(e, employee.id);
              }}
            >
              <MoreVertIcon />
            </IconButton>
          </Box>

          {/* Status and Department */}
          <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
            <Chip
              label={employee.employment.status}
              size="small"
              color={getStatusColor(employee.employment.status) as any}
            />
            <Chip
              label={employee.employment.department}
              size="small"
              sx={{
                bgcolor: getDepartmentColor(employee.employment.department),
                color: 'white',
              }}
            />
            <Chip
              label={employee.currentAssignments.activeProjects.length > 0 ? 'On Project' : 'Available'}
              size="small"
              color={employee.currentAssignments.activeProjects.length > 0 ? 'warning' : 'success'}
            />
          </Box>

          {/* Skills */}
          <Box sx={{ mb: 2 }}>
            <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
              Specialties:
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
              {employee.skills.specialties.slice(0, 3).map((skill, index) => (
                <Chip
                  key={index}
                  label={skill}
                  size="small"
                  variant="outlined"
                  sx={{ fontSize: '0.7rem', height: 20 }}
                />
              ))}
              {employee.skills.specialties.length > 3 && (
                <Chip
                  label={`+${employee.skills.specialties.length - 3}`}
                  size="small"
                  variant="outlined"
                  sx={{ fontSize: '0.7rem', height: 20 }}
                />
              )}
            </Box>
          </Box>

          {/* Projects and Experience */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Box>
              <Typography variant="caption" color="text.secondary">
                Active Projects
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {employee.currentAssignments.activeProjects.length}
              </Typography>
            </Box>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="caption" color="text.secondary">
                Completed
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {employee.performance.completedProjects}
              </Typography>
            </Box>
            <Box sx={{ textAlign: 'right' }}>
              <Typography variant="caption" color="text.secondary">
                Experience
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {employee.skills.yearsExperience} years
              </Typography>
            </Box>
          </Box>

          {/* Contact Info */}
          <Box sx={{ mt: 2, pt: 2, borderTop: 1, borderColor: 'divider' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
              <EmailIcon sx={{ fontSize: 14, mr: 1, color: 'text.secondary' }} />
              <Typography variant="caption" color="text.secondary">
                {employee.personalInfo.email}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <PhoneIcon sx={{ fontSize: 14, mr: 1, color: 'text.secondary' }} />
              <Typography variant="caption" color="text.secondary">
                {employee.personalInfo.phone}
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>
    );
  };

  const renderTableView = () => (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Employee</TableCell>
            <TableCell>Title</TableCell>
            <TableCell>Department</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Project Status</TableCell>
            <TableCell>Rating</TableCell>
            <TableCell>Completed Projects</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {filteredEmployees.map((employee) => {
            const availability = getEmployeeAvailability(employee);
            return (
              <TableRow
                key={employee.id}
                hover
                sx={{ cursor: 'pointer' }}
                onClick={() => router.push(`/employees/${employee.id}`)}
              >
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Avatar
                      src={employee.personalInfo.avatar}
                      sx={{ width: 32, height: 32, mr: 2 }}
                    >
                      {employee.personalInfo.firstName[0]}{employee.personalInfo.lastName[0]}
                    </Avatar>
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {getEmployeeFullName(employee)}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {employee.employment.employeeId}
                      </Typography>
                    </Box>
                  </Box>
                </TableCell>
                <TableCell>{employee.employment.title}</TableCell>
                <TableCell>
                  <Chip
                    label={employee.employment.department}
                    size="small"
                    sx={{
                      bgcolor: getDepartmentColor(employee.employment.department),
                      color: 'white',
                    }}
                  />
                </TableCell>
                <TableCell>
                  <Chip
                    label={employee.employment.status}
                    size="small"
                    color={getStatusColor(employee.employment.status) as any}
                  />
                </TableCell>
                <TableCell>
                  <Chip
                    label={employee.currentAssignments.activeProjects.length > 0 ? 'On Project' : 'Available'}
                    size="small"
                    color={employee.currentAssignments.activeProjects.length > 0 ? 'warning' : 'success'}
                  />
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Rating value={employee.performance.rating} readOnly size="small" />
                    <Typography variant="caption" sx={{ ml: 0.5 }}>
                      {employee.performance.rating}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>{employee.performance.completedProjects}</TableCell>
                <TableCell>
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleMenuOpen(e, employee.id);
                    }}
                  >
                    <MoreVertIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );

  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <Typography>Loading employees...</Typography>
        </Box>
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
        <Typography color="text.primary">Employees</Typography>
      </Breadcrumbs>

      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 4 }}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            Team Management
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage your workforce and track team performance
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => router.push('/employees/new')}
          size="large"
        >
          Add Employee
        </Button>
      </Box>

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ textAlign: 'center', p: 2, bgcolor: 'primary.main', color: 'white' }}>
            <GroupIcon sx={{ fontSize: 40, mb: 1 }} />
            <Typography variant="h4">{employeeStats.total}</Typography>
            <Typography variant="body2">Total Employees</Typography>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ textAlign: 'center', p: 2, bgcolor: 'success.main', color: 'white' }}>
            <CheckCircleIcon sx={{ fontSize: 40, mb: 1 }} />
            <Typography variant="h4">{employeeStats.active}</Typography>
            <Typography variant="body2">Active</Typography>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ textAlign: 'center', p: 2, bgcolor: 'info.main', color: 'white' }}>
            <ScheduleIcon sx={{ fontSize: 40, mb: 1 }} />
            <Typography variant="h4">{employeeStats.available}</Typography>
            <Typography variant="body2">Available</Typography>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ textAlign: 'center', p: 2, bgcolor: 'warning.main', color: 'white' }}>
            <AssignmentIcon sx={{ fontSize: 40, mb: 1 }} />
            <Typography variant="h4">{employeeStats.onProjects}</Typography>
            <Typography variant="body2">On Projects</Typography>
          </Card>
        </Grid>
      </Grid>

      {/* Search and Filters */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap', alignItems: 'center' }}>
          <TextField
            placeholder="Search employees..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            size="small"
            sx={{ minWidth: 250 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />

          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Department</InputLabel>
            <Select
              value={departmentFilter}
              label="Department"
              onChange={(e) => setDepartmentFilter(e.target.value)}
            >
              <MenuItem value="All">All Departments</MenuItem>
              {departments.map((dept) => (
                <MenuItem key={dept} value={dept}>
                  {dept}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Role</InputLabel>
            <Select
              value={roleFilter}
              label="Role"
              onChange={(e) => setRoleFilter(e.target.value)}
            >
              <MenuItem value="All">All Roles</MenuItem>
              {roles.map((role) => (
                <MenuItem key={role} value={role}>
                  {role}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={statusFilter}
              label="Status"
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <MenuItem value="All">All Status</MenuItem>
              <MenuItem value="Active">Active</MenuItem>
              <MenuItem value="Inactive">Inactive</MenuItem>
              <MenuItem value="On Leave">On Leave</MenuItem>
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Availability</InputLabel>
            <Select
              value={availabilityFilter}
              label="Availability"
              onChange={(e) => setAvailabilityFilter(e.target.value)}
            >
              <MenuItem value="All">All</MenuItem>
              <MenuItem value="Available">Available</MenuItem>
              <MenuItem value="Unavailable">Unavailable</MenuItem>
            </Select>
          </FormControl>

          <Box sx={{ ml: 'auto', display: 'flex', gap: 1 }}>
            <Tooltip title="Card View">
              <IconButton
                onClick={() => setViewMode('cards')}
                color={viewMode === 'cards' ? 'primary' : 'default'}
              >
                <ViewModuleIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Table View">
              <IconButton
                onClick={() => setViewMode('table')}
                color={viewMode === 'table' ? 'primary' : 'default'}
              >
                <ViewListIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        <Typography variant="body2" color="text.secondary">
          Showing {filteredEmployees.length} of {employees.length} employees
        </Typography>
      </Paper>

      {/* Employee Display */}
      {viewMode === 'cards' ? (
        <Grid container spacing={3}>
          {filteredEmployees.map((employee) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={employee.id}>
              {renderEmployeeCard(employee)}
            </Grid>
          ))}
        </Grid>
      ) : (
        renderTableView()
      )}

      {filteredEmployees.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <PersonIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No employees found
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Try adjusting your search terms or filters
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => router.push('/employees/new')}
          >
            Add First Employee
          </Button>
        </Box>
      )}

      {/* Floating Action Button */}
      {isMobile && (
        <Fab
          color="primary"
          sx={{ position: 'fixed', bottom: 16, right: 16 }}
          onClick={() => router.push('/employees/new')}
        >
          <AddIcon />
        </Fab>
      )}

      {/* Employee Actions Menu */}
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={() => setMenuAnchor(null)}
      >
        <MenuItemComponent
          onClick={() => {
            router.push(`/employees/${selectedEmployeeId}`);
            setMenuAnchor(null);
          }}
        >
          <ListItemIcon>
            <PersonIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>View Profile</ListItemText>
        </MenuItemComponent>
        <MenuItemComponent
          onClick={() => {
            router.push(`/employees/${selectedEmployeeId}/edit`);
            setMenuAnchor(null);
          }}
        >
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Edit Employee</ListItemText>
        </MenuItemComponent>
        <MenuItemComponent>
          <ListItemIcon>
            <AssignmentIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Assign to Project</ListItemText>
        </MenuItemComponent>
        <MenuItemComponent>
          <ListItemIcon>
            <ContactPhoneIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Contact Employee</ListItemText>
        </MenuItemComponent>
        <Divider />
        <MenuItemComponent
          onClick={() => {
            const employee = employees.find(emp => emp.id === selectedEmployeeId);
            if (employee) handleDeleteEmployee(employee);
          }}
          sx={{ color: 'error.main' }}
        >
          <ListItemIcon>
            <DeleteIcon fontSize="small" sx={{ color: 'error.main' }} />
          </ListItemIcon>
          <ListItemText>Delete Employee</ListItemText>
        </MenuItemComponent>
      </Menu>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete Employee</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete{' '}
            <strong>{employeeToDelete ? getEmployeeFullName(employeeToDelete) : ''}</strong>?
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={confirmDeleteEmployee} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
} 