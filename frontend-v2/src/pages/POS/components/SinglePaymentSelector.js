import React from 'react';
import { Box, Typography, TextField, MenuItem } from '@mui/material';

const PAYMENT_METHODS = ['Cash', 'Card', 'GCash', 'PayMaya', 'Bank Transfer'];

const SinglePaymentSelector = ({ paymentMethod, setPaymentMethod, total }) => {
  const formatCurrency = (amount) => {
    return `₱${(parseFloat(amount) || 0).toFixed(2)}`;
  };

  return (
    <Box>
      <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>
        Payment Method
      </Typography>
      <TextField
        select
        value={paymentMethod}
        onChange={(e) => setPaymentMethod(e.target.value)}
        fullWidth
        size="small"
      >
        {PAYMENT_METHODS.map((method) => (
          <MenuItem key={method} value={method}>
            {method}
          </MenuItem>
        ))}
      </TextField>
      <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
        Total: {formatCurrency(total)}
      </Typography>
    </Box>
  );
};

export default SinglePaymentSelector;






