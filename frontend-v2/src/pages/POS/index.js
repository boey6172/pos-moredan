import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Box,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Grid,
  Button,
  CircularProgress,
  Alert,
  Fab,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';
import axios from '../../api/axios';
import ProductCard from './components/ProductCard';
import BarcodeScanner from './components/BarcodeScanner';
import CartDrawer from './components/CartDrawer';
import CustomerNameDialog from './components/CustomerNameDialog';
import CheckoutDialog from './components/CheckoutDialog';
import ReceiptDialog from './components/ReceiptDialog';
import SnackbarNotification from './components/SnackbarNotification';
import { CATEGORY_ORDER } from './utils/constants';
import { groupProductsByCategory, calculateSubtotal, calculateTotal, handlePrintReceipt } from './utils/helpers';

const POS = () => {
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
  const [isMultiPayment, setIsMultiPayment] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [discount, setDiscount] = useState(0);
  const [showDiscount, setShowDiscount] = useState(false);
  const [addedToCartProductId, setAddedToCartProductId] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [addedProductName, setAddedProductName] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  const receiptRef = React.useRef(null);

  useEffect(() => {
    let mounted = true;

    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await axios.get('/api/products');

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

  const groupedProducts = useMemo(
    () => groupProductsByCategory(products, CATEGORY_ORDER),
    [products]
  );

  const subtotal = useMemo(() => calculateSubtotal(cart), [cart]);
  const total = useMemo(() => calculateTotal(subtotal, discount), [subtotal, discount]);

  const addToCart = useCallback(
    (product) => {
      if (!product.inventory || product.inventory <= 0) {
        setAddedProductName(`${product.name} out of stock`);
        setSnackbarSeverity('error');
        setAddedToCartProductId(null);
        setSnackbarOpen(true);
        return;
      }

      setCart((prev) => {
        const found = prev.find((p) => p.id === product.id);
        if (found) {
          if ((found.quantity || 1) >= product.inventory) {
            setAddedProductName(`${product.name} (No more stock available)`);
            setSnackbarSeverity('error');
            setSnackbarOpen(true);
            return prev;
          }

          return prev.map((p) =>
            p.id === product.id ? { ...p, quantity: (p.quantity || 1) + 1 } : p
          );
        }

        return [...prev, { ...product, quantity: 1 }];
      });

      setAddedToCartProductId(product.id);
      setAddedProductName(`${product.name} added to checkout!`);
      setSnackbarSeverity('success');
      setSnackbarOpen(true);

      setTimeout(() => {
        setAddedToCartProductId(null);
      }, 900);
    },
    []
  );

  const changeQuantity = useCallback((id, delta) => {
    setCart((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, quantity: Math.max(1, (item.quantity || 1) + delta) }
          : item
      )
    );
  }, []);

  const removeFromCart = useCallback((id) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const handleCheckout = useCallback(async () => {
    if (cart.length === 0) return;

    let finalPayments = [];
    let mopString = '';

    if (isMultiPayment) {
      const paidTotal = payments.reduce((sum, p) => sum + parseFloat(p.amount || 0), 0);
      if (paidTotal < total) {
        setCheckoutStatus('Payment amount is less than total. Please add more payments.');
        return;
      }
      finalPayments = payments;
      mopString = JSON.stringify(payments);
    } else {
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
        items: cart.map((item) => ({
          productId: item.id,
          quantity: item.quantity || 1,
        })),
        discount: parseFloat(discount) || 0,
        mop: mopString,
        customerName,
      });

      setCheckoutStatus('success');
      setLastReceipt({
        items: cart,
        subtotal,
        discount: parseFloat(discount) || 0,
        total,
        date: new Date().toLocaleString(),
        transactionId: res.data.transactionId || res.data.id || 'N/A',
        payments: finalPayments,
      });

      setCart([]);
      setCustomerName('');
      setPayments([]);
      setDiscount(0);
      setShowDiscount(false);
      setIsMultiPayment(false);
      setPaymentMethod('Cash');
      setDrawerOpen(false);
      setCheckoutOpen(false);
      setReceiptOpen(true);
    } catch (err) {
      const message = err?.response?.data?.message || err.message || 'Checkout failed';
      console.error('Checkout error', err);
      setCheckoutStatus(message);
    }
  }, [cart, payments, paymentMethod, isMultiPayment, customerName, total, discount, subtotal]);

  const handleReceiptClose = useCallback(() => {
    setReceiptOpen(false);
    setNameDialogOpen(true);
  }, []);

  const handleCustomerNameSubmit = useCallback(() => {
    if (customerName.trim()) {
      setNameDialogOpen(false);
      setCheckoutStatus(null);
    }
  }, [customerName]);

  const handlePrint = useCallback(() => {
    handlePrintReceipt(receiptRef);
  }, []);

  const handleBarcodeProductFound = useCallback(
    (product) => {
      addToCart(product);
    },
    [addToCart]
  );

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
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
    <Box>
      <Typography variant="h4" component="h1" sx={{ fontWeight: 600, mb: 3 }}>
        Point of Sale
      </Typography>

      <BarcodeScanner
        onProductFound={handleBarcodeProductFound}
        cart={cart}
        onQuantityIncrease={(id) => changeQuantity(id, 1)}
      />

      {Object.entries(groupedProducts).map(([categoryName, categoryProducts]) => (
        <Accordion key={categoryName} sx={{ mb: 2 }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6">
              {categoryName} ({categoryProducts.length} items)
            </Typography>
          </AccordionSummary>
          <AccordionDetails sx={{ px: { xs: 1, sm: 2 } }}>
            <Grid container spacing={{ xs: 1, sm: 2, md: 2 }}>
              {categoryProducts.map((product) => (
                <Grid item xs={6} sm={6} md={4} lg={3} key={product.id}>
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
        subtotal={subtotal}
        total={total}
        discount={discount}
        setDiscount={setDiscount}
        showDiscount={showDiscount}
        setShowDiscount={setShowDiscount}
        onCheckout={() => {
          setCheckoutOpen(true);
          setDrawerOpen(false);
        }}
        isMultiPayment={isMultiPayment}
        setIsMultiPayment={setIsMultiPayment}
        paymentMethod={paymentMethod}
        setPaymentMethod={setPaymentMethod}
      />

      <Fab
        color="secondary"
        sx={{ position: 'fixed', bottom: 32, right: 32 }}
        onClick={() => setDrawerOpen(true)}
        aria-label="Open cart"
      >
        <AddShoppingCartIcon sx={{ mr: 1 }} />
        {cart.length}
      </Fab>

      <CustomerNameDialog
        open={nameDialogOpen}
        name={customerName}
        setName={setCustomerName}
        onProceed={handleCustomerNameSubmit}
        onCancel={() => (window.location.href = '/moredansmv/dashboard')}
      />

      <CheckoutDialog
        open={checkoutOpen}
        onClose={() => setCheckoutOpen(false)}
        total={total}
        onConfirm={handleCheckout}
        status={checkoutStatus}
      />

      <ReceiptDialog
        open={receiptOpen}
        onClose={handleReceiptClose}
        lastReceipt={lastReceipt}
        onPrint={handlePrint}
        receiptRef={receiptRef}
      />

      <SnackbarNotification
        open={snackbarOpen}
        onClose={() => setSnackbarOpen(false)}
        message={addedProductName}
        severity={snackbarSeverity}
      />
    </Box>
  );
};

export default POS;

