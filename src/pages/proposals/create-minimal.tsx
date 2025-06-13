import React, { useState, useEffect, useMemo } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Grid,
  Card,
  Button,
  Breadcrumbs,
  Link,
  TextField,
  InputAdornment,
  Chip,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
  Alert,
  Snackbar,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  FormControlLabel,
  Switch,
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  Person as PersonIcon,
  Business as BusinessIcon,
  Home as HomeIcon,
  ShoppingCart as ShoppingCartIcon,
  Inventory as InventoryIcon,
} from '@mui/icons-material';
import NextLink from 'next/link';
import { useRouter } from 'next/router';
import { useApi } from '../../hooks/useApi';
import { getApiUrl } from '../../lib/api';

// Simplified TypeScript interfaces
interface ProposalPersona {
  id: string;
  type: string;
  name: string;
  displayName: string;
  description: string;
}

interface Product {
  id: string;
  name: string;
  description: string;
  category: string;
  brand: string;
  price: number;
}

interface ProposalItem {
  id?: string;
  name: string;
  description: string;
  category: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  productId?: string;
  sortOrder: number;
}

interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  company?: string;
  email: string;
  type: string;
}

interface Property {
  id: string;
  name: string;
  type: string;
  squareFootage: number;
}

interface FormData {
  name: string;
  description: string;
  isExistingCustomer: boolean;
  customerId: string;
  prospectName: string;
  prospectCompany: string;
  prospectEmail: string;
  prospectPhone: string;
  propertyId?: string;
  projectType: 'residential' | 'commercial';
  customerPersona: string;
  validUntil?: string;
  items: ProposalItem[];
}

export default function CreateMinimalProposalPage() {
  const router = useRouter();
  const { customerId, propertyId } = router.query;

  // Simplified state management
  const [formData, setFormData] = useState<FormData>({
    name: '',
    description: '',
    isExistingCustomer: true,
    customerId: (customerId as string) || '',
    prospectName: '',
    prospectCompany: '',
    prospectEmail: '',
    prospectPhone: '',
    propertyId: propertyId as string,
    projectType: 'residential',
    customerPersona: '',
    validUntil: '',
    items: []
  });

  const [personas, setPersonas] = useState<ProposalPersona[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [productSearch, setProductSearch] = useState('');
  const [productSearchResults, setProductSearchResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // API hooks with simplified error handling
  const { get: fetchProposalPersonas } = useApi<{ personas: ProposalPersona[] }>({
    onSuccess: (data) => setPersonas(data.personas || []),
    onError: (error) => console.warn('Failed to load personas:', error)
  });

  const { get: fetchCustomers } = useApi<{ customers: Customer[] }>({
    onSuccess: (data) => setCustomers(data.customers || []),
    onError: (error) => console.warn('Failed to load customers:', error)
  });

  const { get: fetchProperties } = useApi<{ properties: Property[] }>({
    onSuccess: (data) => setProperties(data.properties || []),
    onError: (error) => console.warn('Failed to load properties:', error)
  });

  const { get: searchProducts } = useApi<{ products: Product[] }>({
    onSuccess: (data) => setProductSearchResults(data.products || []),
    onError: (error) => console.warn('Product search failed:', error)
  });

  const { post: createProposal } = useApi<any>({
    onSuccess: (data) => {
      setSuccess('Proposal created successfully!');
      setTimeout(() => router.push(`/proposals/${data.id}`), 2000);
    },
    onError: (error) => setError(`Failed to create proposal: ${error.message}`)
  });

  // Initialize data on component mount (simplified)
  useEffect(() => {
    const initializeData = async () => {
      setLoading(true);
      try {
        // Load all data with graceful fallbacks
        await Promise.allSettled([
          fetchProposalPersonas(getApiUrl('/api/proposal-personas')),
          fetchCustomers(getApiUrl('/api/customers')),
          fetchProperties(getApiUrl('/api/properties'))
        ]);
      } catch (error) {
        console.warn('Some data failed to load:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeData();
  }, []); // Only run once

  // Product search with debouncing (simplified)
  useEffect(() => {
    if (productSearch.trim().length < 2) {
      setProductSearchResults([]);
      return;
    }

    const timeoutId = setTimeout(() => {
      searchProducts(getApiUrl(`/api/products?search=${productSearch}`));
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [productSearch]);

  // Calculate totals
  const totals = useMemo(() => {
    const subtotal = formData.items.reduce((sum, item) => sum + item.totalPrice, 0);
    const tax = subtotal * 0.08; // 8% tax
    const total = subtotal + tax;
    return { subtotal, tax, total };
  }, [formData.items]);

  // Simplified form handlers
  const handlePersonaChange = (personaName: string) => {
    setFormData(prev => ({ ...prev, customerPersona: personaName }));
  };

  const handleAddProduct = (product: Product) => {
    const newItem: ProposalItem = {
      name: product.name,
      description: product.description || '',
      category: product.category,
      quantity: 1,
      unitPrice: product.price,
      totalPrice: product.price,
      productId: product.id,
      sortOrder: formData.items.length
    };

    setFormData(prev => ({
      ...prev,
      items: [...prev.items, newItem]
    }));
  };

  const handleUpdateItem = (index: number, updates: Partial<ProposalItem>) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.map((item, i) => {
        if (i === index) {
          const updatedItem = { ...item, ...updates };
          updatedItem.totalPrice = updatedItem.quantity * updatedItem.unitPrice;
          return updatedItem;
        }
        return item;
      })
    }));
  };

  const handleRemoveItem = (index: number) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async () => {
    // Basic validation
    const isValidCustomer = formData.isExistingCustomer ? formData.customerId : (formData.prospectName && formData.prospectEmail);
    
    if (!formData.name || !isValidCustomer || !formData.customerPersona) {
      const missingFields = [];
      if (!formData.name) missingFields.push('Proposal Name');
      if (!isValidCustomer) {
        missingFields.push(formData.isExistingCustomer ? 'Customer Selection' : 'Prospect Name and Email');
      }
      if (!formData.customerPersona) missingFields.push('Customer Persona');
      
      setError(`Please fill in all required fields: ${missingFields.join(', ')}`);
      return;
    }

    setSaving(true);
    try {
      // Create proposal (simplified - no AI)
      const proposalData = {
        ...formData,
        createdBy: 'current-user',
        validUntil: formData.validUntil ? new Date(formData.validUntil).toISOString() : null,
      };

      await createProposal(getApiUrl('/api/proposals'), proposalData);
    } catch (error) {
      console.error('Failed to create proposal:', error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg">
        <Box display="flex" flexDirection="column" justifyContent="center" alignItems="center" minHeight="60vh">
          <CircularProgress size={60} />
          <Typography variant="h6" sx={{ ml: 2, mt: 2 }}>
            Loading proposal data...
          </Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      {/* Header */}
      <Box mb={3}>
        <Breadcrumbs separator="/" sx={{ mb: 2 }}>
          <Link component={NextLink} href="/" color="inherit">
            Dashboard
          </Link>
          <Link component={NextLink} href="/proposals" color="inherit">
            Proposals
          </Link>
          <Typography color="text.primary">Create Proposal</Typography>
        </Breadcrumbs>
        
        <Typography variant="h4" component="h1" gutterBottom>
          Create Proposal (Minimal Version)
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Basic proposal creation without AI features. Simple, stable, and reliable.
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Main Form */}
        <Grid item xs={12} lg={8}>
          <Paper sx={{ p: 3 }}>
            {/* Project Type Selection */}
            <Typography variant="h6" gutterBottom>
              Project Type
            </Typography>
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={12} sm={6}>
                <Card
                  sx={{
                    p: 2,
                    cursor: 'pointer',
                    border: formData.projectType === 'residential' ? '2px solid' : '1px solid',
                    borderColor: formData.projectType === 'residential' ? 'primary.main' : 'divider',
                    bgcolor: formData.projectType === 'residential' ? 'primary.50' : 'background.paper',
                  }}
                  onClick={() => setFormData(prev => ({ 
                    ...prev, 
                    projectType: 'residential',
                    customerPersona: ''
                  }))}
                >
                  <Box display="flex" alignItems="center" sx={{ mb: 1 }}>
                    <HomeIcon sx={{ mr: 1, color: 'primary.main' }} />
                    <Typography variant="h6" color="primary">Residential</Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    Single-family homes, condos, apartments
                  </Typography>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Card
                  sx={{
                    p: 2,
                    cursor: 'pointer',
                    border: formData.projectType === 'commercial' ? '2px solid' : '1px solid',
                    borderColor: formData.projectType === 'commercial' ? 'primary.main' : 'divider',
                    bgcolor: formData.projectType === 'commercial' ? 'primary.50' : 'background.paper',
                  }}
                  onClick={() => setFormData(prev => ({ 
                    ...prev, 
                    projectType: 'commercial',
                    customerPersona: ''
                  }))}
                >
                  <Box display="flex" alignItems="center" sx={{ mb: 1 }}>
                    <BusinessIcon sx={{ mr: 1, color: 'primary.main' }} />
                    <Typography variant="h6" color="primary">Commercial</Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    Offices, retail, hospitality, enterprise
                  </Typography>
                </Card>
              </Grid>
            </Grid>

            {/* Basic Information */}
            <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>
              Basic Information
            </Typography>
            <Grid container spacing={3} sx={{ mb: 3 }}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Proposal Name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  required
                  placeholder="e.g., Johnson Family Smart Home Automation"
                />
              </Grid>

              {/* Customer Information */}
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.isExistingCustomer}
                      onChange={(e) => {
                        setFormData(prev => ({ 
                          ...prev, 
                          isExistingCustomer: e.target.checked,
                          customerId: '',
                          prospectName: '',
                          prospectCompany: '',
                          prospectEmail: '',
                          prospectPhone: ''
                        }));
                      }}
                      color="primary"
                    />
                  }
                  label={
                    <Box display="flex" alignItems="center">
                      <PersonIcon sx={{ mr: 1 }} />
                      <Typography variant="body1">
                        {formData.isExistingCustomer ? 'Existing Customer' : 'New Prospect'}
                      </Typography>
                    </Box>
                  }
                />

                {formData.isExistingCustomer ? (
                  <FormControl fullWidth required sx={{ mt: 2 }}>
                    <InputLabel>Select Customer</InputLabel>
                    <Select
                      value={formData.customerId}
                      label="Select Customer"
                      onChange={(e) => setFormData(prev => ({ ...prev, customerId: e.target.value }))}
                    >
                      {customers.map((customer) => (
                        <MenuItem key={customer.id} value={customer.id}>
                          {customer.firstName} {customer.lastName}
                          {customer.company && ` (${customer.company})`}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                ) : (
                  <Grid container spacing={2} sx={{ mt: 1 }}>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Contact Name"
                        value={formData.prospectName}
                        onChange={(e) => setFormData(prev => ({ ...prev, prospectName: e.target.value }))}
                        required={!formData.isExistingCustomer}
                        placeholder="John Doe"
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Email Address"
                        type="email"
                        value={formData.prospectEmail}
                        onChange={(e) => setFormData(prev => ({ ...prev, prospectEmail: e.target.value }))}
                        required={!formData.isExistingCustomer}
                        placeholder="john@example.com"
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Company/Organization"
                        value={formData.prospectCompany}
                        onChange={(e) => setFormData(prev => ({ ...prev, prospectCompany: e.target.value }))}
                        placeholder="Acme Corp (optional)"
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Phone Number"
                        value={formData.prospectPhone}
                        onChange={(e) => setFormData(prev => ({ ...prev, prospectPhone: e.target.value }))}
                        placeholder="(555) 123-4567"
                      />
                    </Grid>
                  </Grid>
                )}
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Property</InputLabel>
                  <Select
                    value={formData.propertyId || ''}
                    label="Property"
                    onChange={(e) => setFormData(prev => ({ ...prev, propertyId: e.target.value }))}
                  >
                    <MenuItem value="">No specific property</MenuItem>
                    {properties.map((property) => (
                      <MenuItem key={property.id} value={property.id}>
                        {property.name} ({property.type}, {property.squareFootage} sq ft)
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl fullWidth required>
                  <InputLabel>Customer Persona</InputLabel>
                  <Select
                    value={formData.customerPersona}
                    label="Customer Persona"
                    onChange={(e) => handlePersonaChange(e.target.value)}
                  >
                    {personas
                      .filter(persona => persona.type === formData.projectType)
                      .map((persona) => (
                      <MenuItem key={persona.id} value={persona.name}>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center' }}>
                            {persona.type === 'residential' ? <HomeIcon sx={{ mr: 1 }} /> : <BusinessIcon sx={{ mr: 1 }} />}
                            <span>{persona.displayName}</span>
                          </div>
                          <Typography variant="caption" color="text.secondary">
                            {persona.description}
                          </Typography>
                        </div>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  type="date"
                  label="Valid Until"
                  value={formData.validUntil}
                  onChange={(e) => setFormData(prev => ({ ...prev, validUntil: e.target.value }))}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
            </Grid>

            {/* Description Field */}
            <TextField
              fullWidth
              multiline
              rows={4}
              label="Proposal Description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Describe the proposed smart home solution..."
              sx={{ mb: 3 }}
            />

            <Divider sx={{ my: 3 }} />

            {/* Product Search Section */}
            <Typography variant="h6" gutterBottom>
              Product Selection
            </Typography>
            
            <TextField
              fullWidth
              label="Search Products"
              value={productSearch}
              onChange={(e) => setProductSearch(e.target.value)}
              placeholder="Search by name, brand, or category..."
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                )
              }}
              sx={{ mb: 2 }}
            />

            {productSearchResults.length > 0 && (
              <Card variant="outlined" sx={{ maxHeight: 400, overflow: 'auto', mb: 3 }}>
                <List>
                  {productSearchResults.map((product) => (
                    <ListItem
                      key={product.id}
                      secondaryAction={
                        <Button
                          startIcon={<AddIcon />}
                          variant="outlined"
                          size="small"
                          onClick={() => handleAddProduct(product)}
                        >
                          Add
                        </Button>
                      }
                    >
                      <ListItemAvatar>
                        <Avatar>
                          <InventoryIcon />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span>{product.name}</span>
                            <Chip label={product.category} size="small" />
                            <Chip label={product.brand} size="small" variant="outlined" />
                          </div>
                        }
                        secondary={
                          <Box>
                            <Typography variant="body2" color="text.secondary">
                              {product.description}
                            </Typography>
                            <Typography variant="h6" color="primary" sx={{ mt: 1 }}>
                              ${product.price.toFixed(2)}
                            </Typography>
                          </Box>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              </Card>
            )}

            <Divider sx={{ my: 3 }} />

            {/* Selected Products */}
            <Typography variant="h6" gutterBottom>
              Selected Products ({formData.items.length})
            </Typography>

            {formData.items.length === 0 ? (
              <Paper variant="outlined" sx={{ p: 3, textAlign: 'center' }}>
                <ShoppingCartIcon color="disabled" sx={{ fontSize: 48, mb: 1 }} />
                <Typography variant="body1" color="text.secondary">
                  No products selected yet
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Search and add products above
                </Typography>
              </Paper>
            ) : (
              <TableContainer component={Paper} variant="outlined">
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Product</TableCell>
                      <TableCell align="center">Quantity</TableCell>
                      <TableCell align="right">Unit Price</TableCell>
                      <TableCell align="right">Total</TableCell>
                      <TableCell align="center">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {formData.items.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          <Box>
                            <Typography variant="body2" fontWeight="medium">
                              {item.name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {item.description}
                            </Typography>
                            <Box mt={1}>
                              <Chip label={item.category} size="small" />
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell align="center">
                          <TextField
                            size="small"
                            type="number"
                            value={item.quantity}
                            onChange={(e) => handleUpdateItem(index, { quantity: parseInt(e.target.value) || 1 })}
                            inputProps={{ min: 1, style: { textAlign: 'center' } }}
                            sx={{ width: 80 }}
                          />
                        </TableCell>
                        <TableCell align="right">
                          <TextField
                            size="small"
                            type="number"
                            value={item.unitPrice}
                            onChange={(e) => handleUpdateItem(index, { unitPrice: parseFloat(e.target.value) || 0 })}
                            inputProps={{ min: 0, step: 0.01 }}
                            InputProps={{
                              startAdornment: <InputAdornment position="start">$</InputAdornment>
                            }}
                            sx={{ width: 120 }}
                          />
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2" fontWeight="medium">
                            ${item.totalPrice.toFixed(2)}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleRemoveItem(index)}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Paper>
        </Grid>

        {/* Sidebar */}
        <Grid item xs={12} lg={4}>
          {/* Pricing Summary */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Proposal Summary
            </Typography>
            
            <Box sx={{ mb: 2 }}>
              <Box display="flex" justifyContent="space-between" sx={{ mb: 1 }}>
                <Typography variant="body2">Subtotal:</Typography>
                <Typography variant="body2">${totals.subtotal.toFixed(2)}</Typography>
              </Box>
              <Box display="flex" justifyContent="space-between" sx={{ mb: 1 }}>
                <Typography variant="body2">Tax (8%):</Typography>
                <Typography variant="body2">${totals.tax.toFixed(2)}</Typography>
              </Box>
              <Divider sx={{ my: 1 }} />
              <Box display="flex" justifyContent="space-between">
                <Typography variant="h6">Total:</Typography>
                <Typography variant="h6" color="primary">
                  ${totals.total.toFixed(2)}
                </Typography>
              </Box>
            </Box>

            <Button
              fullWidth
              variant="contained"
              size="large"
              startIcon={saving ? <CircularProgress size={20} /> : <SaveIcon />}
              onClick={handleSubmit}
              disabled={saving || !formData.name || !(formData.isExistingCustomer ? formData.customerId : (formData.prospectName && formData.prospectEmail)) || !formData.customerPersona}
            >
              {saving ? 'Creating...' : 'Create Proposal'}
            </Button>
          </Paper>

          {/* System Status */}
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              System Status
            </Typography>
            
            <Alert severity="success" sx={{ mb: 2 }}>
              <Typography variant="body2">
                <strong>Minimal Mode:</strong> Basic proposal creation is working. AI features temporarily disabled for stability.
              </Typography>
            </Alert>

            <Box display="flex" flexDirection="column" gap={1}>
              <Typography variant="body2" color="success.main">
                ✅ Project Type Selection
              </Typography>
              <Typography variant="body2" color="success.main">
                ✅ Customer & Persona Selection
              </Typography>
              <Typography variant="body2" color="success.main">
                ✅ Product Search & Selection
              </Typography>
              <Typography variant="body2" color="success.main">
                ✅ Proposal Creation
              </Typography>
              <Typography variant="body2" color="warning.main">
                ⚠️ AI Features (Temporarily Disabled)
              </Typography>
              <Typography variant="body2" color="warning.main">
                ⚠️ Voice Input (Temporarily Disabled)
              </Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Snackbar notifications */}
      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setError(null)} severity="error">
          {error}
        </Alert>
      </Snackbar>

      <Snackbar
        open={!!success}
        autoHideDuration={4000}
        onClose={() => setSuccess(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setSuccess(null)} severity="success">
          {success}
        </Alert>
      </Snackbar>
    </Container>
  );
} 