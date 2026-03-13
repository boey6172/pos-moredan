import React, { useEffect, useState, useMemo } from 'react';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Card,
  CardContent,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress,
  Alert,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import TableSkeleton from '../../../components/TableSkeleton';
import axios from '../../../api/axios';

const ProductManagement = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [adjustType, setAdjustType] = useState('in');
  const [selected, setSelected] = useState(null);
  const [quantity, setQuantity] = useState('');
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');
  const [textFilter, setTextFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/products');
      setProducts(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Error fetching products:', err);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await axios.get('/api/categories');
      setCategories(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Error fetching categories:', err);
      setCategories([]);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const filteredProducts = useMemo(() => {
    let list = products;
    const trimmed = (textFilter || '').trim().toLowerCase();
    if (trimmed) {
      list = list.filter(
        (p) =>
          (p.name && p.name.toLowerCase().includes(trimmed)) ||
          (p.sku && String(p.sku).toLowerCase().includes(trimmed)) ||
          (p.barcode && String(p.barcode).toLowerCase().includes(trimmed))
      );
    }
    if (categoryFilter) {
      list = list.filter((p) => p.Category?.id === Number(categoryFilter) || p.categoryId === Number(categoryFilter));
    }
    return list;
  }, [products, textFilter, categoryFilter]);

  const handleOpen = (product, type) => {
    setSelected(product);
    setAdjustType(type);
    setQuantity('');
    setReason('');
    setError('');
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelected(null);
    setQuantity('');
    setReason('');
    setError('');
  };

  const handleAdjust = async () => {
    if (!quantity || Number(quantity) <= 0) {
      setError('Please enter a valid quantity');
      return;
    }

    try {
      setError('');
      await axios.post('/api/inventory/adjust', {
        productId: selected.id,
        type: adjustType,
        quantity: Number(quantity),
        reason,
      });
      fetchProducts();
      handleClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Error adjusting inventory');
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center', mb: 2 }}>
        <TextField
          size="small"
          placeholder="Search by name, SKU, or barcode"
          value={textFilter}
          onChange={(e) => setTextFilter(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="action" />
              </InputAdornment>
            ),
          }}
          sx={{ minWidth: 260 }}
          inputProps={{ 'aria-label': 'Filter products by text' }}
        />
        <FormControl size="small" sx={{ minWidth: 180 }}>
          <InputLabel id="inventory-category-filter-label">Category</InputLabel>
          <Select
            labelId="inventory-category-filter-label"
            value={categoryFilter}
            label="Category"
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <MenuItem value="">All categories</MenuItem>
            {categories.map((cat) => (
              <MenuItem key={cat.id} value={cat.id}>
                {cat.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      <Card>
        <CardContent>
          {loading ? (
            <TableSkeleton rows={6} columns={4} />
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>SKU</TableCell>
                    <TableCell>Inventory</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredProducts.length > 0 ? (
                    filteredProducts.map((product) => (
                      <TableRow key={product.id} hover>
                        <TableCell>{product.name}</TableCell>
                        <TableCell>{product.sku || '-'}</TableCell>
                        <TableCell>{product.inventory}</TableCell>
                        <TableCell>
                          <Button
                            size="small"
                            variant="outlined"
                            color="primary"
                            onClick={() => handleOpen(product, 'in')}
                            sx={{ mr: 1 }}
                          >
                            Add Stock
                          </Button>
                          <Button
                            size="small"
                            variant="outlined"
                            color="error"
                            onClick={() => handleOpen(product, 'out')}
                          >
                            Remove Stock
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} align="center">
                        <Typography color="text.secondary" py={2}>
                          {products.length === 0 ? 'No products found' : 'No products match the filters'}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      {/* Adjust Stock Dialog */}
      <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
        <DialogTitle>
          {adjustType === 'in' ? 'Add Stock' : 'Remove Stock'}
        </DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <Typography mb={2} variant="body1" fontWeight={500}>
            {selected?.name}
          </Typography>
          <TextField
            label="Quantity"
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            fullWidth
            margin="normal"
            inputProps={{ min: 1 }}
          />
          <TextField
            label="Reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            fullWidth
            margin="normal"
            multiline
            rows={3}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleAdjust} variant="contained">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ProductManagement;

