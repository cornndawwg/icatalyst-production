import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Chip,
  Box,
  IconButton,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tabs,
  Tab,
  Paper,
} from '@mui/material';
import {
  Email as EmailIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  ContentCopy as CopyIcon,
  Preview as PreviewIcon,
} from '@mui/icons-material';
import EmailBuilder from './EmailBuilder';

const templateCategories = [
  'Interior Designers',
  'Architects', 
  'Builders',
  'Property Management',
  'General',
  'Sales'
];

const mockTemplates = [
  {
    id: 1,
    name: 'Interior Designer Welcome',
    category: 'Interior Designers',
    description: 'Professional welcome email for interior design clients',
    subject: 'Transform Your Spaces with Smart Home Technology',
    content: '<h2>Transform Your Designs with Smart Technology</h2><p>Dear Interior Design Professional,</p><p>Elevate your interior design projects...</p>',
    usage: 45,
    lastModified: '2024-01-15',
    isCustom: false,
  },
  {
    id: 2,
    name: 'Architect Partnership',
    category: 'Architects',
    description: 'Partnership proposal template for architects',
    subject: 'Smart Building Solutions for Modern Architecture',
    content: '<h2>Smart Building Solutions for Modern Architecture</h2><p>Partner with us to integrate...</p>',
    usage: 32,
    lastModified: '2024-01-12',
    isCustom: false,
  },
  {
    id: 3,
    name: 'Custom Property Manager Template',
    category: 'Property Management',
    description: 'Custom template created for property managers',
    subject: 'Reduce Costs & Increase Property Value',
    content: '<h2>Reduce Costs & Increase Property Value</h2><p>Smart home technology that pays for itself...</p>',
    usage: 28,
    lastModified: '2024-01-10',
    isCustom: true,
  },
];

interface TemplateManagerProps {
  open: boolean;
  onClose: () => void;
  onSelectTemplate?: (template: any) => void;
  onUpdate?: (templates: any[]) => void;
  initialTemplates?: any[];
}

export default function TemplateManager({ open, onClose, onSelectTemplate, onUpdate, initialTemplates = [] }: TemplateManagerProps) {
  const [activeTab, setActiveTab] = useState(0);
  const [templates, setTemplates] = useState<any[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
  const [editMode, setEditMode] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);
  const [newTemplate, setNewTemplate] = useState({
    name: '',
    category: 'General',
    description: '',
    subject: '',
    content: '',
  });

  // Update templates when initialTemplates change (only after hydration)
  React.useEffect(() => {
    if (initialTemplates.length > 0) {
      setTemplates(initialTemplates);
    } else {
      setTemplates(mockTemplates);
    }
    setIsHydrated(true);
  }, [initialTemplates]);

  // Notify parent when templates change
  const updateTemplates = (newTemplates: any[]) => {
    setTemplates(newTemplates);
    if (onUpdate) {
      onUpdate(newTemplates);
    }
  };

  const handleEditTemplate = (template: any) => {
    setSelectedTemplate(template);
    setEditMode(true);
    setActiveTab(1);
  };

  const handleCreateTemplate = () => {
    setSelectedTemplate(null);
    setNewTemplate({
      name: '',
      category: 'General',
      description: '',
      subject: '',
      content: '',
    });
    setEditMode(true);
    setActiveTab(1);
  };

  const handleSaveTemplate = () => {
    if (selectedTemplate) {
      // Update existing template
      updateTemplates(templates.map(t => 
        t.id === selectedTemplate.id 
          ? { ...selectedTemplate, lastModified: new Date().toISOString().split('T')[0] }
          : t
      ));
    } else {
      // Create new template
      const template = {
        id: Date.now(),
        ...newTemplate,
        usage: 0,
        lastModified: new Date().toISOString().split('T')[0],
        isCustom: true,
      };
      updateTemplates([template, ...templates]);
    }
    
    setEditMode(false);
    setActiveTab(0);
  };

  const handleDeleteTemplate = (templateId: number) => {
    updateTemplates(templates.filter(t => t.id !== templateId));
  };

  const handleDuplicateTemplate = (template: any) => {
    const duplicated = {
      ...template,
      id: Date.now(),
      name: `${template.name} (Copy)`,
      usage: 0,
      lastModified: new Date().toISOString().split('T')[0],
      isCustom: true,
    };
    updateTemplates([duplicated, ...templates]);
  };

  const handleUseTemplate = (template: any) => {
    if (onSelectTemplate) {
      onSelectTemplate(template);
    }
    onClose();
  };

  const renderTemplateGrid = () => (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Button
          variant="outlined"
          startIcon={<AddIcon />}
          onClick={handleCreateTemplate}
          fullWidth
          sx={{ mb: 2 }}
        >
          Create New Template
        </Button>
      </Grid>
      
      {templates.map((template) => (
        <Grid item xs={12} sm={6} md={4} key={template.id}>
          <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <CardMedia
              component="div"
              sx={{ 
                height: 120, 
                bgcolor: 'grey.100',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'grey.600'
              }}
            >
              <EmailIcon sx={{ fontSize: 40 }} />
            </CardMedia>
            
            <CardContent sx={{ flexGrow: 1 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                <Typography variant="h6" component="h3" gutterBottom>
                  {template.name}
                </Typography>
                <Box>
                  <IconButton size="small" onClick={() => handleEditTemplate(template)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton size="small" onClick={() => handleDuplicateTemplate(template)}>
                    <CopyIcon />
                  </IconButton>
                  {template.isCustom && (
                    <IconButton size="small" onClick={() => handleDeleteTemplate(template.id)}>
                      <DeleteIcon />
                    </IconButton>
                  )}
                </Box>
              </Box>
              
              <Chip 
                label={template.category} 
                size="small" 
                sx={{ mb: 1 }}
                color={template.isCustom ? 'secondary' : 'primary'}
              />
              
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {template.description}
              </Typography>
              
              <Typography variant="caption" display="block" sx={{ mb: 1 }}>
                <strong>Subject:</strong> {template.subject}
              </Typography>
              
              <Typography variant="caption" color="text.secondary">
                Used {template.usage} times • Modified {template.lastModified}
              </Typography>
            </CardContent>
            
            <Box sx={{ p: 2, pt: 0 }}>
              <Button
                variant="contained"
                size="small"
                onClick={() => handleUseTemplate(template)}
                fullWidth
              >
                Use Template
              </Button>
            </Box>
          </Card>
        </Grid>
      ))}
    </Grid>
  );

  const renderTemplateEditor = () => {
    const template = selectedTemplate || newTemplate;
    
    return (
      <Box>
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Template Name"
              value={template.name}
              onChange={(e) => {
                if (selectedTemplate) {
                  setSelectedTemplate({ ...selectedTemplate, name: e.target.value });
                } else {
                  setNewTemplate({ ...newTemplate, name: e.target.value });
                }
              }}
              required
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Category</InputLabel>
              <Select
                value={template.category}
                label="Category"
                onChange={(e) => {
                  if (selectedTemplate) {
                    setSelectedTemplate({ ...selectedTemplate, category: e.target.value });
                  } else {
                    setNewTemplate({ ...newTemplate, category: e.target.value });
                  }
                }}
              >
                {templateCategories.map((category) => (
                  <MenuItem key={category} value={category}>
                    {category}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Description"
              value={template.description}
              onChange={(e) => {
                if (selectedTemplate) {
                  setSelectedTemplate({ ...selectedTemplate, description: e.target.value });
                } else {
                  setNewTemplate({ ...newTemplate, description: e.target.value });
                }
              }}
              multiline
              rows={2}
            />
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Email Subject"
              value={template.subject}
              onChange={(e) => {
                if (selectedTemplate) {
                  setSelectedTemplate({ ...selectedTemplate, subject: e.target.value });
                } else {
                  setNewTemplate({ ...newTemplate, subject: e.target.value });
                }
              }}
              required
            />
          </Grid>
        </Grid>
        
        {/* Simplified template editor for now */}
        <Paper sx={{ p: 3, minHeight: 400, bgcolor: 'grey.50' }}>
          <Typography variant="h6" gutterBottom>Template Content Editor</Typography>
          <TextField
            fullWidth
            multiline
            rows={12}
            label="Template Content"
            value={template.content}
            onChange={(e) => {
              if (selectedTemplate) {
                setSelectedTemplate({ ...selectedTemplate, content: e.target.value });
              } else {
                setNewTemplate({ ...newTemplate, content: e.target.value });
              }
            }}
            placeholder="Enter your template content here..."
          />
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            📧 Full drag-and-drop email builder coming soon!
          </Typography>
        </Paper>
      </Box>
    );
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xl" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <EmailIcon sx={{ mr: 1 }} />
          Email Template Manager
        </Box>
      </DialogTitle>
      
      <DialogContent>
        {!isHydrated ? (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="h6" gutterBottom>
              Loading Templates...
            </Typography>
            <Grid container spacing={3}>
              {[1, 2, 3, 4].map((index) => (
                <Grid item xs={12} sm={6} md={4} key={index}>
                  <Box sx={{ height: 200, bgcolor: 'grey.100', borderRadius: 1 }} />
                </Grid>
              ))}
            </Grid>
          </Box>
        ) : (
          <Box sx={{ width: '100%' }}>
            <Tabs value={activeTab} onChange={(e, v) => setActiveTab(v)}>
              <Tab label="Templates Library" />
              <Tab label={editMode ? (selectedTemplate ? 'Edit Template' : 'Create Template') : 'Template Editor'} />
            </Tabs>
            
            <Box sx={{ mt: 3 }}>
              {activeTab === 0 && renderTemplateGrid()}
              {activeTab === 1 && renderTemplateEditor()}
            </Box>
          </Box>
        )}
      </DialogContent>
      
      <DialogActions>
        {activeTab === 1 && editMode && isHydrated && (
          <>
            <Button onClick={() => { setEditMode(false); setActiveTab(0); }}>
              Cancel
            </Button>
            <Button variant="contained" onClick={handleSaveTemplate}>
              {selectedTemplate ? 'Update Template' : 'Create Template'}
            </Button>
          </>
        )}
        
        {(activeTab === 0 || !isHydrated) && (
          <Button onClick={onClose}>
            Close
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
} 