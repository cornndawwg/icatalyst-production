import React, { useState, useCallback } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  IconButton,
  Button,
  Chip,
  Avatar,
  LinearProgress,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Fab,
  Menu,
  ListItemIcon,
  ListItemText,
  MenuItem as MenuItemComponent,
  useMediaQuery,
  useTheme,
  Collapse,
  List,
  ListItem,
  ListItemButton,
  Checkbox,
  FormControlLabel,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  PlayArrow as StartIcon,
  Check as CompleteIcon,
  MoreVert as MoreVertIcon,
  DragIndicator as DragIcon,
  Person as PersonIcon,
  Schedule as ScheduleIcon,
  Warning as BlockedIcon,
  FilterList as FilterIcon,
  ViewColumn as ViewColumnIcon,
  ViewList as ViewListIcon,
} from '@mui/icons-material';

export interface Task {
  id: string;
  name: string;
  description?: string;
  category: 'Planning' | 'Installation' | 'Testing' | 'Documentation' | 'Other';
  assignedTo?: string;
  assignedToName?: string;
  status: 'Not Started' | 'In Progress' | 'Complete' | 'Blocked';
  priority: 'High' | 'Medium' | 'Low';
  dueDate?: string;
  estimatedHours?: number;
  actualHours?: number;
  progress?: number;
  dependencies?: string[];
  notes?: string;
  createdAt: string;
  completedAt?: string;
}

export interface TaskManagerProps {
  projectId: string;
  tasks: Task[];
  onTaskUpdate: (task: Task) => Promise<void>;
  onTaskCreate: (task: Omit<Task, 'id' | 'createdAt'>) => Promise<void>;
  onTaskDelete: (taskId: string) => Promise<void>;
  onTaskReorder: (tasks: Task[]) => Promise<void>;
  employees?: Array<{ id: string; name: string; avatar?: string }>;
  readonly?: boolean;
}

const TaskManager: React.FC<TaskManagerProps> = ({
  projectId,
  tasks,
  onTaskUpdate,
  onTaskCreate,
  onTaskDelete,
  onTaskReorder,
  employees = [],
  readonly = false,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [newTaskColumn, setNewTaskColumn] = useState<string>('Not Started');
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [selectedTaskId, setSelectedTaskId] = useState<string>('');
  
  // Filters
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [filterAssignee, setFilterAssignee] = useState<string>('All');
  const [filterPriority, setFilterPriority] = useState<string>('All');
  const [searchTerm, setSearchTerm] = useState('');
  
  // New task form
  const [newTask, setNewTask] = useState<Partial<Task>>({
    name: '',
    description: '',
    category: 'Installation',
    status: 'Not Started',
    priority: 'Medium',
    assignedTo: '',
    dueDate: '',
    estimatedHours: 0,
  });

  const columns = [
    { id: 'Not Started', title: 'Not Started', color: '#6B7280' },
    { id: 'In Progress', title: 'In Progress', color: '#3B82F6' },
    { id: 'Complete', title: 'Complete', color: '#10B981' },
    { id: 'Blocked', title: 'Blocked', color: '#EF4444' },
  ];

  const priorityColors = {
    High: '#EF4444',
    Medium: '#F59E0B',
    Low: '#10B981',
  };

  const categoryColors = {
    Planning: '#8B5CF6',
    Installation: '#3B82F6',
    Testing: '#F59E0B',
    Documentation: '#6B7280',
    Other: '#6366F1',
  };

  // Filter tasks
  const filteredTasks = tasks.filter(task => {
    if (filterStatus !== 'All' && task.status !== filterStatus) return false;
    if (filterAssignee !== 'All' && task.assignedTo !== filterAssignee) return false;
    if (filterPriority !== 'All' && task.priority !== filterPriority) return false;
    if (searchTerm && !task.name.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  // Group tasks by status for Kanban view
  const tasksByStatus = columns.reduce((acc, column) => {
    acc[column.id] = filteredTasks.filter(task => task.status === column.id);
    return acc;
  }, {} as Record<string, Task[]>);

  const handleTaskCreate = async () => {
    if (!newTask.name?.trim()) return;

    const taskData: Omit<Task, 'id' | 'createdAt'> = {
      name: newTask.name,
      description: newTask.description || '',
      category: newTask.category as Task['category'],
      status: newTaskColumn as Task['status'],
      priority: newTask.priority as Task['priority'],
      assignedTo: newTask.assignedTo || undefined,
      assignedToName: newTask.assignedTo ? employees.find(e => e.id === newTask.assignedTo)?.name : undefined,
      dueDate: newTask.dueDate || undefined,
      estimatedHours: newTask.estimatedHours || undefined,
      notes: newTask.notes || undefined,
    };

    try {
      await onTaskCreate(taskData);
      setNewTask({
        name: '',
        description: '',
        category: 'Installation',
        status: 'Not Started',
        priority: 'Medium',
        assignedTo: '',
        dueDate: '',
        estimatedHours: 0,
      });
      setIsAddingTask(false);
      setNewTaskColumn('Not Started');
    } catch (error) {
      console.error('Failed to create task:', error);
    }
  };

  const handleTaskStatusChange = async (task: Task, newStatus: Task['status']) => {
    const updatedTask = { 
      ...task, 
      status: newStatus,
      completedAt: newStatus === 'Complete' ? new Date().toISOString() : undefined,
      progress: newStatus === 'Complete' ? 100 : task.progress,
    };
    await onTaskUpdate(updatedTask);
  };

  const handleTaskComplete = async (task: Task) => {
    await handleTaskStatusChange(task, 'Complete');
  };

  const handleTaskStart = async (task: Task) => {
    await handleTaskStatusChange(task, 'In Progress');
  };

  const handleTaskEdit = (task: Task) => {
    setEditingTask(task);
    setMenuAnchor(null);
  };

  const handleTaskDelete = async (taskId: string) => {
    try {
      await onTaskDelete(taskId);
      setMenuAnchor(null);
    } catch (error) {
      console.error('Failed to delete task:', error);
    }
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, taskId: string) => {
    setMenuAnchor(event.currentTarget);
    setSelectedTaskId(taskId);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString();
  };

  const getTaskProgressColor = (task: Task) => {
    if (task.status === 'Complete') return 'success';
    if (task.status === 'Blocked') return 'error';
    if (task.dueDate && new Date(task.dueDate) < new Date()) return 'error';
    return 'primary';
  };

  const renderTaskCard = (task: Task, isDragging = false) => (
    <Card
      key={task.id}
      sx={{
        mb: 2,
        cursor: 'pointer',
        opacity: isDragging ? 0.5 : 1,
        '&:hover': {
          elevation: 3,
          transform: 'translateY(-1px)',
        },
        transition: 'all 0.2s ease-in-out',
      }}
    >
      <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, flex: 1 }}>
            {task.name}
          </Typography>
          {!readonly && (
            <IconButton
              size="small"
              onClick={(e) => handleMenuOpen(e, task.id)}
              sx={{ ml: 1, p: 0.5 }}
            >
              <MoreVertIcon fontSize="small" />
            </IconButton>
          )}
        </Box>

        {task.description && (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1, fontSize: '0.8rem' }}>
            {task.description}
          </Typography>
        )}

        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1 }}>
          <Chip
            label={task.category}
            size="small"
            sx={{
              backgroundColor: categoryColors[task.category],
              color: 'white',
              fontSize: '0.7rem',
              height: 20,
            }}
          />
          <Chip
            label={task.priority}
            size="small"
            sx={{
              backgroundColor: priorityColors[task.priority],
              color: 'white',
              fontSize: '0.7rem',
              height: 20,
            }}
          />
        </Box>

        {task.assignedToName && (
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <PersonIcon sx={{ fontSize: 14, mr: 0.5, color: 'text.secondary' }} />
            <Typography variant="caption" color="text.secondary">
              {task.assignedToName}
            </Typography>
          </Box>
        )}

        {task.dueDate && (
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <ScheduleIcon sx={{ fontSize: 14, mr: 0.5, color: 'text.secondary' }} />
            <Typography variant="caption" color="text.secondary">
              Due: {formatDate(task.dueDate)}
            </Typography>
          </Box>
        )}

        {task.estimatedHours && (
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
            Est: {task.estimatedHours}h
          </Typography>
        )}

        {task.status === 'In Progress' && task.progress !== undefined && (
          <Box sx={{ mt: 1 }}>
            <LinearProgress
              variant="determinate"
              value={task.progress}
              color={getTaskProgressColor(task)}
              sx={{ height: 6, borderRadius: 3 }}
            />
            <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
              {task.progress}% Complete
            </Typography>
          </Box>
        )}

        {!readonly && (
          <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
            {task.status === 'Not Started' && (
              <Button
                size="small"
                variant="outlined"
                startIcon={<StartIcon />}
                onClick={() => handleTaskStart(task)}
                sx={{ fontSize: '0.7rem' }}
              >
                Start
              </Button>
            )}
            {task.status === 'In Progress' && (
              <Button
                size="small"
                variant="contained"
                startIcon={<CompleteIcon />}
                onClick={() => handleTaskComplete(task)}
                color="success"
                sx={{ fontSize: '0.7rem' }}
              >
                Done
              </Button>
            )}
            {task.status === 'Blocked' && (
              <Chip
                label="Blocked"
                size="small"
                color="error"
                icon={<BlockedIcon />}
              />
            )}
          </Box>
        )}
      </CardContent>
    </Card>
  );

  const renderKanbanView = () => (
    <Box sx={{ display: 'flex', gap: 2, overflowX: 'auto', pb: 2 }}>
      {columns.map((column) => (
        <Box
          key={column.id}
          sx={{
            minWidth: isMobile ? 280 : 320,
            maxWidth: isMobile ? 280 : 320,
            bgcolor: 'background.paper',
            borderRadius: 2,
            p: 2,
            border: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1rem' }}>
              {column.title}
            </Typography>
            <Chip
              label={tasksByStatus[column.id].length}
              size="small"
              sx={{ bgcolor: column.color, color: 'white' }}
            />
          </Box>

          {!readonly && (
            <Button
              fullWidth
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={() => {
                setNewTaskColumn(column.id);
                setIsAddingTask(true);
              }}
              sx={{ mb: 2, textTransform: 'none' }}
            >
              Add Task
            </Button>
          )}

          <Box sx={{ minHeight: 200 }}>
            {tasksByStatus[column.id].map((task) => renderTaskCard(task))}
          </Box>
        </Box>
      ))}
    </Box>
  );

  const renderListView = () => (
    <List>
      {filteredTasks.map((task) => (
        <ListItem key={task.id} disablePadding>
          <ListItemButton sx={{ borderRadius: 1, mb: 1 }}>
            <Box sx={{ width: '100%' }}>
              {renderTaskCard(task)}
            </Box>
          </ListItemButton>
        </ListItem>
      ))}
    </List>
  );

  return (
    <Box>
      {/* Header with filters and view controls */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 3, alignItems: 'center' }}>
        <TextField
          size="small"
          placeholder="Search tasks..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ minWidth: 200 }}
        />

        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Status</InputLabel>
          <Select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
            <MenuItem value="All">All Status</MenuItem>
            {columns.map((column) => (
              <MenuItem key={column.id} value={column.id}>
                {column.title}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Priority</InputLabel>
          <Select value={filterPriority} onChange={(e) => setFilterPriority(e.target.value)}>
            <MenuItem value="All">All Priority</MenuItem>
            <MenuItem value="High">High</MenuItem>
            <MenuItem value="Medium">Medium</MenuItem>
            <MenuItem value="Low">Low</MenuItem>
          </Select>
        </FormControl>

        {employees.length > 0 && (
          <FormControl size="small" sx={{ minWidth: 140 }}>
            <InputLabel>Assignee</InputLabel>
            <Select value={filterAssignee} onChange={(e) => setFilterAssignee(e.target.value)}>
              <MenuItem value="All">All Assignees</MenuItem>
              {employees.map((employee) => (
                <MenuItem key={employee.id} value={employee.id}>
                  {employee.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}

        <Box sx={{ ml: 'auto', display: 'flex', gap: 1 }}>
          <IconButton
            onClick={() => setViewMode('kanban')}
            color={viewMode === 'kanban' ? 'primary' : 'default'}
          >
            <ViewColumnIcon />
          </IconButton>
          <IconButton
            onClick={() => setViewMode('list')}
            color={viewMode === 'list' ? 'primary' : 'default'}
          >
            <ViewListIcon />
          </IconButton>
        </Box>
      </Box>

      {/* Task display */}
      {viewMode === 'kanban' ? renderKanbanView() : renderListView()}

      {/* Add Task Dialog */}
      <Dialog open={isAddingTask} onClose={() => setIsAddingTask(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add New Task</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <TextField
              label="Task Name"
              value={newTask.name}
              onChange={(e) => setNewTask({ ...newTask, name: e.target.value })}
              required
              fullWidth
            />
            
            <TextField
              label="Description"
              value={newTask.description}
              onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
              multiline
              rows={2}
              fullWidth
            />

            <Box sx={{ display: 'flex', gap: 2 }}>
              <FormControl fullWidth>
                <InputLabel>Category</InputLabel>
                <Select
                  value={newTask.category}
                  onChange={(e) => setNewTask({ ...newTask, category: e.target.value as Task['category'] })}
                >
                  <MenuItem value="Planning">Planning</MenuItem>
                  <MenuItem value="Installation">Installation</MenuItem>
                  <MenuItem value="Testing">Testing</MenuItem>
                  <MenuItem value="Documentation">Documentation</MenuItem>
                  <MenuItem value="Other">Other</MenuItem>
                </Select>
              </FormControl>

              <FormControl fullWidth>
                <InputLabel>Priority</InputLabel>
                <Select
                  value={newTask.priority}
                  onChange={(e) => setNewTask({ ...newTask, priority: e.target.value as Task['priority'] })}
                >
                  <MenuItem value="High">High</MenuItem>
                  <MenuItem value="Medium">Medium</MenuItem>
                  <MenuItem value="Low">Low</MenuItem>
                </Select>
              </FormControl>
            </Box>

            {employees.length > 0 && (
              <FormControl fullWidth>
                <InputLabel>Assign To</InputLabel>
                <Select
                  value={newTask.assignedTo}
                  onChange={(e) => setNewTask({ ...newTask, assignedTo: e.target.value })}
                >
                  <MenuItem value="">Unassigned</MenuItem>
                  {employees.map((employee) => (
                    <MenuItem key={employee.id} value={employee.id}>
                      {employee.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}

            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                label="Due Date"
                type="date"
                value={newTask.dueDate}
                onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                InputLabelProps={{ shrink: true }}
                fullWidth
              />

              <TextField
                label="Estimated Hours"
                type="number"
                value={newTask.estimatedHours}
                onChange={(e) => setNewTask({ ...newTask, estimatedHours: Number(e.target.value) })}
                fullWidth
              />
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsAddingTask(false)}>Cancel</Button>
          <Button onClick={handleTaskCreate} variant="contained">
            Add Task
          </Button>
        </DialogActions>
      </Dialog>

      {/* Task context menu */}
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={() => setMenuAnchor(null)}
      >
        <MenuItemComponent onClick={() => handleTaskEdit(tasks.find(t => t.id === selectedTaskId)!)}>
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Edit Task</ListItemText>
        </MenuItemComponent>
        <MenuItemComponent 
          onClick={() => handleTaskDelete(selectedTaskId)}
          sx={{ color: 'error.main' }}
        >
          <ListItemIcon>
            <DeleteIcon fontSize="small" sx={{ color: 'error.main' }} />
          </ListItemIcon>
          <ListItemText>Delete Task</ListItemText>
        </MenuItemComponent>
      </Menu>

      {/* Floating Action Button for mobile */}
      {isMobile && !readonly && (
        <Fab
          color="primary"
          sx={{ position: 'fixed', bottom: 16, right: 16 }}
          onClick={() => setIsAddingTask(true)}
        >
          <AddIcon />
        </Fab>
      )}
    </Box>
  );
};

export default TaskManager; 