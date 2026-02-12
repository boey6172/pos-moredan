import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  List,
  ListItem,
  ListItemText,
  Box,
} from '@mui/material';

const ReceiptDialog = ({ open, onClose, lastReceipt, onPrint, receiptRef }) => {

  const formatCurrency = (amount) => {
    return `₱${(parseFloat(amount) || 0).toFixed(2)}`;
  };

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
        <DialogTitle>Receipt</DialogTitle>
        <DialogContent>
          {lastReceipt ? (
            <Box>
              <Typography variant="h6">Receipt</Typography>
              <Typography>Date: {lastReceipt.date}</Typography>
              <Typography>Transaction ID: {lastReceipt.transactionId}</Typography>
              <Typography sx={{ mt: 1, fontWeight: 'bold' }}>Payment Methods:</Typography>
              {lastReceipt.payments && Array.isArray(lastReceipt.payments) ? (
                lastReceipt.payments.map((payment, idx) => (
                  <Typography key={idx} sx={{ ml: 2 }}>
                    {payment.method}: {formatCurrency(payment.amount)}
                  </Typography>
                ))
              ) : (
                <Typography>Mode of Payment: {lastReceipt.mop || 'N/A'}</Typography>
              )}
              <List>
                {lastReceipt.items.map((item) => (
                  <ListItem key={item.id}>
                    <ListItemText
                      primary={item.name}
                      secondary={`Qty: ${item.quantity} x ${formatCurrency(item.price)} = ${formatCurrency(
                        (item.price || 0) * (item.quantity || 1)
                      )}`}
                    />
                  </ListItem>
                ))}
              </List>
              {lastReceipt.subtotal !== undefined && (
                <>
                  <Box sx={{ mt: 2, mb: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      Subtotal: {formatCurrency(lastReceipt.subtotal)}
                    </Typography>
                    {lastReceipt.discount > 0 && (
                      <Typography variant="body2" color="error">
                        Discount: -{formatCurrency(lastReceipt.discount)}
                      </Typography>
                    )}
                  </Box>
                </>
              )}
              <Typography variant="subtitle1">Total: {formatCurrency(lastReceipt.total)}</Typography>
            </Box>
          ) : (
            <Typography>No receipt available</Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Close</Button>
          <Button onClick={onPrint} variant="contained">
            Print
          </Button>
        </DialogActions>
      </Dialog>
      <div ref={receiptRef} style={{ display: 'none' }}>
        {lastReceipt && (
          <Box>
            <Typography variant="h6">Receipt</Typography>
            <Typography>Date: {lastReceipt.date}</Typography>
            <Typography>Transaction ID: {lastReceipt.transactionId}</Typography>
            <Typography sx={{ mt: 1, fontWeight: 'bold' }}>Payment Methods:</Typography>
            {lastReceipt.payments && Array.isArray(lastReceipt.payments) ? (
              lastReceipt.payments.map((payment, idx) => (
                <Typography key={idx} sx={{ ml: 2 }}>
                  {payment.method}: {formatCurrency(payment.amount)}
                </Typography>
              ))
            ) : (
              <Typography>Mode of Payment: {lastReceipt.mop || 'N/A'}</Typography>
            )}
            <List>
              {lastReceipt.items.map((item) => (
                <ListItem key={item.id}>
                  <ListItemText
                    primary={item.name}
                    secondary={`Qty: ${item.quantity} x ${formatCurrency(item.price)} = ${formatCurrency(
                      (item.price || 0) * (item.quantity || 1)
                    )}`}
                  />
                </ListItem>
              ))}
            </List>
            {lastReceipt.subtotal !== undefined && (
              <>
                <Box sx={{ mt: 2, mb: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    Subtotal: {formatCurrency(lastReceipt.subtotal)}
                  </Typography>
                  {lastReceipt.discount > 0 && (
                    <Typography variant="body2" color="error">
                      Discount: -{formatCurrency(lastReceipt.discount)}
                    </Typography>
                  )}
                </Box>
              </>
            )}
            <Typography variant="subtitle1">Total: {formatCurrency(lastReceipt.total)}</Typography>
          </Box>
        )}
      </div>
    </>
  );
};

export default ReceiptDialog;

