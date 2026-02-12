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
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import axios from '../api/axios';

const Expenses = () => {
  const [expenses, setExpenses] = useState([]);
  const [expenseTypes, setExpenseTypes] = useState([]);
  const [open, setOpen] = useState(false);
  const [edit, setEdit] = useState(null);
  const [form, setForm] = useState({ amount: '', type: '', location: '', notes: '' });
  const [typeInputValue, setTypeInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [filterDate, setFilterDate] = useState(new Date().toISOString().split('T')[0]);

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

  useEffect(() => {
    fetchExpenses();
    fetchExpenseTypes();
  }, [filterDate]);

  const handleOpen = (expense = null) => {
    setEdit(expense);
    if (expense) {
      setForm({
        amount: expense.amount.toString(),
        type: expense.type,
        location: expense.location,
        notes: expense.notes || '',
      });
      setTypeInputValue(expense.type);
    } else {
      setForm({ amount: '', type: '', location: '', notes: '' });
      setTypeInputValue('');
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEdit(null);
    setForm({ amount: '', type: '', location: '', notes: '' });
    setTypeInputValue('');
  };

  const handleSave = async () => {
    if (!form.amount || !form.type || !form.location) {
      alert('Please fill in all required fields (Amount, Type, Location)');
      return;
    }

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

      if (edit) {
        await axios.put(`/api/expenses/${edit.id}`, data);
      } else {
        await axios.post('/api/expenses', data);
      }

      fetchExpenses();
      handleClose();
    } catch (err) {
      alert(err.response?.data?.message || 'Error saving expense');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this expense?')) return;
    try {
      await axios.delete(`/api/expenses/${id}`);
      fetchExpenses();
    } catch (err) {
      alert(err.response?.data?.message || 'Error deleting expense');
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
            <Box display="flex" justifyContent="center" p={4}>
              <CircularProgress />
            </Box>
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
                            aria-label={`Delete expense ${expense.id}`}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} align="center">
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
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSave} variant="contained" disabled={!form.amount || !form.type || !form.location}>
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Expenses;






