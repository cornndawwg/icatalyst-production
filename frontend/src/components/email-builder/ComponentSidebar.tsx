import { Box, Paper, Typography } from '@mui/material';
import { Draggable, Droppable, DroppableProvided, DraggableProvided, DraggableStateSnapshot } from '@hello-pangea/dnd';
import TextFieldsIcon from '@mui/icons-material/TextFields';
import ImageIcon from '@mui/icons-material/Image';
import SmartButtonIcon from '@mui/icons-material/SmartButton';
import HorizontalRuleIcon from '@mui/icons-material/HorizontalRule';
import ShareIcon from '@mui/icons-material/Share';
import { ComponentType } from './types';

interface ComponentItem {
  type: ComponentType;
  label: string;
  icon: React.ReactNode;
}

const components: ComponentItem[] = [
  { type: 'text', label: 'Text', icon: <TextFieldsIcon /> },
  { type: 'image', label: 'Image', icon: <ImageIcon /> },
  { type: 'button', label: 'Button', icon: <SmartButtonIcon /> },
  { type: 'divider', label: 'Divider', icon: <HorizontalRuleIcon /> },
  { type: 'social', label: 'Social Media', icon: <ShareIcon /> },
];

const ComponentSidebar: React.FC = () => {
  return (
    <Box
      component={Paper}
      elevation={2}
      sx={{
        width: 250,
        p: 2,
        borderRight: 1,
        borderColor: 'divider',
      }}
    >
      <Typography variant="h6" gutterBottom>
        Components
      </Typography>
      
      <Droppable droppableId="sidebar" isDropDisabled>
        {(provided: DroppableProvided) => (
          <Box
            ref={provided.innerRef}
            {...provided.droppableProps}
          >
            {components.map((item, index) => (
              <Draggable
                key={item.type}
                draggableId={item.type}
                index={index}
              >
                {(provided: DraggableProvided, snapshot: DraggableStateSnapshot) => (
                  <Box
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      p: 2,
                      my: 1,
                      borderRadius: 1,
                      bgcolor: 'background.paper',
                      border: '1px solid',
                      borderColor: 'divider',
                      cursor: 'grab',
                      '&:hover': {
                        bgcolor: 'action.hover',
                      },
                      ...(snapshot.isDragging && {
                        bgcolor: 'action.selected',
                      }),
                    }}
                  >
                    {item.icon}
                    <Typography>{item.label}</Typography>
                  </Box>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </Box>
        )}
      </Droppable>
    </Box>
  );
};

export default ComponentSidebar; 
