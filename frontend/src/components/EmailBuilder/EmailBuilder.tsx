import { useState, useCallback, Fragment } from 'react';
import {
  Box,
  Paper,
  Typography,
  IconButton,
  Tabs,
  Tab,
  Button,
  Tooltip,
  useTheme,
} from '@mui/material';
import DesktopWindowsIcon from '@mui/icons-material/DesktopWindows';
import PhoneAndroidIcon from '@mui/icons-material/PhoneAndroid';
import CodeIcon from '@mui/icons-material/Code';
import DeleteIcon from '@mui/icons-material/Delete';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { DragDropContext, Droppable, Draggable, DropResult, DroppableProvided, DraggableProvided, DraggableStateSnapshot } from '@hello-pangea/dnd';
import type { DroppableProps, DraggableProps } from '@hello-pangea/dnd';
import ComponentSidebar from './ComponentSidebar';
import PropertiesPanel from './PropertiesPanel';
import { EmailComponent, ComponentType, ComponentProps, TextComponentProps, ImageComponentProps, ButtonComponentProps, DividerComponentProps, SocialComponentProps } from './types';
import { renderEmailComponent } from './components';
import './styles.css';
import CloseIcon from '@mui/icons-material/Close';

interface EmailBuilderProps {
  value: EmailComponent[];
  onChange: (components: EmailComponent[]) => void;
  onSendTest?: () => void;
}

const DroppableComponent = Droppable as React.ComponentType<DroppableProps>;
const DraggableComponent = Draggable as React.ComponentType<DraggableProps>;

export default function EmailBuilder({ value, onChange, onSendTest }: EmailBuilderProps) {
  const theme = useTheme();
  const [selectedComponent, setSelectedComponent] = useState<EmailComponent | null>(null);
  const [previewMode, setPreviewMode] = useState<'desktop' | 'mobile'>('desktop');
  const [showCode, setShowCode] = useState(false);
  const [dropTarget, setDropTarget] = useState<number | null>(null);

  const handleDragEnd = useCallback((result: DropResult) => {
    setDropTarget(null);
    if (!result.destination) return;

    const items = Array.from(value);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    onChange(items);
  }, [value, onChange]);

  const handleComponentUpdate = useCallback((updatedComponent: EmailComponent) => {
    const newComponents = value.map(comp =>
      comp.id === updatedComponent.id ? updatedComponent : comp
    );
    onChange(newComponents);
    setSelectedComponent(updatedComponent);
  }, [value, onChange]);

  const handleComponentDelete = useCallback((componentId: string) => {
    const newComponents = value.filter(comp => comp.id !== componentId);
    onChange(newComponents);
    setSelectedComponent(null);
  }, [value, onChange]);

  const handleComponentDuplicate = useCallback((component: EmailComponent) => {
    const newComponent = {
      ...component,
      id: `comp-${Date.now()}`,
    };
    const index = value.findIndex(c => c.id === component.id);
    const newComponents = [...value];
    newComponents.splice(index + 1, 0, newComponent);
    onChange(newComponents);
  }, [value, onChange]);

  const handleAddComponent = useCallback((type: ComponentType) => {
    const newComponent: EmailComponent = {
      id: `comp-${Date.now()}`,
      type,
      props: getDefaultProps(type),
    };
    onChange([...value, newComponent]);
  }, [value, onChange]);

  const getDefaultProps = (type: ComponentType): ComponentProps => {
    switch (type) {
      case 'text':
        return {
          content: 'Type your message here. You can format this text using the properties panel.',
          fontSize: 16,
          color: '#000000',
          align: 'left',
          fontFamily: 'Arial',
        } as TextComponentProps;
      case 'image':
        return {
          src: 'https://via.placeholder.com/400x200?text=Click+to+Upload+Image',
          alt: 'Placeholder image',
          width: '100%',
          align: 'center',
        } as ImageComponentProps;
      case 'button':
        return {
          text: 'Click Me',
          backgroundColor: '#007bff',
          textColor: '#ffffff',
          url: '#',
          borderRadius: 4,
          align: 'center',
        } as ButtonComponentProps;
      case 'divider':
        return {
          style: 'solid',
          color: '#e0e0e0',
          spacing: 20,
        } as DividerComponentProps;
      case 'social':
        return {
          networks: ['facebook', 'twitter', 'linkedin'],
          size: 32,
          align: 'center',
        } as SocialComponentProps;
    }
  };

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>, index: number) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'copy';
    
    // Only update drop target if it's different
    if (dropTarget !== index) {
      setDropTarget(index);
    }
  }, [dropTarget]);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Only clear drop target if we're leaving the container
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setDropTarget(null);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    const componentType = e.dataTransfer.getData('componentType') as ComponentType;
    if (!componentType) return;

    const newComponent: EmailComponent = {
      id: `comp-${Date.now()}`,
      type: componentType,
      props: getDefaultProps(componentType),
    };

    const dropIndex = dropTarget !== null ? dropTarget : value.length;
    const newComponents = [...value];
    newComponents.splice(dropIndex, 0, newComponent);
    onChange(newComponents);
    setDropTarget(null);

    // Remove dragging class
    document.body.classList.remove('dragging-component');
  }, [value, onChange, dropTarget, getDefaultProps]);

  const renderDropZone = useCallback((index: number) => (
    <Box
      className="email-builder-dropzone"
      onDragOver={(e) => handleDragOver(e, index)}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      sx={{
        height: dropTarget === index ? '60px' : '8px',
        my: dropTarget === index ? 2 : 0.5,
        mx: -1,
        transition: 'all 0.2s ease',
        bgcolor: dropTarget === index ? 'primary.main' : 'transparent',
        opacity: dropTarget === index ? 0.1 : 0,
        borderRadius: 1,
        border: dropTarget === index ? '2px dashed' : 'none',
        borderColor: 'primary.main',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        '&:hover': {
          height: '30px',
          opacity: 0.05,
          bgcolor: 'primary.main',
        },
        '&::before': dropTarget === index ? {
          content: '"Drop here"',
          color: 'text.secondary',
          fontSize: '0.875rem',
          fontWeight: 'medium',
        } : undefined,
      }}
    />
  ), [dropTarget, handleDrop, handleDragOver, handleDragLeave]);

  const renderComponent = (component: EmailComponent): JSX.Element => {
    const rendered = renderEmailComponent(component);
    return (
      <div className="component-content">
        {rendered}
      </div>
    );
  };

  return (
    <Box sx={{ display: 'flex', gap: 2, height: '100%', overflow: 'hidden' }}>
      <Box sx={{ width: 280, flexShrink: 0, overflow: 'auto' }}>
        <ComponentSidebar onAddComponent={handleAddComponent} />
      </Box>

      <Box
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        <Box
          sx={{
            p: 2,
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            borderBottom: 1,
            borderColor: 'divider',
            bgcolor: 'background.paper',
          }}
        >
          <Tabs
            value={previewMode}
            onChange={(_, value) => setPreviewMode(value)}
            sx={{ minHeight: 'auto' }}
          >
            <Tab
              icon={<DesktopWindowsIcon />}
              value="desktop"
              sx={{ minHeight: 'auto', px: 2 }}
            />
            <Tab
              icon={<PhoneAndroidIcon />}
              value="mobile"
              sx={{ minHeight: 'auto', px: 2 }}
            />
          </Tabs>
          <Box sx={{ flex: 1 }} />
          <Tooltip title="View HTML">
            <IconButton
              color={showCode ? 'primary' : 'default'}
              onClick={() => setShowCode(!showCode)}
            >
              <CodeIcon />
            </IconButton>
          </Tooltip>
          {onSendTest && (
            <Button
              variant="contained"
              size="small"
              onClick={onSendTest}
            >
              Send Test
            </Button>
          )}
        </Box>

        <Box
          sx={{
            flex: 1,
            overflow: 'auto',
            bgcolor: 'grey.100',
            p: 3,
          }}
        >
          <Paper
            sx={{
              maxWidth: previewMode === 'mobile' ? 480 : 800,
              mx: 'auto',
              overflow: 'hidden',
              transition: 'max-width 0.3s ease',
              bgcolor: 'background.paper',
              minHeight: 400,
            }}
          >
            <DragDropContext onDragEnd={handleDragEnd}>
              <DroppableComponent droppableId="email-builder">
                {(provided: DroppableProvided) => (
                  <Box
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    sx={{
                      minHeight: 400,
                      p: 3,
                      '& > *:not(:last-child)': {
                        mb: 2,
                      },
                    }}
                  >
                    {value.length === 0 && (
                      <Box
                        className="empty-canvas"
                        sx={{
                          height: '100%',
                          minHeight: 300,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          border: '2px dashed',
                          borderColor: 'divider',
                          borderRadius: 2,
                          p: 4,
                          bgcolor: 'action.hover',
                        }}
                      >
                        <Typography
                          variant="body1"
                          color="text.secondary"
                          align="center"
                          sx={{ maxWidth: 400 }}
                        >
                          Drag components from the left sidebar or click to add them to your email
                        </Typography>
                      </Box>
                    )}
                    {renderDropZone(0)}
                    {value.map((component, index) => (
                      <Fragment key={component.id}>
                        <DraggableComponent
                          draggableId={component.id}
                          index={index}
                        >
                          {(dragProvided: DraggableProvided, dragSnapshot: DraggableStateSnapshot) => (
                            <Box
                              ref={dragProvided.innerRef}
                              {...dragProvided.draggableProps}
                              sx={{
                                position: 'relative',
                                transition: 'all 0.2s ease',
                                transform: dragSnapshot.isDragging ? 'scale(1.02)' : 'none',
                                '&:hover': {
                                  '& .component-actions': {
                                    opacity: 1,
                                  },
                                },
                              }}
                            >
                              <Box
                                {...dragProvided.dragHandleProps}
                                onClick={() => setSelectedComponent(component)}
                                sx={{
                                  position: 'relative',
                                  cursor: 'grab',
                                  '&:active': {
                                    cursor: 'grabbing',
                                  },
                                  outline: selectedComponent?.id === component.id
                                    ? `2px solid ${theme.palette.primary.main}`
                                    : 'none',
                                  outlineOffset: 2,
                                  borderRadius: 1,
                                  '&:hover': {
                                    bgcolor: 'action.hover',
                                  },
                                  p: 2,
                                }}
                              >
                                <div className="component-content">
                                  {renderComponent(component)}
                                </div>
                                <Box
                                  className="component-actions"
                                  sx={{
                                    position: 'absolute',
                                    top: -20,
                                    right: -4,
                                    display: 'flex',
                                    gap: 0.5,
                                    opacity: 0,
                                    transition: 'opacity 0.2s',
                                    bgcolor: 'background.paper',
                                    borderRadius: '4px 4px 0 0',
                                    boxShadow: 1,
                                    p: 0.5,
                                    zIndex: 1,
                                  }}
                                >
                                  <IconButton
                                    size="small"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleComponentDuplicate(component);
                                    }}
                                  >
                                    <ContentCopyIcon fontSize="small" />
                                  </IconButton>
                                  <IconButton
                                    size="small"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleComponentDelete(component.id);
                                    }}
                                  >
                                    <DeleteIcon fontSize="small" />
                                  </IconButton>
                                </Box>
                              </Box>
                            </Box>
                          )}
                        </DraggableComponent>
                        {renderDropZone(index + 1)}
                      </Fragment>
                    ))}
                    {provided.placeholder}
                    {/* Footer can be added here if needed */}
                  </Box>
                )}
              </DroppableComponent>
            </DragDropContext>
          </Paper>
        </Box>

        {/* Properties Panel Overlay */}
        {selectedComponent && (
          <Box
            sx={{
              position: 'fixed',
              top: 0,
              right: 0,
              bottom: 0,
              width: '100%',
              maxWidth: 360,
              bgcolor: 'background.paper',
              boxShadow: '-4px 0 20px rgba(0, 0, 0, 0.1)',
              zIndex: 1200,
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
            }}
          >
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                px: 2,
                py: 1.5,
                borderBottom: 1,
                borderColor: 'divider',
                bgcolor: 'background.paper',
              }}
            >
              <Typography variant="subtitle1" fontWeight="medium">
                Properties
              </Typography>
              <IconButton
                size="small"
                onClick={() => setSelectedComponent(null)}
                sx={{ color: 'text.secondary' }}
              >
                <CloseIcon fontSize="small" />
              </IconButton>
            </Box>
            <Box
              className="properties-panel-scroll"
              sx={{
                flex: 1,
                overflow: 'auto',
              }}
            >
              <PropertiesPanel
                component={selectedComponent}
                onUpdate={handleComponentUpdate}
                onClose={() => setSelectedComponent(null)}
              />
            </Box>
          </Box>
        )}

        {/* Semi-transparent overlay behind properties panel */}
        {selectedComponent && (
          <Box
            onClick={() => setSelectedComponent(null)}
            sx={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              bgcolor: 'rgba(0, 0, 0, 0.3)',
              zIndex: 1100,
            }}
          />
        )}
      </Box>
    </Box>
  );
} 
