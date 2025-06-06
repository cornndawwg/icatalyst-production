import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Grid,
  TextField,
  Card,
  CardContent,
  IconButton,
  Tooltip,
  Divider,
  Switch,
  FormControlLabel,
  Tabs,
  Tab,
  Alert,
} from '@mui/material';
import {
  TextFields as TextIcon,
  Image as ImageIcon,
  SmartButton as ButtonIcon,
  DragIndicator as DragIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Code as CodeIcon,
  Preview as PreviewIcon,
  Undo as UndoIcon,
  Redo as RedoIcon,
  Save as SaveIcon,
  Title as TitleIcon,
  FormatQuote as QuoteIcon,
  Remove as DividerIcon,
} from '@mui/icons-material';

interface EmailBlock {
  id: string;
  type: 'text' | 'heading' | 'image' | 'button' | 'divider' | 'quote';
  content: any;
  styles: any;
}

interface EmailBuilderProps {
  template?: any;
  subject: string;
  onContentChange: (content: string) => void;
  onSubjectChange: (subject: string) => void;
}

const defaultBlocks: EmailBlock[] = [
  {
    id: '1',
    type: 'heading',
    content: { text: 'Welcome to Smart Home Solutions' },
    styles: { fontSize: '24px', color: '#1976d2', textAlign: 'center' }
  },
  {
    id: '2',
    type: 'text',
    content: { text: 'Transform your space with our cutting-edge smart home technology.' },
    styles: { fontSize: '16px', color: '#333333', textAlign: 'left' }
  },
  {
    id: '3',
    type: 'button',
    content: { text: 'Schedule a Demo', url: 'https://example.com/demo' },
    styles: { backgroundColor: '#1976d2', color: '#ffffff', padding: '12px 24px' }
  }
];

const blockTemplates = [
  { type: 'text', icon: <TextIcon />, label: 'Text Block' },
  { type: 'heading', icon: <TitleIcon />, label: 'Heading' },
  { type: 'image', icon: <ImageIcon />, label: 'Image' },
  { type: 'button', icon: <ButtonIcon />, label: 'Button' },
  { type: 'quote', icon: <QuoteIcon />, label: 'Quote' },
  { type: 'divider', icon: <DividerIcon />, label: 'Divider' },
];

export default function EmailBuilder({ template, subject, onContentChange, onSubjectChange }: EmailBuilderProps) {
  const [activeTab, setActiveTab] = useState(0);
  const [blocks, setBlocks] = useState<EmailBlock[]>(defaultBlocks);
  const [selectedBlock, setSelectedBlock] = useState<string | null>(null);
  const [emailSubject, setEmailSubject] = useState(subject);
  const [previewMode, setPreviewMode] = useState(false);

  useEffect(() => {
    if (template && template.id !== 'blank') {
      // Load template-specific blocks
      setBlocks(getTemplateBlocks(template));
    }
  }, [template]);

  useEffect(() => {
    // Convert blocks to HTML and send to parent
    const htmlContent = generateEmailHTML();
    onContentChange(htmlContent);
  }, [blocks, onContentChange]);

  useEffect(() => {
    setEmailSubject(subject);
  }, [subject]);

  const getTemplateBlocks = (template: any): EmailBlock[] => {
    switch (template.id) {
      case 1: // Interior Designer Welcome
        return [
          {
            id: '1',
            type: 'heading',
            content: { text: 'Transform Your Designs with Smart Technology' },
            styles: { fontSize: '28px', color: '#2c3e50', textAlign: 'center' }
          },
          {
            id: '2',
            type: 'text',
            content: { text: 'Dear Interior Design Professional,' },
            styles: { fontSize: '16px', color: '#333333', textAlign: 'left' }
          },
          {
            id: '3',
            type: 'text',
            content: { text: 'Elevate your interior design projects with our seamlessly integrated smart home solutions. Our technology doesn\'t just add functionality—it enhances the aesthetic and experience of every space you create.' },
            styles: { fontSize: '16px', color: '#555555', textAlign: 'left' }
          },
          {
            id: '4',
            type: 'image',
            content: { src: '/images/smart-design.jpg', alt: 'Smart Home Interior Design' },
            styles: { width: '100%', borderRadius: '8px' }
          },
          {
            id: '5',
            type: 'button',
            content: { text: 'View Our Design Portfolio', url: 'https://example.com/portfolio' },
            styles: { backgroundColor: '#e74c3c', color: '#ffffff', padding: '14px 28px' }
          }
        ];
      
      case 2: // Architect Partnership
        return [
          {
            id: '1',
            type: 'heading',
            content: { text: 'Smart Building Solutions for Modern Architecture' },
            styles: { fontSize: '26px', color: '#34495e', textAlign: 'center' }
          },
          {
            id: '2',
            type: 'text',
            content: { text: 'Partner with us to integrate intelligent building systems into your architectural projects from the ground up.' },
            styles: { fontSize: '16px', color: '#555555', textAlign: 'left' }
          },
          {
            id: '3',
            type: 'quote',
            content: { text: 'The integration was seamless and added incredible value to our commercial project.' },
            styles: { fontSize: '18px', color: '#27ae60', fontStyle: 'italic' }
          },
          {
            id: '4',
            type: 'button',
            content: { text: 'Schedule Partnership Discussion', url: 'https://example.com/partnership' },
            styles: { backgroundColor: '#3498db', color: '#ffffff', padding: '12px 24px' }
          }
        ];
      
      default:
        return defaultBlocks;
    }
  };

  const addBlock = (type: string) => {
    const newBlock: EmailBlock = {
      id: Date.now().toString(),
      type: type as any,
      content: getDefaultContent(type),
      styles: getDefaultStyles(type)
    };
    
    setBlocks([...blocks, newBlock]);
  };

  const getDefaultContent = (type: string) => {
    switch (type) {
      case 'text':
        return { text: 'Enter your text here...' };
      case 'heading':
        return { text: 'Your Heading Here' };
      case 'image':
        return { src: '', alt: 'Image description' };
      case 'button':
        return { text: 'Click Here', url: 'https://example.com' };
      case 'quote':
        return { text: 'Your quote or testimonial here...' };
      case 'divider':
        return {};
      default:
        return {};
    }
  };

  const getDefaultStyles = (type: string) => {
    switch (type) {
      case 'text':
        return { fontSize: '16px', color: '#333333', textAlign: 'left' };
      case 'heading':
        return { fontSize: '24px', color: '#1976d2', textAlign: 'center' };
      case 'image':
        return { width: '100%', borderRadius: '4px' };
      case 'button':
        return { backgroundColor: '#1976d2', color: '#ffffff', padding: '12px 24px' };
      case 'quote':
        return { fontSize: '18px', color: '#666666', fontStyle: 'italic' };
      case 'divider':
        return { height: '2px', backgroundColor: '#e0e0e0', margin: '20px 0' };
      default:
        return {};
    }
  };

  const updateBlock = (blockId: string, field: 'content' | 'styles', value: any) => {
    setBlocks(blocks.map(block => 
      block.id === blockId 
        ? { ...block, [field]: { ...block[field], ...value } }
        : block
    ));
  };

  const deleteBlock = (blockId: string) => {
    setBlocks(blocks.filter(block => block.id !== blockId));
    setSelectedBlock(null);
  };

  const moveBlock = (blockId: string, direction: 'up' | 'down') => {
    const index = blocks.findIndex(block => block.id === blockId);
    if (
      (direction === 'up' && index > 0) ||
      (direction === 'down' && index < blocks.length - 1)
    ) {
      const newBlocks = [...blocks];
      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      [newBlocks[index], newBlocks[targetIndex]] = [newBlocks[targetIndex], newBlocks[index]];
      setBlocks(newBlocks);
    }
  };

  const generateEmailHTML = () => {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${emailSubject}</title>
</head>
<body style="margin: 0; padding: 20px; background-color: #f5f5f5; font-family: Arial, sans-serif;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 30px; border-radius: 8px;">
    ${blocks.map(block => generateBlockHTML(block)).join('\n')}
  </div>
</body>
</html>
    `.trim();
  };

  const generateBlockHTML = (block: EmailBlock) => {
    switch (block.type) {
      case 'text':
        return `<p style="font-size: ${block.styles.fontSize}; color: ${block.styles.color}; text-align: ${block.styles.textAlign}; line-height: 1.6; margin: 16px 0;">${block.content.text}</p>`;
      
      case 'heading':
        return `<h2 style="font-size: ${block.styles.fontSize}; color: ${block.styles.color}; text-align: ${block.styles.textAlign}; margin: 24px 0 16px 0;">${block.content.text}</h2>`;
      
      case 'image':
        return block.content.src ? `<img src="${block.content.src}" alt="${block.content.alt}" style="width: ${block.styles.width}; border-radius: ${block.styles.borderRadius}; display: block; margin: 16px auto;" />` : '';
      
      case 'button':
        return `<div style="text-align: center; margin: 24px 0;"><a href="${block.content.url}" style="display: inline-block; background-color: ${block.styles.backgroundColor}; color: ${block.styles.color}; padding: ${block.styles.padding}; text-decoration: none; border-radius: 4px; font-weight: bold;">${block.content.text}</a></div>`;
      
      case 'quote':
        return `<blockquote style="font-size: ${block.styles.fontSize}; color: ${block.styles.color}; font-style: ${block.styles.fontStyle}; border-left: 4px solid #e0e0e0; padding-left: 16px; margin: 20px 0;">${block.content.text}</blockquote>`;
      
      case 'divider':
        return `<hr style="height: ${block.styles.height}; background-color: ${block.styles.backgroundColor}; border: none; margin: ${block.styles.margin};" />`;
      
      default:
        return '';
    }
  };

  const renderBlockEditor = (block: EmailBlock) => {
    switch (block.type) {
      case 'text':
      case 'heading':
        return (
          <TextField
            fullWidth
            multiline
            rows={block.type === 'text' ? 3 : 1}
            value={block.content.text}
            onChange={(e) => updateBlock(block.id, 'content', { text: e.target.value })}
            placeholder={`Enter ${block.type} content...`}
          />
        );
      
      case 'image':
        return (
          <Box>
            <TextField
              fullWidth
              label="Image URL"
              value={block.content.src}
              onChange={(e) => updateBlock(block.id, 'content', { ...block.content, src: e.target.value })}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Alt Text"
              value={block.content.alt}
              onChange={(e) => updateBlock(block.id, 'content', { ...block.content, alt: e.target.value })}
            />
          </Box>
        );
      
      case 'button':
        return (
          <Box>
            <TextField
              fullWidth
              label="Button Text"
              value={block.content.text}
              onChange={(e) => updateBlock(block.id, 'content', { ...block.content, text: e.target.value })}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Button URL"
              value={block.content.url}
              onChange={(e) => updateBlock(block.id, 'content', { ...block.content, url: e.target.value })}
            />
          </Box>
        );
      
      case 'quote':
        return (
          <TextField
            fullWidth
            multiline
            rows={2}
            value={block.content.text}
            onChange={(e) => updateBlock(block.id, 'content', { text: e.target.value })}
            placeholder="Enter quote or testimonial..."
          />
        );
      
      default:
        return null;
    }
  };

  return (
    <Box sx={{ height: '600px', border: 1, borderColor: 'divider', borderRadius: 1 }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={activeTab} onChange={(e, v) => setActiveTab(v)}>
          <Tab label="Design" />
          <Tab label="Preview" />
          <Tab label="HTML" />
        </Tabs>
      </Box>

      {activeTab === 0 && (
        <Grid container sx={{ height: 'calc(100% - 48px)' }}>
          {/* Block Library */}
          <Grid item xs={3} sx={{ borderRight: 1, borderColor: 'divider', p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Email Blocks
            </Typography>
            <Grid container spacing={1}>
              {blockTemplates.map((template) => (
                <Grid item xs={6} key={template.type}>
                  <Card
                    sx={{ 
                      cursor: 'pointer',
                      '&:hover': { bgcolor: 'primary.50' }
                    }}
                    onClick={() => addBlock(template.type)}
                  >
                    <CardContent sx={{ p: 1, textAlign: 'center' }}>
                      {template.icon}
                      <Typography variant="caption" display="block">
                        {template.label}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Grid>

          {/* Email Canvas */}
          <Grid item xs={6} sx={{ p: 2, overflow: 'auto' }}>
            <Box sx={{ mb: 2 }}>
              <TextField
                fullWidth
                label="Email Subject"
                value={emailSubject}
                onChange={(e) => {
                  setEmailSubject(e.target.value);
                  onSubjectChange(e.target.value);
                }}
              />
            </Box>
            
            <Paper sx={{ p: 3, minHeight: '400px', bgcolor: '#ffffff' }}>
              {blocks.map((block, index) => (
                <Box
                  key={block.id}
                  sx={{
                    border: selectedBlock === block.id ? 2 : 1,
                    borderColor: selectedBlock === block.id ? 'primary.main' : 'transparent',
                    borderRadius: 1,
                    p: 1,
                    mb: 2,
                    position: 'relative',
                    '&:hover': {
                      borderColor: 'primary.light',
                      '& .block-actions': { opacity: 1 }
                    }
                  }}
                  onClick={() => setSelectedBlock(block.id)}
                >
                  <Box
                    className="block-actions"
                    sx={{
                      position: 'absolute',
                      top: -10,
                      right: -10,
                      opacity: 0,
                      transition: 'opacity 0.2s',
                      display: 'flex',
                      gap: 0.5
                    }}
                  >
                    <IconButton size="small" onClick={() => moveBlock(block.id, 'up')}>
                      <DragIcon />
                    </IconButton>
                    <IconButton size="small" onClick={() => deleteBlock(block.id)}>
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                  
                  <div dangerouslySetInnerHTML={{ __html: generateBlockHTML(block) }} />
                </Box>
              ))}
            </Paper>
          </Grid>

          {/* Properties Panel */}
          <Grid item xs={3} sx={{ borderLeft: 1, borderColor: 'divider', p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Properties
            </Typography>
            
            {selectedBlock && (
              <Box>
                {renderBlockEditor(blocks.find(b => b.id === selectedBlock)!)}
              </Box>
            )}
            
            {!selectedBlock && (
              <Typography variant="body2" color="text.secondary">
                Select a block to edit its properties
              </Typography>
            )}
          </Grid>
        </Grid>
      )}

      {activeTab === 1 && (
        <Box sx={{ p: 3, overflow: 'auto', height: 'calc(100% - 48px)' }}>
          <div dangerouslySetInnerHTML={{ __html: generateEmailHTML() }} />
        </Box>
      )}

      {activeTab === 2 && (
        <Box sx={{ p: 2, height: 'calc(100% - 48px)' }}>
          <TextField
            fullWidth
            multiline
            rows={20}
            value={generateEmailHTML()}
            InputProps={{ readOnly: true }}
            sx={{ '& .MuiInputBase-input': { fontFamily: 'monospace', fontSize: '12px' } }}
          />
        </Box>
      )}
    </Box>
  );
} 