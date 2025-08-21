import React, { useEffect, useState, useRef, useMemo, useCallback } from 'react';
import PropTypes from 'prop-types';
import {
  Box, Grid, Card, CardContent, Typography, Button, Drawer, List, ListItem, ListItemText,
  IconButton, Dialog, DialogTitle, DialogContent, DialogActions, Alert, TextField,
  Accordion, AccordionSummary, AccordionDetails, Snackbar, 
} from '@mui/material';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import DeleteIcon from '@mui/icons-material/Delete';
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
const ProductCard = ({ product, onAdd, addedToCartProductId }) => {
  const isAdded = addedToCartProductId === product.id;

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
          onClick={() => onAdd(product)}
          fullWidth
          sx={{ mt: 1 }}
        >
          {isAdded ? 'Added' : 'Add to Checkout'}
        </Button>
      </CardContent>
    </Card>
  );
};

ProductCard.propTypes = {
  product: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    name: PropTypes.string.isRequired,
    price: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired
  }).isRequired,
  onAdd: PropTypes.func.isRequired,
  addedToCartProductId: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
};

/* ---------- CartDrawer ---------- */
const CartDrawer = ({ open, onClose, cart, changeQuantity, removeFromCart, mop, setMOP, total, onCheckout }) => (
  <Drawer anchor="right" open={open} onClose={onClose}>
    <Box width={320} p={2}>
      <Typography variant="h6">Cart</Typography>
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

      <Box mt={2}>
        <TextField
          select
          label="Mode of Payment"
          value={mop}
          onChange={(e) => setMOP(e.target.value)}
          fullWidth
          SelectProps={{ native: true }}
        >
          <option value="Cash">Cash</option>
          <option value="Card">Card</option>
          <option value="GCash">GCash</option>
          <option value="PayMaya">PayMaya</option>
          <option value="Bank Transfer">Bank Transfer</option>
        </TextField>
      </Box>

      <Box mt={2}>
        <Typography variant="subtitle1">Total: ₱{total.toFixed(2)}</Typography>
      </Box>

      <Button 
        variant="contained" 
        color="success" 
        fullWidth 
        sx={{ mt: 2 }} 
        disabled={cart.length === 0} 
        onClick={onCheckout}
      >
        Checkout
      </Button>
    </Box>
  </Drawer>
);

CartDrawer.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  cart: PropTypes.array.isRequired,
  changeQuantity: PropTypes.func.isRequired,
  removeFromCart: PropTypes.func.isRequired,
  mop: PropTypes.string.isRequired,
  setMOP: PropTypes.func.isRequired,
  total: PropTypes.number.isRequired,
  onCheckout: PropTypes.func.isRequired
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
          <Typography>Mode of Payment: {lastReceipt.mop}</Typography>
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
  const [mop, setMOP] = useState('Cash');
  const [addedToCartProductId, setAddedToCartProductId] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [addedProductName, setAddedProductName] = useState('');
  const receiptRef = useRef(null);
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
      // Show "out of stock" response
      setAddedProductName(`${product.name} out of stock`);
      setSnackbarOpen(true);
      setSnackbarSeverity('error')
      setAddedToCartProductId(null); // no product actually added
      return;
    }
  
    setCart(prev => {
      const found = prev.find(p => p.id === product.id);
      if (found) {
        // check again if stock is enough
        if ((found.quantity || 1) >= product.inventory) {
          setAddedProductName(`${product.name} (No more stock available)`);
          setSnackbarSeverity('error')
          setSnackbarOpen(true);
          return prev; // don’t increase
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
    setAddedProductName(`${product.name} added to checkout!`);
    setSnackbarOpen(true);
  
    const timer = setTimeout(() => setAddedToCartProductId(null), 900);
    return () => clearTimeout(timer);
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
    
    setCheckoutStatus(null);
    
    try {
      const res = await axios.post('/api/transactions', {
        items: cart.map(item => ({ 
          productId: item.id, 
          quantity: item.quantity || 1 
        })),
        discount: 0,
        mop,
        customerName
      }, { headers: authHeader() });

      setCheckoutStatus('success');
      setLastReceipt({ 
        items: cart, 
        total, 
        date: new Date().toLocaleString(), 
        transactionId: res.data.transactionId || res.data.id || 'N/A', 
        mop 
      });

      // Reset for next transaction
      setCart([]);
      setCustomerName('');
      setMOP('Cash');
      setDrawerOpen(false);
      setCheckoutOpen(false);
      setReceiptOpen(true);
    } catch (err) {
      const message = err?.response?.data?.message || err.message || 'Checkout failed';
      console.error('Checkout error', err);
      setCheckoutStatus(message);
    }
  }, [cart, mop, customerName, total]);

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
        mop={mop}
        setMOP={setMOP}
        total={total}
        onCheckout={() => { setCheckoutOpen(true); setDrawerOpen(false); }}
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
            <Typography>Mode of Payment: {lastReceipt.mop}</Typography>
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