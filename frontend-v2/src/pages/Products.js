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
  MenuItem,
  IconButton,
  Chip,
  CircularProgress,
} from '@mui/material';
import TableSkeleton from '../components/TableSkeleton';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import axios from '../api/axios';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [open, setOpen] = useState(false);
  const [edit, setEdit] = useState(null);
  const [form, setForm] = useState({
    name: '',
    price: '',
    sku: '',
    inventory: '',
    categoryId: '',
    costToMake: '',
    image: null,
    materialId: '',
    materialQuantityPerUnit: '1',
    materialDeductionMode: 'NONE',
  });
  const [categoryFilter, setCategoryFilter] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(null);

  const filteredProducts = categoryFilter
    ? products.filter((p) => p.categoryId === parseInt(categoryFilter))
    : products;

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

  const fetchCategories = async () => {
    try {
      const res = await axios.get('/api/categories');
      setCategories(res.data);
    } catch (err) {
      console.error('Error fetching categories:', err);
      setCategories([]);
    }
  };

  const fetchMaterials = async () => {
    try {
      const res = await axios.get('/api/materials');
      setMaterials(res.data || []);
    } catch {
      setMaterials([]);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchCategories();
    fetchMaterials();
  }, []);

  const handleOpen = (product = null) => {
    setEdit(product);
    setForm(
      product
        ? {
            ...product,
            image: null,
            materialId: product.materialId ?? '',
            materialQuantityPerUnit: String(product.materialQuantityPerUnit ?? 1),
            materialDeductionMode: product.materialDeductionMode || 'NONE',
          }
        : {
            name: '',
            price: '',
            sku: '',
            inventory: '',
            categoryId: '',
            costToMake: '',
            image: null,
            materialId: '',
            materialQuantityPerUnit: '1',
            materialDeductionMode: 'NONE',
          }
    );
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEdit(null);
    setForm({
      name: '',
      price: '',
      sku: '',
      inventory: '',
      categoryId: '',
      costToMake: '',
      image: null,
      materialId: '',
      materialQuantityPerUnit: '1',
      materialDeductionMode: 'NONE',
    });
  };

  const handleSave = async () => {
    if (saving) return; // Prevent double-click
    setSaving(true);
    try {
      const data = new FormData();
      Object.entries(form).forEach(([k, v]) => {
        if (k === 'image' || k === 'materialId' || k === 'materialQuantityPerUnit' || k === 'materialDeductionMode') {
          return;
        }
        if (v !== null && v !== undefined && v !== '') {
          data.append(k, v);
        }
      });
      data.append('materialQuantityPerUnit', form.materialQuantityPerUnit || '1');
      data.append('materialDeductionMode', form.materialDeductionMode || 'NONE');
      data.append('materialId', form.materialId === '' || form.materialId == null ? '' : String(form.materialId));

      if (edit) {
        await axios.put(`/api/products/${edit.id}`, data, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      } else {
        await axios.post('/api/products', data, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }

      fetchProducts();
      handleClose();
    } catch (err) {
      alert(err.response?.data?.message || 'Error saving product');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (deleting === id) return; // Prevent double-click
    if (!window.confirm('Delete this product?')) return;
    setDeleting(id);
    try {
      await axios.delete(`/api/products/${id}`);
      fetchProducts();
    } catch (err) {
      alert(err.response?.data?.message || 'Error deleting product');
    } finally {
      setDeleting(null);
    }
  };

  const formatCurrency = (amount) => {
    return `₱${(parseFloat(amount) || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 600 }}>
          Products
        </Typography>
        <Box display="flex" gap={2} alignItems="center" flexWrap="wrap">
          <TextField
            select
            label="Filter by Category"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            sx={{ minWidth: 200 }}
            size="small"
          >
            <MenuItem value="">All Categories</MenuItem>
            {categories.map((cat) => (
              <MenuItem key={cat.id} value={cat.id}>
                {cat.name}
              </MenuItem>
            ))}
          </TextField>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpen()}>
            Add Product
          </Button>
        </Box>
      </Box>

      <Card>
        <CardContent>
          {loading ? (
            <TableSkeleton rows={6} columns={6} />
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Price</TableCell>
                    <TableCell>SKU</TableCell>
                    <TableCell>Inventory</TableCell>
                    <TableCell>Category</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredProducts.length > 0 ? (
                    filteredProducts.map((product) => (
                      <TableRow key={product.id} hover>
                        <TableCell>{product.name}</TableCell>
                        <TableCell>{formatCurrency(product.price)}</TableCell>
                        <TableCell>{product.sku || '-'}</TableCell>
                        <TableCell>
                          <Chip
                            label={product.inventory}
                            color={product.inventory <= 10 ? 'error' : 'default'}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>{product.Category?.name || '-'}</TableCell>
                        <TableCell align="right">
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => handleOpen(product)}
                            aria-label={`Edit ${product.name}`}
                          >
                            <EditIcon />
                          </IconButton>
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleDelete(product.id)}
                            disabled={deleting === product.id}
                            aria-label={`Delete ${product.name}`}
                          >
                            {deleting === product.id ? <CircularProgress size={20} /> : <DeleteIcon />}
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} align="center">
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

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>{edit ? 'Edit Product' : 'Add Product'}</DialogTitle>
        <DialogContent>
          <TextField
            label="Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            fullWidth
            margin="normal"
            required
          />
          <TextField
            label="Price"
            type="number"
            value={form.price}
            onChange={(e) => setForm({ ...form, price: e.target.value })}
            fullWidth
            margin="normal"
            required
            inputProps={{ step: '0.01', min: '0' }}
          />
          <TextField
            label="SKU"
            value={form.sku}
            onChange={(e) => setForm({ ...form, sku: e.target.value })}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Inventory"
            type="number"
            value={form.inventory}
            onChange={(e) => setForm({ ...form, inventory: e.target.value })}
            fullWidth
            margin="normal"
            required
            inputProps={{ min: '0' }}
          />
          <TextField
            select
            label="Category"
            value={form.categoryId}
            onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
            fullWidth
            margin="normal"
          >
            {categories.map((cat) => (
              <MenuItem key={cat.id} value={cat.id}>
                {cat.name}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            label="Cost to Make"
            type="number"
            value={form.costToMake}
            onChange={(e) => setForm({ ...form, costToMake: e.target.value })}
            fullWidth
            margin="normal"
            inputProps={{ step: '0.01', min: '0' }}
          />
          <TextField
            select
            label="Linked material (inventory / BOM)"
            value={form.materialId === '' || form.materialId == null ? '' : form.materialId}
            onChange={(e) => setForm({ ...form, materialId: e.target.value })}
            fullWidth
            margin="normal"
            helperText="Optional. Link a unified material for recipe deduction on sale."
          >
            <MenuItem value="">None (POS stock only)</MenuItem>
            {materials.map((m) => (
              <MenuItem key={m.id} value={m.id}>
                {m.name} ({m.materialType})
              </MenuItem>
            ))}
          </TextField>
          <TextField
            label="Material base units per 1 product sold"
            value={form.materialQuantityPerUnit}
            onChange={(e) => setForm({ ...form, materialQuantityPerUnit: e.target.value })}
            fullWidth
            margin="normal"
            type="number"
            inputProps={{ min: '1' }}
            helperText="In material base UOM (e.g. ml per cup). Use 1 for each/bottle SKUs."
          />
          <TextField
            select
            label="Material deduction mode"
            value={form.materialDeductionMode}
            onChange={(e) => setForm({ ...form, materialDeductionMode: e.target.value })}
            fullWidth
            margin="normal"
          >
            <MenuItem value="NONE">None — do not deduct materials</MenuItem>
            <MenuItem value="MATERIAL_ONLY">Deduct linked material only (e.g. sell shots from stock)</MenuItem>
            <MenuItem value="BOM_CONSUME">BOM: consume inputs (keep intermediates as lines)</MenuItem>
            <MenuItem value="BOM_EXPLODE">BOM: explode to raw materials</MenuItem>
          </TextField>
          <Button component="label" fullWidth sx={{ mt: 2 }}>
            Upload Image
            <input
              type="file"
              hidden
              accept="image/*"
              onChange={(e) => setForm({ ...form, image: e.target.files[0] })}
            />
          </Button>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} disabled={saving}>Cancel</Button>
          <Button onClick={handleSave} variant="contained" disabled={!form.name || !form.price || saving}>
            {saving ? 'Saving...' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Products;






