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
  MenuItem,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import TableSkeleton from '../components/TableSkeleton';
import axios from '../api/axios';

const emptyForm = () => ({
  name: '',
  description: '',
  groupCode: 'CUSTOM',
});

const Units = () => {
  const [units, setUnits] = useState([]);
  const [open, setOpen] = useState(false);
  const [edit, setEdit] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [conversions, setConversions] = useState([]);
  const [convFrom, setConvFrom] = useState('');
  const [convTo, setConvTo] = useState('');
  const [convNum, setConvNum] = useState('1');
  const [convDen, setConvDen] = useState('1');

  const fetchConversions = async () => {
    try {
      const res = await axios.get('/api/unit-conversions');
      setConversions(res.data || []);
    } catch {
      setConversions([]);
    }
  };

  const fetchUnits = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/units');
      setUnits(res.data);
    } catch (err) {
      console.error('Error fetching units:', err);
      setUnits([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUnits();
    fetchConversions();
  }, []);

  const handleOpen = (unit = null) => {
    setEdit(unit);
    if (unit) {
      setForm({
        name: unit.name || '',
        description: unit.description || '',
        groupCode: unit.groupCode || 'CUSTOM',
      });
    } else {
      setForm(emptyForm());
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEdit(null);
    setForm(emptyForm());
  };

  const handleSave = async () => {
    if (saving) return;
    if (!form.name.trim()) {
      alert('Name is required');
      return;
    }
    setSaving(true);
    const payload = {
      name: form.name.trim(),
      description: form.description.trim() || null,
      groupCode: form.groupCode || 'CUSTOM',
    };
    try {
      if (edit) {
        await axios.put(`/api/units/${edit.id}`, payload);
      } else {
        await axios.post('/api/units', payload);
      }
      fetchUnits();
      handleClose();
    } catch (err) {
      alert(err.response?.data?.message || 'Error saving unit');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (deleting === id) return;
    if (!window.confirm('Delete this unit?')) return;
    setDeleting(id);
    try {
      await axios.delete(`/api/units/${id}`);
      fetchUnits();
    } catch (err) {
      alert(err.response?.data?.message || 'Error deleting unit');
    } finally {
      setDeleting(null);
    }
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 600 }}>
            Units of measure
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Maintain the list of units (g, ml, pcs, shot, etc.) used for raw materials and recipes.
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpen()}>
          Add unit
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
                    <TableCell>Group</TableCell>
                    <TableCell>Description</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {units.length > 0 ? (
                    units.map((unit) => (
                      <TableRow key={unit.id} hover>
                        <TableCell>{unit.name}</TableCell>
                        <TableCell>{unit.groupCode || 'CUSTOM'}</TableCell>
                        <TableCell>{unit.description || '—'}</TableCell>
                        <TableCell align="right">
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => handleOpen(unit)}
                            aria-label={`Edit ${unit.name}`}
                          >
                            <EditIcon />
                          </IconButton>
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleDelete(unit.id)}
                            disabled={deleting === unit.id}
                            aria-label={`Delete ${unit.name}`}
                          >
                            {deleting === unit.id ? <CircularProgress size={20} /> : <DeleteIcon />}
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} align="center">
                        <Typography color="text.secondary" py={2}>
                          No units yet
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
        <DialogTitle>{edit ? 'Edit unit' : 'Add unit'}</DialogTitle>
        <DialogContent>
          <TextField
            label="Name"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            fullWidth
            margin="normal"
            required
            autoFocus
            helperText="Example: g, ml, pcs, shot"
          />
          <TextField
            select
            label="Dimension group"
            value={form.groupCode}
            onChange={(e) => setForm((f) => ({ ...f, groupCode: e.target.value }))}
            fullWidth
            margin="normal"
            helperText="Use the same group for units you convert (e.g. kg ↔ g = MASS)."
          >
            <MenuItem value="MASS">MASS</MenuItem>
            <MenuItem value="VOLUME">VOLUME</MenuItem>
            <MenuItem value="COUNT">COUNT</MenuItem>
            <MenuItem value="CUSTOM">CUSTOM</MenuItem>
          </TextField>
          <TextField
            label="Description"
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            fullWidth
            margin="normal"
            multiline
            minRows={2}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={handleSave} variant="contained" disabled={!form.name.trim() || saving}>
            {saving ? 'Saving...' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>

      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Unit conversions (rational factors)
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Example: kg → g with numerator 1000, denominator 1. Same group only (MASS/VOLUME/COUNT).
          </Typography>
          <Box display="flex" flexWrap="wrap" gap={1} alignItems="flex-end" mb={2}>
            <TextField select label="From" size="small" sx={{ minWidth: 120 }} value={convFrom} onChange={(e) => setConvFrom(e.target.value)}>
              <MenuItem value="">—</MenuItem>
              {units.map((u) => (
                <MenuItem key={u.id} value={u.id}>
                  {u.name}
                </MenuItem>
              ))}
            </TextField>
            <TextField select label="To" size="small" sx={{ minWidth: 120 }} value={convTo} onChange={(e) => setConvTo(e.target.value)}>
              <MenuItem value="">—</MenuItem>
              {units.map((u) => (
                <MenuItem key={u.id} value={u.id}>
                  {u.name}
                </MenuItem>
              ))}
            </TextField>
            <TextField label="Numerator" size="small" value={convNum} onChange={(e) => setConvNum(e.target.value)} sx={{ width: 100 }} />
            <TextField label="Denominator" size="small" value={convDen} onChange={(e) => setConvDen(e.target.value)} sx={{ width: 100 }} />
            <Button
              variant="outlined"
              onClick={async () => {
                if (!convFrom || !convTo) return alert('Select from and to');
                try {
                  await axios.post('/api/unit-conversions', {
                    fromUnitId: convFrom,
                    toUnitId: convTo,
                    numerator: convNum,
                    denominator: convDen,
                  });
                  fetchConversions();
                } catch (e) {
                  alert(e.response?.data?.message || 'Failed');
                }
              }}
            >
              Add conversion
            </Button>
          </Box>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>From</TableCell>
                  <TableCell>To</TableCell>
                  <TableCell>Factor</TableCell>
                  <TableCell align="right"> </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {conversions.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell>{c.fromUnit?.name}</TableCell>
                    <TableCell>{c.toUnit?.name}</TableCell>
                    <TableCell>
                      {c.numerator} / {c.denominator}
                    </TableCell>
                    <TableCell align="right">
                      <IconButton size="small" onClick={async () => {
                        if (!window.confirm('Delete?')) return;
                        try {
                          await axios.delete(`/api/unit-conversions/${c.id}`);
                          fetchConversions();
                        } catch (e) {
                          alert(e.response?.data?.message || 'Failed');
                        }
                      }}>
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Units;

