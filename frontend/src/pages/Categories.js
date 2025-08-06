import React, { useEffect, useState } from 'react';
import { Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField } from '@mui/material';
import axios from '../api/axios';

const emptyCategory = { name: '', description: '' };

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [open, setOpen] = useState(false);
  const [edit, setEdit] = useState(null);
  const [form, setForm] = useState(emptyCategory);

  const fetchCategories = () => {
    axios.get('/api/categories', { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } })
      .then(res => setCategories(res.data))
      .catch(() => setCategories([]));
  };

  useEffect(() => { fetchCategories(); }, []);

  const handleOpen = (cat = null) => {
    setEdit(cat);
    setForm(cat ? { ...cat } : emptyCategory);
    setOpen(true);
  };
  const handleClose = () => { setOpen(false); setEdit(null); setForm(emptyCategory); };

  const handleSave = async () => {
    try {
      if (edit) {
        await axios.put(`/api/categories/${edit.id}`, form, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
      } else {
        await axios.post('/api/categories', form, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
      }
      fetchCategories();
      handleClose();
    } catch (err) { alert(err.response?.data?.message || 'Error'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete category?')) return;
    try {
      await axios.delete(`/api/categories/${id}`, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
      fetchCategories();
    } catch (err) { alert(err.response?.data?.message || 'Error'); }
  };

  return (
    <Box p={2}>
      <Typography variant="h4" mb={2}>Categories</Typography>
      <Button variant="contained" color="primary" sx={{ mb: 2 }} onClick={() => handleOpen()}>Add Category</Button>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {categories.map(cat => (
              <TableRow key={cat.id}>
                <TableCell>{cat.name}</TableCell>
                <TableCell>{cat.description}</TableCell>
                <TableCell>
                  <Button size="small" variant="outlined" color="primary" onClick={() => handleOpen(cat)}>Edit</Button>
                  <Button size="small" variant="outlined" color="error" sx={{ ml: 1 }} onClick={() => handleDelete(cat.id)}>Delete</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      {/* Create/Edit Dialog */}
      <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
        <DialogTitle>{edit ? 'Edit Category' : 'Add Category'}</DialogTitle>
        <DialogContent>
          <TextField label="Name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} fullWidth margin="normal" />
          <TextField label="Description" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} fullWidth margin="normal" />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSave} variant="contained">Save</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Categories; 