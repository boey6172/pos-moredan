import React, { useEffect, useState, useMemo } from 'react';
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
  TextField,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  IconButton,
  MenuItem,
  Autocomplete,
  Alert,
  InputAdornment,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Switch,
  Divider,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import VisibilityIcon from '@mui/icons-material/Visibility';
import axios from '../api/axios';
import MultiPaymentManager from './POS/components/MultiPaymentManager';
import SinglePaymentSelector from './POS/components/SinglePaymentSelector';

const Transactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [products, setProducts] = useState([]);
  const [selected, setSelected] = useState(null);
  const [editTarget, setEditTarget] = useState(null);
  const [editedItems, setEditedItems] = useState([]);
  const [mop, setMOP] = useState('Cash');
  const [loading, setLoading] = useState(false);
  const today = new Date().toISOString().split('T')[0];
  const [fromDate, setFromDate] = useState(today);
  const [toDate, setToDate] = useState(today);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [newProductId, setNewProductId] = useState('');
  const [discount, setDiscount] = useState(0);
  const [showDiscount, setShowDiscount] = useState(false);
  const [isMultiPayment, setIsMultiPayment] = useState(false);
  const [payments, setPayments] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState('Cash');

  useEffect(() => {
    fetchTransactions();
    fetchProducts();
  }, []);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const params = {};
      if (fromDate && toDate) {
        const start = new Date(fromDate);
        start.setHours(0, 0, 0, 0);
        const end = new Date(toDate);
        end.setHours(23, 59, 59, 999);
        params.startDate = start.toISOString();
        params.endDate = end.toISOString();
      }
      const res = await axios.get('/api/transactions', { params });
      setTransactions(res.data);
    } catch (err) {
      console.error('Error fetching transactions:', err);
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await axios.get('/api/products');
      setProducts(res.data);
    } catch (err) {
      console.error('Error fetching products:', err);
      setProducts([]);
    }
  };

  const handleEditOpen = (tx) => {
    setEditTarget(tx);
    
    // Initialize discount
    setDiscount(parseFloat(tx.discount) || 0);
    setShowDiscount((parseFloat(tx.discount) || 0) > 0);
    
    // Initialize payment method
    if (tx.payments && Array.isArray(tx.payments) && tx.payments.length > 0) {
      if (tx.payments.length > 1) {
        // Multi-payment
        setIsMultiPayment(true);
        setPayments(tx.payments);
        setPaymentMethod('Cash');
      } else {
        // Single payment
        setIsMultiPayment(false);
        setPayments([]);
        setPaymentMethod(tx.payments[0].method || 'Cash');
      }
    } else {
      // Old format - single string
      setIsMultiPayment(false);
      setPayments([]);
      setPaymentMethod(tx.mop || 'Cash');
    }
    
    setEditedItems(
      tx.TransactionItems.map((item) => ({
        id: item.id,
        productId: item.Product?.id,
        name: item.Product?.name,
        category: item.Product?.Category?.name || 'Uncategorized',
        quantity: item.quantity,
        price: item.price,
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
          price: prod.price,
        },
      ]);
      setNewProductId('');
    }
  };

  const subtotal = useMemo(() => {
    return editedItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  }, [editedItems]);

  const calculateTotal = () => {
    return Math.max(0, subtotal - parseFloat(discount || 0));
  };

  const handleUpdate = async () => {
    try {
      // Prepare payment data
      let finalPayments = [];
      let mopString = '';

      if (isMultiPayment) {
        const paidTotal = payments.reduce((sum, p) => sum + parseFloat(p.amount || 0), 0);
        const total = calculateTotal();
        if (paidTotal < total) {
          alert('Payment amount is less than total. Please add more payments.');
          return;
        }
        finalPayments = payments;
        mopString = JSON.stringify(payments);
      } else {
        const total = calculateTotal();
        finalPayments = [{ method: paymentMethod, amount: total }];
        mopString = JSON.stringify(finalPayments);
      }

      await axios.put(`/api/transactions/${editTarget.id}`, {
        items: editedItems.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
        })),
        discount: parseFloat(discount) || 0,
        mop: mopString,
      });
      setEditTarget(null);
      setDiscount(0);
      setShowDiscount(false);
      setIsMultiPayment(false);
      setPayments([]);
      setPaymentMethod('Cash');
      fetchTransactions();
    } catch (err) {
      alert(err.response?.data?.message || 'Update failed');
    }
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`/api/transactions/${deleteTarget.id}`);
      setDeleteTarget(null);
      fetchTransactions();
    } catch (err) {
      alert(err.response?.data?.message || 'Delete failed');
    }
  };

  const formatCurrency = (amount) => {
    return `₱${(parseFloat(amount) || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  return (
    <Box>
      <Box
        display="flex"
        flexDirection={{ xs: 'column', md: 'row' }}
        justifyContent="space-between"
        alignItems={{ xs: 'stretch', md: 'center' }}
        gap={2}
        mb={3}
      >
        <Typography variant="h4" component="h1" sx={{ fontWeight: 600 }}>
          Transactions
        </Typography>
        <Box display="flex" gap={2} flexWrap="wrap" alignItems="center">
          <TextField
            label="From Date"
            type="date"
            size="small"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            label="To Date"
            type="date"
            size="small"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
          />
          <Button variant="contained" onClick={fetchTransactions}>
            Apply
          </Button>
          <Button
            variant="outlined"
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
                    <TableCell>Customer Name</TableCell>
                    <TableCell>Cashier</TableCell>
                    <TableCell>MOP</TableCell>
                    <TableCell>Total</TableCell>
                    <TableCell>Items</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {transactions.length > 0 ? (
                    transactions.map((tx) => (
                      <TableRow key={tx.id} hover>
                        <TableCell>{new Date(tx.createdAt).toLocaleString()}</TableCell>
                        <TableCell>{tx.customerName}</TableCell>
                        <TableCell>{tx.cashier?.username}</TableCell>
                        <TableCell>
                          {tx.payments && Array.isArray(tx.payments) ? (
                            <Box>
                              {tx.payments.map((p, idx) => (
                                <Typography key={idx} variant="caption" display="block">
                                  {p.method}: {formatCurrency(p.amount)}
                                </Typography>
                              ))}
                            </Box>
                          ) : (
                            tx.mop || 'N/A'
                          )}
                        </TableCell>
                        <TableCell>
                          <strong>{formatCurrency(tx.total)}</strong>
                        </TableCell>
                        <TableCell>{tx.TransactionItems?.length || 0}</TableCell>
                        <TableCell align="right">
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => setSelected(tx)}
                            aria-label={`View transaction ${tx.id}`}
                          >
                            <VisibilityIcon />
                          </IconButton>
                          <IconButton
                            size="small"
                            color="warning"
                            onClick={() => handleEditOpen(tx)}
                            aria-label={`Edit transaction ${tx.id}`}
                          >
                            <EditIcon />
                          </IconButton>
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => setDeleteTarget(tx)}
                            aria-label={`Delete transaction ${tx.id}`}
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
                          No transactions found
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

      {/* View Dialog */}
      <Dialog open={!!selected} onClose={() => setSelected(null)} maxWidth="sm" fullWidth>
        <DialogTitle>Transaction Details</DialogTitle>
        <DialogContent>
          {selected && (
            <>
              <List>
                {selected.TransactionItems?.map((item) => (
                  <ListItem key={item.id}>
                    <ListItemText
                      primary={`${item.Product?.name} (${item.Product?.Category?.name || 'Uncategorized'})`}
                      secondary={`Qty: ${item.quantity} x ${formatCurrency(item.price)} = ${formatCurrency(item.price * item.quantity)}`}
                    />
                  </ListItem>
                ))}
              </List>
              <Box mt={2}>
                {selected.discount > 0 && (
                  <Box display="flex" justifyContent="space-between" sx={{ mb: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      Subtotal:
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {formatCurrency((parseFloat(selected.total) || 0) + (parseFloat(selected.discount) || 0))}
                    </Typography>
                  </Box>
                )}
                {selected.discount > 0 && (
                  <Box display="flex" justifyContent="space-between" sx={{ mb: 1 }}>
                    <Typography variant="body2" color="error">
                      Discount:
                    </Typography>
                    <Typography variant="body2" color="error">
                      -{formatCurrency(selected.discount)}
                    </Typography>
                  </Box>
                )}
                <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
                  Payment Methods:
                </Typography>
                {selected.payments && Array.isArray(selected.payments) ? (
                  selected.payments.map((p, idx) => (
                    <Typography key={idx} variant="body2" sx={{ ml: 2 }}>
                      {p.method}: {formatCurrency(p.amount)}
                    </Typography>
                  ))
                ) : (
                  <Typography variant="body2" sx={{ ml: 2 }}>
                    {selected.mop || 'N/A'}
                  </Typography>
                )}
                <Divider sx={{ my: 1 }} />
                <Typography variant="subtitle2" sx={{ mt: 1, fontWeight: 'bold' }}>
                  Total: {formatCurrency(selected.total)}
                </Typography>
              </Box>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelected(null)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={!!editTarget} onClose={() => setEditTarget(null)} maxWidth="md" fullWidth>
        <DialogTitle>Edit Transaction</DialogTitle>
        <DialogContent>
          {/* Items List */}
          {editedItems.map((item) => (
            <Box
              key={item.productId}
              display="flex"
              alignItems="center"
              justifyContent="space-between"
              gap={2}
              mb={2}
            >
              <Typography sx={{ minWidth: 120 }}>{item.name}</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ flex: 1, textAlign: 'right' }}>
                {item.category}
              </Typography>
              <TextField
                label="Quantity"
                type="number"
                size="small"
                value={item.quantity}
                onChange={(e) => handleQuantityChange(item.productId, e.target.value)}
                sx={{ width: 90 }}
                inputProps={{ min: 1 }}
              />
              <Typography>{formatCurrency(item.price * item.quantity)}</Typography>
              <IconButton color="error" onClick={() => handleItemDelete(item.productId)}>
                <DeleteIcon />
              </IconButton>
            </Box>
          ))}

          {/* Add Product Section */}
          <Box display="flex" gap={1} alignItems="center" mt={2}>
            <Autocomplete
              options={products}
              getOptionLabel={(p) => `${p.name} (${p.Category?.name || 'Uncategorized'}) - ${formatCurrency(p.price)}`}
              value={products.find((p) => p.id === parseInt(newProductId)) || null}
              onChange={(e, value) => setNewProductId(value ? value.id : '')}
              renderInput={(params) => <TextField {...params} label="Add Product" size="small" />}
              sx={{ flex: 1 }}
            />
            <IconButton color="primary" onClick={handleAddProduct} disabled={!newProductId}>
              <AddIcon />
            </IconButton>
          </Box>

          <Divider sx={{ my: 3 }} />

          {/* Discount Section */}
          <Box mt={2} mb={2}>
            <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
              <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                Enable Discount
              </Typography>
              <Switch
                checked={showDiscount}
                onChange={(e) => {
                  const enabled = e.target.checked;
                  setShowDiscount(enabled);
                  if (!enabled) {
                    setDiscount(0);
                  }
                }}
                size="small"
              />
            </Box>
            {showDiscount && (
              <TextField
                type="number"
                label="Discount"
                value={discount}
                onChange={(e) => {
                  const value = parseFloat(e.target.value) || 0;
                  setDiscount(Math.max(0, Math.min(value, subtotal)));
                }}
                size="small"
                fullWidth
                InputProps={{
                  startAdornment: <InputAdornment position="start">₱</InputAdornment>,
                }}
                inputProps={{ min: 0, step: 0.01 }}
              />
            )}
          </Box>

          <Divider sx={{ my: 2 }} />

          {/* Totals */}
          <Box mt={2} mb={2}>
            <Box display="flex" justifyContent="space-between" sx={{ mb: 1 }}>
              <Typography variant="body2" color="text.secondary">
                Subtotal:
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {formatCurrency(subtotal)}
              </Typography>
            </Box>

            {showDiscount && discount > 0 && (
              <Box display="flex" justifyContent="space-between" sx={{ mb: 1 }}>
                <Typography variant="body2" color="error">
                  Discount:
                </Typography>
                <Typography variant="body2" color="error">
                  -{formatCurrency(discount)}
                </Typography>
              </Box>
            )}

            <Divider sx={{ my: 1 }} />

            <Box display="flex" justifyContent="space-between">
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                Total:
              </Typography>
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                {formatCurrency(calculateTotal())}
              </Typography>
            </Box>
          </Box>

          <Divider sx={{ my: 2 }} />

          {/* Payment Mode Selection */}
          <Box mt={2} mb={2}>
            <FormControl component="fieldset" fullWidth>
              <FormLabel component="legend" sx={{ mb: 1, fontWeight: 'bold', fontSize: '0.95rem' }}>
                Payment Mode
              </FormLabel>
              <RadioGroup
                row
                value={isMultiPayment ? 'multi' : 'single'}
                onChange={(e) => {
                  const isMulti = e.target.value === 'multi';
                  setIsMultiPayment(isMulti);
                  if (!isMulti) {
                    setPayments([]);
                  }
                }}
                sx={{ display: 'flex', gap: 1 }}
              >
                <FormControlLabel value="single" control={<Radio size="small" />} label="Single" />
                <FormControlLabel value="multi" control={<Radio size="small" />} label="Multi" />
              </RadioGroup>
            </FormControl>
          </Box>

          {/* Payment Section */}
          <Box mt={2}>
            {isMultiPayment ? (
              <MultiPaymentManager
                payments={payments}
                setPayments={setPayments}
                total={calculateTotal()}
              />
            ) : (
              <SinglePaymentSelector
                paymentMethod={paymentMethod}
                setPaymentMethod={setPaymentMethod}
                total={calculateTotal()}
              />
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setEditTarget(null);
            setDiscount(0);
            setShowDiscount(false);
            setIsMultiPayment(false);
            setPayments([]);
            setPaymentMethod('Cash');
          }}>
            Cancel
          </Button>
          <Button variant="contained" color="primary" onClick={handleUpdate}>
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} maxWidth="xs" fullWidth>
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2 }}>
            Are you sure you want to delete this transaction? This action cannot be undone.
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteTarget(null)}>Cancel</Button>
          <Button variant="contained" color="error" onClick={handleDelete}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Transactions;


