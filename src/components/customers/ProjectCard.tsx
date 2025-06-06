import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  IconButton,
  LinearProgress,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Avatar,
  AvatarGroup,
} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import DescriptionIcon from '@mui/icons-material/Description';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import { Project } from '../../types/customer';

interface ProjectCardProps {
  project: Project;
  onEdit?: (project: Project) => void;
  onDelete?: (project: Project) => void;
  onViewDocuments?: (project: Project) => void;
}

export default function ProjectCard({
  project,
  onEdit,
  onDelete,
  onViewDocuments,
}: ProjectCardProps) {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleAction = (action: 'edit' | 'delete' | 'documents') => {
    handleMenuClose();
    switch (action) {
      case 'edit':
        onEdit?.(project);
        break;
      case 'delete':
        onDelete?.(project);
        break;
      case 'documents':
        onViewDocuments?.(project);
        break;
    }
  };

  const getStatusColor = (status: Project['status']): 'primary' | 'success' | 'error' | 'warning' => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'in-progress':
        return 'primary';
      case 'on-hold':
        return 'warning';
      case 'cancelled':
        return 'error';
      default:
        return 'primary';
    }
  };

  const getProgressValue = (status: Project['status']): number => {
    switch (status) {
      case 'planning':
        return 0;
      case 'in-progress':
        return 50;
      case 'completed':
        return 100;
      case 'on-hold':
        return project.milestones.filter(m => m.status === 'completed').length / project.milestones.length * 100;
      case 'cancelled':
        return project.milestones.filter(m => m.status === 'completed').length / project.milestones.length * 100;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: project.budget.currency,
    }).format(amount);
  };

  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2 }}>
          <Box>
            <Typography variant="h6" gutterBottom>
              {project.name}
            </Typography>
            <Chip
              label={project.status.replace('-', ' ')}
              color={getStatusColor(project.status)}
              size="small"
            />
          </Box>
          <IconButton size="small" onClick={handleMenuClick}>
            <MoreVertIcon />
          </IconButton>
        </Box>

        <Box sx={{ mb: 2 }}>
          <LinearProgress
            variant="determinate"
            value={getProgressValue(project.status)}
            color={getStatusColor(project.status)}
            sx={{ height: 8, borderRadius: 4 }}
          />
        </Box>

        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
          <Box>
            <Typography variant="caption" color="text.secondary">
              Budget
            </Typography>
            <Typography variant="body2">
              {formatCurrency(project.budget.total)}
            </Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary">
              Spent
            </Typography>
            <Typography variant="body2">
              {formatCurrency(project.budget.spent)}
            </Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary">
              Remaining
            </Typography>
            <Typography variant="body2" color={project.budget.remaining < 0 ? 'error.main' : 'inherit'}>
              {formatCurrency(project.budget.remaining)}
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <Box sx={{ flex: 1 }}>
            <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
              Team
            </Typography>
            <AvatarGroup max={4} sx={{ justifyContent: 'flex-start' }}>
              {project.team.map((member) => (
                <Avatar
                  key={member.id}
                  alt={member.name}
                  src={`https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}&background=random`}
                  sx={{ width: 32, height: 32 }}
                />
              ))}
            </AvatarGroup>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
              Documents
            </Typography>
            <Chip
              icon={<DescriptionIcon />}
              label={project.documents.length}
              size="small"
              onClick={() => handleAction('documents')}
            />
          </Box>
        </Box>

        <Box>
          <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
            Milestones
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {project.milestones.slice(0, 3).map((milestone) => (
              <Box
                key={milestone.id}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <Typography variant="body2" noWrap sx={{ flex: 1 }}>
                  {milestone.name}
                </Typography>
                <Chip
                  label={milestone.status}
                  size="small"
                  color={
                    milestone.status === 'completed' ? 'success' :
                    milestone.status === 'overdue' ? 'error' :
                    'default'
                  }
                />
              </Box>
            ))}
            {project.milestones.length > 3 && (
              <Typography variant="body2" color="text.secondary">
                +{project.milestones.length - 3} more milestones
              </Typography>
            )}
          </Box>
        </Box>
      </CardContent>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => handleAction('edit')}>
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Edit Project</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleAction('documents')}>
          <ListItemIcon>
            <DescriptionIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>View Documents</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleAction('delete')}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Delete Project</ListItemText>
        </MenuItem>
      </Menu>
    </Card>
  );
} 