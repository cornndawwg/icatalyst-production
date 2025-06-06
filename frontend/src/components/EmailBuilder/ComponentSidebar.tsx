import { useState, useRef, Fragment, DragEvent } from 'react';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Paper,
  useTheme,
} from '@mui/material';
import TextFieldsIcon from '@mui/icons-material/TextFields';
import ImageIcon from '@mui/icons-material/Image';
import SmartButtonIcon from '@mui/icons-material/SmartButton';
import HorizontalRuleIcon from '@mui/icons-material/HorizontalRule';
import ShareIcon from '@mui/icons-material/Share';
import { ComponentType } from './types';

const COMPONENTS = [
  {
    type: 'text' as ComponentType,
    label: 'Text Block',
    icon: <TextFieldsIcon />,
    description: 'Add a block of text with formatting options',
    preview: 'Your text here...',
    defaultContent: 'Type your message here. You can format this text using the properties panel.',
  },
  {
    type: 'image' as ComponentType,
    label: 'Image',
    icon: <ImageIcon />,
    description: 'Insert an image with customizable size',
    preview: 'https://via.placeholder.com/200x100?text=Drop+Image+Here',
    defaultContent: 'https://via.placeholder.com/400x200?text=Click+to+Upload+Image',
  },
  {
    type: 'button' as ComponentType,
    label: 'Button',
    icon: <SmartButtonIcon />,
    description: 'Add a call-to-action button',
    preview: 'Click Here',
    defaultContent: 'Click Me',
  },
  {
    type: 'divider' as ComponentType,
    label: 'Divider',
    icon: <HorizontalRuleIcon />,
    description: 'Insert a horizontal line divider',
  },
  {
    type: 'social' as ComponentType,
    label: 'Social Media',
    icon: <ShareIcon />,
    description: 'Add social media links',
    defaultContent: ['facebook', 'twitter', 'linkedin'],
  },
];

interface ComponentSidebarProps {
  onAddComponent: (type: ComponentType) => void;
}

export default function ComponentSidebar({ onAddComponent }: ComponentSidebarProps) {
  const theme = useTheme();
  const [draggedComponent, setDraggedComponent] = useState<ComponentType | null>(null);
  const dragPreviewRef = useRef<HTMLDivElement | null>(null);

  const handleDragStart = (e: DragEvent<HTMLDivElement>, type: ComponentType) => {
    // Create drag preview element if it doesn't exist
    if (!dragPreviewRef.current) {
      const preview = document.createElement('div');
      preview.style.position = 'absolute';
      preview.style.top = '-1000px';
      preview.style.padding = '12px 20px';
      preview.style.background = theme.palette.primary.main;
      preview.style.color = theme.palette.primary.contrastText;
      preview.style.border = `2px solid ${theme.palette.primary.dark}`;
      preview.style.borderRadius = '6px';
      preview.style.boxShadow = '0 4px 8px rgba(0,0,0,0.2)';
      preview.style.fontSize = '14px';
      preview.style.fontWeight = 'bold';
      preview.style.pointerEvents = 'none';
      preview.style.zIndex = '9999';
      document.body.appendChild(preview);
      dragPreviewRef.current = preview;
    }

    // Set drag data
    e.dataTransfer.setData('componentType', type);
    e.dataTransfer.effectAllowed = 'copy';
    setDraggedComponent(type);

    // Update preview content
    if (dragPreviewRef.current) {
      dragPreviewRef.current.textContent = `Add ${COMPONENTS.find(c => c.type === type)?.label}`;
      e.dataTransfer.setDragImage(
        dragPreviewRef.current,
        dragPreviewRef.current.clientWidth / 2,
        dragPreviewRef.current.clientHeight / 2
      );
    }

    // Add dragging class to body
    document.body.classList.add('dragging-component');

    // Set cursor style
    const el = e.currentTarget as HTMLElement;
    el.style.cursor = 'grabbing';
  };

  const handleDragEnd = (e: DragEvent<HTMLDivElement>) => {
    setDraggedComponent(null);
    document.body.classList.remove('dragging-component');

    // Reset cursor style
    const el = e.currentTarget as HTMLElement;
    el.style.cursor = 'grab';

    // Clean up preview element
    if (dragPreviewRef.current) {
      document.body.removeChild(dragPreviewRef.current);
      dragPreviewRef.current = null;
    }
  };

  return (
    <Box
      sx={{
        bgcolor: 'background.paper',
        borderRadius: 1,
        boxShadow: 1,
        overflow: 'hidden',
      }}
    >
      <Typography
        variant="subtitle1"
        sx={{
          px: 2,
          py: 1.5,
          bgcolor: 'primary.main',
          color: 'primary.contrastText',
          fontWeight: 'medium',
        }}
      >
        Drag Components
      </Typography>
      <List sx={{ p: 1 }}>
        {COMPONENTS.map((component, index) => (
          <Fragment key={component.type}>
            {index > 0 && <Divider sx={{ my: 1 }} />}
            <ListItem
              component={Paper}
              elevation={draggedComponent === component.type ? 4 : 1}
              draggable="true"
              onDragStart={(e) => handleDragStart(e, component.type)}
              onDragEnd={handleDragEnd}
              onClick={() => onAddComponent(component.type)}
              sx={{
                p: 2,
                mb: 1,
                cursor: 'grab',
                transition: 'all 0.2s ease',
                transform: draggedComponent === component.type ? 'scale(0.98)' : 'scale(1)',
                opacity: draggedComponent === component.type ? 0.6 : 1,
                '&:hover': {
                  bgcolor: 'action.hover',
                  transform: 'translateY(-2px)',
                },
                '&:active': {
                  cursor: 'grabbing',
                  transform: 'scale(0.95)',
                },
                '&[draggable=true]:active': {
                  cursor: 'grabbing',
                },
                userSelect: 'none',
                touchAction: 'none',
              }}
            >
              <Box sx={{ width: '100%' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                  <ListItemIcon 
                    sx={{ 
                      minWidth: 40,
                      color: 'primary.main',
                      '& svg': { fontSize: 24 }
                    }}
                  >
                    {component.icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={component.label}
                    secondary={component.description}
                    primaryTypographyProps={{
                      variant: 'body1',
                      fontWeight: 'medium',
                      color: 'text.primary',
                    }}
                    secondaryTypographyProps={{
                      variant: 'caption',
                      color: 'text.secondary',
                    }}
                  />
                </Box>
                {component.preview && (
                  <Box
                    sx={{
                      p: 1.5,
                      bgcolor: 'background.default',
                      borderRadius: 1,
                      border: '2px dashed',
                      borderColor: 'divider',
                      color: 'text.secondary',
                      fontSize: '0.875rem',
                      textAlign: 'center',
                      transition: 'all 0.2s',
                      '&:hover': {
                        borderColor: 'primary.main',
                        bgcolor: 'action.hover',
                      },
                    }}
                  >
                    {component.type === 'image' ? (
                      <Box
                        component="img"
                        src={component.preview}
                        alt="Preview"
                        sx={{
                          width: '100%',
                          height: 'auto',
                          borderRadius: 1,
                          boxShadow: 1,
                          pointerEvents: 'none',
                        }}
                      />
                    ) : (
                      component.preview
                    )}
                  </Box>
                )}
              </Box>
            </ListItem>
          </Fragment>
        ))}
      </List>
    </Box>
  );
} 
