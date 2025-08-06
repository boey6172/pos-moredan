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

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = () => {
    axios.get('/api/transactions', {
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
    <Box p={2}>
      <Typography variant="h4" mb={2}>Transactions</Typography>

      <TableContainer component={Paper}>
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
                <TableCell>${tx.total}</TableCell>
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
                    secondary={`Qty: ${item.quantity} x $${item.price} = $${item.subtotal}`}
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
                <Typography>= ${(item.price * item.quantity).toFixed(2)}</Typography>
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
              <Typography variant="h6">Total: ${calculateTotal()}</Typography>
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
