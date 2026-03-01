import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Alert,
  CircularProgress,
} from '@mui/material';

const CheckoutDialog = ({ open, onClose, total, onConfirm, status, loading }) => {
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
        <Button onClick={onClose} disabled={status === 'success' || loading}>
          Cancel
        </Button>
        <Button onClick={onConfirm} variant="contained" disabled={status === 'success' || loading}>
          {loading ? (
            <>
              <CircularProgress size={16} sx={{ mr: 1 }} />
              Processing...
            </>
          ) : (
            'Confirm'
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CheckoutDialog;






