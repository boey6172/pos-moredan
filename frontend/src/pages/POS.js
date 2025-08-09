import React, { useEffect, useState, useRef } from 'react';
import { Box, Grid, Card, CardMedia, CardContent, Typography, Button, Drawer, List, ListItem, ListItemText, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, Alert, TextField, Accordion, AccordionSummary, AccordionDetails, Snackbar, Zoom, Grow } from '@mui/material';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import DeleteIcon from '@mui/icons-material/Delete';
import axios from '../api/axios';
import { useNavigate } from 'react-router-dom';

const POS = () => {
  const [products, setProducts] = useState([]);
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
  const receiptRef = useRef();
  const navigate = useNavigate();

  useEffect(() => {
    axios.get('/api/products', { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } })
      .then(res => setProducts(res.data))
      .catch(() => setProducts([]));
  }, []);

  const addToCart = (product) => {
    setCart(prev => {
      const found = prev.find(item => item.id === product.id);
      if (found) {
        return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    
    // Trigger animation and notification
    setAddedToCartProductId(product.id);
    setAddedProductName(product.name);
    setSnackbarOpen(true);
    
    // Reset animation after delay
    setTimeout(() => {
      setAddedToCartProductId(null);
    }, 1000);
  };

  const changeQuantity = (id, delta) => {
    setCart(prev => prev.map(item => item.id === id ? { ...item, quantity: Math.max(1, item.quantity + delta) } : item));
  };

  const removeFromCart = (id) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  // Group products by category
  const groupedProducts = products.reduce((acc, product) => {
    const categoryName = product.Category?.name || 'Uncategorized';
    if (!acc[categoryName]) {
      acc[categoryName] = [];
    }
    acc[categoryName].push(product);
    return acc;
  }, {});

  const handleCheckout = async () => {
    setCheckoutStatus(null);
    try {
      const res = await axios.post('/api/transactions', {
        items: cart.map(item => ({ productId: item.id, quantity: item.quantity })),
        discount: 0,
        mop,
        customerName
      }, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
      setCheckoutStatus('success');
      setLastReceipt({
        items: cart,
        total,
        date: new Date().toLocaleString(),
        transactionId: res.data.transactionId,
        mop
      });
      
      // Reset all data
      setCart([]);
      setCustomerName('');
      setMOP('Cash');
      setDrawerOpen(false);
      setCheckoutOpen(false);
      
      // Show receipt first, then customer name modal
      setReceiptOpen(true);
    } catch (err) {
      setCheckoutStatus(err.response?.data?.message || 'Checkout failed');
    }
  };

  const handleReceiptClose = () => {
    setReceiptOpen(false);
    // After closing receipt, show customer name modal for next transaction
    setNameDialogOpen(true);
  };

  const handleCustomerNameSubmit = () => {
    if (customerName.trim()) {
      setNameDialogOpen(false);
    }
  };

  const handlePrint = () => {
    const printContents = receiptRef.current.innerHTML;
    const win = window.open('', '', 'width=600,height=800');
    win.document.write('<html><head><title>Receipt</title></head><body>' + printContents + '</body></html>');
    win.document.close();
    win.print();
  };

  return (
    <Box p={2}>
      <Typography variant="h4" mb={2}>Point of Sale</Typography>
      {Object.entries(groupedProducts).map(([categoryName, categoryProducts]) => (
        <Accordion key={categoryName} defaultExpanded sx={{ mb: 2 }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6">{categoryName} ({categoryProducts.length} items)</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Grid container spacing={2}>
              {categoryProducts.map(product => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={product.id}>
                  <Grow in={true} timeout={300}>
                    <Card 
                      sx={{
                        transform: addedToCartProductId === product.id ? 'scale(1.05)' : 'scale(1)',
                        transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
                        boxShadow: addedToCartProductId === product.id ? '0 8px 25px rgba(76, 175, 80, 0.3)' : '0 2px 8px rgba(0,0,0,0.1)',
                        border: addedToCartProductId === product.id ? '2px solid #4CAF50' : '2px solid transparent',
                        position: 'relative',
                        overflow: 'visible'
                      }}
                    >
                      {addedToCartProductId === product.id && (
                        <Box
                          sx={{
                            position: 'absolute',
                            top: -10,
                            right: -10,
                            zIndex: 10,
                            animation: 'bounce 0.6s ease-in-out',
                            '@keyframes bounce': {
                              '0%, 20%, 50%, 80%, 100%': { transform: 'translateY(0)' },
                              '40%': { transform: 'translateY(-10px)' },
                              '60%': { transform: 'translateY(-5px)' }
                            }
                          }}
                        >
                          <CheckCircleIcon 
                            sx={{ 
                              color: '#4CAF50', 
                              fontSize: 30,
                              backgroundColor: 'white',
                              borderRadius: '50%'
                            }} 
                          />
                        </Box>
                      )}
                      <CardMedia
                        component="img"
                        height="140"
                        image={product.image ? `http://localhost:5000${product.image}` : '/logo.svg'}
                        alt={product.name || 'Product Image'}
                      />
                      <CardContent>
                        <Typography variant="h6">{product.name}</Typography>
                        <Typography color="text.secondary">₱{product.price}</Typography>
                        <Button
                          variant="contained"
                          startIcon={<AddShoppingCartIcon />}
                          onClick={() => addToCart(product)}
                          sx={{ 
                            mt: 1,
                            backgroundColor: addedToCartProductId === product.id ? '#4CAF50' : '',
                            '&:hover': {
                              backgroundColor: addedToCartProductId === product.id ? '#45a049' : ''
                            }
                          }}
                          fullWidth
                        >
                          {addedToCartProductId === product.id ? 'Added!' : 'Add to Checkout'}
                        </Button>
                      </CardContent>
                    </Card>
                  </Grow>
                </Grid>
              ))}
            </Grid>
          </AccordionDetails>
        </Accordion>
      ))}
      <Drawer anchor="right" open={drawerOpen} onClose={() => setDrawerOpen(false)}>
        <Box width={320} p={2}>
          <Typography variant="h6">Cart</Typography>
            <List>
              {cart.map(item => (
                <ListItem
                  key={item.id}
                  sx={{ 
                    paddingLeft: 1,
                    '&:hover': {
                      backgroundColor: 'rgba(0, 0, 0, 0.04)'
                    }
                  }}
                >
                  <IconButton 
                    onClick={() => removeFromCart(item.id)}
                    sx={{ 
                      color: '#f44336',
                      marginRight: 1,
                      '&:hover': {
                        backgroundColor: 'rgba(244, 67, 54, 0.1)'
                      }
                    }}
                    size="small"
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                  <ListItemText 
                    primary={item.name} 
                    secondary={`₱${item.price}`}
                    sx={{ flexGrow: 1 }}
                  />
                  <Box display="flex" alignItems="center" gap={1} sx={{ marginLeft: 1 }}>
                    <IconButton 
                      onClick={() => changeQuantity(item.id, -1)}
                      size="small"
                      sx={{
                        backgroundColor: 'rgba(0, 0, 0, 0.1)',
                        '&:hover': {
                          backgroundColor: 'rgba(0, 0, 0, 0.2)'
                        }
                      }}
                    >
                      -
                    </IconButton>
                    <Typography 
                      sx={{ 
                        minWidth: '20px', 
                        textAlign: 'center',
                        fontWeight: 'bold'
                      }}
                    >
                      {item.quantity}
                    </Typography>
                    <IconButton 
                      onClick={() => changeQuantity(item.id, 1)}
                      size="small"
                      sx={{
                        backgroundColor: 'rgba(0, 0, 0, 0.1)',
                        '&:hover': {
                          backgroundColor: 'rgba(0, 0, 0, 0.2)'
                        }
                      }}
                    >
                      +
                    </IconButton>
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
            onClick={() => setCheckoutOpen(true)}
          >
            Checkout
          </Button>
        </Box>
      </Drawer>
      <Button
        variant="contained"
        color="secondary"
        sx={{ position: 'fixed', bottom: 32, right: 32 }}
        onClick={() => setDrawerOpen(true)}
        startIcon={<AddShoppingCartIcon />}
      >
        Checkout ({cart.length})
      </Button>
      <Dialog open={nameDialogOpen} onClose={() => {}} maxWidth="xs" fullWidth>
        <DialogTitle>Enter Customer Name</DialogTitle>
        <DialogContent>
          <TextField
            label="Customer Name"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            fullWidth
            autoFocus
            onKeyPress={(e) => {
              if (e.key === 'Enter' && customerName.trim()) {
                handleCustomerNameSubmit();
              }
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => navigate('/')}>Cancel</Button>
          <Button
            onClick={handleCustomerNameSubmit}
            variant="contained"
            disabled={!customerName.trim()}
          >
            Proceed
          </Button>
        </DialogActions>
      </Dialog>
      {/* Checkout Dialog */}
      <Dialog open={checkoutOpen} onClose={() => setCheckoutOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Checkout</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to checkout?</Typography>
          <Typography mt={2}>Total: ₱{total.toFixed(2)}</Typography>
          {checkoutStatus && (
            <Alert severity={checkoutStatus === 'success' ? 'success' : 'error'} sx={{ mt: 2 }}>
              {checkoutStatus === 'success' ? 'Checkout successful!' : checkoutStatus}
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCheckoutOpen(false)}>Cancel</Button>
          <Button onClick={handleCheckout} variant="contained" disabled={cart.length === 0 || checkoutStatus === 'success'}>Confirm</Button>
        </DialogActions>
      </Dialog>
      {/* Receipt Dialog */}
      <Dialog open={receiptOpen} onClose={handleReceiptClose} maxWidth="xs" fullWidth>
        <DialogTitle>Receipt</DialogTitle>
        <DialogContent ref={receiptRef}>
          {lastReceipt && (
            <Box>
              <Typography variant="h6">Receipt</Typography>
              <Typography>Date: {lastReceipt.date}</Typography>
              <Typography>Transaction ID: {lastReceipt.transactionId}</Typography>
              <Typography>Mode of Payment: {lastReceipt.mop}</Typography>
              <List>
                {lastReceipt.items.map(item => (
                  <ListItem key={item.id}>
                    <ListItemText primary={item.name} secondary={`Qty: ${item.quantity} x ₱${item.price} = ₱${(item.price * item.quantity).toFixed(2)}`} />
                  </ListItem>
                ))}
              </List>
              <Typography variant="subtitle1">Total: ₱{lastReceipt.total.toFixed(2)}</Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleReceiptClose}>Close</Button>
          <Button onClick={handlePrint} variant="contained">Print</Button>
        </DialogActions>
      </Dialog>
      
      {/* Add to Cart Notification */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={2000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        TransitionComponent={Zoom}
      >
        <Alert 
          onClose={() => setSnackbarOpen(false)} 
          severity="success" 
          sx={{ 
            width: '100%',
            '& .MuiAlert-icon': {
              fontSize: '1.5rem'
            }
          }}
          iconMapping={{
            success: <CheckCircleIcon fontSize="inherit" />
          }}
        >
          {addedProductName} added to checkout!
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default POS; 