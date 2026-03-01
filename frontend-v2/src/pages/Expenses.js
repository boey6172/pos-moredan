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
  Autocomplete,
  Chip,
  IconButton,
  CircularProgress,
  ToggleButton,
  ToggleButtonGroup,
  Collapse,
} from '@mui/material';
import TableSkeleton from '../components/TableSkeleton';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import BadgeIcon from '@mui/icons-material/Badge';
import axios from '../api/axios';

const Expenses = () => {
  const [expenses, setExpenses] = useState([]);
  const [expenseTypes, setExpenseTypes] = useState([]);
  const [open, setOpen] = useState(false);
  const [edit, setEdit] = useState(null);
  const [form, setForm] = useState({
    amount: '',
    type: '',
    location: '',
    notes: '',
    hasTinNumber: false,
    particulars: '',
    tinNumber: '',
    address: '',
    referenceNo: '',
  });
  const [tinProfiles, setTinProfiles] = useState([]);
  const [typeInputValue, setTypeInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [filterDate, setFilterDate] = useState(new Date().toISOString().split('T')[0]);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(null);

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      const params = {};
      if (filterDate) {
        params.startDate = filterDate;
        params.endDate = filterDate;
      }
      const res = await axios.get('/api/expenses', { params });
      setExpenses(res.data);
    } catch (err) {
      console.error('Error fetching expenses:', err);
      setExpenses([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchExpenseTypes = async () => {
    try {
      const res = await axios.get('/api/expenses/types');
      setExpenseTypes(res.data.map((type) => type.name));
    } catch (err) {
      console.error('Error fetching expense types:', err);
      setExpenseTypes([]);
    }
  };

  const fetchTinProfiles = async () => {
    try {
      const res = await axios.get('/api/expenses/tin-profiles');
      setTinProfiles(res.data || []);
    } catch (err) {
      console.error('Error fetching tin profiles:', err);
      setTinProfiles([]);
    }
  };

  useEffect(() => {
    fetchExpenses();
    fetchExpenseTypes();
    fetchTinProfiles();
  }, [filterDate]);

  const handleOpen = (expense = null) => {
    setEdit(expense);
    if (expense) {
      const hasTin = !!(expense.tinNumber != null && expense.tinNumber !== '');
      setForm({
        amount: expense.amount.toString(),
        type: expense.type,
        location: expense.location,
        notes: expense.notes || '',
        hasTinNumber: hasTin,
        particulars: expense.particulars || '',
        tinNumber: expense.tinNumber || '',
        address: expense.address || '',
        referenceNo: expense.referenceNo || '',
      });
      setTypeInputValue(expense.type);
    } else {
      setForm({
        amount: '',
        type: '',
        location: '',
        notes: '',
        hasTinNumber: false,
        particulars: '',
        tinNumber: '',
        address: '',
        referenceNo: '',
      });
      setTypeInputValue('');
    }
    if (!expense) fetchTinProfiles();
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEdit(null);
    setForm({
      amount: '',
      type: '',
      location: '',
      notes: '',
      hasTinNumber: false,
      particulars: '',
      tinNumber: '',
      address: '',
      referenceNo: '',
    });
    setTypeInputValue('');
  };

  const handleSave = async () => {
    if (saving) return; // Prevent double-click
    if (!form.amount || !form.type || !form.location) {
      alert('Please fill in all required fields (Amount, Type, Location)');
      return;
    }

    setSaving(true);
    try {
      if (!expenseTypes.includes(form.type.trim())) {
        await axios.post('/api/expenses/types', { name: form.type.trim() });
        await fetchExpenseTypes();
      }

      const data = {
        amount: parseFloat(form.amount),
        type: form.type.trim(),
        location: form.location.trim(),
        notes: form.notes || null,
      };
      if (form.hasTinNumber) {
        data.particulars = form.particulars.trim() || null;
        data.tinNumber = form.tinNumber.trim() || null;
        data.address = form.address.trim() || null;
        data.referenceNo = form.referenceNo.trim() || null;
      } else {
        data.particulars = null;
        data.tinNumber = null;
        data.address = null;
        data.referenceNo = null;
      }

      if (edit) {
        await axios.put(`/api/expenses/${edit.id}`, data);
      } else {
        await axios.post('/api/expenses', data);
      }

      fetchExpenses();
      handleClose();
    } catch (err) {
      alert(err.response?.data?.message || 'Error saving expense');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (deleting === id) return; // Prevent double-click
    if (!window.confirm('Delete this expense?')) return;
    setDeleting(id);
    try {
      await axios.delete(`/api/expenses/${id}`);
      fetchExpenses();
    } catch (err) {
      alert(err.response?.data?.message || 'Error deleting expense');
    } finally {
      setDeleting(null);
    }
  };

  const formatCurrency = (amount) => {
    return `₱${(parseFloat(amount) || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const totalExpenses = expenses.reduce((sum, exp) => sum + parseFloat(exp.amount || 0), 0);

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3} flexWrap="wrap" gap={2}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 600 }}>
          Expenses
        </Typography>
        <Box display="flex" gap={2} alignItems="center" flexWrap="wrap">
          <TextField
            type="date"
            label="Filter by Date"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
            size="small"
          />
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpen()}>
            Add Expense
          </Button>
        </Box>
      </Box>

      {expenses.length > 0 && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" color="text.secondary">
              Total Expenses: <strong>{formatCurrency(totalExpenses)}</strong>
            </Typography>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent>
          {loading ? (
            <TableSkeleton rows={6} columns={8} />
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Date</TableCell>
                    <TableCell>Amount</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Location</TableCell>
                    <TableCell>Notes</TableCell>
                    <TableCell>Tin / Reference</TableCell>
                    <TableCell>Created By</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {expenses.length > 0 ? (
                    expenses.map((expense) => (
                      <TableRow key={expense.id} hover>
                        <TableCell>{new Date(expense.createdAt).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <strong>{formatCurrency(expense.amount)}</strong>
                        </TableCell>
                        <TableCell>
                          <Chip label={expense.type} size="small" color="primary" variant="outlined" />
                        </TableCell>
                        <TableCell>{expense.location}</TableCell>
                        <TableCell>{expense.notes || '-'}</TableCell>
                        <TableCell>
                          {expense.tinNumber ? (
                            <Box>
                              <Typography variant="body2">{expense.tinNumber}</Typography>
                              {expense.referenceNo && (
                                <Typography variant="caption" color="text.secondary">
                                  Ref: {expense.referenceNo}
                                </Typography>
                              )}
                            </Box>
                          ) : (
                            '-'
                          )}
                        </TableCell>
                        <TableCell>{expense.creator?.username || 'Unknown'}</TableCell>
                        <TableCell align="right">
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => handleOpen(expense)}
                            aria-label={`Edit expense ${expense.id}`}
                          >
                            <EditIcon />
                          </IconButton>
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleDelete(expense.id)}
                            disabled={deleting === expense.id}
                            aria-label={`Delete expense ${expense.id}`}
                          >
                            {deleting === expense.id ? <CircularProgress size={20} /> : <DeleteIcon />}
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={8} align="center">
                        <Typography color="text.secondary" py={2}>
                          No expenses found
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
        <DialogTitle>{edit ? 'Edit Expense' : 'Add Expense'}</DialogTitle>
        <DialogContent>
          <TextField
            label="Amount"
            type="number"
            value={form.amount}
            onChange={(e) => setForm({ ...form, amount: e.target.value })}
            fullWidth
            margin="normal"
            required
            inputProps={{ step: '0.01', min: '0' }}
          />

          <Autocomplete
            freeSolo
            options={expenseTypes}
            value={form.type}
            inputValue={typeInputValue}
            onInputChange={(event, newInputValue) => {
              setTypeInputValue(newInputValue);
              setForm({ ...form, type: newInputValue });
            }}
            onChange={(event, newValue) => {
              if (newValue) {
                setForm({ ...form, type: newValue });
                setTypeInputValue(newValue);
              }
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Expense Type"
                margin="normal"
                required
                helperText="Select an existing type or type a new one"
              />
            )}
          />

          <TextField
            label="Location/Branch"
            value={form.location}
            onChange={(e) => setForm({ ...form, location: e.target.value })}
            fullWidth
            margin="normal"
            required
            placeholder="e.g., Main Branch"
          />

          <TextField
            label="Notes (Optional)"
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            fullWidth
            margin="normal"
            multiline
            rows={3}
          />

          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Tin Number (optional)
            </Typography>
            <ToggleButtonGroup
              value={form.hasTinNumber}
              exclusive
              onChange={(e, val) => {
                if (val === null) return;
                setForm({
                  ...form,
                  hasTinNumber: val,
                  ...(val ? {} : { particulars: '', tinNumber: '', address: '', referenceNo: '' }),
                });
              }}
              aria-label="Has Tin Number"
            >
              <ToggleButton value={false} aria-label="No Tin">No</ToggleButton>
              <ToggleButton value={true} aria-label="Has Tin" startIcon={<BadgeIcon />}>
                Has Tin Number
              </ToggleButton>
            </ToggleButtonGroup>

            <Collapse in={form.hasTinNumber}>
              <Box sx={{ mt: 2 }}>
                <Autocomplete
                  options={tinProfiles}
                  getOptionLabel={(opt) =>
                    typeof opt === 'object' && opt
                      ? [opt.tinNumber, opt.particulars, opt.referenceNo].filter(Boolean).join(' • ') || 'Select saved profile'
                      : ''
                  }
                  value={
                    tinProfiles.find(
                      (p) =>
                        p.tinNumber === form.tinNumber &&
                        p.particulars === form.particulars &&
                        p.address === form.address &&
                        p.referenceNo === form.referenceNo
                    ) || null
                  }
                  onChange={(e, newVal) => {
                    if (newVal) {
                      setForm({
                        ...form,
                        particulars: newVal.particulars || '',
                        tinNumber: newVal.tinNumber || '',
                        address: newVal.address || '',
                        referenceNo: newVal.referenceNo || '',
                      });
                    }
                  }}
                  renderInput={(params) => (
                    <TextField {...params} label="Select saved Tin profile (optional)" margin="normal" size="small" />
                  )}
                />
                <TextField
                  label="Particulars"
                  value={form.particulars}
                  onChange={(e) => setForm({ ...form, particulars: e.target.value })}
                  fullWidth
                  margin="normal"
                  size="small"
                />
                <TextField
                  label="Tin Number"
                  value={form.tinNumber}
                  onChange={(e) => setForm({ ...form, tinNumber: e.target.value })}
                  fullWidth
                  margin="normal"
                  size="small"
                />
                <TextField
                  label="Address"
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  fullWidth
                  margin="normal"
                  size="small"
                />
                <TextField
                  label="Reference No"
                  value={form.referenceNo}
                  onChange={(e) => setForm({ ...form, referenceNo: e.target.value })}
                  fullWidth
                  margin="normal"
                  size="small"
                />
              </Box>
            </Collapse>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} disabled={saving}>Cancel</Button>
          <Button onClick={handleSave} variant="contained" disabled={!form.amount || !form.type || !form.location || saving}>
            {saving ? 'Saving...' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Expenses;






