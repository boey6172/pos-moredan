import React, { useEffect, useState } from 'react';
import { Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField } from '@mui/material';
import axios from '../api/axios';

const emptyUser = { username: '', role: 'cashier', password: '' };

const Users = () => {
  const [users, setUsers] = useState([]);
  const [open, setOpen] = useState(false);
  const [edit, setEdit] = useState(null);
  const [form, setForm] = useState(emptyUser);
  const [resetId, setResetId] = useState(null);
  const [resetPassword, setResetPassword] = useState('');

  const fetchUsers = () => {
    axios.get('/api/users', { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } })
      .then(res => setUsers(res.data))
      .catch(() => setUsers([]));
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleOpen = (user = null) => {
    setEdit(user);
    setForm(user ? { ...user, password: '' } : emptyUser);
    setOpen(true);
  };
  const handleClose = () => { setOpen(false); setEdit(null); setForm(emptyUser); };

  const handleSave = async () => {
    try {
      if (edit) {
        await axios.put(`/api/users/${edit.id}`, { username: form.username, role: form.role }, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
      } else {
        await axios.post('/api/users', form, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
      }
      fetchUsers();
      handleClose();
    } catch (err) { alert(err.response?.data?.message || 'Error'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete user?')) return;
    try {
      await axios.delete(`/api/users/${id}`, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
      fetchUsers();
    } catch (err) { alert(err.response?.data?.message || 'Error'); }
  };

  const handleReset = async () => {
    try {
      await axios.post(`/api/users/${resetId}/reset-password`, { password: resetPassword }, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
      setResetId(null); setResetPassword('');
      alert('Password reset');
    } catch (err) { alert(err.response?.data?.message || 'Error'); }
  };

  return (
    <Box p={2}>
      <Typography variant="h4" mb={2}>Users</Typography>
      <Button variant="contained" color="primary" sx={{ mb: 2 }} onClick={() => handleOpen()}>Add User</Button>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Username</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map(user => (
              <TableRow key={user.id}>
                <TableCell>{user.username}</TableCell>
                <TableCell>{user.role}</TableCell>
                <TableCell>
                  <Button size="small" variant="outlined" color="primary" onClick={() => handleOpen(user)}>Edit</Button>
                  <Button size="small" variant="outlined" color="error" sx={{ ml: 1 }} onClick={() => handleDelete(user.id)}>Delete</Button>
                  <Button size="small" variant="outlined" color="secondary" sx={{ ml: 1 }} onClick={() => setResetId(user.id)}>Reset Password</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      {/* Create/Edit Dialog */}
      <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
        <DialogTitle>{edit ? 'Edit User' : 'Add User'}</DialogTitle>
        <DialogContent>
          <TextField label="Username" value={form.username} onChange={e => setForm(f => ({ ...f, username: e.target.value }))} fullWidth margin="normal" />
          <TextField label="Role" value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))} fullWidth margin="normal" />
          {!edit && <TextField label="Password" type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} fullWidth margin="normal" />}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSave} variant="contained">Save</Button>
        </DialogActions>
      </Dialog>
      {/* Reset Password Dialog */}
      <Dialog open={!!resetId} onClose={() => setResetId(null)} maxWidth="xs" fullWidth>
        <DialogTitle>Reset Password</DialogTitle>
        <DialogContent>
          <TextField label="New Password" type="password" value={resetPassword} onChange={e => setResetPassword(e.target.value)} fullWidth margin="normal" />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setResetId(null)}>Cancel</Button>
          <Button onClick={handleReset} variant="contained">Reset</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Users; 