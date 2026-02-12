import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Alert,
} from '@mui/material';

const CheckoutDialog = ({ open, onClose, total, onConfirm, status }) => {
  const formatCurrency = (amount) => {
    return `₱${(parseFloat(amount) || 0).toFixed(2)}`;
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Checkout</DialogTitle>
      <DialogContent>
        <Typography>Are you sure you want to checkout?</Typography>
        <Typography mt={2} variant="h6">
          Total: {formatCurrency(total)}
        </Typography>
        {status && (
          <Alert
            severity={status === 'success' ? 'success' : 'error'}
            sx={{ mt: 2 }}
          >
            {status === 'success' ? 'Checkout successful!' : status}
          </Alert>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={status === 'success'}>
          Cancel
        </Button>
        <Button onClick={onConfirm} variant="contained" disabled={status === 'success'}>
          Confirm
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CheckoutDialog;






