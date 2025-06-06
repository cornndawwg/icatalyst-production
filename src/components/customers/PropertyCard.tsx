import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Box,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  Grid,
} from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import BusinessIcon from '@mui/icons-material/Business';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import PhotoLibraryIcon from '@mui/icons-material/PhotoLibrary';
import DescriptionIcon from '@mui/icons-material/Description';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import FileUpload from '../common/FileUpload';
import { useApi } from '../../hooks/useApi';
import { getApiUrl } from '../../lib/api';

// Define Prisma-based property type
interface PrismaProperty {
  id: string;
  name: string;
  type: string;
  squareFootage: number;
  bedrooms?: number | null;
  bathrooms?: number | null;
  yearBuilt?: number | null;
  customerId: string;
  address?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  } | null;
  photos?: {
    id: string;
    url: string;
    uploadedAt: Date;
    uploadedBy: string;
  }[];
  documents?: {
    id: string;
    name: string;
    url: string;
    type: string;
    uploadedAt: Date;
    uploadedBy: string;
  }[];
}

interface PropertyCardProps {
  property: PrismaProperty;
  onEdit?: (property: PrismaProperty) => void;
  onDelete?: (propertyId: string) => void;
  onViewPhotos?: (property: PrismaProperty) => void;
  onViewDocuments?: (property: PrismaProperty) => void;
}

export default function PropertyCard({
  property,
  onEdit,
  onDelete,
  onViewPhotos,
  onViewDocuments,
}: PropertyCardProps) {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [galleryOpen, setGalleryOpen] = useState(false);

  const { get: refreshProperty } = useApi<PrismaProperty>();

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleAction = (action: 'edit' | 'delete' | 'photos' | 'documents') => {
    handleMenuClose();
    switch (action) {
      case 'edit':
        onEdit?.(property);
        break;
      case 'delete':
        onDelete?.(property.id);
        break;
      case 'photos':
        onViewPhotos?.(property);
        break;
      case 'documents':
        onViewDocuments?.(property);
        break;
    }
  };

  const getPropertyTypeIcon = () => {
    switch (property.type) {
      case 'commercial':
        return <BusinessIcon />;
      case 'single-family':
      case 'condo':
      case 'multi-family':
        return <HomeIcon />;
      default:
        return null;
    }
  };

  const handleUploadComplete = async () => {
    try {
      const updatedProperty = await refreshProperty(getApiUrl(`/api/customers/${property.customerId}/properties/${property.id}`));
      // You would typically update the parent component's state here
      console.log('Property updated:', updatedProperty);
    } catch (error) {
      console.error('Error refreshing property:', error);
    }
    setUploadDialogOpen(false);
  };

  const mainPhoto = property.photos?.[0]?.url;

  return (
    <>
      <Card>
        {mainPhoto && (
          <CardMedia
            component="img"
            height="200"
            image={mainPhoto}
            alt={property.name}
            onClick={() => setGalleryOpen(true)}
            sx={{ cursor: 'pointer' }}
          />
        )}
        <CardContent>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              mb: 2,
            }}
          >
            <Typography variant="h6" component="h3" gutterBottom>
              {property.name}
            </Typography>
            <Box>
              <Tooltip title="Upload Photos">
                <IconButton
                  size="small"
                  onClick={() => setUploadDialogOpen(true)}
                >
                  <PhotoCameraIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Edit">
                <IconButton
                  size="small"
                  onClick={() => onEdit?.(property)}
                >
                  <EditIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Delete">
                <IconButton
                  size="small"
                  onClick={() => onDelete?.(property.id)}
                >
                  <DeleteIcon />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>

          <Typography variant="body2" color="textSecondary" gutterBottom>
            {property.type}
          </Typography>

          <Typography variant="body2" gutterBottom>
            {property.address?.street}
            {property.address?.city && `, ${property.address.city}`}
            {property.address?.state && `, ${property.address.state}`}
            {property.address?.zipCode && ` ${property.address.zipCode}`}
          </Typography>

          <Box sx={{ mt: 2 }}>
            <Typography variant="body2">
              {property.squareFootage.toLocaleString()} sq ft
              {property.bedrooms && ` • ${property.bedrooms} beds`}
              {property.bathrooms && ` • ${property.bathrooms} baths`}
            </Typography>
            {property.yearBuilt && (
              <Typography variant="body2" color="textSecondary">
                Built in {property.yearBuilt}
              </Typography>
            )}
          </Box>

          {property.documents && property.documents.length > 0 && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Documents
              </Typography>
              {property.documents.map((doc, index) => (
                <Box
                  key={index}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    mb: 1,
                  }}
                >
                  <DescriptionIcon fontSize="small" color="action" />
                  <Typography
                    variant="body2"
                    component="a"
                    href={doc.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    sx={{ textDecoration: 'none', color: 'primary.main' }}
                  >
                    {doc.name}
                  </Typography>
                </Box>
              ))}
            </Box>
          )}
        </CardContent>
      </Card>

      <Dialog
        open={uploadDialogOpen}
        onClose={() => setUploadDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Upload Photos</DialogTitle>
        <DialogContent>
          <FileUpload
            type="photo"
            propertyId={property.id}
            onUploadComplete={handleUploadComplete}
            accept={{
              'image/*': ['.jpg', '.jpeg', '.png', '.gif'],
            }}
          />
        </DialogContent>
      </Dialog>

      <Dialog
        open={galleryOpen}
        onClose={() => setGalleryOpen(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>Property Photos</DialogTitle>
        <DialogContent>
          <Grid container spacing={2}>
            {property.photos?.map((photo, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <img
                  src={photo.url}
                  alt={`Property photo ${index + 1}`}
                  style={{
                    width: '100%',
                    height: 'auto',
                    borderRadius: 4,
                  }}
                />
              </Grid>
            ))}
          </Grid>
        </DialogContent>
      </Dialog>
    </>
  );
} 