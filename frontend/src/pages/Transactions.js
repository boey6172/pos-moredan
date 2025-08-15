import React, { useEffect, useState } from 'react';
import {
  Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
  Button, Dialog, DialogTitle, DialogContent, List, ListItem, ListItemText,
  TextField, DialogActions, IconButton, MenuItem, Autocomplete
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import axios from '../api/axios';

const Transactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [products, setProducts] = useState([]);
  const [selected, setSelected] = useState(null);
  const [editTarget, setEditTarget] = useState(null);
  const [editedItems, setEditedItems] = useState([]);
  const [mop, setMOP] = useState('Cash');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [newProductId, setNewProductId] = useState('');

  useEffect(() => {
    fetchTransactions();
    fetchProducts();
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
    axios
      .get('/api/transactions', {
        params,
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      })
      .then((res) => setTransactions(res.data))
      .catch(() => setTransactions([]));
  };

  const fetchProducts = () => {
    axios
      .get('/api/products', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      })
      .then((res) => setProducts(res.data))
      .catch(() => setProducts([]));
  };

  const handleEditOpen = (tx) => {
    setEditTarget(tx);
    setMOP(tx.modeOfPayment || 'Cash');
    setEditedItems(
      tx.TransactionItems.map((item) => ({
        id: item.id,
        productId: item.Product?.id,
        name: item.Product?.name,
        category: item.Product?.Category?.name || 'Uncategorized',
        quantity: item.quantity,
        price: item.price
      }))
    );
  };

  const handleQuantityChange = (productId, value) => {
    setEditedItems((prev) =>
      prev.map((item) =>
        item.productId === productId
          ? { ...item, quantity: Math.max(1, parseInt(value) || 1) }
          : item
      )
    );
  };

  const handleItemDelete = (productId) => {
    setEditedItems((prev) => prev.filter((item) => item.productId !== productId));
  };

  const handleAddProduct = () => {
    if (!newProductId) return;
    const prod = products.find((p) => p.id === parseInt(newProductId));
    if (prod) {
      setEditedItems((prev) => [
        ...prev,
        {
          id: null,
          productId: prod.id,
          name: prod.name,
          category: prod.Category?.name || 'Uncategorized',
          quantity: 1,
          price: prod.price
        }
      ]);
      setNewProductId('');
    }
  };

  const calculateTotal = () => {
    return editedItems
      .reduce((acc, item) => acc + item.price * item.quantity, 0)
      .toFixed(2);
  };

  const handleUpdate = async () => {
    try {
      await axios.put(
        `/api/transactions/${editTarget.id}`,
        {
          items: editedItems.map((item) => ({
            productId: item.productId,
            quantity: item.quantity
          })),
          mop
        },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        }
      );

      setEditTarget(null);
      fetchTransactions();
    } catch (err) {
      alert(err.response?.data?.message || 'Update failed');
    }
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`/api/transactions/${deleteTarget.id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setDeleteTarget(null);
      fetchTransactions();
    } catch (err) {
      alert(err.response?.data?.message || 'Delete failed');
    }
  };

  return (
    <Box p={{ xs: 2, md: 3 }}>
      {/* Filters */}
      <Box display="flex" flexDirection={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ xs: 'stretch', md: 'center' }} gap={2} mb={2}>
        <Typography variant={{ xs: 'h5', md: 'h4' }}>Transactions</Typography>
        <Box display="flex" gap={2} flexWrap="wrap" alignItems="center">
          <TextField label="From date" type="date" size="small" value={fromDate} onChange={(e) => setFromDate(e.target.value)} InputLabelProps={{ shrink: true }} />
          <TextField label="To date" type="date" size="small" value={toDate} onChange={(e) => setToDate(e.target.value)} InputLabelProps={{ shrink: true }} />
          <Button variant="contained" onClick={fetchTransactions}>Apply</Button>
          <Button variant="text" onClick={() => { setFromDate(''); setToDate(''); fetchTransactions(); }}>Clear</Button>
        </Box>
      </Box>

      {/* Transactions Table */}
      <TableContainer component={Paper} sx={{ overflowX: 'auto' }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Date</TableCell>
              <TableCell>Customer Name</TableCell>
              <TableCell>Cashier</TableCell>
              <TableCell>Total</TableCell>
              <TableCell>Items</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {transactions.map((tx) => (
              <TableRow key={tx.id}>
                <TableCell>{new Date(tx.createdAt).toLocaleString()}</TableCell>
                <TableCell>{tx.customerName}</TableCell>
                <TableCell>{tx.cashier?.username}</TableCell>
                <TableCell>₱{parseFloat(tx.total || 0).toFixed(2)}</TableCell>
                <TableCell>{tx.TransactionItems?.length}</TableCell>
                <TableCell>
                  <Button size="small" variant="outlined" onClick={() => setSelected(tx)}>View</Button>
                  <Button size="small" variant="contained" color="warning" sx={{ ml: 1 }} onClick={() => handleEditOpen(tx)}>Edit</Button>
                  <Button size="small" variant="contained" color="error" sx={{ ml: 1 }} onClick={() => setDeleteTarget(tx)}>Delete</Button>
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
              {selected.TransactionItems.map((item) => (
                <ListItem key={item.id}>
                  <ListItemText
                    primary={`${item.Product?.name} (${item.Product?.Category?.name || 'Uncategorized'})`}
                    secondary={`Qty: ${item.quantity} x ₱${parseFloat(item.price || 0).toFixed(2)} = ₱${(item.price * item.quantity).toFixed(2)}`}
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
          {editedItems.map((item) => (
            <Box key={item.productId} display="flex" alignItems="center" justifyContent="space-between" gap={2} mb={2}>
              <Typography sx={{ minWidth: 120 }}>{item.name}</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ flex: 1, textAlign: 'right' }}>{item.category}</Typography>
              <TextField label="Quantity" type="number" size="small" value={item.quantity} onChange={(e) => handleQuantityChange(item.productId, e.target.value)} sx={{ width: 90 }} />
              <Typography>₱{(item.price * item.quantity).toFixed(2)}</Typography>
              <IconButton color="error" onClick={() => handleItemDelete(item.productId)}>
                <DeleteIcon />
              </IconButton>
            </Box>
          ))}

          {/* Add Product Section with Autocomplete */}
          <Box display="flex" gap={1} alignItems="center" mt={2}>
            <Autocomplete
              options={products}
              getOptionLabel={(p) => `${p.name} (${p.Category?.name || 'Uncategorized'}) - ₱${p.price}`}
              value={products.find((p) => p.id === parseInt(newProductId)) || null}
              onChange={(e, value) => setNewProductId(value ? value.id : '')}
              renderInput={(params) => (
                <TextField {...params} label="Add Product" size="small" />
              )}
              sx={{ flex: 1 }}
            />
            <IconButton color="primary" onClick={handleAddProduct}>
              <AddIcon />
            </IconButton>
          </Box>

          <Box mt={2}>
            <TextField select label="Mode of Payment" value={mop} onChange={(e) => setMOP(e.target.value)} fullWidth>
              <MenuItem value="Cash">Cash</MenuItem>
              <MenuItem value="Card">Card</MenuItem>
              <MenuItem value="GCash">GCash</MenuItem>
              <MenuItem value="PayMaya">PayMaya</MenuItem>
              <MenuItem value="Bank Transfer">Bank Transfer</MenuItem>
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

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} maxWidth="xs" fullWidth>
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>Are you sure you want to delete this transaction?</DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteTarget(null)}>Cancel</Button>
          <Button variant="contained" color="error" onClick={handleDelete}>Delete</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Transactions;
