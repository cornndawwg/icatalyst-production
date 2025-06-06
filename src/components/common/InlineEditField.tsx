import React, { useState, useEffect, useRef } from 'react';
import {
  TextField,
  Typography,
  Box,
  IconButton,
  CircularProgress,
  Select,
  MenuItem,
  FormControl,
  Chip,
  Alert,
} from '@mui/material';
import {
  Edit as EditIcon,
  Check as CheckIcon,
  Close as CloseIcon,
  Save as SaveIcon,
} from '@mui/icons-material';

export interface InlineEditFieldProps {
  value: string | number;
  onSave: (value: string | number) => Promise<void>;
  type?: 'text' | 'number' | 'select' | 'multiline' | 'currency';
  options?: string[];
  label?: string;
  placeholder?: string;
  validation?: (value: string | number) => string | null;
  disabled?: boolean;
  autoSave?: boolean;
  debounceMs?: number;
  maxLength?: number;
  minRows?: number;
  maxRows?: number;
  prefix?: string;
  suffix?: string;
  required?: boolean;
}

const InlineEditField: React.FC<InlineEditFieldProps> = ({
  value,
  onSave,
  type = 'text',
  options = [],
  label,
  placeholder,
  validation,
  disabled = false,
  autoSave = true,
  debounceMs = 1000,
  maxLength,
  minRows = 1,
  maxRows = 4,
  prefix,
  suffix,
  required = false,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [tempValue, setTempValue] = useState(value);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout>();

  // Reset temp value when value prop changes
  useEffect(() => {
    setTempValue(value);
    setHasUnsavedChanges(false);
  }, [value]);

  // Auto-save functionality with debouncing
  useEffect(() => {
    if (!autoSave || !hasUnsavedChanges || tempValue === value) return;

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(() => {
      handleSave(tempValue);
    }, debounceMs);

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [tempValue, hasUnsavedChanges, autoSave, debounceMs]);

  // Focus input when entering edit mode
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  const handleEdit = () => {
    if (disabled) return;
    setIsEditing(true);
    setError(null);
  };

  const handleCancel = () => {
    setTempValue(value);
    setIsEditing(false);
    setError(null);
    setHasUnsavedChanges(false);
    
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
  };

  const handleSave = async (valueToSave: string | number = tempValue) => {
    setError(null);

    // Validation
    if (required && (!valueToSave || valueToSave.toString().trim() === '')) {
      setError('This field is required');
      return;
    }

    if (validation) {
      const validationError = validation(valueToSave);
      if (validationError) {
        setError(validationError);
        return;
      }
    }

    setIsSaving(true);

    try {
      await onSave(valueToSave);
      setIsEditing(false);
      setHasUnsavedChanges(false);
    } catch (error) {
      setError('Failed to save. Please try again.');
      console.error('Save error:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleInputChange = (newValue: string | number) => {
    setTempValue(newValue);
    setHasUnsavedChanges(newValue !== value);
    setError(null);
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && type !== 'multiline') {
      event.preventDefault();
      handleSave();
    } else if (event.key === 'Escape') {
      event.preventDefault();
      handleCancel();
    }
  };

  const formatDisplayValue = (val: string | number) => {
    if (type === 'currency' && typeof val === 'number') {
      return `$${val.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
    }
    return `${prefix || ''}${val}${suffix || ''}`;
  };

  const renderInput = () => {
    if (type === 'select') {
      return (
        <FormControl fullWidth size="small">
          <Select
            value={tempValue}
            onChange={(e) => handleInputChange(e.target.value)}
            onBlur={() => !autoSave && handleSave()}
            displayEmpty
          >
            {options.map((option) => (
              <MenuItem key={option} value={option}>
                {option}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      );
    }

    return (
      <TextField
        ref={inputRef}
        fullWidth
        size="small"
        value={tempValue}
        onChange={(e) => {
          const newValue = type === 'number' ? Number(e.target.value) : e.target.value;
          handleInputChange(newValue);
        }}
        onBlur={() => !autoSave && handleSave()}
        onKeyDown={handleKeyPress}
        type={type === 'number' || type === 'currency' ? 'number' : 'text'}
        multiline={type === 'multiline'}
        rows={type === 'multiline' ? minRows : undefined}
        maxRows={type === 'multiline' ? maxRows : undefined}
        placeholder={placeholder}
        inputProps={{
          maxLength,
          step: type === 'currency' ? '0.01' : undefined,
        }}
        error={!!error}
        helperText={error}
      />
    );
  };

  if (isEditing) {
    return (
      <Box sx={{ position: 'relative' }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
          <Box sx={{ flex: 1 }}>
            {renderInput()}
          </Box>
          
          {!autoSave && (
            <Box sx={{ display: 'flex', gap: 0.5 }}>
              <IconButton 
                size="small" 
                onClick={() => handleSave()}
                disabled={isSaving}
                color="primary"
              >
                {isSaving ? <CircularProgress size={16} /> : <CheckIcon />}
              </IconButton>
              <IconButton 
                size="small" 
                onClick={handleCancel}
                disabled={isSaving}
              >
                <CloseIcon />
              </IconButton>
            </Box>
          )}
        </Box>

        {autoSave && (hasUnsavedChanges || isSaving) && (
          <Box sx={{ 
            position: 'absolute', 
            top: -8, 
            right: -8, 
            display: 'flex', 
            alignItems: 'center',
            gap: 0.5,
            fontSize: '0.75rem',
            color: 'text.secondary'
          }}>
            {isSaving ? (
              <>
                <CircularProgress size={12} />
                <Typography variant="caption">Saving...</Typography>
              </>
            ) : hasUnsavedChanges ? (
              <>
                <SaveIcon sx={{ fontSize: 12 }} />
                <Typography variant="caption">Auto-save in {Math.ceil(debounceMs / 1000)}s</Typography>
              </>
            ) : (
              <Chip 
                label="Saved" 
                size="small" 
                color="success" 
                sx={{ height: 18, fontSize: '0.6rem' }}
              />
            )}
          </Box>
        )}
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        cursor: disabled ? 'default' : 'pointer',
        padding: '4px 8px',
        borderRadius: 1,
        border: '1px solid transparent',
        '&:hover': disabled ? {} : {
          backgroundColor: 'action.hover',
          border: '1px solid',
          borderColor: 'primary.main',
        },
        minHeight: 40,
      }}
      onClick={handleEdit}
    >
      <Typography 
        variant="body1" 
        sx={{ 
          flex: 1,
          color: !value ? 'text.secondary' : 'text.primary',
          fontStyle: !value ? 'italic' : 'normal'
        }}
      >
        {value ? formatDisplayValue(value) : (placeholder || 'Click to edit...')}
      </Typography>
      
      {!disabled && (
        <EditIcon 
          sx={{ 
            fontSize: 16, 
            color: 'action.active',
            opacity: 0.7,
            '&:hover': { opacity: 1 }
          }} 
        />
      )}
    </Box>
  );
};

export default InlineEditField; 