import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Button,
  TextField,
  Breadcrumbs,
  Link,
  Alert,
  Snackbar,
  CircularProgress,
  MenuItem,
  Grid,
  FormControl,
  InputLabel,
  Select,
  Divider,
  IconButton,
  Collapse,
  InputAdornment,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Card,
} from '@mui/material';
import {
  Save as SaveIcon,
  Cancel as CancelIcon,
  ArrowBack as ArrowBackIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Search as SearchIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  Inventory as InventoryIcon,
  ShoppingCart as ShoppingCartIcon,
} from '@mui/icons-material';
import NextLink from 'next/link';
import { useRouter } from 'next/router';
import { useApi } from '../../../hooks/useApi';
import { getApiUrl } from '../../../lib/api';

// TypeScript interfaces
interface Product {
  id: string;
  name: string;
  description: string;
  category: string;
  brand: string;
  model: string;
  sku: string;
  basePrice: number;
  goodTierPrice?: number;
  betterTierPrice?: number;
  bestTierPrice?: number;
  specifications: any;
  compatibility: string;
  installation: string;
  price: number; // Calculated based on selected tier
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
  product?: Product;
  sortOrder: number;
}

interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  company?: string;
  email: string;
  phone?: string;
  type: string;
}

interface Property {
  id: string;
  name: string;
  type: string;
  squareFootage: number;
  address?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
  };
}

interface Proposal {
  id: string;
  name: string;
  description: string;
  status: 'draft' | 'sent' | 'viewed' | 'accepted' | 'rejected' | 'expired';
  customerPersona: string;
  totalAmount: number;
  validUntil?: string;
  voiceTranscript?: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  
  // Customer vs Prospect fields
  isExistingCustomer: boolean;
  customer?: Customer | null;
  
  // Prospect fields (used when isExistingCustomer = false)
  prospectName?: string;
  prospectCompany?: string;
  prospectEmail?: string;
  prospectPhone?: string;
  prospectStatus?: string;
  
  property?: Property;
  items: ProposalItem[];
}

const PERSONAS = [
  'homeowner',
  'interior-designer', 
  'builder',
  'architect',
  'cto-cio',
  'business-owner',
  'c-suite',
  'office-manager',
  'facilities-manager'
];

const STATUSES = [
  'draft',
  'sent', 
  'viewed',
  'accepted',
  'rejected',
  'expired'
];

const PROSPECT_STATUSES = [
  'prospect',
  'qualified',
  'approved',
  'converted_to_customer',
  'lost'
];

export default function EditProposalPage() {
  const router = useRouter();
  const { id } = router.query;

  // Form state
  const [formData, setFormData] = useState<Proposal | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Product search state
  const [productSearch, setProductSearch] = useState('');
  const [productSearchResults, setProductSearchResults] = useState<Product[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [expandedSections, setExpandedSections] = useState({
    productSearch: true,
    currentItems: true,
  });

  // API hooks
  const { get: fetchProposal } = useApi<Proposal>({
    onSuccess: (data) => {
      setFormData(data);
      setLoading(false);
    },
    onError: (error) => {
      setError(`Failed to load proposal: ${error.message}`);
      setLoading(false);
    }
  });

  const { get: fetchProducts } = useApi<{ products: Product[] }>({
    onSuccess: (data) => {
      setProducts(data.products || []);
    },
    onError: (error) => {
      console.error('Failed to load products:', error);
    }
  });

  const { put: updateProposal } = useApi<Proposal>({
    onSuccess: (data) => {
      setSuccess('Proposal updated successfully!');
      setSaving(false);
      setTimeout(() => {
        router.push(`/proposals/${data.id}`);
      }, 2000);
    },
    onError: (error) => {
      setError(`Failed to update proposal: ${error.message}`);
      setSaving(false);
    }
  });

  // Load proposal data
  useEffect(() => {
    if (id && typeof id === 'string') {
      fetchProposal(getApiUrl(`/api/proposals/${id}`));
      fetchProducts(getApiUrl('/api/products'));
    }
  }, [id]);

  // Product search functionality
  useEffect(() => {
    if (productSearch.trim() === '') {
      setProductSearchResults([]);
      return;
    }

    const searchLower = productSearch.toLowerCase();
    const filtered = products.filter(product =>
      product.name.toLowerCase().includes(searchLower) ||
      product.brand.toLowerCase().includes(searchLower) ||
      product.category.toLowerCase().includes(searchLower) ||
      product.description.toLowerCase().includes(searchLower)
    );

    setProductSearchResults(filtered.slice(0, 10)); // Limit to 10 results
  }, [productSearch, products]);

  // Product management functions
  const handleAddProduct = (product: Product) => {
    if (!formData) return;

    const newItem: ProposalItem = {
      name: product.name,
      description: product.description || '',
      category: product.category,
      quantity: 1,
      unitPrice: product.basePrice || product.price || 0,
      totalPrice: product.basePrice || product.price || 0,
      productId: product.id,
      product,
      sortOrder: formData.items.length
    };

    setFormData(prev => prev ? ({
      ...prev,
      items: [...prev.items, newItem]
    }) : null);

    // Clear search after adding
    setProductSearch('');
    setProductSearchResults([]);
  };

  const handleUpdateItem = (index: number, updates: Partial<ProposalItem>) => {
    if (!formData) return;

    setFormData(prev => prev ? ({
      ...prev,
      items: prev.items.map((item, i) => {
        if (i === index) {
          const updatedItem = { ...item, ...updates };
          updatedItem.totalPrice = updatedItem.quantity * updatedItem.unitPrice;
          return updatedItem;
        }
        return item;
      })
    }) : null);
  };

  const handleRemoveItem = (index: number) => {
    if (!formData) return;

    setFormData(prev => prev ? ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }) : null);
  };

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Calculate totals
  const totals = React.useMemo(() => {
    if (!formData) return { subtotal: 0, tax: 0, total: 0 };
    
    const subtotal = formData.items.reduce((sum, item) => sum + item.totalPrice, 0);
    const tax = subtotal * 0.08; // 8% tax
    const total = subtotal + tax;

    return { subtotal, tax, total };
  }, [formData]);

  const handleSubmit = async () => {
    if (!formData) return;

    setSaving(true);
    try {
      // Update total amount
      const updatedData = {
        ...formData,
        totalAmount: totals.total,
        validUntil: formData.validUntil ? new Date(formData.validUntil).toISOString() : null
      };

      await updateProposal(getApiUrl(`/api/proposals/${formData.id}`), updatedData);
    } catch (error) {
      console.error('Failed to update proposal:', error);
    }
  };

  const handleCancel = () => {
    router.push(`/proposals/${id}`);
  };

  if (loading) {
    return (
      <Container maxWidth="lg">
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
          <CircularProgress size={60} />
          <Typography variant="h6" sx={{ ml: 2 }}>
            Loading proposal...
          </Typography>
        </Box>
      </Container>
    );
  }

  if (!formData) {
    return (
      <Container maxWidth="lg">
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
          <Alert severity="error">
            Proposal not found or you don't have permission to edit it.
          </Alert>
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
          <Link component={NextLink} href={`/proposals/${id}`} color="inherit">
            {formData.name}
          </Link>
          <Typography color="text.primary">Edit</Typography>
        </Breadcrumbs>
        
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography variant="h4" component="h1" gutterBottom>
              Edit Proposal
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Modify proposal details, add or remove products, and update pricing.
            </Typography>
          </Box>

          <Box display="flex" gap={2}>
            <Button
              variant="outlined"
              onClick={handleCancel}
              startIcon={<CancelIcon />}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={handleSubmit}
              disabled={saving}
              startIcon={saving ? <CircularProgress size={16} /> : <SaveIcon />}
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </Box>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {/* Main Form */}
        <Grid item xs={12} lg={8}>
          <Paper sx={{ p: 3 }}>
            {/* Basic Information */}
            <Typography variant="h6" gutterBottom>
              Basic Information
            </Typography>

            <TextField
              fullWidth
              label="Proposal Name"
              value={formData.name}
              onChange={(e) => setFormData(prev => {
                if (!prev) return null;
                return { ...prev, name: e.target.value };
              })}
              sx={{ mb: 3 }}
            />

            <TextField
              fullWidth
              multiline
              rows={4}
              label="Description"
              value={formData.description || ''}
              onChange={(e) => setFormData(prev => {
                if (!prev) return null;
                return { ...prev, description: e.target.value };
              })}
              sx={{ mb: 3 }}
            />

            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={formData.status}
                    onChange={(e) => setFormData(prev => {
                      if (!prev) return null;
                      return { ...prev, status: e.target.value as any };
                    })}
                    label="Status"
                  >
                    <MenuItem value="draft">Draft</MenuItem>
                    <MenuItem value="sent">Sent</MenuItem>
                    <MenuItem value="viewed">Viewed</MenuItem>
                    <MenuItem value="accepted">Accepted</MenuItem>
                    <MenuItem value="rejected">Rejected</MenuItem>
                    <MenuItem value="expired">Expired</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  type="date"
                  label="Valid Until"
                  value={formData.validUntil ? formData.validUntil.split('T')[0] : ''}
                  onChange={(e) => setFormData(prev => {
                    if (!prev) return null;
                    return { ...prev, validUntil: e.target.value };
                  })}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
            </Grid>

            {!formData.isExistingCustomer && (
              <>
                <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
                  Prospect Information
                </Typography>
                
                <Grid container spacing={2} sx={{ mb: 3 }}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Prospect Name"
                      value={formData.prospectName || ''}
                      onChange={(e) => setFormData(prev => {
                        if (!prev) return null;
                        return { ...prev, prospectName: e.target.value };
                      })}
                    />
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Company"
                      value={formData.prospectCompany || ''}
                      onChange={(e) => setFormData(prev => {
                        if (!prev) return null;
                        return { ...prev, prospectCompany: e.target.value };
                      })}
                    />
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Email"
                      value={formData.prospectEmail || ''}
                      onChange={(e) => setFormData(prev => {
                        if (!prev) return null;
                        return { ...prev, prospectEmail: e.target.value };
                      })}
                    />
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Phone"
                      value={formData.prospectPhone || ''}
                      onChange={(e) => setFormData(prev => {
                        if (!prev) return null;
                        return { ...prev, prospectPhone: e.target.value };
                      })}
                    />
                  </Grid>
                </Grid>
              </>
            )}

            <Divider sx={{ my: 3 }} />

            {/* Current Products Section */}
            <Box sx={{ mb: 3 }}>
              <Box display="flex" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
                <Typography variant="h6">
                  Current Products ({formData.items.length})
                </Typography>
                <IconButton onClick={() => toggleSection('currentItems')}>
                  {expandedSections.currentItems ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                </IconButton>
              </Box>

              <Collapse in={expandedSections.currentItems}>
                {formData.items.length === 0 ? (
                  <Paper variant="outlined" sx={{ p: 3, textAlign: 'center' }}>
                    <ShoppingCartIcon color="disabled" sx={{ fontSize: 48, mb: 1 }} />
                    <Typography variant="body1" color="text.secondary">
                      No products in this proposal
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Use the search below to add products
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
                                  {item.product && (
                                    <Chip 
                                      label={item.product.brand} 
                                      size="small" 
                                      variant="outlined" 
                                      sx={{ ml: 0.5 }}
                                    />
                                  )}
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
                        
                        {/* Totals */}
                        <TableRow>
                          <TableCell colSpan={3}>
                            <Typography variant="body2">Subtotal:</Typography>
                          </TableCell>
                          <TableCell align="right">
                            <Typography variant="body2">${totals.subtotal.toFixed(2)}</Typography>
                          </TableCell>
                          <TableCell />
                        </TableRow>
                        <TableRow>
                          <TableCell colSpan={3}>
                            <Typography variant="body2">Tax (8%):</Typography>
                          </TableCell>
                          <TableCell align="right">
                            <Typography variant="body2">${totals.tax.toFixed(2)}</Typography>
                          </TableCell>
                          <TableCell />
                        </TableRow>
                        <TableRow>
                          <TableCell colSpan={3}>
                            <Typography variant="h6">Total:</Typography>
                          </TableCell>
                          <TableCell align="right">
                            <Typography variant="h6" color="primary">
                              ${totals.total.toFixed(2)}
                            </Typography>
                          </TableCell>
                          <TableCell />
                        </TableRow>
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </Collapse>
            </Box>

            <Divider sx={{ my: 3 }} />

            {/* Add Products Section */}
            <Box sx={{ mb: 3 }}>
              <Box display="flex" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
                <Typography variant="h6">
                  Add Products
                </Typography>
                <IconButton onClick={() => toggleSection('productSearch')}>
                  {expandedSections.productSearch ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                </IconButton>
              </Box>

              <Collapse in={expandedSections.productSearch}>
                <Alert severity="info" sx={{ mb: 2 }}>
                  <Typography variant="body2">
                    Search for products to add to this proposal. You can modify quantities and prices after adding.
                  </Typography>
                </Alert>
                
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
                  <Card variant="outlined" sx={{ maxHeight: 400, overflow: 'auto' }}>
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
                              <Box display="flex" alignItems="center" gap={1}>
                                {product.name}
                                <Chip label={product.category} size="small" />
                                <Chip label={product.brand} size="small" variant="outlined" />
                              </Box>
                            }
                            secondary={
                              <Box>
                                <Typography variant="body2" color="text.secondary">
                                  {product.description}
                                </Typography>
                                <Typography variant="h6" color="primary" sx={{ mt: 1 }}>
                                  ${(product.basePrice || product.price || 0).toFixed(2)}
                                </Typography>
                              </Box>
                            }
                          />
                        </ListItem>
                      ))}
                    </List>
                  </Card>
                )}

                {productSearch && productSearchResults.length === 0 && (
                  <Paper variant="outlined" sx={{ p: 3, textAlign: 'center' }}>
                    <SearchIcon color="disabled" sx={{ fontSize: 48, mb: 1 }} />
                    <Typography variant="body1" color="text.secondary">
                      No products found
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Try a different search term
                    </Typography>
                  </Paper>
                )}
              </Collapse>
            </Box>
          </Paper>
        </Grid>

        {/* Sidebar */}
        <Grid item xs={12} lg={4}>
          {/* Proposal Summary */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Proposal Summary
            </Typography>
            
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary">Items:</Typography>
              <Typography variant="h6">{formData.items.length}</Typography>
            </Box>

            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary">Subtotal:</Typography>
              <Typography variant="h6">${totals.subtotal.toFixed(2)}</Typography>
            </Box>

            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary">Tax (8%):</Typography>
              <Typography variant="body1">${totals.tax.toFixed(2)}</Typography>
            </Box>

            <Divider sx={{ my: 2 }} />

            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary">Total Amount:</Typography>
              <Typography variant="h5" color="primary">
                ${totals.total.toFixed(2)}
              </Typography>
            </Box>

            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary">Status:</Typography>
              <Chip label={formData.status.toUpperCase()} color="primary" />
            </Box>

            {formData.validUntil && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">Valid Until:</Typography>
                <Typography variant="body1">
                  {new Date(formData.validUntil).toLocaleDateString()}
                </Typography>
              </Box>
            )}
          </Paper>

          {/* Customer/Prospect Information */}
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              {formData.isExistingCustomer ? 'Customer Information' : 'Prospect Information'}
            </Typography>
            
            {formData.isExistingCustomer && formData.customer ? (
              <>
                <Typography variant="body1" fontWeight="medium" sx={{ mb: 1 }}>
                  {formData.customer.firstName} {formData.customer.lastName}
                </Typography>
                {formData.customer.company && (
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    {formData.customer.company}
                  </Typography>
                )}
                <Typography variant="body2" sx={{ mb: 1 }}>
                  {formData.customer.email}
                </Typography>
                {formData.customer.phone && (
                  <Typography variant="body2">
                    {formData.customer.phone}
                  </Typography>
                )}
              </>
            ) : (
              <>
                <Typography variant="body1" fontWeight="medium" sx={{ mb: 1 }}>
                  {formData.prospectName || 'Unknown Prospect'}
                </Typography>
                {formData.prospectCompany && (
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    {formData.prospectCompany}
                  </Typography>
                )}
                {formData.prospectEmail && (
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    {formData.prospectEmail}
                  </Typography>
                )}
                {formData.prospectPhone && (
                  <Typography variant="body2">
                    {formData.prospectPhone}
                  </Typography>
                )}
              </>
            )}
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