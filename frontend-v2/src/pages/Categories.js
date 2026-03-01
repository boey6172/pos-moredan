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
  IconButton,
  CircularProgress,
  Skeleton,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import TableSkeleton from '../components/TableSkeleton';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import axios from '../api/axios';

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [open, setOpen] = useState(false);
  const [edit, setEdit] = useState(null);
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(null);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/categories');
      setCategories(res.data);
    } catch (err) {
      console.error('Error fetching categories:', err);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleOpen = (category = null) => {
    setEdit(category);
    setName(category ? category.name : '');
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEdit(null);
    setName('');
  };

  const handleSave = async () => {
    if (saving) return; // Prevent double-click
    setSaving(true);
    try {
      if (edit) {
        await axios.put(`/api/categories/${edit.id}`, { name });
      } else {
        await axios.post('/api/categories', { name });
      }
      fetchCategories();
      handleClose();
    } catch (err) {
      alert(err.response?.data?.message || 'Error saving category');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (deleting === id) return; // Prevent double-click
    if (!window.confirm('Delete this category?')) return;
    setDeleting(id);
    try {
      await axios.delete(`/api/categories/${id}`);
      fetchCategories();
    } catch (err) {
      alert(err.response?.data?.message || 'Error deleting category');
    } finally {
      setDeleting(null);
    }
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 600 }}>
          Categories
        </Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpen()}>
          Add Category
        </Button>
      </Box>

      <Card>
        <CardContent>
          {loading ? (
            <TableSkeleton rows={6} columns={2} />
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {categories.length > 0 ? (
                    categories.map((category) => (
                      <TableRow key={category.id} hover>
                        <TableCell>{category.name}</TableCell>
                        <TableCell align="right">
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => handleOpen(category)}
                            aria-label={`Edit ${category.name}`}
                          >
                            <EditIcon />
                          </IconButton>
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleDelete(category.id)}
                            disabled={deleting === category.id}
                            aria-label={`Delete ${category.name}`}
                          >
                            {deleting === category.id ? <CircularProgress size={20} /> : <DeleteIcon />}
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={2} align="center">
                        <Typography color="text.secondary" py={2}>
                          No categories found
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
        <DialogTitle>{edit ? 'Edit Category' : 'Add Category'}</DialogTitle>
        <DialogContent>
          <TextField
            label="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            fullWidth
            margin="normal"
            required
            autoFocus
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} disabled={saving}>Cancel</Button>
          <Button onClick={handleSave} variant="contained" disabled={!name || saving}>
            {saving ? 'Saving...' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Categories;






