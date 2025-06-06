import { useState, useCallback, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  TextField,
  Stack,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Slider,
  IconButton,
  Paper,
  Button,
} from '@mui/material';
import { CompactPicker } from 'react-color';
import type { ColorResult } from 'react-color';
import FormatBoldIcon from '@mui/icons-material/FormatBold';
import FormatItalicIcon from '@mui/icons-material/FormatItalic';
import FormatAlignLeftIcon from '@mui/icons-material/FormatAlignLeft';
import FormatAlignCenterIcon from '@mui/icons-material/FormatAlignCenter';
import FormatAlignRightIcon from '@mui/icons-material/FormatAlignRight';
import CloseIcon from '@mui/icons-material/Close';
import { EmailComponent, TextComponentProps } from './types';

const FONT_FAMILIES = [
  'Arial',
  'Helvetica',
  'Times New Roman',
  'Georgia',
  'Verdana',
  'Courier New',
];

interface PropertiesPanelProps {
  component: EmailComponent;
  onUpdate: (component: EmailComponent) => void;
  onClose: () => void;
}

export default function PropertiesPanel({ component, onUpdate, onClose }: PropertiesPanelProps) {
  const [colorPickerAnchor, setColorPickerAnchor] = useState<null | HTMLElement>(null);
  const [fontFamilyOpen, setFontFamilyOpen] = useState(false);
  const selectRef = useRef<HTMLDivElement>(null);
  const colorPickerRef = useRef<HTMLDivElement>(null);

  // Handle Escape key to close popups
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setColorPickerAnchor(null);
        setFontFamilyOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Handle clicks outside popups
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (colorPickerRef.current && !colorPickerRef.current.contains(e.target as Node)) {
        setColorPickerAnchor(null);
      }
      if (selectRef.current && !selectRef.current.contains(e.target as Node)) {
        setFontFamilyOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleUpdate = useCallback((updates: Partial<TextComponentProps>) => {
    const updatedProps = {
      ...component.props,
      ...updates,
    } as TextComponentProps;

    const updatedComponent: EmailComponent = {
      id: component.id,
      type: component.type,
      props: updatedProps,
    };
    
    onUpdate(updatedComponent);
  }, [component, onUpdate]);

  const handleColorClick = (event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    setColorPickerAnchor(colorPickerAnchor ? null : event.currentTarget);
  };

  const handleColorChange = (color: ColorResult) => {
    handleUpdate({ color: color.hex });
  };

  if (component.type !== 'text') {
    return (
      <Box sx={{ p: 2 }}>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Select a text component to edit its properties
        </Typography>
        <Button variant="outlined" size="small" onClick={onClose}>
          Close
        </Button>
      </Box>
    );
  }

  const props = component.props as TextComponentProps;

  return (
    <Stack spacing={3} sx={{ p: 2 }}>
      {/* Text Content */}
      <FormControl>
        <InputLabel htmlFor="text-content" shrink>
          Content
        </InputLabel>
        <TextField
          id="text-content"
          multiline
          rows={4}
          value={props.content}
          onChange={(e) => handleUpdate({ content: e.target.value })}
          sx={{ mt: 1 }}
        />
      </FormControl>

      {/* Font Family */}
      <FormControl ref={selectRef}>
        <InputLabel htmlFor="font-family" shrink>
          Font Family
        </InputLabel>
        <Select
          id="font-family"
          value={props.fontFamily}
          open={fontFamilyOpen}
          onOpen={() => setFontFamilyOpen(true)}
          onClose={() => setFontFamilyOpen(false)}
          onChange={(e) => {
            handleUpdate({ fontFamily: e.target.value });
            setFontFamilyOpen(false);
          }}
          sx={{ mt: 1 }}
        >
          {FONT_FAMILIES.map((font) => (
            <MenuItem key={font} value={font} sx={{ fontFamily: font }}>
              {font}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* Font Size */}
      <Box>
        <Typography variant="caption" color="text.secondary" gutterBottom>
          Font Size: {props.fontSize}px
        </Typography>
        <Slider
          value={props.fontSize}
          onChange={(_, value) => handleUpdate({ fontSize: value as number })}
          min={8}
          max={72}
          step={1}
          marks={[
            { value: 8, label: '8px' },
            { value: 72, label: '72px' },
          ]}
        />
      </Box>

      {/* Text Color */}
      <Box>
        <Typography variant="caption" color="text.secondary" gutterBottom>
          Text Color
        </Typography>
        <Box
          onClick={handleColorClick}
          sx={{
            width: '100%',
            height: 40,
            bgcolor: props.color,
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 1,
            cursor: 'pointer',
            transition: 'all 0.2s',
            '&:hover': {
              filter: 'brightness(0.95)',
            },
          }}
        />
        {colorPickerAnchor && (
          <Box
            ref={colorPickerRef}
            sx={{
              position: 'absolute',
              right: '100%',
              top: '50%',
              transform: 'translateY(-50%)',
              mr: 2,
              zIndex: 1300,
            }}
          >
            <Paper
              elevation={8}
              sx={{
                p: 1,
                borderRadius: 1,
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1 }}>
                <IconButton
                  size="small"
                  onClick={() => setColorPickerAnchor(null)}
                >
                  <CloseIcon fontSize="small" />
                </IconButton>
              </Box>
              <CompactPicker
                color={props.color}
                onChange={(color) => {
                  handleColorChange(color);
                  setColorPickerAnchor(null);
                }}
              />
            </Paper>
          </Box>
        )}
      </Box>

      {/* Text Alignment */}
      <Box>
        <Typography variant="caption" color="text.secondary" gutterBottom>
          Alignment
        </Typography>
        <Stack direction="row" spacing={1}>
          <IconButton
            size="small"
            color={props.align === 'left' ? 'primary' : 'default'}
            onClick={() => handleUpdate({ align: 'left' })}
          >
            <FormatAlignLeftIcon />
          </IconButton>
          <IconButton
            size="small"
            color={props.align === 'center' ? 'primary' : 'default'}
            onClick={() => handleUpdate({ align: 'center' })}
          >
            <FormatAlignCenterIcon />
          </IconButton>
          <IconButton
            size="small"
            color={props.align === 'right' ? 'primary' : 'default'}
            onClick={() => handleUpdate({ align: 'right' })}
          >
            <FormatAlignRightIcon />
          </IconButton>
        </Stack>
      </Box>

      {/* Text Style */}
      <Box>
        <Typography variant="caption" color="text.secondary" gutterBottom>
          Style
        </Typography>
        <Stack direction="row" spacing={1}>
          <IconButton
            size="small"
            color={props.bold ? 'primary' : 'default'}
            onClick={() => handleUpdate({ bold: !props.bold })}
          >
            <FormatBoldIcon />
          </IconButton>
          <IconButton
            size="small"
            color={props.italic ? 'primary' : 'default'}
            onClick={() => handleUpdate({ italic: !props.italic })}
          >
            <FormatItalicIcon />
          </IconButton>
        </Stack>
      </Box>
    </Stack>
  );
} 
