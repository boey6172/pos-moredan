import React, { useEffect, useState, useCallback } from 'react';
import {
  Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem
} from '@mui/material';
import axios from '../api/axios';
import { debounce } from 'lodash';

const emptyProduct = {
  name: '', price: '', sku: '', inventory: '', categoryId: '', costToMake: '', image: null
};

const ProductRow = React.memo(({ product, onEdit, onDelete }) => (
  <TableRow key={product.id}>
    <TableCell>{product.name}</TableCell>
    <TableCell>${product.price}</TableCell>
    <TableCell>{product.sku}</TableCell>
    <TableCell>{product.inventory}</TableCell>
    <TableCell>{product.Category?.name || ''}</TableCell>
    <TableCell>
      <Button size="small" variant="outlined" onClick={() => onEdit(product)}>Edit</Button>
      <Button size="small" variant="outlined" color="error" sx={{ ml: 1 }} onClick={() => onDelete(product.id)}>Delete</Button>
    </TableCell>
  </TableRow>
));

const Products = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [open, setOpen] = useState(false);
  const [edit, setEdit] = useState(null);
  const [form, setForm] = useState(emptyProduct);
  const [categoryFilter, setCategoryFilter] = useState("");
  

  const filteredProducts = categoryFilter
  ? products.filter((p) => p.categoryId === categoryFilter)
  : products;

  const fetchProducts = async () => {
    try {
      const res = await axios.get('/api/products', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setProducts(res.data);
    } catch {
      setProducts([]);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await axios.get('/api/categories', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setCategories(res.data);
    } catch {
      setCategories([]);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const handleOpen = (product = null) => {
    setEdit(product);
    setForm(product ? { ...product, image: null } : emptyProduct);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEdit(null);
    setForm(emptyProduct);
  };

  const handleSave = async () => {
    try {
      const data = new FormData();
      Object.entries(form).forEach(([k, v]) => {
        if (v !== null && v !== undefined) data.append(k, v);
      });

      const headers = {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'multipart/form-data'
      };

      if (edit) {
        await axios.put(`/api/products/${edit.id}`, data, { headers });
      } else {
        await axios.post('/api/products', data, { headers });
      }

      fetchProducts();
      handleClose();
    } catch (err) {
      alert(err.response?.data?.message || 'Error');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete product?')) return;
    try {
      await axios.delete(`/api/products/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      fetchProducts();
    } catch (err) {
      alert(err.response?.data?.message || 'Error');
    }
  };

  // Debounced field update
  const debouncedUpdate = useCallback(
    debounce((field, value) => {
      setForm(prev => ({ ...prev, [field]: value }));
    }, 200),
    []
  );

  const handleFieldChange = (field) => (e) => {
    debouncedUpdate(field, e.target.value);
  };

  return (
    <Box p={2}>
      <Typography variant="h4" mb={2}>Products</Typography>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        {/* Left side: Add Product button */}
        <Button
          variant="contained"
          color="primary"
          onClick={() => handleOpen()}
        >
          Add Product
        </Button>

        {/* Right side: Category Filter */}
        <TextField
          select
          label="Filter by Category"
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          sx={{ minWidth: 200 }}
        >
          <MenuItem value="">All Categories</MenuItem>
          {categories.map((cat) => (
            <MenuItem key={cat.id} value={cat.id}>
              {cat.name}
            </MenuItem>
          ))}
        </TextField>
      </Box>
   
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Price</TableCell>
              <TableCell>SKU</TableCell>
              <TableCell>Inventory</TableCell>
              <TableCell>Category</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredProducts.map(product => (
              <ProductRow
                key={product.id}
                product={product}
                onEdit={handleOpen}
                onDelete={handleDelete}
              />
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Modal */}
      <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
        <DialogTitle>{edit ? 'Edit Product' : 'Add Product'}</DialogTitle>
        <DialogContent>
          <TextField label="Name" defaultValue={form.name} onChange={handleFieldChange('name')} fullWidth margin="normal" />
          <TextField label="Price" type="number" defaultValue={form.price} onChange={handleFieldChange('price')} fullWidth margin="normal" />
          <TextField label="SKU" defaultValue={form.sku} onChange={handleFieldChange('sku')} fullWidth margin="normal" />
          <TextField label="Inventory" type="number" defaultValue={form.inventory} onChange={handleFieldChange('inventory')} fullWidth margin="normal" />
          <TextField select label="Category" defaultValue={form.categoryId} onChange={handleFieldChange('categoryId')} fullWidth margin="normal">
            {categories.map(cat => (
              <MenuItem key={cat.id} value={cat.id}>{cat.name}</MenuItem>
            ))}
          </TextField>
          <TextField label="Cost to Make" type="number" defaultValue={form.costToMake} onChange={handleFieldChange('costToMake')} fullWidth margin="normal" />
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