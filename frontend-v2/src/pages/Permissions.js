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
} from '@mui/material';
import TableSkeleton from '../components/TableSkeleton';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import axios from '../api/axios';

const Permissions = () => {
  const [permissions, setPermissions] = useState([]);
  const [open, setOpen] = useState(false);
  const [edit, setEdit] = useState(null);
  const [form, setForm] = useState({ name: '', code: '', description: '' });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(null);

  const fetchPermissions = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/permissions');
      setPermissions(res.data);
    } catch (err) {
      console.error('Error fetching permissions:', err);
      setPermissions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPermissions();
  }, []);

  const handleOpen = (perm = null) => {
    setEdit(perm);
    setForm(perm ? { name: perm.name, code: perm.code, description: perm.description || '' } : { name: '', code: '', description: '' });
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEdit(null);
    setForm({ name: '', code: '', description: '' });
  };

  const handleSave = async () => {
    if (saving) return;
    setSaving(true);
    try {
      if (edit) {
        await axios.put(`/api/permissions/${edit.id}`, form);
      } else {
        await axios.post('/api/permissions', form);
      }
      fetchPermissions();
      handleClose();
    } catch (err) {
      alert(err.response?.data?.message || 'Error saving permission');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (deleting === id) return;
    if (!window.confirm('Delete this permission? It will be removed from all roles.')) return;
    setDeleting(id);
    try {
      await axios.delete(`/api/permissions/${id}`);
      fetchPermissions();
    } catch (err) {
      alert(err.response?.data?.message || 'Error deleting permission');
    } finally {
      setDeleting(null);
    }
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 600 }}>
          Permissions
        </Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpen()}>
          Add Permission
        </Button>
      </Box>

      <Card>
        <CardContent>
          {loading ? (
            <TableSkeleton rows={8} columns={3} />
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Code</TableCell>
                    <TableCell>Description</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {permissions.length > 0 ? (
                    permissions.map((p) => (
                      <TableRow key={p.id} hover>
                        <TableCell>{p.name}</TableCell>
                        <TableCell><code>{p.code}</code></TableCell>
                        <TableCell>{p.description || '—'}</TableCell>
                        <TableCell align="right">
                          <IconButton size="small" color="primary" onClick={() => handleOpen(p)} aria-label={`Edit ${p.code}`}>
                            <EditIcon />
                          </IconButton>
                          <IconButton size="small" color="error" onClick={() => handleDelete(p.id)} disabled={deleting === p.id} aria-label={`Delete ${p.code}`}>
                            {deleting === p.id ? <CircularProgress size={20} /> : <DeleteIcon />}
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} align="center">
                        <Typography color="text.secondary" py={2}>No permissions found</Typography>
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
        <DialogTitle>{edit ? 'Edit Permission' : 'Add Permission'}</DialogTitle>
        <DialogContent>
          <TextField
            label="Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            fullWidth
            margin="normal"
            required
            placeholder="e.g. View Users"
          />
          <TextField
            label="Code"
            value={form.code}
            onChange={(e) => setForm({ ...form, code: e.target.value })}
            fullWidth
            margin="normal"
            required
            disabled={!!edit}
            helperText={edit ? 'Code cannot be changed after creation.' : 'e.g. users.view (lowercase, dots)'}
            placeholder="users.view"
          />
          <TextField
            label="Description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            fullWidth
            margin="normal"
            multiline
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} disabled={saving}>Cancel</Button>
          <Button onClick={handleSave} variant="contained" disabled={!form.name || !form.code || saving}>
            {saving ? 'Saving...' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Permissions;
