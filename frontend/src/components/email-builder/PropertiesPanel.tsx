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
import { ChromePicker } from 'react-color';
import { EmailComponent, ComponentProps } from './types';

interface PropertiesPanelProps {
  component: EmailComponent | null;
  onUpdate: (props: ComponentProps) => void;
}

const PropertiesPanel: React.FC<PropertiesPanelProps> = ({ component, onUpdate }) => {
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
      <Box>
        <Typography gutterBottom>Color</Typography>
        <ChromePicker
          color={(component.props as any).color}
          onChange={(color) => handleChange('color', color.hex)}
        />
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
      <Box>
        <Typography gutterBottom>Background Color</Typography>
        <ChromePicker
          color={(component.props as any).backgroundColor}
          onChange={(color) => handleChange('backgroundColor', color.hex)}
        />
      </Box>
      <Box>
        <Typography gutterBottom>Text Color</Typography>
        <ChromePicker
          color={(component.props as any).textColor}
          onChange={(color) => handleChange('textColor', color.hex)}
        />
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
      <Box>
        <Typography gutterBottom>Color</Typography>
        <ChromePicker
          color={(component.props as any).color}
          onChange={(color) => handleChange('color', color.hex)}
        />
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
