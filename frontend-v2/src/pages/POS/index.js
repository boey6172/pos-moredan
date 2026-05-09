import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Box,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Grid,
  Button,
  Alert,
  Fab,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { POSProductSkeleton } from '../../components/PageSkeleton';
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
import {
  groupProductsByCategory,
  calculateSubtotal,
  calculateTotal,
  handlePrintReceipt,
  computeChangeDue,
  roundMoney,
} from './utils/helpers';

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
  const [cashTendered, setCashTendered] = useState('');
  const [discount, setDiscount] = useState(0);
  const [showDiscount, setShowDiscount] = useState(false);
  const [addedToCartProductId, setAddedToCartProductId] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [addedProductName, setAddedProductName] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [productFilter, setProductFilter] = useState('');
  const [sortByName, setSortByName] = useState('');
  const [sortByStock, setSortByStock] = useState('');
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

  const filteredProducts = useMemo(() => {
    const trimmed = (productFilter || '').trim();
    let list = products;
    if (trimmed.length >= 2) {
      const lower = trimmed.toLowerCase();
      list = products.filter(
        (p) =>
          (p.name && p.name.toLowerCase().includes(lower)) ||
          (p.barcode && String(p.barcode).toLowerCase().includes(lower))
      );
    }
    return list;
  }, [products, productFilter]);

  const sortedProducts = useMemo(() => {
    const list = [...filteredProducts];
    const stockVal = (p) => Number(p.inventory ?? 0);
    const nameVal = (p) => (p.name || '').toLowerCase();
    if (!sortByStock && !sortByName) return list;
    list.sort((a, b) => {
      if (sortByStock === 'desc') {
        const d = stockVal(b) - stockVal(a);
        if (d !== 0) return d;
      } else if (sortByStock === 'asc') {
        const d = stockVal(a) - stockVal(b);
        if (d !== 0) return d;
      }
      if (sortByName === 'asc') return nameVal(a).localeCompare(nameVal(b));
      if (sortByName === 'desc') return nameVal(b).localeCompare(nameVal(a));
      return 0;
    });
    return list;
  }, [filteredProducts, sortByName, sortByStock]);

  const groupedProducts = useMemo(
    () => groupProductsByCategory(sortedProducts, CATEGORY_ORDER),
    [sortedProducts]
  );

  const subtotal = useMemo(() => calculateSubtotal(cart), [cart]);
  const total = useMemo(() => calculateTotal(subtotal, discount), [subtotal, discount]);

  useEffect(() => {
    if (isMultiPayment || paymentMethod !== 'Cash') {
      setCashTendered('');
    }
  }, [isMultiPayment, paymentMethod]);

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
    if (checkoutLoading) return; // Prevent double-click
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
      if (paymentMethod === 'Cash') {
        const tender = parseFloat(String(cashTendered).trim());
        if (!Number.isFinite(tender) || tender < roundMoney(total) - 0.001) {
          setCheckoutStatus('Cash received is less than the total. Please enter how much the customer paid.');
          return;
        }
      }
      finalPayments = [{ method: paymentMethod, amount: total }];
      mopString = JSON.stringify(finalPayments);
    }

    setCheckoutStatus(null);
    setCheckoutLoading(true);

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
      const tenderNum =
        !isMultiPayment && paymentMethod === 'Cash'
          ? parseFloat(String(cashTendered).trim())
          : NaN;
      const changeForReceipt =
        Number.isFinite(tenderNum) && paymentMethod === 'Cash'
          ? computeChangeDue(tenderNum, total)
          : undefined;

      setLastReceipt({
        items: cart,
        subtotal,
        discount: parseFloat(discount) || 0,
        total,
        date: new Date().toLocaleString(),
        transactionId: res.data.transactionId || res.data.id || 'N/A',
        payments: finalPayments,
        cashReceived: Number.isFinite(tenderNum) ? tenderNum : undefined,
        changeDue: changeForReceipt,
        customerName: customerName.trim() || undefined,
      });

      setCart([]);
      setCustomerName('');
      setPayments([]);
      setDiscount(0);
      setShowDiscount(false);
      setIsMultiPayment(false);
      setPaymentMethod('Cash');
      setCashTendered('');
      setDrawerOpen(false);
      setCheckoutOpen(false);
      setReceiptOpen(true);
    } catch (err) {
      const message = err?.response?.data?.message || err.message || 'Checkout failed';
      console.error('Checkout error', err);
      setCheckoutStatus(message);
    } finally {
      setCheckoutLoading(false);
    }
  }, [
    cart,
    payments,
    paymentMethod,
    isMultiPayment,
    customerName,
    total,
    discount,
    subtotal,
    checkoutLoading,
    cashTendered,
  ]);

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
      <Box>
        <POSProductSkeleton />
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

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center', mb: 2 }}>
        <TextField
          size="small"
          placeholder="Filter products (2+ characters)"
          value={productFilter}
          onChange={(e) => setProductFilter(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="action" />
              </InputAdornment>
            ),
          }}
          sx={{ minWidth: 220, maxWidth: 400 }}
          inputProps={{ 'aria-label': 'Filter products by name or barcode' }}
        />
        <FormControl size="small" sx={{ minWidth: 140 }}>
          <InputLabel id="sort-name-label">Sort by name</InputLabel>
          <Select
            labelId="sort-name-label"
            value={sortByName}
            label="Sort by name"
            onChange={(e) => setSortByName(e.target.value)}
          >
            <MenuItem value="">Default</MenuItem>
            <MenuItem value="asc">A–Z</MenuItem>
            <MenuItem value="desc">Z–A</MenuItem>
          </Select>
        </FormControl>
        <FormControl size="small" sx={{ minWidth: 160 }}>
          <InputLabel id="sort-stock-label">Sort by stock</InputLabel>
          <Select
            labelId="sort-stock-label"
            value={sortByStock}
            label="Sort by stock"
            onChange={(e) => setSortByStock(e.target.value)}
          >
            <MenuItem value="">Default</MenuItem>
            <MenuItem value="desc">High to low</MenuItem>
            <MenuItem value="asc">Low to high</MenuItem>
          </Select>
        </FormControl>
      </Box>

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
        cashTendered={cashTendered}
        setCashTendered={setCashTendered}
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
        onCancel={() => (window.location.href = '/unohub/dashboard')}
      />

      <CheckoutDialog
        open={checkoutOpen}
        onClose={() => setCheckoutOpen(false)}
        total={total}
        onConfirm={handleCheckout}
        status={checkoutStatus}
        loading={checkoutLoading}
        paymentMethod={paymentMethod}
        isMultiPayment={isMultiPayment}
        cashTendered={cashTendered}
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

