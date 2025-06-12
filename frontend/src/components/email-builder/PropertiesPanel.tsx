import { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Stack,
} from '@mui/material';
import { ChromePicker, ColorResult } from 'react-color';
import { EmailComponent, ComponentProps } from './types';

interface PropertiesPanelProps {
  component: EmailComponent | null;
  onUpdate: (props: ComponentProps) => void;
}

const PropertiesPanel: React.FC<PropertiesPanelProps> = ({ component, onUpdate }) => {
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [colorProperty, setColorProperty] = useState<string>('');

  if (!component) {
    return (
      <Box
        component={Paper}
        elevation={2}
        sx={{
          width: 300,
          p: 2,
          borderLeft: 1,
          borderColor: 'divider',
        }}
      >
        <Typography variant="body2" color="text.secondary" textAlign="center">
          Select a component to edit its properties
        </Typography>
      </Box>
    );
  }

  const handleChange = (field: string, value: any) => {
    onUpdate({
      ...component.props,
      [field]: value,
    });
  };

  const handleColorChange = (property: string) => {
    setColorProperty(property);
    setShowColorPicker(true);
  };

  const renderTextProperties = () => (
    <Stack spacing={2}>
      <TextField
        label="Content"
        multiline
        rows={4}
        value={(component.props as any).content}
        onChange={(e) => handleChange('content', e.target.value)}
      />
      <TextField
        label="Font Size"
        type="number"
        value={(component.props as any).fontSize}
        onChange={(e) => handleChange('fontSize', Number(e.target.value))}
      />
      <FormControl>
        <InputLabel>Alignment</InputLabel>
        <Select
          value={(component.props as any).align}
          onChange={(e) => handleChange('align', e.target.value)}
          label="Alignment"
        >
          <MenuItem value="left">Left</MenuItem>
          <MenuItem value="center">Center</MenuItem>
          <MenuItem value="right">Right</MenuItem>
        </Select>
      </FormControl>
      <Box sx={{ mt: 2 }}>
        <Typography variant="subtitle2" gutterBottom>
          Text Color
        </Typography>
        <Box
          sx={{
            width: 30,
            height: 30,
            bgcolor: (component.props as any).color || '#000000',
            border: 1,
            borderColor: 'divider',
            cursor: 'pointer',
          }}
          onClick={() => handleColorChange('color')}
        />
        {showColorPicker && colorProperty === 'color' && (
          <ChromePicker
            color={(component.props as any).color || '#000000'}
            onChange={(color: ColorResult) => handleChange('color', color.hex)}
          />
        )}
      </Box>
    </Stack>
  );

  const renderImageProperties = () => (
    <Stack spacing={2}>
      <TextField
        label="Image URL"
        value={(component.props as any).src}
        onChange={(e) => handleChange('src', e.target.value)}
      />
      <TextField
        label="Alt Text"
        value={(component.props as any).alt}
        onChange={(e) => handleChange('alt', e.target.value)}
      />
      <TextField
        label="Width"
        value={(component.props as any).width}
        onChange={(e) => handleChange('width', e.target.value)}
      />
      <FormControl>
        <InputLabel>Alignment</InputLabel>
        <Select
          value={(component.props as any).align}
          onChange={(e) => handleChange('align', e.target.value)}
          label="Alignment"
        >
          <MenuItem value="left">Left</MenuItem>
          <MenuItem value="center">Center</MenuItem>
          <MenuItem value="right">Right</MenuItem>
        </Select>
      </FormControl>
    </Stack>
  );

  const renderButtonProperties = () => (
    <Stack spacing={2}>
      <TextField
        label="Button Text"
        value={(component.props as any).text}
        onChange={(e) => handleChange('text', e.target.value)}
      />
      <TextField
        label="URL"
        value={(component.props as any).url}
        onChange={(e) => handleChange('url', e.target.value)}
      />
      <Box sx={{ mt: 2 }}>
        <Typography variant="subtitle2" gutterBottom>
          Background Color
        </Typography>
        <Box
          sx={{
            width: 30,
            height: 30,
            bgcolor: (component.props as any).backgroundColor || '#1976d2',
            border: 1,
            borderColor: 'divider',
            cursor: 'pointer',
          }}
          onClick={() => handleColorChange('backgroundColor')}
        />
        {showColorPicker && colorProperty === 'backgroundColor' && (
          <ChromePicker
            color={(component.props as any).backgroundColor || '#1976d2'}
            onChange={(color: ColorResult) => handleChange('backgroundColor', color.hex)}
          />
        )}
      </Box>
      <Box sx={{ mt: 2 }}>
        <Typography variant="subtitle2" gutterBottom>
          Text Color
        </Typography>
        <Box
          sx={{
            width: 30,
            height: 30,
            bgcolor: (component.props as any).textColor || '#ffffff',
            border: 1,
            borderColor: 'divider',
            cursor: 'pointer',
          }}
          onClick={() => handleColorChange('textColor')}
        />
        {showColorPicker && colorProperty === 'textColor' && (
          <ChromePicker
            color={(component.props as any).textColor || '#ffffff'}
            onChange={(color: ColorResult) => handleChange('textColor', color.hex)}
          />
        )}
      </Box>
    </Stack>
  );

  const renderDividerProperties = () => (
    <Stack spacing={2}>
      <FormControl>
        <InputLabel>Style</InputLabel>
        <Select
          value={(component.props as any).style}
          onChange={(e) => handleChange('style', e.target.value)}
          label="Style"
        >
          <MenuItem value="solid">Solid</MenuItem>
          <MenuItem value="dashed">Dashed</MenuItem>
          <MenuItem value="dotted">Dotted</MenuItem>
        </Select>
      </FormControl>
      <TextField
        label="Spacing"
        type="number"
        value={(component.props as any).spacing}
        onChange={(e) => handleChange('spacing', Number(e.target.value))}
      />
      <Box sx={{ mt: 2 }}>
        <Typography variant="subtitle2" gutterBottom>
          Color
        </Typography>
        <Box
          sx={{
            width: 30,
            height: 30,
            bgcolor: (component.props as any).color || '#cccccc',
            border: 1,
            borderColor: 'divider',
            cursor: 'pointer',
          }}
          onClick={() => handleColorChange('color')}
        />
        {showColorPicker && colorProperty === 'color' && (
          <ChromePicker
            color={(component.props as any).color || '#cccccc'}
            onChange={(color: ColorResult) => handleChange('color', color.hex)}
          />
        )}
      </Box>
    </Stack>
  );

  const renderSocialProperties = () => (
    <Stack spacing={2}>
      <FormControl>
        <InputLabel>Networks</InputLabel>
        <Select
          multiple
          value={(component.props as any).networks}
          onChange={(e) => handleChange('networks', e.target.value)}
          label="Networks"
        >
          <MenuItem value="facebook">Facebook</MenuItem>
          <MenuItem value="twitter">Twitter</MenuItem>
          <MenuItem value="linkedin">LinkedIn</MenuItem>
          <MenuItem value="instagram">Instagram</MenuItem>
        </Select>
      </FormControl>
      <TextField
        label="Icon Size"
        type="number"
        value={(component.props as any).size}
        onChange={(e) => handleChange('size', Number(e.target.value))}
      />
    </Stack>
  );

  const renderProperties = () => {
    switch (component.type) {
      case 'text':
        return renderTextProperties();
      case 'image':
        return renderImageProperties();
      case 'button':
        return renderButtonProperties();
      case 'divider':
        return renderDividerProperties();
      case 'social':
        return renderSocialProperties();
      default:
        return null;
    }
  };

  return (
    <Box
      component={Paper}
      elevation={2}
      sx={{
        width: 300,
        p: 2,
        borderLeft: 1,
        borderColor: 'divider',
        overflowY: 'auto',
      }}
    >
      <Typography variant="h6" gutterBottom>
        Properties
      </Typography>
      {renderProperties()}
    </Box>
  );
};

export default PropertiesPanel; 
