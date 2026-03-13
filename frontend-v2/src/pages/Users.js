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
  Chip,
  CircularProgress,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  MenuItem,
  Alert,
} from '@mui/material';
import TableSkeleton from '../components/TableSkeleton';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import LockResetIcon from '@mui/icons-material/LockReset';
import axios from '../api/axios';
import { useAuth } from '../contexts/AuthContext';

const emptyUser = { username: '', roleId: '', password: '' };

const Users = () => {
  const { auth } = useAuth();
  const currentUserId = auth?.user?.id;
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [open, setOpen] = useState(false);
  const [edit, setEdit] = useState(null);
  const [form, setForm] = useState(emptyUser);
  const [resetId, setResetId] = useState(null);
  const [resetPassword, setResetPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [resetting, setResetting] = useState(false);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/users');
      setUsers(res.data);
    } catch (err) {
      console.error('Error fetching users:', err);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchRoles = async () => {
    try {
      const res = await axios.get('/api/roles');
      setRoles(res.data);
    } catch (err) {
      console.error('Error fetching roles:', err);
      setRoles([]);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchRoles();
  }, []);

  const handleOpen = (user = null) => {
    setEdit(user);
    setForm(user ? { username: user.username, roleId: user.roleId || '', password: '' } : emptyUser);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEdit(null);
    setForm(emptyUser);
  };

  const handleSave = async () => {
    if (saving) return;
    setSaving(true);
    try {
      if (edit) {
        await axios.put(`/api/users/${edit.id}`, { username: form.username, roleId: form.roleId });
      } else {
        await axios.post('/api/users', { username: form.username, password: form.password, roleId: form.roleId });
      }
      fetchUsers();
      handleClose();
    } catch (err) {
      alert(err.response?.data?.message || 'Error saving user');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (deleting === id) return; // Prevent double-click
    if (!window.confirm('Delete this user?')) return;
    setDeleting(id);
    try {
      await axios.delete(`/api/users/${id}`);
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.message || 'Error deleting user');
    } finally {
      setDeleting(null);
    }
  };

  const handleReset = async () => {
    if (resetting) return; // Prevent double-click
    setResetting(true);
    try {
      await axios.post(`/api/users/${resetId}/reset-password`, { password: resetPassword });
      setResetId(null);
      setResetPassword('');
      alert('Password reset successfully');
    } catch (err) {
      alert(err.response?.data?.message || 'Error resetting password');
    } finally {
      setResetting(false);
    }
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 600 }}>
          Users
        </Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpen()}>
          Add User
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
                    <TableCell>Username</TableCell>
                    <TableCell>Role</TableCell>
                    <TableCell>Created At</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {users.length > 0 ? (
                    users.map((user) => (
                      <TableRow key={user.id} hover>
                        <TableCell>{user.username}</TableCell>
                        <TableCell>
                          <Chip
                            label={user.roleName || user.role || '—'}
                            size="small"
                            color={user.role === 'admin' || user.roleName === 'Admin' ? 'primary' : 'default'}
                          />
                        </TableCell>
                        <TableCell>{new Date(user.createdAt).toLocaleDateString()}</TableCell>
                        <TableCell align="right">
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => handleOpen(user)}
                            aria-label={`Edit user ${user.username}`}
                          >
                            <EditIcon />
                          </IconButton>
                          <IconButton
                            size="small"
                            color="secondary"
                            onClick={() => setResetId(user.id)}
                            aria-label={`Reset password for ${user.username}`}
                          >
                            <LockResetIcon />
                          </IconButton>
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleDelete(user.id)}
                            disabled={deleting === user.id || user.id === currentUserId}
                            aria-label={user.id === currentUserId ? 'Cannot delete your own account' : `Delete user ${user.username}`}
                            title={user.id === currentUserId ? 'You cannot delete your own account' : ''}
                          >
                            {deleting === user.id ? <CircularProgress size={20} /> : <DeleteIcon />}
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} align="center">
                        <Typography color="text.secondary" py={2}>
                          No users found
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

      {/* Create/Edit Dialog */}
      <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
        <DialogTitle>{edit ? 'Edit User' : 'Add User'}</DialogTitle>
        <DialogContent>
          <TextField
            label="Username"
            value={form.username}
            onChange={(e) => setForm({ ...form, username: e.target.value })}
            fullWidth
            margin="normal"
            required
          />
          <TextField
            select
            label="Role"
            value={form.roleId}
            onChange={(e) => setForm({ ...form, roleId: e.target.value })}
            fullWidth
            margin="normal"
            required
            helperText={edit?.id === currentUserId ? 'You cannot change your own role.' : ''}
            disabled={edit?.id === currentUserId}
          >
            {roles.map((r) => (
              <MenuItem key={r.id} value={r.id}>{r.name}</MenuItem>
            ))}
          </TextField>
          {!edit && (
            <TextField
              label="Password"
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              fullWidth
              margin="normal"
              required
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} disabled={saving}>Cancel</Button>
          <Button onClick={handleSave} variant="contained" disabled={!form.username || !form.roleId || (!edit && !form.password) || saving}>
            {saving ? 'Saving...' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Reset Password Dialog */}
      <Dialog open={!!resetId} onClose={() => setResetId(null)} maxWidth="xs" fullWidth>
        <DialogTitle>Reset Password</DialogTitle>
        <DialogContent>
          <Alert severity="info" sx={{ mb: 2 }}>
            Enter a new password for this user.
          </Alert>
          <TextField
            label="New Password"
            type="password"
            value={resetPassword}
            onChange={(e) => setResetPassword(e.target.value)}
            fullWidth
            margin="normal"
            required
            autoFocus
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setResetId(null)} disabled={resetting}>Cancel</Button>
          <Button onClick={handleReset} variant="contained" disabled={!resetPassword || resetting}>
            {resetting ? 'Resetting...' : 'Reset'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Users;


