import { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  IconButton,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import ComponentSidebar from './ComponentSidebar';
import PropertiesPanel from './PropertiesPanel';
import { EmailComponent, ComponentType, ComponentProps, TextComponentProps, ImageComponentProps, ButtonComponentProps, DividerComponentProps, SocialComponentProps } from './types';
import { renderEmailComponent } from './components';
import './styles.css';

const EmailBuilder: React.FC = () => {
  const [components, setComponents] = useState<EmailComponent[]>([]);
  const [selectedComponent, setSelectedComponent] = useState<number | null>(null);

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;

    if (result.source.droppableId === 'sidebar' && result.destination.droppableId === 'builder') {
      // Add new component from sidebar
      const newComponent: EmailComponent = {
        id: `component-${Date.now()}`,
        type: result.draggableId as ComponentType,
        props: getDefaultProps(result.draggableId as ComponentType),
      };
      
      const newComponents = [...components];
      newComponents.splice(result.destination.index, 0, newComponent);
      setComponents(newComponents);
    } else if (result.source.droppableId === 'builder' && result.destination.droppableId === 'builder') {
      // Reorder existing components
      const newComponents = [...components];
      const [removed] = newComponents.splice(result.source.index, 1);
      newComponents.splice(result.destination.index, 0, removed);
      setComponents(newComponents);
    }
  };

  const handleComponentSelect = (index: number) => {
    setSelectedComponent(index);
  };

  const handleComponentUpdate = (index: number, props: any) => {
    const newComponents = [...components];
    newComponents[index] = { ...newComponents[index], props };
    setComponents(newComponents);
  };

  const handleDuplicate = (index: number) => {
    const newComponents = [...components];
    const duplicated = { ...components[index], id: `component-${Date.now()}` };
    newComponents.splice(index + 1, 0, duplicated);
    setComponents(newComponents);
  };

  const handleDelete = (index: number) => {
    const newComponents = [...components];
    newComponents.splice(index, 1);
    setComponents(newComponents);
    if (selectedComponent === index) {
      setSelectedComponent(null);
    }
  };

  const getDefaultProps = (type: ComponentType): ComponentProps => {
    switch (type) {
      case 'text':
        return { 
          content: 'New Text', 
          fontSize: 16, 
          color: '#000000', 
          align: 'left' as const,
          fontFamily: 'Arial'
        } as TextComponentProps;
      case 'image':
        return { 
          src: 'https://via.placeholder.com/400x200', 
          alt: 'Placeholder', 
          width: '100%', 
          align: 'center' as const
        } as ImageComponentProps;
      case 'button':
        return { 
          text: 'Click Me', 
          url: '#', 
          backgroundColor: '#007bff', 
          textColor: '#ffffff',
          align: 'center' as const
        } as ButtonComponentProps;
      case 'divider':
        return { 
          style: 'solid' as const, 
          color: '#cccccc', 
          spacing: 20 
        } as DividerComponentProps;
      case 'social':
        return { 
          networks: ['facebook', 'twitter'], 
          size: 32,
          align: 'center' as const
        } as SocialComponentProps;
      default:
        // This should never happen, but we need a return for TypeScript
        return { 
          content: '', 
          fontSize: 16, 
          color: '#000000', 
          align: 'left' as const
        } as TextComponentProps;
    }
  };

  return (
    <Box sx={{ display: 'flex', height: 'calc(100vh - 64px)' }}>
      <ComponentSidebar />
      
      <DragDropContext onDragEnd={handleDragEnd}>
        <Box sx={{ flex: 1, p: 2, overflowY: 'auto' }}>
          <Paper sx={{ minHeight: '100%', p: 2 }}>
            <Droppable droppableId="builder">
              {(provided) => (
                <Box
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  sx={{ minHeight: '100%' }}
                >
                  {components.length === 0 ? (
                    <Typography
                      variant="body1"
                      color="text.secondary"
                      textAlign="center"
                      py={4}
                    >
                      Drag and drop components here to build your email
                    </Typography>
                  ) : (
                    components.map((component, index) => (
                      <Draggable
                        key={component.id}
                        draggableId={component.id}
                        index={index}
                      >
                        {(provided) => (
                          <Box
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            onClick={() => handleComponentSelect(index)}
                            sx={{
                              position: 'relative',
                              my: 1,
                              p: 1,
                              border: selectedComponent === index ? '2px solid #007bff' : '2px solid transparent',
                              '&:hover': {
                                '& .actions': {
                                  opacity: 1,
                                },
                              },
                            }}
                          >
                            {renderEmailComponent(component)}
                            <Box
                              className="actions"
                              sx={{
                                position: 'absolute',
                                top: 0,
                                right: 0,
                                opacity: 0,
                                transition: 'opacity 0.2s',
                                bgcolor: 'rgba(255, 255, 255, 0.9)',
                              }}
                            >
                              <IconButton
                                size="small"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDuplicate(index);
                                }}
                              >
                                <ContentCopyIcon fontSize="small" />
                              </IconButton>
                              <IconButton
                                size="small"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDelete(index);
                                }}
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Box>
                          </Box>
                        )}
                      </Draggable>
                    ))
                  )}
                  {provided.placeholder}
                </Box>
              )}
            </Droppable>
          </Paper>
        </Box>
      </DragDropContext>

      <PropertiesPanel
        component={selectedComponent !== null ? components[selectedComponent] : null}
        onUpdate={(props) => {
          if (selectedComponent !== null) {
            handleComponentUpdate(selectedComponent, props);
          }
        }}
      />
    </Box>
  );
};

export default EmailBuilder; 
