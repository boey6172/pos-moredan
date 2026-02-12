import React, { useState, useMemo, useCallback } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Chip,
  Alert,
  InputAdornment,
  IconButton,
  MenuItem,
  Divider,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';

const PAYMENT_METHODS = ['Cash', 'Card', 'GCash', 'PayMaya', 'Bank Transfer'];

const MultiPaymentManager = ({ payments, setPayments, total }) => {
  const [newMethod, setNewMethod] = useState('Cash');
  const [newAmount, setNewAmount] = useState('');
  const [error, setError] = useState('');

  const paidTotal = useMemo(
    () => payments.reduce((sum, p) => sum + parseFloat(p.amount || 0), 0),
    [payments]
  );
  const remaining = total - paidTotal;

  const addPayment = useCallback(() => {
    const amount = parseFloat(newAmount);
    if (!amount || amount <= 0) {
      setError('Please enter a valid amount');
      return;
    }
    if (paidTotal + amount > total) {
      setError('Payment amount exceeds remaining balance');
      return;
    }
    setPayments([...payments, { method: newMethod, amount }]);
    setNewAmount('');
    setError('');
  }, [newMethod, newAmount, payments, paidTotal, total, setPayments]);

  const removePayment = useCallback(
    (index) => {
      setPayments(payments.filter((_, i) => i !== index));
    },
    [payments, setPayments]
  );

  const handleKeyPress = useCallback(
    (e) => {
      if (e.key === 'Enter' && newAmount) {
        addPayment();
      }
    },
    [newAmount, addPayment]
  );

  const formatCurrency = (amount) => {
    return `₱${(parseFloat(amount) || 0).toFixed(2)}`;
  };

  return (
    <Box>
      <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>
        Payment Methods
      </Typography>

      {payments.length > 0 && (
        <Box sx={{ mb: 2 }}>
          {payments.map((payment, index) => (
            <Chip
              key={index}
              label={`${payment.method}: ${formatCurrency(payment.amount)}`}
              onDelete={() => removePayment(index)}
              sx={{ mr: 1, mb: 1 }}
              color="primary"
              variant="outlined"
            />
          ))}
          <Box sx={{ mt: 1 }}>
            <Typography variant="caption" color="text.secondary">
              Paid: {formatCurrency(paidTotal)} / Total: {formatCurrency(total)}
            </Typography>
            {remaining > 0 && (
              <Typography variant="caption" color="error" display="block">
                Remaining: {formatCurrency(remaining)}
              </Typography>
            )}
            {remaining < 0 && (
              <Typography variant="caption" color="error" display="block">
                Overpaid: {formatCurrency(Math.abs(remaining))}
              </Typography>
            )}
          </Box>
        </Box>
      )}

      <Divider sx={{ my: 1 }} />

      <Box display="flex" gap={1} sx={{ mb: 1 }}>
        <TextField
          select
          value={newMethod}
          onChange={(e) => setNewMethod(e.target.value)}
          size="small"
          sx={{ flex: 1 }}
        >
          {PAYMENT_METHODS.map((method) => (
            <MenuItem key={method} value={method}>
              {method}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          type="number"
          label="Amount"
          value={newAmount}
          onChange={(e) => {
            setNewAmount(e.target.value);
            setError('');
          }}
          onKeyPress={handleKeyPress}
          size="small"
          sx={{ flex: 1 }}
          InputProps={{
            startAdornment: <InputAdornment position="start">₱</InputAdornment>,
          }}
          inputProps={{ min: 0, step: 0.01 }}
        />
        <IconButton
          onClick={addPayment}
          color="primary"
          disabled={!newAmount || parseFloat(newAmount) <= 0}
          sx={{ border: '1px solid', borderColor: 'divider' }}
          aria-label="Add payment"
        >
          <AddIcon />
        </IconButton>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 1, py: 0 }}>
          {error}
        </Alert>
      )}

      {remaining === 0 && payments.length > 0 && (
        <Alert severity="success" sx={{ mb: 1, py: 0 }}>
          Payment complete!
        </Alert>
      )}
    </Box>
  );
};

export default MultiPaymentManager;






