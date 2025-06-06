import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import {
  Box,
  Button,
  CircularProgress,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Alert,
} from '@mui/material';
import {
  CloudUpload as CloudUploadIcon,
  Delete as DeleteIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';
import { getApiUrl } from '../../lib/api';

interface FileUploadProps {
  type: 'photo' | 'document';
  propertyId?: string;
  projectId?: string;
  onUploadComplete: (files: any[]) => void;
  accept?: Record<string, string[]>;
  maxFiles?: number;
}

export default function FileUpload({
  type,
  propertyId,
  projectId,
  onUploadComplete,
  accept = {
    'image/*': ['.jpg', '.jpeg', '.png', '.gif'],
    'application/pdf': ['.pdf'],
    'application/msword': ['.doc'],
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': [
      '.docx',
    ],
  },
  maxFiles = 5,
}: FileUploadProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<any[]>([]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setFiles(prev => [...prev, ...acceptedFiles].slice(0, maxFiles));
    setError(null);
  }, [maxFiles]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    maxFiles: maxFiles - files.length,
  });

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (files.length === 0) return;

    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      files.forEach(file => {
        formData.append('files', file);
      });
      formData.append('type', type);
      if (propertyId) formData.append('propertyId', propertyId);
      if (projectId) formData.append('projectId', projectId);

      const response = await fetch(getApiUrl('/api/upload'), {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const result = await response.json();
      setUploadedFiles(prev => [...prev, ...result.files]);
      onUploadComplete(result.files);
      setFiles([]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <Box sx={{ width: '100%' }}>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Box
        {...getRootProps()}
        sx={{
          border: '2px dashed',
          borderColor: isDragActive ? 'primary.main' : 'grey.300',
          borderRadius: 1,
          p: 3,
          mb: 2,
          textAlign: 'center',
          cursor: 'pointer',
          bgcolor: isDragActive ? 'action.hover' : 'background.paper',
          '&:hover': {
            bgcolor: 'action.hover',
          },
        }}
      >
        <input {...getInputProps()} />
        <CloudUploadIcon sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />
        <Typography variant="h6" gutterBottom>
          {isDragActive ? 'Drop files here' : 'Drag & drop files here'}
        </Typography>
        <Typography variant="body2" color="textSecondary">
          or click to select files
        </Typography>
        <Typography variant="caption" display="block" color="textSecondary" sx={{ mt: 1 }}>
          {type === 'photo'
            ? 'Accepted formats: JPG, PNG, GIF'
            : 'Accepted formats: PDF, DOC, DOCX'}
          {` (Max ${maxFiles} files)`}
        </Typography>
      </Box>

      {files.length > 0 && (
        <>
          <List>
            {files.map((file, index) => (
              <ListItem key={index} divider>
                <ListItemText
                  primary={file.name}
                  secondary={`${(file.size / 1024 / 1024).toFixed(2)} MB`}
                />
                <ListItemSecondaryAction>
                  <IconButton
                    edge="end"
                    aria-label="delete"
                    onClick={() => removeFile(index)}
                    disabled={uploading}
                  >
                    <DeleteIcon />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>

          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleUpload}
              disabled={uploading}
              startIcon={
                uploading ? (
                  <CircularProgress size={20} color="inherit" />
                ) : (
                  <CloudUploadIcon />
                )
              }
            >
              {uploading ? 'Uploading...' : 'Upload Files'}
            </Button>
          </Box>
        </>
      )}

      {uploadedFiles.length > 0 && (
        <List sx={{ mt: 2 }}>
          {uploadedFiles.map((file, index) => (
            <ListItem key={index} divider>
              <ListItemText
                primary={file.name || file.url.split('/').pop()}
                secondary="Upload complete"
              />
              <ListItemSecondaryAction>
                <CheckCircleIcon color="success" />
              </ListItemSecondaryAction>
            </ListItem>
          ))}
        </List>
      )}
    </Box>
  );
} 