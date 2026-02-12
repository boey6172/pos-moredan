import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Tabs, Tab, Alert, CircularProgress } from '@mui/material';
import axios from '../../api/axios';
import SalesReport from './components/SalesReport';
import TopProductsReport from './components/TopProductsReport';
import LowStockReport from './components/LowStockReport';
import { formatSalesData, formatTopProductsData } from './utils/helpers';

const Reports = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Sales Report State
  const [salesData, setSalesData] = useState([]);
  const [salesPeriod, setSalesPeriod] = useState('daily');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Top Products State
  const [topProducts, setTopProducts] = useState([]);
  const [topProductsLimit, setTopProductsLimit] = useState(5);

  // Low Stock State
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [lowStockThreshold, setLowStockThreshold] = useState(10);

  useEffect(() => {
    if (activeTab === 0) {
      fetchSalesReport();
    } else if (activeTab === 1) {
      fetchTopProducts();
    } else if (activeTab === 2) {
      fetchLowStock();
    }
  }, [activeTab, salesPeriod, topProductsLimit, lowStockThreshold, startDate, endDate]);

  const fetchSalesReport = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await axios.get(
        `/api/reports/sales?period=${salesPeriod}&startDate=${startDate}&endDate=${endDate}`
      );
      setSalesData(formatSalesData(response.data));
    } catch (err) {
      setError('Failed to fetch sales report');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchTopProducts = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await axios.get(`/api/reports/top-products?limit=${topProductsLimit}`);
      setTopProducts(formatTopProductsData(response.data));
    } catch (err) {
      setError('Failed to fetch top products');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchLowStock = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await axios.get(`/api/reports/low-stock?threshold=${lowStockThreshold}`);
      setLowStockProducts(response.data);
    } catch (err) {
      setError('Failed to fetch low stock products');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  return (
    <Box>
      <Typography variant="h4" component="h1" sx={{ fontWeight: 600, mb: 4 }}>
        Reports
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Paper sx={{ mb: 4 }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          aria-label="report tabs"
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            '& .MuiTab-root': {
              fontSize: { xs: '0.9rem', md: '1.1rem' },
              padding: { xs: '12px 16px', md: '16px 24px' },
              minWidth: { xs: 'auto', md: '160px' },
            },
          }}
        >
          <Tab label="Sales Report" />
          <Tab label="Top Products" />
          <Tab label="Low Stock" />
        </Tabs>
      </Paper>

      {loading && (
        <Box display="flex" justifyContent="center" p={4}>
          <CircularProgress size={60} />
        </Box>
      )}

      {!loading && (
        <Box>
          {activeTab === 0 && (
            <SalesReport
              salesData={salesData}
              period={salesPeriod}
              startDate={startDate}
              endDate={endDate}
              onPeriodChange={setSalesPeriod}
              onStartDateChange={setStartDate}
              onEndDateChange={setEndDate}
            />
          )}
          {activeTab === 1 && (
            <TopProductsReport
              topProducts={topProducts}
              limit={topProductsLimit}
              onLimitChange={setTopProductsLimit}
            />
          )}
          {activeTab === 2 && (
            <LowStockReport
              lowStockProducts={lowStockProducts}
              threshold={lowStockThreshold}
              onThresholdChange={setLowStockThreshold}
            />
          )}
        </Box>
      )}
    </Box>
  );
};

export default Reports;






