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
  FormGroup,
  FormControlLabel,
  Checkbox,
  Chip,
} from '@mui/material';
import TableSkeleton from '../components/TableSkeleton';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import axios from '../api/axios';

const Roles = () => {
  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [open, setOpen] = useState(false);
  const [edit, setEdit] = useState(null);
  const [form, setForm] = useState({ name: '', description: '', permissionIds: [] });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(null);

  const fetchRoles = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/roles');
      setRoles(res.data);
    } catch (err) {
      console.error('Error fetching roles:', err);
      setRoles([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchPermissions = async () => {
    try {
      const res = await axios.get('/api/permissions');
      setPermissions(res.data);
    } catch (err) {
      console.error('Error fetching permissions:', err);
      setPermissions([]);
    }
  };

  useEffect(() => {
    fetchRoles();
    fetchPermissions();
  }, []);

  const handleOpen = (role = null) => {
    setEdit(role);
    const permissionIds = role && role.Permissions ? role.Permissions.map((p) => p.id) : [];
    setForm({
      name: role ? role.name : '',
      description: role ? (role.description || '') : '',
      permissionIds,
    });
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEdit(null);
    setForm({ name: '', description: '', permissionIds: [] });
  };

  const togglePermission = (id) => {
    setForm((prev) => ({
      ...prev,
      permissionIds: prev.permissionIds.includes(id)
        ? prev.permissionIds.filter((pid) => pid !== id)
        : [...prev.permissionIds, id],
    }));
  };

  const handleSave = async () => {
    if (saving) return;
    setSaving(true);
    try {
      if (edit) {
        await axios.put(`/api/roles/${edit.id}`, { name: form.name, description: form.description, permissionIds: form.permissionIds });
      } else {
        await axios.post('/api/roles', { name: form.name, description: form.description, permissionIds: form.permissionIds });
      }
      fetchRoles();
      handleClose();
    } catch (err) {
      alert(err.response?.data?.message || 'Error saving role');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (deleting === id) return;
    if (!window.confirm('Delete this role? Users with this role must be reassigned first.')) return;
    setDeleting(id);
    try {
      await axios.delete(`/api/roles/${id}`);
      fetchRoles();
    } catch (err) {
      alert(err.response?.data?.message || 'Error deleting role');
    } finally {
      setDeleting(null);
    }
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 600 }}>
          Roles
        </Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpen()}>
          Add Role
        </Button>
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
                    <TableCell>Description</TableCell>
                    <TableCell>Permissions</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {roles.length > 0 ? (
                    roles.map((role) => (
                      <TableRow key={role.id} hover>
                        <TableCell>{role.name}</TableCell>
                        <TableCell>{role.description || '—'}</TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                            {(role.Permissions || []).slice(0, 5).map((p) => (
                              <Chip key={p.id} label={p.code} size="small" variant="outlined" />
                            ))}
                            {(role.Permissions || []).length > 5 && (
                              <Chip label={`+${role.Permissions.length - 5} more`} size="small" />
                            )}
                          </Box>
                        </TableCell>
                        <TableCell align="right">
                          <IconButton size="small" color="primary" onClick={() => handleOpen(role)} aria-label={`Edit ${role.name}`}>
                            <EditIcon />
                          </IconButton>
                          <IconButton size="small" color="error" onClick={() => handleDelete(role.id)} disabled={deleting === role.id} aria-label={`Delete ${role.name}`}>
                            {deleting === role.id ? <CircularProgress size={20} /> : <DeleteIcon />}
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} align="center">
                        <Typography color="text.secondary" py={2}>No roles found</Typography>
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
        <DialogTitle>{edit ? 'Edit Role' : 'Add Role'}</DialogTitle>
        <DialogContent>
          <TextField
            label="Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            fullWidth
            margin="normal"
            required
            placeholder="e.g. Manager"
          />
          <TextField
            label="Description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            fullWidth
            margin="normal"
          />
          <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>Permissions</Typography>
          <Box sx={{ maxHeight: 320, overflow: 'auto', border: 1, borderColor: 'divider', borderRadius: 1, p: 1 }}>
            <FormGroup>
              {permissions.map((p) => (
                <FormControlLabel
                  key={p.id}
                  control={
                    <Checkbox
                      checked={form.permissionIds.includes(p.id)}
                      onChange={() => togglePermission(p.id)}
                    />
                  }
                  label={<><code>{p.code}</code> — {p.name}</>}
                />
              ))}
            </FormGroup>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} disabled={saving}>Cancel</Button>
          <Button onClick={handleSave} variant="contained" disabled={!form.name || saving}>
            {saving ? 'Saving...' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Roles;
