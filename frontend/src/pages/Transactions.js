import React, { useEffect, useState } from 'react';
import {
  Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
  Button, Dialog, DialogTitle, DialogContent, List, ListItem, ListItemText,
  TextField, DialogActions
} from '@mui/material';
import axios from '../api/axios';

const Transactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [selected, setSelected] = useState(null);       // For View dialog
  const [editTarget, setEditTarget] = useState(null);   // For Edit dialog
  const [editedItems, setEditedItems] = useState([]);   // For edited item states
  const [mop, setMOP] = useState('Cash');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = () => {
    const params = {};
    if (fromDate && toDate) {
      const start = new Date(fromDate);
      start.setHours(0, 0, 0, 0);
      const end = new Date(toDate);
      end.setHours(23, 59, 59, 999);
      params.startDate = start.toISOString();
      params.endDate = end.toISOString();
    }
    axios.get('/api/transactions', {
      params,
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    })
    .then(res => setTransactions(res.data))
    .catch(() => setTransactions([]));
  };

  const handleEditOpen = (tx) => {
    setEditTarget(tx);
    setMOP(tx.modeOfPayment || 'Cash');
    setEditedItems(tx.TransactionItems.map(item => ({
      id: item.id,
      productId: item.Product?.id,
      name: item.Product?.name,
      quantity: item.quantity,
      price: item.price
    })));
  };
  
  const handleQuantityChange = (productId, value) => {
    setEditedItems(prev =>
      prev.map(item =>
        item.productId === productId
          ? { ...item, quantity: Math.max(1, parseInt(value) || 1) }
          : item
      )
    );
  };
  
  const calculateTotal = () => {
    return editedItems.reduce((acc, item) => acc + item.price * item.quantity, 0).toFixed(2);
  };
  
  const handleUpdate = async () => {
    try {
      await axios.put(`/api/transactions/${editTarget.id}`, {
        items: editedItems.map(item => ({
          productId: item.productId,
          quantity: item.quantity
        })),
        mop
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      
      setEditTarget(null);
      fetchTransactions();
    } catch (err) {
      alert(err.response?.data?.message || 'Update failed');
    }
  };
  

  return (
    <Box p={{ xs: 2, md: 3 }}>
      <Box
        display="flex"
        flexDirection={{ xs: 'column', md: 'row' }}
        justifyContent="space-between"
        alignItems={{ xs: 'stretch', md: 'center' }}
        gap={2}
        mb={2}
      >
        <Typography variant={{ xs: 'h5', md: 'h4' }}>Transactions</Typography>
        <Box display="flex" gap={2} flexWrap="wrap" alignItems="center">
          <TextField
            label="From date"
            type="date"
            size="small"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            label="To date"
            type="date"
            size="small"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
          />
          <Button
            variant="contained"
            onClick={() => {
              if (fromDate && toDate && new Date(toDate) < new Date(fromDate)) {
                alert('End date must be on or after start date');
                return;
              }
              fetchTransactions();
            }}
          >
            Apply
          </Button>
          <Button
            variant="text"
            onClick={() => {
              setFromDate('');
              setToDate('');
              fetchTransactions();
            }}
          >
            Clear
          </Button>
        </Box>
      </Box>

      <TableContainer component={Paper} sx={{ overflowX: 'auto' }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Date</TableCell>
              <TableCell>Cashier</TableCell>
              <TableCell>Total</TableCell>
              <TableCell>Items</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {transactions.map(tx => (
              <TableRow key={tx.id}>
                <TableCell>{new Date(tx.createdAt).toLocaleString()}</TableCell>
                <TableCell>{tx.cashier?.username}</TableCell>
                <TableCell>₱{parseFloat(tx.total || 0).toFixed(2)}</TableCell>
                <TableCell>{tx.TransactionItems?.length}</TableCell>
                <TableCell>
                  <Button size="small" variant="outlined" onClick={() => setSelected(tx)}>View</Button>
                  <Button size="small" variant="contained" color="warning" sx={{ ml: 1 }} onClick={() => handleEditOpen(tx)}>Edit</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* View Dialog */}
      <Dialog open={!!selected} onClose={() => setSelected(null)} maxWidth="sm" fullWidth>
        <DialogTitle>Transaction Details</DialogTitle>
        <DialogContent>
          {selected && (
            <List>
              {selected.TransactionItems.map(item => (
                <ListItem key={item.id}>
                  <ListItemText
                    primary={item.Product?.name}
                    secondary={`Qty: ${item.quantity} x ₱${parseFloat(item.price || 0).toFixed(2)} = ₱${parseFloat(item.subtotal || (item.price * item.quantity) || 0).toFixed(2)}`}
                  />
                </ListItem>
              ))}
            </List>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={!!editTarget} onClose={() => setEditTarget(null)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Transaction</DialogTitle>
          <DialogContent>
            {editedItems.map(item => (
              <Box key={item.productId} display="flex" alignItems="center" gap={2} mb={2}>
                <Typography sx={{ minWidth: 120 }}>{item.name}</Typography>
                <TextField
                  label="Quantity"
                  type="number"
                  size="small"
                  value={item.quantity}
                  onChange={(e) => handleQuantityChange(item.productId, e.target.value)}
                  inputProps={{ min: 1 }}
                />
                <Typography>= ₱{(item.price * item.quantity).toFixed(2)}</Typography>
              </Box>
            ))}
            <Box mt={2}>
              <TextField
                select
                label="Mode of Payment"
                value={mop}
                onChange={(e) => setMOP(e.target.value)}
                fullWidth
                SelectProps={{ native: true }}
              >
                <option value="Cash">Cash</option>
                <option value="Card">Card</option>
                <option value="GCash">GCash</option>
                <option value="PayMaya">PayMaya</option>
                <option value="Bank Transfer">Bank Transfer</option>
              </TextField>
            </Box>
            <Box mt={2}>
              <Typography variant="h6">Total: ₱{calculateTotal()}</Typography>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setEditTarget(null)}>Cancel</Button>
            <Button variant="contained" color="primary" onClick={handleUpdate}>Save Changes</Button>
          </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Transactions;
