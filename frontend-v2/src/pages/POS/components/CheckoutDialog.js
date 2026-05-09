import React, { useMemo } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Alert,
  CircularProgress,
  Box,
} from '@mui/material';
import { computeChangeDue, formatCurrency } from '../utils/helpers';

const CheckoutDialog = ({
  open,
  onClose,
  total,
  onConfirm,
  status,
  loading,
  paymentMethod,
  isMultiPayment,
  cashTendered,
}) => {
  const cashSummary = useMemo(() => {
    if (isMultiPayment || paymentMethod !== 'Cash') return null;
    const tender = parseFloat(String(cashTendered).trim());
    if (!Number.isFinite(tender)) return null;
    const change = computeChangeDue(tender, total);
    return { tender, change };
  }, [isMultiPayment, paymentMethod, cashTendered, total]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Confirm checkout</DialogTitle>
      <DialogContent>
        <Typography color="text.secondary">
          Complete this sale and print the receipt when you&apos;re ready.
        </Typography>
        <Typography mt={2} variant="h6" component="p">
          Total due: {formatCurrency(total)}
        </Typography>
        {cashSummary && (
          <Box
            sx={{
              mt: 2,
              p: 1.5,
              borderRadius: 1,
              bgcolor: 'action.hover',
            }}
          >
            <Typography variant="body2" color="text.secondary">
              Customer paid
            </Typography>
            <Typography variant="subtitle1" fontWeight={700}>
              {formatCurrency(cashSummary.tender)}
            </Typography>
            {cashSummary.change > 0 ? (
              <>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Give back as change
                </Typography>
                <Typography variant="h6" color="success.main" fontWeight={700}>
                  {formatCurrency(cashSummary.change)}
                </Typography>
              </>
            ) : (
              <Typography variant="body2" sx={{ mt: 1 }} color="success.dark">
                No change — exact amount.
              </Typography>
            )}
          </Box>
        )}
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
            'Confirm sale'
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CheckoutDialog;
