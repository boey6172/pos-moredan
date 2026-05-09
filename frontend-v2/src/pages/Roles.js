import React, { useEffect, useMemo, useState } from 'react';
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
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Divider,
  Stack,
} from '@mui/material';
import TableSkeleton from '../components/TableSkeleton';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import axios from '../api/axios';

const formatCategoryLabel = (key) => {
  if (!key) return 'Other';
  return key
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
};

const groupPermissionsByCategory = (permissions) => {
  const groups = new Map();
  permissions.forEach((p) => {
    const code = p.code || '';
    const dotIdx = code.indexOf('.');
    const category = dotIdx === -1 ? 'other' : code.slice(0, dotIdx);
    if (!groups.has(category)) groups.set(category, []);
    groups.get(category).push(p);
  });
  return Array.from(groups.entries())
    .map(([key, perms]) => ({
      key,
      label: formatCategoryLabel(key),
      permissions: perms.slice().sort((a, b) => a.code.localeCompare(b.code)),
    }))
    .sort((a, b) => a.label.localeCompare(b.label));
};

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

  const groupedPermissions = useMemo(
    () => groupPermissionsByCategory(permissions),
    [permissions]
  );

  const toggleCategory = (categoryPermissionIds, allSelected) => {
    setForm((prev) => {
      const set = new Set(prev.permissionIds);
      if (allSelected) {
        categoryPermissionIds.forEach((id) => set.delete(id));
      } else {
        categoryPermissionIds.forEach((id) => set.add(id));
      }
      return { ...prev, permissionIds: Array.from(set) };
    });
  };

  const toggleAllPermissions = (allSelected) => {
    setForm((prev) => ({
      ...prev,
      permissionIds: allSelected ? [] : permissions.map((p) => p.id),
    }));
  };

  const totalPermissions = permissions.length;
  const selectedCount = form.permissionIds.length;
  const allSelected = totalPermissions > 0 && selectedCount === totalPermissions;
  const someSelected = selectedCount > 0 && selectedCount < totalPermissions;

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
          <Box
            sx={{
              mt: 2,
              mb: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 1,
            }}
          >
            <Typography variant="subtitle2">Permissions</Typography>
            <Typography variant="caption" color="text.secondary">
              {selectedCount} of {totalPermissions} selected
            </Typography>
          </Box>
          <Box sx={{ border: 1, borderColor: 'divider', borderRadius: 1 }}>
            <Box sx={{ px: 1.5, py: 0.5, bgcolor: 'action.hover', borderTopLeftRadius: 4, borderTopRightRadius: 4 }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={allSelected}
                    indeterminate={someSelected}
                    onChange={() => toggleAllPermissions(allSelected)}
                    disabled={totalPermissions === 0}
                  />
                }
                label={
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    Select All Permissions
                  </Typography>
                }
              />
            </Box>
            <Divider />
            <Box sx={{ maxHeight: 360, overflow: 'auto' }}>
              {groupedPermissions.length === 0 ? (
                <Box sx={{ p: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    No permissions available.
                  </Typography>
                </Box>
              ) : (
                groupedPermissions.map((group) => {
                  const groupIds = group.permissions.map((p) => p.id);
                  const groupSelectedCount = groupIds.filter((id) =>
                    form.permissionIds.includes(id)
                  ).length;
                  const groupAllSelected =
                    groupIds.length > 0 && groupSelectedCount === groupIds.length;
                  const groupSomeSelected =
                    groupSelectedCount > 0 && groupSelectedCount < groupIds.length;
                  return (
                    <Accordion
                      key={group.key}
                      disableGutters
                      defaultExpanded={false}
                      sx={{
                        boxShadow: 'none',
                        '&:before': { display: 'none' },
                        borderBottom: 1,
                        borderColor: 'divider',
                        '&:last-of-type': { borderBottom: 0 },
                      }}
                    >
                      <AccordionSummary
                        expandIcon={<ExpandMoreIcon />}
                        sx={{ px: 1.5 }}
                      >
                        <Stack
                          direction="row"
                          alignItems="center"
                          justifyContent="space-between"
                          sx={{ width: '100%', pr: 1 }}
                        >
                          <FormControlLabel
                            onClick={(e) => e.stopPropagation()}
                            onFocus={(e) => e.stopPropagation()}
                            control={
                              <Checkbox
                                checked={groupAllSelected}
                                indeterminate={groupSomeSelected}
                                onChange={() =>
                                  toggleCategory(groupIds, groupAllSelected)
                                }
                              />
                            }
                            label={
                              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                {group.label}
                              </Typography>
                            }
                          />
                          <Typography variant="caption" color="text.secondary">
                            {groupSelectedCount}/{groupIds.length}
                          </Typography>
                        </Stack>
                      </AccordionSummary>
                      <AccordionDetails sx={{ pt: 0, pl: 4, pr: 2 }}>
                        <FormGroup>
                          {group.permissions.map((p) => (
                            <FormControlLabel
                              key={p.id}
                              control={
                                <Checkbox
                                  size="small"
                                  checked={form.permissionIds.includes(p.id)}
                                  onChange={() => togglePermission(p.id)}
                                />
                              }
                              label={
                                <Typography variant="body2">
                                  <code>{p.code}</code> — {p.name}
                                </Typography>
                              }
                            />
                          ))}
                        </FormGroup>
                      </AccordionDetails>
                    </Accordion>
                  );
                })
              )}
            </Box>
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
