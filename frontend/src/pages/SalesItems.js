import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Button,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  CircularProgress,
  Alert
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import axios from '../api/axios';

const SalesItems = () => {
  const [salesData, setSalesData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const today = new Date().toISOString().split('T')[0];
  const [fromDate, setFromDate] = useState(today);
  const [toDate, setToDate] = useState(today);

  useEffect(() => {
    fetchSalesItems();
  }, []);

  const fetchSalesItems = async () => {
    setLoading(true);
    setError('');
    try {
      const params = {};
      if (fromDate) params.startDate = fromDate;
      if (toDate) params.endDate = toDate;

      const response = await axios.get('/api/reports/sales-items', {
        params,
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setSalesData(response.data);
    } catch (err) {
      setError('Failed to fetch sales items');
      console.error(err);
      setSalesData([]);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return `₱${(amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const calculateGrandTotal = () => {
    return salesData.reduce((sum, category) => sum + category.totalRevenue, 0);
  };

  const calculateGrandQuantity = () => {
    return salesData.reduce((sum, category) => sum + category.totalQuantity, 0);
  };

  return (
    <Box p={{ xs: 2, md: 3 }}>
      {/* Header and Filters */}
      <Box 
        display="flex" 
        flexDirection={{ xs: 'column', md: 'row' }} 
        justifyContent="space-between" 
        alignItems={{ xs: 'stretch', md: 'center' }} 
        gap={2} 
        mb={3}
      >
        <Typography variant={{ xs: 'h5', md: 'h4' }}>Sales Items by Category</Typography>
        <Box display="flex" gap={2} flexWrap="wrap" alignItems="center">
          <TextField 
            label="From Date" 
            type="date" 
            size="small" 
            value={fromDate} 
            onChange={(e) => setFromDate(e.target.value)} 
            InputLabelProps={{ shrink: true }} 
          />
          <TextField 
            label="To Date" 
            type="date" 
            size="small" 
            value={toDate} 
            onChange={(e) => setToDate(e.target.value)} 
            InputLabelProps={{ shrink: true }} 
          />
          <Button variant="contained" onClick={fetchSalesItems}>
            Apply Filter
          </Button>
          <Button 
            variant="outlined" 
            onClick={() => {
              setFromDate('');
              setToDate('');
              fetchSalesItems();
            }}
          >
            Clear
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Summary Cards */}
      {!loading && salesData.length > 0 && (
        <Box display="flex" gap={2} mb={3} flexWrap="wrap">
          <Paper sx={{ p: 2, flex: 1, minWidth: 200 }}>
            <Typography variant="body2" color="text.secondary">Total Categories</Typography>
            <Typography variant="h5">{salesData.length}</Typography>
          </Paper>
          <Paper sx={{ p: 2, flex: 1, minWidth: 200 }}>
            <Typography variant="body2" color="text.secondary">Total Items Sold</Typography>
            <Typography variant="h5">{calculateGrandQuantity()}</Typography>
          </Paper>
          <Paper sx={{ p: 2, flex: 1, minWidth: 200 }}>
            <Typography variant="body2" color="text.secondary">Total Revenue</Typography>
            <Typography variant="h5">{formatCurrency(calculateGrandTotal())}</Typography>
          </Paper>
        </Box>
      )}

      {/* Loading State */}
      {loading && (
        <Box display="flex" justifyContent="center" p={4}>
          <CircularProgress size={60} />
        </Box>
      )}

      {/* Sales Items by Category */}
      {!loading && salesData.length > 0 && (
        <Box>
          {salesData.map((category) => (
            <Accordion key={category.categoryId || category.categoryName} defaultExpanded sx={{ mb: 2 }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Box display="flex" justifyContent="space-between" alignItems="center" width="100%" pr={2}>
                  <Typography variant="h6">{category.categoryName}</Typography>
                  <Box display="flex" gap={2}>
                    <Chip 
                      label={`${category.totalQuantity} items`} 
                      color="primary" 
                      variant="outlined"
                    />
                    <Chip 
                      label={formatCurrency(category.totalRevenue)} 
                      color="success" 
                      variant="outlined"
                    />
                  </Box>
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 'bold' }}>Product Name</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>SKU</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }} align="right">Quantity</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }} align="right">Unit Price</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }} align="right">Subtotal</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>Transaction Date</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>Customer</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>MOP</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {category.items.map((item) => (
                        <TableRow key={item.id} hover>
                          <TableCell>{item.productName}</TableCell>
                          <TableCell>{item.sku || 'N/A'}</TableCell>
                          <TableCell align="right">{item.quantity}</TableCell>
                          <TableCell align="right">{formatCurrency(item.price)}</TableCell>
                          <TableCell align="right">{formatCurrency(item.subtotal)}</TableCell>
                          <TableCell>{formatDate(item.transactionDate)}</TableCell>
                          <TableCell>{item.customerName || 'N/A'}</TableCell>
                          <TableCell>
                            <Chip 
                              label={item.mop || 'Cash'} 
                              size="small" 
                              color={item.mop === 'GCash' ? 'primary' : 'default'}
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                      <TableRow sx={{ backgroundColor: 'action.hover' }}>
                        <TableCell colSpan={2} sx={{ fontWeight: 'bold' }}>
                          Category Total
                        </TableCell>
                        <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                          {category.totalQuantity}
                        </TableCell>
                        <TableCell colSpan={2} />
                        <TableCell colSpan={3} align="right" sx={{ fontWeight: 'bold' }}>
                          {formatCurrency(category.totalRevenue)}
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
              </AccordionDetails>
            </Accordion>
          ))}
        </Box>
      )}

      {/* Empty State */}
      {!loading && salesData.length === 0 && (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary">
            No sales items found for the selected date range
          </Typography>
        </Paper>
      )}
    </Box>
  );
};

export default SalesItems;

