import React, { useRef, useEffect, useCallback, useState } from 'react';
import {
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  InputAdornment,
  CircularProgress,
} from '@mui/material';
import QrCodeScannerIcon from '@mui/icons-material/QrCodeScanner';
import SearchIcon from '@mui/icons-material/Search';
import axios from '../../../api/axios';

const BarcodeScanner = ({ onProductFound, cart, onQuantityIncrease }) => {
  const [barcodeInput, setBarcodeInput] = useState('');
  const [searching, setSearching] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    if (inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, []);

  const searchProductByBarcode = useCallback(
    async (barcode) => {
      if (!barcode.trim()) return;

      setSearching(true);
      try {
        const res = await axios.get(`/api/products/sku/${encodeURIComponent(barcode.trim())}`);

        if (res.data) {
          const existingItem = cart.find((item) => item.id === res.data.id);
          if (existingItem) {
            onQuantityIncrease(res.data.id);
          } else {
            onProductFound(res.data);
          }
          setBarcodeInput('');
        }
      } catch (err) {
        console.error('Barcode search failed', err);
        setBarcodeInput('');
      } finally {
        setSearching(false);
      }
    },
    [cart, onProductFound, onQuantityIncrease]
  );

  const handleKeyPress = useCallback(
    (e) => {
      if (e.key === 'Enter' && barcodeInput.trim()) {
        searchProductByBarcode(barcodeInput);
      }
    },
    [barcodeInput, searchProductByBarcode]
  );

  const handleSubmit = useCallback(() => {
    if (barcodeInput.trim()) {
      searchProductByBarcode(barcodeInput);
    }
  }, [barcodeInput, searchProductByBarcode]);

  return (
    <Paper elevation={2} sx={{ p: 2, mb: 3, backgroundColor: 'background.default' }}>
      <Typography variant="h6" mb={2} display="flex" alignItems="center" gap={1}>
        <QrCodeScannerIcon color="primary" />
        Barcode Scanner
      </Typography>
      <Box display="flex" gap={2} alignItems="center">
        <TextField
          ref={inputRef}
          label="Scan or Enter Barcode"
          value={barcodeInput}
          onChange={(e) => setBarcodeInput(e.target.value)}
          onKeyPress={handleKeyPress}
          fullWidth
          placeholder="Scan barcode or enter SKU manually"
          disabled={searching}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <QrCodeScannerIcon />
              </InputAdornment>
            ),
            endAdornment: searching && (
              <InputAdornment position="end">
                <CircularProgress size={20} />
              </InputAdornment>
            ),
          }}
          autoFocus
          aria-label="Barcode scanner input"
        />
        <Button
          variant="contained"
          color="primary"
          onClick={handleSubmit}
          disabled={!barcodeInput.trim() || searching}
          startIcon={<SearchIcon />}
          sx={{ minWidth: 120 }}
        >
          {searching ? 'Searching...' : 'Search'}
        </Button>
      </Box>
      <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
        💡 Connect your barcode scanner and scan directly, or manually enter the product SKU.
      </Typography>
    </Paper>
  );
};

export default BarcodeScanner;






