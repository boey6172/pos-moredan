import React, { useEffect, useState, useRef, useMemo, useCallback, memo, startTransition } from 'react';
import PropTypes from 'prop-types';
import {
  Box, Grid, Card, CardContent, Typography, Button, Drawer, List, ListItem, ListItemText,
  IconButton, Dialog, DialogTitle, DialogContent, DialogActions, Alert, TextField,
  Accordion, AccordionSummary, AccordionDetails, Snackbar, InputAdornment, Paper,
  Chip, Divider, RadioGroup, Radio, FormControlLabel, FormControl, FormLabel
} from '@mui/material';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import DeleteIcon from '@mui/icons-material/Delete';
import QrCodeScannerIcon from '@mui/icons-material/QrCodeScanner';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import axios from '../api/axios';
import { useNavigate } from 'react-router-dom';
import { keyframes } from '@emotion/react';

// Simple debounce utility
const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

/*
  Fixed POS component with the following improvements:
  - Proper error handling and loading states
  - Fixed async useEffect
  - Better prop validation
  - Improved cart management
  - Fixed memory leaks
  - Better UX feedback
*/

const bounce = keyframes`
  0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
  40% { transform: translateY(-10px); }
  60% { transform: translateY(-5px); }
`;

/* ---------- Helper: token header ---------- */
const authHeader = () => ({ Authorization: `Bearer ${localStorage.getItem('token') || ''}` });

/* ---------- ProductCard ---------- */
const ProductCard = memo(({ product, onAdd, addedToCartProductId }) => {
  const isAdded = addedToCartProductId === product.id;
  
  // Memoize the click handler to prevent recreation on every render
  const handleAdd = useCallback(() => {
    onAdd(product);
  }, [onAdd, product]);

  return (
    <Card
      sx={{
        transform: isAdded ? 'scale(1.05)' : 'scale(1)',
        transition: 'transform 0.25s ease, box-shadow 0.25s ease',
        boxShadow: isAdded ? '0 8px 25px rgba(76,175,80,0.25)' : '0 2px 8px rgba(0,0,0,0.08)',
        border: isAdded ? '2px solid #4caf50' : '1px solid transparent',
        position: 'relative'
      }}
    >
      {isAdded && (
        <Box sx={{ position: 'absolute', top: -10, right: -10, zIndex: 10, animation: `${bounce} 0.6s ease-in-out` }}>
          <CheckCircleIcon sx={{ color: '#4caf50', fontSize: 30, backgroundColor: 'white', borderRadius: '50%' }} />
        </Box>
      )}

      <CardContent>
        <Typography variant="h6" noWrap>{product.name}</Typography>
        <Typography color="text.secondary">₱{Number(product.price || 0).toFixed(2)}</Typography>
        <Button
          variant="contained"
          startIcon={<AddShoppingCartIcon />}
          onClick={handleAdd}
          fullWidth
          sx={{ mt: 1 }}
        >
          {isAdded ? 'Added' : 'Add to Checkout'}
        </Button>
      </CardContent>
    </Card>
  );
});

ProductCard.displayName = 'ProductCard';

ProductCard.propTypes = {
  product: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    name: PropTypes.string.isRequired,
    price: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired
  }).isRequired,
  onAdd: PropTypes.func.isRequired,
  addedToCartProductId: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
};

/* ---------- MultiPaymentManager Component ---------- */
const MultiPaymentManager = ({ payments, setPayments, total }) => {
  const [newMethod, setNewMethod] = useState('Cash');
  const [newAmount, setNewAmount] = useState('');
  const [error, setError] = useState('');

  const paymentMethods = ['Cash', 'Card', 'GCash', 'PayMaya', 'Bank Transfer'];
  const paidTotal = useMemo(() => 
    payments.reduce((sum, p) => sum + parseFloat(p.amount || 0), 0), 
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

  const removePayment = useCallback((index) => {
    setPayments(payments.filter((_, i) => i !== index));
  }, [payments, setPayments]);

  const handleKeyPress = useCallback((e) => {
    if (e.key === 'Enter' && newAmount) {
      addPayment();
    }
  }, [newAmount, addPayment]);

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
              label={`${payment.method}: ₱${parseFloat(payment.amount).toFixed(2)}`}
              onDelete={() => removePayment(index)}
              sx={{ mr: 1, mb: 1 }}
              color="primary"
              variant="outlined"
            />
          ))}
          <Box sx={{ mt: 1 }}>
            <Typography variant="caption" color="text.secondary">
              Paid: ₱{paidTotal.toFixed(2)} / Total: ₱{total.toFixed(2)}
            </Typography>
            {remaining > 0 && (
              <Typography variant="caption" color="error" display="block">
                Remaining: ₱{remaining.toFixed(2)}
              </Typography>
            )}
            {remaining < 0 && (
              <Typography variant="caption" color="error" display="block">
                Overpaid: ₱{Math.abs(remaining).toFixed(2)}
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
          SelectProps={{ native: true }}
        >
          {paymentMethods.map(method => (
            <option key={method} value={method}>{method}</option>
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
            startAdornment: <InputAdornment position="start">₱</InputAdornment>
          }}
          inputProps={{ min: 0, step: 0.01 }}
        />
        <IconButton 
          onClick={addPayment} 
          color="primary" 
          disabled={!newAmount || parseFloat(newAmount) <= 0}
          sx={{ border: '1px solid', borderColor: 'divider' }}
        >
          <AddIcon />
        </IconButton>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 1, py: 0 }}>{error}</Alert>
      )}

      {remaining === 0 && payments.length > 0 && (
        <Alert severity="success" sx={{ mb: 1, py: 0 }}>
          Payment complete!
        </Alert>
      )}
    </Box>
  );
};

MultiPaymentManager.propTypes = {
  payments: PropTypes.array.isRequired,
  setPayments: PropTypes.func.isRequired,
  total: PropTypes.number.isRequired
};

/* ---------- SinglePaymentSelector Component ---------- */
const SinglePaymentSelector = ({ paymentMethod, setPaymentMethod, total }) => {
  const paymentMethods = ['Cash', 'Card', 'GCash', 'PayMaya', 'Bank Transfer'];

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
        SelectProps={{ native: true }}
      >
        {paymentMethods.map(method => (
          <option key={method} value={method}>{method}</option>
        ))}
      </TextField>
      <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
        Total: ₱{total.toFixed(2)}
      </Typography>
    </Box>
  );
};

SinglePaymentSelector.propTypes = {
  paymentMethod: PropTypes.string.isRequired,
  setPaymentMethod: PropTypes.func.isRequired,
  total: PropTypes.number.isRequired
};

/* ---------- CartDrawer ---------- */
const CartDrawer = ({ open, onClose, cart, changeQuantity, removeFromCart, payments, setPayments, total, onCheckout, isMultiPayment, setIsMultiPayment, paymentMethod, setPaymentMethod }) => {
  const paidTotal = useMemo(() => {
    if (isMultiPayment) {
      return payments.reduce((sum, p) => sum + parseFloat(p.amount || 0), 0);
    } else {
      return paymentMethod ? total : 0;
    }
  }, [payments, isMultiPayment, paymentMethod, total]);
  
  const canCheckout = cart.length > 0 && (
    isMultiPayment 
      ? (paidTotal >= total && payments.length > 0)
      : (paymentMethod && paidTotal >= total)
  );

  return (
    <Drawer 
      anchor="right" 
      open={open} 
      onClose={onClose}
      PaperProps={{
        sx: {
          width: { xs: '100%', sm: 380 },
          maxWidth: '100vw'
        }
      }}
    >
      <Box 
        sx={{ 
          width: '100%',
          height: '100vh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}
      >
        {/* Header with back button */}
        <Box 
          sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            p: 2, 
            borderBottom: '1px solid',
            borderColor: 'divider',
            minHeight: 64
          }}
        >
          <IconButton 
            onClick={onClose} 
            sx={{ mr: 1 }}
            aria-label="close drawer"
          >
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Cart
          </Typography>
        </Box>

        {/* Scrollable content */}
        <Box 
          sx={{ 
            flex: 1,
            overflowY: 'auto',
            p: 2
          }}
        >
          <List>
          {cart.length === 0 && <Typography sx={{ p: 2 }}>Cart is empty</Typography>}
          {cart.map(item => (
            <ListItem key={item.id} sx={{ paddingLeft: 1 }}>
              <IconButton onClick={() => removeFromCart(item.id)} size="small" sx={{ color: '#f44336', mr: 1 }}>
                <DeleteIcon fontSize="small" />
              </IconButton>
              <ListItemText 
                primary={item.name} 
                secondary={`₱${Number(item.price || 0).toFixed(2)}`} 
                sx={{ flexGrow: 1 }} 
              />
              <Box display="flex" alignItems="center" gap={1} sx={{ ml: 1 }}>
                <IconButton onClick={() => changeQuantity(item.id, -1)} size="small">-</IconButton>
                <Typography sx={{ minWidth: '24px', textAlign: 'center', fontWeight: 'bold' }}>
                  {item.quantity || 1}
                </Typography>
                <IconButton onClick={() => changeQuantity(item.id, 1)} size="small">+</IconButton>
              </Box>
            </ListItem>
          ))}
        </List>

        <Divider sx={{ my: 2 }} />

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
                // Reset payments when switching modes
                if (!isMulti) {
                  setPayments([]);
                }
              }}
              sx={{ display: 'flex', gap: 1 }}
            >
              <FormControlLabel 
                value="single" 
                control={<Radio size="small" />} 
                label="Single" 
                sx={{ flex: 1, mr: 0 }}
              />
              <FormControlLabel 
                value="multi" 
                control={<Radio size="small" />} 
                label="Multi" 
                sx={{ flex: 1, mr: 0 }}
              />
            </RadioGroup>
          </FormControl>
        </Box>

        <Divider sx={{ my: 2 }} />

        <Box mt={2}>
          <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 'bold' }}>
            Total: ₱{total.toFixed(2)}
          </Typography>
        </Box>

        <Box mt={2}>
          {isMultiPayment ? (
            <MultiPaymentManager 
              payments={payments} 
              setPayments={setPayments} 
              total={total} 
            />
          ) : (
            <SinglePaymentSelector
              paymentMethod={paymentMethod}
              setPaymentMethod={setPaymentMethod}
              total={total}
            />
          )}
        </Box>

        </Box>

        {/* Fixed footer with checkout button */}
        <Box 
          sx={{ 
            p: 2, 
            borderTop: '1px solid',
            borderColor: 'divider',
            backgroundColor: 'background.paper'
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

CartDrawer.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  cart: PropTypes.array.isRequired,
  changeQuantity: PropTypes.func.isRequired,
  removeFromCart: PropTypes.func.isRequired,
  payments: PropTypes.array.isRequired,
  setPayments: PropTypes.func.isRequired,
  total: PropTypes.number.isRequired,
  onCheckout: PropTypes.func.isRequired,
  isMultiPayment: PropTypes.bool.isRequired,
  setIsMultiPayment: PropTypes.func.isRequired,
  paymentMethod: PropTypes.string.isRequired,
  setPaymentMethod: PropTypes.func.isRequired
};

/* ---------- CheckoutDialog ---------- */
const CheckoutDialog = ({ open, onClose, total, onConfirm, status }) => (
  <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
    <DialogTitle>Checkout</DialogTitle>
    <DialogContent>
      <Typography>Are you sure you want to checkout?</Typography>
      <Typography mt={2}>Total: ₱{total.toFixed(2)}</Typography>
      {status && (
        <Alert severity={status === 'success' ? 'success' : 'error'} sx={{ mt: 2 }}>
          {status === 'success' ? 'Checkout successful!' : status}
        </Alert>
      )}
    </DialogContent>
    <DialogActions>
      <Button onClick={onClose}>Cancel</Button>
      <Button onClick={onConfirm} variant="contained" disabled={status === 'success'}>
        Confirm
      </Button>
    </DialogActions>
  </Dialog>
);

CheckoutDialog.propTypes = { 
  open: PropTypes.bool.isRequired, 
  onClose: PropTypes.func.isRequired, 
  total: PropTypes.number.isRequired, 
  onConfirm: PropTypes.func.isRequired, 
  status: PropTypes.oneOfType([PropTypes.string, PropTypes.oneOf([null])]) 
};

/* ---------- ReceiptDialog ---------- */
const ReceiptDialog = ({ open, onClose, lastReceipt, onPrint }) => (
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
                {payment.method}: ₱{parseFloat(payment.amount).toFixed(2)}
              </Typography>
            ))
          ) : (
            <Typography>Mode of Payment: {lastReceipt.mop || 'N/A'}</Typography>
          )}
          <List>
            {lastReceipt.items.map(item => (
              <ListItem key={item.id}>
                <ListItemText 
                  primary={item.name} 
                  secondary={`Qty: ${item.quantity} x ₱${Number(item.price || 0).toFixed(2)} = ₱${((item.price || 0) * (item.quantity || 1)).toFixed(2)}`} 
                />
              </ListItem>
            ))}
          </List>
          <Typography variant="subtitle1">Total: ₱{lastReceipt.total.toFixed(2)}</Typography>
        </Box>
      ) : (
        <Typography>No receipt available</Typography>
      )}
    </DialogContent>
    <DialogActions>
      <Button onClick={onClose}>Close</Button>
      <Button onClick={onPrint} variant="contained">Print</Button>
    </DialogActions>
  </Dialog>
);

ReceiptDialog.propTypes = { 
  open: PropTypes.bool.isRequired, 
  onClose: PropTypes.func.isRequired, 
  lastReceipt: PropTypes.object, 
  onPrint: PropTypes.func.isRequired 
};

/* ---------- CustomerNameDialog ---------- */
const CustomerNameDialog = ({ open, name, setName, onProceed, onCancel }) => {
  const [inputValue, setInputValue] = useState(name);

  // Reset input when dialog opens/closes
  useEffect(() => {
    setInputValue(name);
  }, [name, open]);

  // Run onProceed AFTER name is updated
  useEffect(() => {
    if (name && open) {
      console.log("✅ Updated name:", name);
      onProceed();
    }
  }, [name]); // only runs when "name" changes

  const handleKeyPress = useCallback(
    (e) => {
      if (e.key === "Enter" && inputValue.trim()) {
        setName(inputValue.trim());
      }
    },
    [inputValue, setName]
  );

  const handleProceed = useCallback(() => {
    setName(inputValue.trim());
  }, [inputValue, setName]);

  return (
    <Dialog open={open} onClose={() => {}} maxWidth="xs" fullWidth>
      <DialogTitle>Enter Customer Name</DialogTitle>
      <DialogContent>
        <TextField
          label="Customer Name"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          fullWidth
          autoFocus
          onKeyDown={handleKeyPress} // onKeyDown is more reliable than onKeyPress
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancel}>Cancel</Button>
        <Button
          onClick={handleProceed}
          variant="contained"
          disabled={!inputValue.trim()}
        >
          Proceed
        </Button>
      </DialogActions>
    </Dialog>
  );
};


CustomerNameDialog.propTypes = { 
  open: PropTypes.bool.isRequired, 
  name: PropTypes.string.isRequired, 
  setName: PropTypes.func.isRequired, 
  onProceed: PropTypes.func.isRequired, 
  onCancel: PropTypes.func.isRequired 
};

/* ---------- SnackbarNotification ---------- */
const SnackbarNotification = ({ open, onClose, message,severity }) => (
  <Snackbar 
    open={open} 
    autoHideDuration={2000} 
    onClose={onClose} 
    anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
  >
    <Alert 
      onClose={onClose} 
      sx={{ width: '100%' }} 
      iconMapping={{ success: <CheckCircleIcon fontSize="inherit" /> }}
      severity={severity} 
    >
      {message}
    </Alert>
  </Snackbar>
);

SnackbarNotification.propTypes = { 
  open: PropTypes.bool.isRequired, 
  onClose: PropTypes.func.isRequired, 
  message: PropTypes.string.isRequired 
};

/* ---------- Main POS component ---------- */
export default function POS() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [customerName, setCustomerName] = useState('');
  const [nameDialogOpen, setNameDialogOpen] = useState(true);
  const [cart, setCart] = useState([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [checkoutStatus, setCheckoutStatus] = useState(null);
  const [receiptOpen, setReceiptOpen] = useState(false);
  const [lastReceipt, setLastReceipt] = useState(null);
  const [payments, setPayments] = useState([]);
  const [isMultiPayment, setIsMultiPayment] = useState(false); // Default to single payment
  const [paymentMethod, setPaymentMethod] = useState('Cash'); // Default payment method
  const [addedToCartProductId, setAddedToCartProductId] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [addedProductName, setAddedProductName] = useState('');
  const [barcodeInput, setBarcodeInput] = useState('');
  const [barcodeSearching, setBarcodeSearching] = useState(false);
  const receiptRef = useRef(null);
  const barcodeInputRef = useRef(null);
  const navigate = useNavigate();
  const [snackbarSeverity, setSnackbarSeverity] = useState('success'); 

  /* Fetch products once - Fixed async useEffect */
  useEffect(() => {
    let mounted = true;
    
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await axios.get('/api/products', { headers: authHeader() });
        
        if (mounted) {
          setProducts(Array.isArray(res.data) ? res.data : []);
        }
      } catch (err) {
        console.error('Failed to fetch products', err);
        if (mounted) {
          setProducts([]);
          setError('Failed to load products. Please try again.');
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    fetchProducts();
    
    return () => { 
      mounted = false; 
    };
  }, []);

  /* Auto-focus barcode input when not in customer name dialog */
  useEffect(() => {
    if (!nameDialogOpen && barcodeInputRef.current) {
      setTimeout(() => {
        barcodeInputRef.current?.focus();
      }, 100);
    }
  }, [nameDialogOpen]);

  /* Memoized derived values */
  const categoryOrder = [
    "Buy 1 Take 1",
    "Iced Coffee",
    "Hot Coffee",
    "Non Coffee",
    "Freezy Series",
    "Fruity Series",
    "Fruit Shakes",
    "Juice",
    "Silog Meals",
    "Pasta",
    "Snacks",
    "Pastries",
    "Add Ons",
    "Uncategorized" // fallback
  ];
  
  const groupedProducts = useMemo(() => {
    // group first
    const groups = products.reduce((acc, product) => {
      const categoryName = product.Category?.name || "Uncategorized";
      if (!acc[categoryName]) acc[categoryName] = [];
      acc[categoryName].push(product);
      return acc;
    }, {});
  
    // sort/group by fixed order
    const orderedGroups = {};
    categoryOrder.forEach(category => {
      if (groups[category]) {
        orderedGroups[category] = groups[category];
      }
    });
  
    // if some categories are not in categoryOrder, append them at the end
    Object.keys(groups).forEach(category => {
      if (!orderedGroups[category]) {
        orderedGroups[category] = groups[category];
      }
    });
  
    return orderedGroups;
  }, [products]);
  
  const total = useMemo(
    () =>
      cart.reduce(
        (sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 1),
        0
      ),
    [cart]
  );

  /* Handlers */
  const addToCart = useCallback((product) => {
    if (!product.inventory || product.inventory <= 0) {
      // Batch state updates for better performance
      startTransition(() => {
        setAddedProductName(`${product.name} out of stock`);
        setSnackbarSeverity('error');
        setAddedToCartProductId(null);
        setSnackbarOpen(true);
      });
      return;
    }
  
    setCart(prev => {
      const found = prev.find(p => p.id === product.id);
      if (found) {
        // check again if stock is enough
        if ((found.quantity || 1) >= product.inventory) {
          startTransition(() => {
            setAddedProductName(`${product.name} (No more stock available)`);
            setSnackbarSeverity('error');
            setSnackbarOpen(true);
          });
          return prev; // don't increase
        }
  
        return prev.map(p => 
          p.id === product.id 
            ? { ...p, quantity: (p.quantity || 1) + 1 } 
            : p
        );
      }
  
      return [...prev, { ...product, quantity: 1 }];
    });
  
    setAddedToCartProductId(product.id);
    // Use startTransition for non-urgent UI updates (animations, notifications)
    startTransition(() => {
      setAddedProductName(`${product.name} added to checkout!`);
      setSnackbarOpen(true);
      setAddedToCartProductId(product.id);
      
      // Clear the added state after animation
      setTimeout(() => {
        setAddedToCartProductId(null);
      }, 900);
    });
  }, []);

  const changeQuantity = useCallback((id, delta) => {
    setCart(prev => 
      prev.map(item => 
        item.id === id 
          ? { ...item, quantity: Math.max(1, (item.quantity || 1) + delta) } 
          : item
      )
    );
  }, []);

  const removeFromCart = useCallback((id) => {
    setCart(prev => prev.filter(item => item.id !== id));
  }, []);

  const handleCheckout = useCallback(async () => {
    if (cart.length === 0) return;
    
    let finalPayments = [];
    let mopString = '';
    
    if (isMultiPayment) {
      // Validate multi-payment
      const paidTotal = payments.reduce((sum, p) => sum + parseFloat(p.amount || 0), 0);
      if (paidTotal < total) {
        setCheckoutStatus('Payment amount is less than total. Please add more payments.');
        return;
      }
      finalPayments = payments;
      mopString = JSON.stringify(payments);
    } else {
      // Single payment mode
      if (!paymentMethod) {
        setCheckoutStatus('Please select a payment method.');
        return;
      }
      finalPayments = [{ method: paymentMethod, amount: total }];
      mopString = JSON.stringify(finalPayments);
    }
    
    setCheckoutStatus(null);
    
    try {
      const res = await axios.post('/api/transactions', {
        items: cart.map(item => ({ 
          productId: item.id, 
          quantity: item.quantity || 1 
        })),
        discount: 0,
        mop: mopString,
        customerName
      }, { headers: authHeader() });

      setCheckoutStatus('success');
      setLastReceipt({ 
        items: cart, 
        total, 
        date: new Date().toLocaleString(), 
        transactionId: res.data.transactionId || res.data.id || 'N/A', 
        payments: finalPayments 
      });

      // Reset for next transaction
      setCart([]);
      setCustomerName('');
      setPayments([]);
      setIsMultiPayment(false); // Reset to single payment
      setPaymentMethod('Cash'); // Reset to default
      setDrawerOpen(false);
      setCheckoutOpen(false);
      setReceiptOpen(true);
    } catch (err) {
      const message = err?.response?.data?.message || err.message || 'Checkout failed';
      console.error('Checkout error', err);
      setCheckoutStatus(message);
    }
  }, [cart, payments, paymentMethod, isMultiPayment, customerName, total]);

  const handleReceiptClose = useCallback(() => {
    setReceiptOpen(false);
    setNameDialogOpen(true); // Ask for name for next transaction
  }, []);

  const handleCustomerNameSubmit = useCallback(() => {
    if (customerName.trim()) {
      setNameDialogOpen(false);
      setCheckoutStatus(null);

    }
  }, [customerName]);

  const handlePrint = useCallback(() => {
    if (!receiptRef.current) return;
    
    const printContents = receiptRef.current.innerHTML;
    const win = window.open('', '', 'width=600,height=800');
    if (!win) return;
    
    win.document.write(`
      <html>
        <head><title>Receipt</title></head>
        <body>${printContents}</body>
      </html>
    `);
    win.document.close();
    win.print();
  }, []);

  /* Barcode search functionality */
  const searchProductByBarcode = useCallback(async (barcode) => {
    if (!barcode.trim()) return;
    
    setBarcodeSearching(true);
    try {
      const res = await axios.get(`/api/products/sku/${encodeURIComponent(barcode.trim())}`, { 
        headers: authHeader() 
      });
      
      if (res.data) {
        // Check if product is already in cart
        const existingItem = cart.find(item => item.id === res.data.id);
        if (existingItem) {
          // If already in cart, increase quantity
          changeQuantity(res.data.id, 1);
          setAddedProductName(`${res.data.name} quantity increased!`);
        } else {
          // Add new product to cart
          addToCart(res.data);
          setAddedProductName(`${res.data.name} added via barcode scan!`);
        }
        setBarcodeInput(''); // Clear input after successful scan
        setSnackbarOpen(true);
        setSnackbarSeverity('success');
        
        // Auto-open cart drawer to show added item
        // if (!drawerOpen) {
        //   setDrawerOpen(true);
        // }
      }
    } catch (err) {
      console.error('Barcode search failed', err);
      const errorMessage = err.response?.status === 404 
        ? `Product not found for barcode: ${barcode}` 
        : 'Error searching for product. Please try again.';
      setAddedProductName(errorMessage);
      setSnackbarOpen(true);
      setSnackbarSeverity('error');
    } finally {
      setBarcodeSearching(false);
    }
  }, [addToCart, cart, changeQuantity, drawerOpen]);

  const handleBarcodeKeyPress = useCallback((e) => {
    if (e.key === 'Enter' && barcodeInput.trim()) {
      searchProductByBarcode(barcodeInput);
    }
  }, [barcodeInput, searchProductByBarcode]);

  const handleBarcodeSubmit = useCallback(() => {
    if (barcodeInput.trim()) {
      searchProductByBarcode(barcodeInput);
    }
  }, [barcodeInput, searchProductByBarcode]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <Typography>Loading products...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={2}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button onClick={() => window.location.reload()}>Retry</Button>
      </Box>
    );
  }

  return (
    <Box p={2}>
      <Typography variant="h4" mb={2}>Point of Sale</Typography>

      {/* Barcode Scanner Input */}
      <Paper elevation={2} sx={{ p: 2, mb: 3, backgroundColor: '#f5f5f5' }}>
        <Typography variant="h6" mb={2} display="flex" alignItems="center" gap={1}>
          <QrCodeScannerIcon color="primary" />
          Barcode Scanner
        </Typography>
        <Box display="flex" gap={2} alignItems="center">
          <TextField
            ref={barcodeInputRef}
            label="Scan or Enter Barcode"
            value={barcodeInput}
            onChange={(e) => {
              const value = e.target.value;
              startTransition(() => {
                setBarcodeInput(value);
              });
            }}
            onKeyPress={handleBarcodeKeyPress}
            fullWidth
            placeholder="Scan barcode or enter SKU manually"
            disabled={barcodeSearching}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <QrCodeScannerIcon />
                </InputAdornment>
              ),
              endAdornment: barcodeSearching && (
                <InputAdornment position="end">
                  <Typography variant="caption" color="text.secondary">
                    Searching...
                  </Typography>
                </InputAdornment>
              )
            }}
            autoFocus
          />
          <Button
            variant="contained"
            color="primary"
            onClick={handleBarcodeSubmit}
            disabled={!barcodeInput.trim() || barcodeSearching}
            startIcon={<SearchIcon />}
            sx={{ minWidth: 120 }}
          >
            {barcodeSearching ? 'Searching...' : 'Search'}
          </Button>
        </Box>
        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
          💡 Connect your barcode scanner and scan directly, or manually enter the product SKU. 
          The input field will automatically focus for quick scanning.
        </Typography>
      </Paper>

      {Object.entries(groupedProducts).map(([categoryName, categoryProducts]) => (
        <Accordion key={categoryName}  sx={{ mb: 2 }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6">
              {categoryName} ({categoryProducts.length} items)
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Grid container spacing={2}>
              {categoryProducts.map(product => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={product.id}>
                  <ProductCard 
                    product={product} 
                    onAdd={addToCart} 
                    addedToCartProductId={addedToCartProductId} 
                  />
                </Grid>
              ))}
            </Grid>
          </AccordionDetails>
        </Accordion>
      ))}

      <CartDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        cart={cart}
        changeQuantity={changeQuantity}
        removeFromCart={removeFromCart}
        payments={payments}
        setPayments={setPayments}
        total={total}
        onCheckout={() => { setCheckoutOpen(true); setDrawerOpen(false); }}
        isMultiPayment={isMultiPayment}
        setIsMultiPayment={setIsMultiPayment}
        paymentMethod={paymentMethod}
        setPaymentMethod={setPaymentMethod}
      />

      <Button 
        variant="contained" 
        color="secondary" 
        sx={{ position: 'fixed', bottom: 32, right: 32 }} 
        onClick={() => setDrawerOpen(true)} 
        startIcon={<AddShoppingCartIcon />}
      >
        Checkout ({cart.length})
      </Button>

      <CustomerNameDialog 
        open={nameDialogOpen} 
        name={customerName} 
        setName={setCustomerName} 
        onProceed={handleCustomerNameSubmit} 
        onCancel={() => navigate('/')} 
      />

      <CheckoutDialog 
        open={checkoutOpen} 
        onClose={() => setCheckoutOpen(false)} 
        total={total} 
        onConfirm={handleCheckout} 
        status={checkoutStatus} 
      />

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
                  {payment.method}: ₱{parseFloat(payment.amount).toFixed(2)}
                </Typography>
              ))
            ) : (
              <Typography>Mode of Payment: {lastReceipt.mop || 'N/A'}</Typography>
            )}
            <List>
              {lastReceipt.items.map(item => (
                <ListItem key={item.id}>
                  <ListItemText 
                    primary={item.name} 
                    secondary={`Qty: ${item.quantity} x ₱${Number(item.price || 0).toFixed(2)} = ₱${((item.price || 0) * (item.quantity || 1)).toFixed(2)}`} 
                  />
                </ListItem>
              ))}
            </List>
            <Typography variant="subtitle1">Total: ₱{lastReceipt.total.toFixed(2)}</Typography>
          </Box>
        )}
      </div>

      <ReceiptDialog 
        open={receiptOpen} 
        onClose={handleReceiptClose} 
        lastReceipt={lastReceipt} 
        onPrint={handlePrint} 
      />

      <SnackbarNotification 
        open={snackbarOpen} 
        onClose={() => setSnackbarOpen(false)} 
        message={`${addedProductName}`} 
        severity={`${snackbarSeverity}`} 
      />
    </Box>
  );
}