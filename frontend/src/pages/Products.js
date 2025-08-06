import React, { useEffect, useState } from 'react';
import { Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, Avatar, Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem } from '@mui/material';
import axios from '../api/axios';

const emptyProduct = { name: '', price: '', sku: '', inventory: '', categoryId: '', image: null };

const Products = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [open, setOpen] = useState(false);
  const [edit, setEdit] = useState(null);
  const [form, setForm] = useState(emptyProduct);

  const fetchProducts = () => {
    axios.get('/api/products', { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } })
      .then(res => setProducts(res.data))
      .catch(() => setProducts([]));
  };
  const fetchCategories = () => {
    axios.get('/api/categories', { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } })
      .then(res => setCategories(res.data))
      .catch(() => setCategories([]));
  };

  useEffect(() => { fetchProducts(); fetchCategories(); }, []);

  const handleOpen = (product = null) => {
    setEdit(product);
    setForm(product ? { ...product, image: null } : emptyProduct);
    setOpen(true);
  };
  const handleClose = () => { setOpen(false); setEdit(null); setForm(emptyProduct); };

  const handleSave = async () => {
    try {
      const data = new FormData();
      Object.entries(form).forEach(([k, v]) => {
        if (v !== null && v !== undefined) data.append(k, v);
      });
      if (edit) {
        await axios.put(`/api/products/${edit.id}`, data, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}`, 'Content-Type': 'multipart/form-data' } });
      } else {
        await axios.post('/api/products', data, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}`, 'Content-Type': 'multipart/form-data' } });
      }
      fetchProducts();
      handleClose();
    } catch (err) { alert(err.response?.data?.message || 'Error'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete product?')) return;
    try {
      await axios.delete(`/api/products/${id}`, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
      fetchProducts();
    } catch (err) { alert(err.response?.data?.message || 'Error'); }
  };

  return (
    <Box p={2}>
      <Typography variant="h4" mb={2}>Products</Typography>
      <Button variant="contained" color="primary" sx={{ mb: 2 }} onClick={() => handleOpen()}>Add Product</Button>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Image</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Price</TableCell>
              <TableCell>SKU</TableCell>
              <TableCell>Inventory</TableCell>
              <TableCell>Category</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {products.map(product => (
              <TableRow key={product.id}>
                <TableCell><Avatar src={product.image || '/logo.svg'} variant="square" /></TableCell>
                <TableCell>{product.name}</TableCell>
                <TableCell>${product.price}</TableCell>
                <TableCell>{product.sku}</TableCell>
                <TableCell>{product.inventory}</TableCell>
                <TableCell>{product.Category?.name || ''}</TableCell>
                <TableCell>
                  <Button size="small" variant="outlined" color="primary" onClick={() => handleOpen(product)}>Edit</Button>
                  <Button size="small" variant="outlined" color="error" sx={{ ml: 1 }} onClick={() => handleDelete(product.id)}>Delete</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      {/* Create/Edit Dialog */}
      <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
        <DialogTitle>{edit ? 'Edit Product' : 'Add Product'}</DialogTitle>
        <DialogContent>
          <TextField label="Name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} fullWidth margin="normal" />
          <TextField label="Price" type="number" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} fullWidth margin="normal" />
          <TextField label="SKU" value={form.sku} onChange={e => setForm(f => ({ ...f, sku: e.target.value }))} fullWidth margin="normal" />
          <TextField label="Inventory" type="number" value={form.inventory} onChange={e => setForm(f => ({ ...f, inventory: e.target.value }))} fullWidth margin="normal" />
          <TextField select label="Category" value={form.categoryId} onChange={e => setForm(f => ({ ...f, categoryId: e.target.value }))} fullWidth margin="normal">
            {categories.map(cat => <MenuItem key={cat.id} value={cat.id}>{cat.name}</MenuItem>)}
          </TextField>
          <Button component="label" fullWidth sx={{ mt: 1 }}>
            Upload Image
            <input type="file" hidden accept="image/*" onChange={e => setForm(f => ({ ...f, image: e.target.files[0] }))} />
          </Button>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSave} variant="contained">Save</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Products; 