import React, { useEffect, useState } from 'react';
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
} from '@mui/material';
import axios from '../../../api/axios';

const ProductManagement = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [adjustType, setAdjustType] = useState('in');
  const [selected, setSelected] = useState(null);
  const [quantity, setQuantity] = useState('');
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/products');
      setProducts(res.data);
    } catch (err) {
      console.error('Error fetching products:', err);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

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
      <Card>
        <CardContent>
          {loading ? (
            <Box display="flex" justifyContent="center" p={4}>
              <CircularProgress />
            </Box>
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
                  {products.length > 0 ? (
                    products.map((product) => (
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
                          No products found
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

