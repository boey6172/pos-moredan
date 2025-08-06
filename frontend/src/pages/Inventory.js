import React, { useEffect, useState } from 'react';
import { Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField } from '@mui/material';
import axios from '../api/axios';

const Inventory = () => {
  const [products, setProducts] = useState([]);
  const [open, setOpen] = useState(false);
  const [adjustType, setAdjustType] = useState('in');
  const [selected, setSelected] = useState(null);
  const [quantity, setQuantity] = useState('');
  const [reason, setReason] = useState('');

  const fetchProducts = () => {
    axios.get('/api/products', { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } })
      .then(res => setProducts(res.data))
      .catch(() => setProducts([]));
  };

  useEffect(() => { fetchProducts(); }, []);

  const handleOpen = (product, type) => {
    setSelected(product);
    setAdjustType(type);
    setQuantity('');
    setReason('');
    setOpen(true);
  };
  const handleClose = () => { setOpen(false); setSelected(null); setQuantity(''); setReason(''); };

  const handleAdjust = async () => {
    try {
      await axios.post('/api/inventory/adjust', {
        productId: selected.id,
        type: adjustType,
        quantity: Number(quantity),
        reason
      }, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
      fetchProducts();
      handleClose();
    } catch (err) { alert(err.response?.data?.message || 'Error'); }
  };

  return (
    <Box p={2}>
      <Typography variant="h4" mb={2}>Inventory</Typography>
      <TableContainer component={Paper}>
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
            {products.map(product => (
              <TableRow key={product.id}>
                <TableCell>{product.name}</TableCell>
                <TableCell>{product.sku}</TableCell>
                <TableCell>{product.inventory}</TableCell>
                <TableCell>
                  <Button size="small" variant="outlined" color="primary" onClick={() => handleOpen(product, 'in')}>Add Stock</Button>
                  <Button size="small" variant="outlined" color="error" sx={{ ml: 1 }} onClick={() => handleOpen(product, 'out')}>Remove Stock</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      {/* Adjust Stock Dialog */}
      <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
        <DialogTitle>{adjustType === 'in' ? 'Add Stock' : 'Remove Stock'}</DialogTitle>
        <DialogContent>
          <Typography mb={2}>{selected?.name}</Typography>
          <TextField label="Quantity" type="number" value={quantity} onChange={e => setQuantity(e.target.value)} fullWidth margin="normal" />
          <TextField label="Reason" value={reason} onChange={e => setReason(e.target.value)} fullWidth margin="normal" />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleAdjust} variant="contained">Save</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Inventory; 