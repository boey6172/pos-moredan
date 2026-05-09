import React, { useMemo, useEffect, useRef } from 'react';
import {
  Drawer,
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Divider,
  Button,
  TextField,
  InputAdornment,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Switch,
  Alert,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import MultiPaymentManager from './MultiPaymentManager';
import SinglePaymentSelector from './SinglePaymentSelector';
import { roundMoney } from '../utils/helpers';

const CartDrawer = ({
  open,
  onClose,
  cart,
  changeQuantity,
  removeFromCart,
  payments,
  setPayments,
  subtotal,
  total,
  discount,
  setDiscount,
  showDiscount,
  setShowDiscount,
  onCheckout,
  isMultiPayment,
  setIsMultiPayment,
  paymentMethod,
  setPaymentMethod,
  cashTendered,
  setCashTendered,
}) => {
  const prevTotalRef = useRef(total);

  useEffect(() => {
    if (isMultiPayment || paymentMethod !== 'Cash') {
      prevTotalRef.current = total;
      return;
    }
    const prevT = prevTotalRef.current;
    setCashTendered((prev) => {
      const raw = String(prev).trim();
      if (raw === '') return total > 0 ? total.toFixed(2) : '';
      const p = parseFloat(raw);
      const wasExact = Number.isFinite(p) && Math.abs(p - prevT) < 0.009;
      if (wasExact) return total > 0 ? total.toFixed(2) : '';
      return raw;
    });
    prevTotalRef.current = total;
  }, [total, paymentMethod, isMultiPayment, setCashTendered]);

  const paidTotal = useMemo(() => {
    if (isMultiPayment) {
      return payments.reduce((sum, p) => sum + parseFloat(p.amount || 0), 0);
    }
    if (!paymentMethod) return 0;
    if (paymentMethod === 'Cash') {
      const t = parseFloat(String(cashTendered).trim());
      return Number.isFinite(t) ? t : 0;
    }
    return total;
  }, [payments, isMultiPayment, paymentMethod, total, cashTendered]);

  const cashSingleOk = useMemo(() => {
    if (isMultiPayment || paymentMethod !== 'Cash') return true;
    const t = parseFloat(String(cashTendered).trim());
    return Number.isFinite(t) && t >= roundMoney(total) - 0.001;
  }, [isMultiPayment, paymentMethod, cashTendered, total]);

  const canCheckout =
    cart.length > 0 &&
    (isMultiPayment ? paidTotal >= total && payments.length > 0 : Boolean(paymentMethod) && cashSingleOk);

  const formatCurrency = (amount) => {
    return `₱${(parseFloat(amount) || 0).toFixed(2)}`;
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: { xs: '100%', sm: 440, md: 520 },
          maxWidth: '100vw',
        },
      }}
    >
      <Box
        sx={{
          width: '100%',
          height: '100vh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            p: 2,
            borderBottom: '1px solid',
            borderColor: 'divider',
            minHeight: 64,
            backgroundColor: 'background.paper',
          }}
        >
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Cart ({cart.length})
          </Typography>
        </Box>

        {/* Back Button Section */}
        <Box
          sx={{
            p: 1.5,
            borderBottom: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Button
            onClick={onClose}
            startIcon={<ArrowBackIcon />}
            variant="text"
            fullWidth
            sx={{
              textTransform: 'none',
              justifyContent: 'flex-start',
            }}
            aria-label="Back to POS items"
          >
            Back
          </Button>
        </Box>

        {/* Scrollable content */}
        <Box
          sx={{
            flex: 1,
            overflowY: 'auto',
            p: 2,
          }}
        >
          <List>
            {cart.length === 0 && (
              <Typography sx={{ p: 2, textAlign: 'center' }} color="text.secondary">
                Cart is empty
              </Typography>
            )}
            {cart.map((item) => (
              <ListItem key={item.id} sx={{ px: 1 }}>
                <IconButton
                  onClick={() => removeFromCart(item.id)}
                  size="small"
                  color="error"
                  sx={{ mr: 1 }}
                  aria-label={`Remove ${item.name}`}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
                <ListItemText
                  primary={item.name}
                  secondary={formatCurrency(item.price)}
                  sx={{ flexGrow: 1 }}
                />
                <Box display="flex" alignItems="center" gap={1} sx={{ ml: 1 }}>
                  <IconButton
                    onClick={() => changeQuantity(item.id, -1)}
                    size="small"
                    aria-label={`Decrease ${item.name} quantity`}
                  >
                    <RemoveIcon fontSize="small" />
                  </IconButton>
                  <Typography sx={{ minWidth: '24px', textAlign: 'center', fontWeight: 'bold' }}>
                    {item.quantity || 1}
                  </Typography>
                  <IconButton
                    onClick={() => changeQuantity(item.id, 1)}
                    size="small"
                    aria-label={`Increase ${item.name} quantity`}
                  >
                    <AddIcon fontSize="small" />
                  </IconButton>
                </Box>
              </ListItem>
            ))}
          </List>

          <Divider sx={{ my: 2 }} />

          {/* Discount Toggle */}
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

          <Divider sx={{ my: 2 }} />

          {/* Totals */}
          <Box mt={2}>
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
                {formatCurrency(total)}
              </Typography>
            </Box>
          </Box>

          {/* Payment Section */}
          <Box mt={2}>
            {isMultiPayment ? (
              <MultiPaymentManager payments={payments} setPayments={setPayments} total={total} />
            ) : (
              <SinglePaymentSelector
                paymentMethod={paymentMethod}
                setPaymentMethod={setPaymentMethod}
                total={total}
                cashTendered={cashTendered}
                setCashTendered={setCashTendered}
              />
            )}
          </Box>
        </Box>

        {/* Fixed footer */}
        <Box
          sx={{
            p: 2,
            borderTop: '1px solid',
            borderColor: 'divider',
            backgroundColor: 'background.paper',
          }}
        >
          <Button
            variant="contained"
            color="success"
            fullWidth
            disabled={!canCheckout}
            onClick={onCheckout}
            size="large"
          >
            Checkout
          </Button>
        </Box>
      </Box>
    </Drawer>
  );
};

export default CartDrawer;






