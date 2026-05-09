import React, { useMemo } from 'react';
import {
  Box,
  Typography,
  TextField,
  MenuItem,
  Stack,
  Alert,
  Paper,
  Button,
  Grid,
} from '@mui/material';
import { computeChangeDue, cashShortfall, formatCurrency, roundMoney } from '../utils/helpers';

const PAYMENT_METHODS = ['Cash', 'Card', 'GCash', 'PayMaya', 'Bank Transfer'];

const QUICK_BILLS = [20, 50, 100, 200, 500, 1000];
const ADD_AMOUNTS = [1, 5, 20, 50, 100, 500];

/** Min touch target ~48px; comfortable on tablets */
const touchBtnSx = {
  minHeight: { xs: 52, sm: 56 },
  py: 1.25,
  px: 1,
  fontSize: { xs: '1rem', sm: '1.05rem' },
  fontWeight: 600,
  borderRadius: 1.5,
};

const SinglePaymentSelector = ({
  paymentMethod,
  setPaymentMethod,
  total,
  cashTendered,
  setCashTendered,
}) => {
  const tenderNum = useMemo(() => {
    const t = parseFloat(String(cashTendered).trim());
    return Number.isFinite(t) ? t : NaN;
  }, [cashTendered]);

  const changeDue = useMemo(() => {
    if (paymentMethod !== 'Cash' || !Number.isFinite(tenderNum)) return 0;
    return computeChangeDue(tenderNum, total);
  }, [paymentMethod, tenderNum, total]);

  const shortfall = useMemo(() => {
    if (paymentMethod !== 'Cash' || !Number.isFinite(tenderNum)) return roundMoney(total);
    return cashShortfall(tenderNum, total);
  }, [paymentMethod, tenderNum, total]);

  const cashOk = paymentMethod === 'Cash' && Number.isFinite(tenderNum) && tenderNum >= roundMoney(total) - 0.001;

  const setTenderValue = (value) => {
    const n = roundMoney(value);
    setCashTendered(Number.isFinite(n) ? n.toFixed(2) : '');
  };

  const addToTender = (delta) => {
    const base = Number.isFinite(tenderNum) ? tenderNum : 0;
    setTenderValue(base + delta);
  };

  return (
    <Box>
      <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 700 }}>
        Payment method
      </Typography>
      <TextField
        select
        value={paymentMethod}
        onChange={(e) => setPaymentMethod(e.target.value)}
        fullWidth
        size="medium"
        sx={{
          '& .MuiSelect-select': { py: 1.25, fontSize: { xs: '1rem', sm: '1.05rem' } },
        }}
        aria-label="Payment method"
      >
        {PAYMENT_METHODS.map((method) => (
          <MenuItem key={method} value={method} sx={{ fontSize: '1rem', py: 1.25 }}>
            {method}
          </MenuItem>
        ))}
      </TextField>

      {paymentMethod === 'Cash' ? (
        <Box sx={{ mt: 2.5 }}>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 1.5, fontWeight: 500 }}>
            How much did the customer hand you?
          </Typography>

          <Button
            fullWidth
            variant="contained"
            color="primary"
            onClick={() => setTenderValue(total)}
            sx={{ ...touchBtnSx, mb: 2, fontSize: { xs: '1.05rem', sm: '1.1rem' } }}
          >
            Exact — {formatCurrency(total)}
          </Button>

          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1, fontWeight: 600 }}>
            Bill / coin (set amount)
          </Typography>
          <Grid container spacing={1.25} sx={{ mb: 2 }}>
            {QUICK_BILLS.map((bill) => (
              <Grid item xs={4} key={bill}>
                <Button
                  fullWidth
                  variant="outlined"
                  onClick={() => setTenderValue(bill)}
                  sx={touchBtnSx}
                >
                  {formatCurrency(bill)}
                </Button>
              </Grid>
            ))}
          </Grid>

          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1, fontWeight: 600 }}>
            Add to cash received
          </Typography>
          <Grid container spacing={1.25} sx={{ mb: 2 }}>
            {ADD_AMOUNTS.map((amt) => (
              <Grid item xs={4} key={`add-${amt}`}>
                <Button
                  fullWidth
                  variant="outlined"
                  color="secondary"
                  onClick={() => addToTender(amt)}
                  sx={touchBtnSx}
                >
                  +{formatCurrency(amt)}
                </Button>
              </Grid>
            ))}
          </Grid>

          <TextField
            fullWidth
            size="medium"
            label="Cash received"
            value={cashTendered}
            onChange={(e) => setCashTendered(e.target.value)}
            type="number"
            inputProps={{ min: 0, step: 0.01, 'aria-label': 'Cash received' }}
            helperText="Use the buttons above or type the amount."
            sx={{
              '& .MuiInputBase-input': { fontSize: { xs: '1.125rem', sm: '1.25rem' }, py: 1.5 },
            }}
          />

          {Number.isFinite(tenderNum) && tenderNum > 0 && !cashOk && (
            <Alert severity="warning" sx={{ mt: 2, fontSize: { xs: '0.95rem', sm: '1rem' }, py: 1.25 }} icon={false}>
              Still need <strong>{formatCurrency(shortfall)}</strong> more to reach the total.
            </Alert>
          )}

          {cashOk && changeDue > 0 && (
            <Paper
              elevation={0}
              sx={{
                mt: 2,
                p: { xs: 2, sm: 2.5 },
                bgcolor: 'success.light',
                color: 'success.contrastText',
                borderRadius: 2,
              }}
            >
              <Typography variant="body1" sx={{ opacity: 0.95, fontWeight: 600 }}>
                Give back to customer
              </Typography>
              <Typography
                variant="h3"
                sx={{
                  fontWeight: 800,
                  lineHeight: 1.1,
                  mt: 0.5,
                  fontSize: { xs: '2.25rem', sm: '2.75rem' },
                }}
              >
                {formatCurrency(changeDue)}
              </Typography>
            </Paper>
          )}

          {cashOk && changeDue === 0 && (
            <Alert
              severity="success"
              sx={{ mt: 2, fontSize: { xs: '0.95rem', sm: '1rem' }, py: 1.25 }}
              icon={false}
            >
              Exact amount — no change.
            </Alert>
          )}
        </Box>
      ) : (
        <Typography variant="body1" color="text.secondary" sx={{ mt: 1.5, fontWeight: 500 }}>
          Amount due: {formatCurrency(total)}
        </Typography>
      )}
    </Box>
  );
};

export default SinglePaymentSelector;
