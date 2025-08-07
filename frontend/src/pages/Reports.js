import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Alert,
  CircularProgress,
  Tabs,
  Tab
} from '@mui/material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import axios from '../api/axios';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

const Reports = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Sales Report State
  const [salesData, setSalesData] = useState([]);
  const [salesPeriod, setSalesPeriod] = useState('daily');

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
  }, [activeTab, salesPeriod, topProductsLimit, lowStockThreshold]);

  const fetchSalesReport = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await axios.get(`/api/reports/sales?period=${salesPeriod}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      // Format the data for charts
      const formattedData = response.data.map(item => ({
        ...item,
        totalSales: parseFloat(item.totalSales || 0),
        transactionCount: parseInt(item.transactionCount || 0)
      }));
      setSalesData(formattedData);
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
      const response = await axios.get(`/api/reports/top-products?limit=${topProductsLimit}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      // Format the data for charts
      const formattedData = response.data.map(item => ({
        ...item,
        totalSold: parseInt(item.totalSold || 0),
        name: item.Product?.name || 'Unknown' // Add name for chart compatibility
      }));
      setTopProducts(formattedData);
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
      const response = await axios.get(`/api/reports/low-stock?threshold=${lowStockThreshold}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setLowStockProducts(response.data);
    } catch (err) {
      setError('Failed to fetch low stock products');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  const SalesReport = () => (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5">Sales Report</Typography>
        <FormControl sx={{ minWidth: 120 }}>
          <InputLabel>Period</InputLabel>
          <Select
            value={salesPeriod}
            label="Period"
            onChange={(e) => setSalesPeriod(e.target.value)}
          >
            <MenuItem value="daily">Daily</MenuItem>
            <MenuItem value="weekly">Weekly</MenuItem>
            <MenuItem value="monthly">Monthly</MenuItem>
          </Select>
        </FormControl>
      </Box>

      <Grid container spacing={4}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, height: 600, width: '100%' }}>
            <Typography variant="h6" mb={3}>Sales Trend</Typography>
            {salesData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%" minWidth={1000}>
                <LineChart data={salesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="period" />
                  <YAxis />
                  <Tooltip formatter={(value) => formatCurrency(value)} />
                  <Legend />
                  <Line type="monotone" dataKey="totalSales" stroke="#8884d8" name="Total Sales" strokeWidth={3} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <Box display="flex" justifyContent="center" alignItems="center" height="100%">
                <Typography color="textSecondary">No sales data available</Typography>
              </Box>
            )}
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, height: 600 }}>
            <Typography variant="h6" mb={3}>Summary</Typography>
            <Box>
              <Typography variant="h6" color="textSecondary" mb={2}>
                Total Sales: {formatCurrency(salesData.reduce((sum, item) => sum + parseFloat(item.totalSales || 0), 0))}
              </Typography>
              <Typography variant="h6" color="textSecondary" mb={2}>
                Total Transactions: {salesData.reduce((sum, item) => sum + parseInt(item.transactionCount || 0), 0)}
              </Typography>
              <Typography variant="h6" color="textSecondary">
                Average Sale: {formatCurrency(
                  salesData.length > 0 
                    ? salesData.reduce((sum, item) => sum + parseFloat(item.totalSales || 0), 0) / 
                      Math.max(1, salesData.reduce((sum, item) => sum + parseInt(item.transactionCount || 0), 0))
                    : 0
                )}
              </Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      <Paper sx={{ mt: 4, p: 3 }}>
        <Typography variant="h6" mb={3}>Sales Data</Typography>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontSize: '1.1rem', fontWeight: 'bold' }}>Period</TableCell>
                <TableCell sx={{ fontSize: '1.1rem', fontWeight: 'bold' }}>Transactions</TableCell>
                <TableCell sx={{ fontSize: '1.1rem', fontWeight: 'bold' }}>Total Sales</TableCell>
                <TableCell sx={{ fontSize: '1.1rem', fontWeight: 'bold' }}>Average Sale</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {salesData.length > 0 ? (
                salesData.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell sx={{ fontSize: '1rem' }}>{formatDate(item.period)}</TableCell>
                    <TableCell sx={{ fontSize: '1rem' }}>{item.transactionCount || 0}</TableCell>
                    <TableCell sx={{ fontSize: '1rem' }}>{formatCurrency(item.totalSales)}</TableCell>
                    <TableCell sx={{ fontSize: '1rem' }}>
                      {formatCurrency(item.transactionCount > 0 ? item.totalSales / item.transactionCount : 0)}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} align="center">
                    <Typography color="textSecondary">No sales data available</Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );

  const TopProductsReport = () => (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5">Top Products</Typography>
        <FormControl sx={{ minWidth: 120 }}>
          <InputLabel>Limit</InputLabel>
          <Select
            value={topProductsLimit}
            label="Limit"
            onChange={(e) => setTopProductsLimit(e.target.value)}
          >
            <MenuItem value={5}>Top 5</MenuItem>
            <MenuItem value={10}>Top 10</MenuItem>
            <MenuItem value={15}>Top 15</MenuItem>
            <MenuItem value={20}>Top 20</MenuItem>
          </Select>
        </FormControl>
      </Box>

      <Grid container spacing={4}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: 600 }}>
            <Typography variant="h6" mb={3}>Top Products by Quantity Sold</Typography>
            {topProducts.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%" minWidth={1000}>
                <BarChart data={topProducts}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="totalSold" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <Box display="flex" justifyContent="center" alignItems="center" height="100%">
                <Typography color="textSecondary">No product data available</Typography>
              </Box>
            )}
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: 600 }}>
            <Typography variant="h6" mb={3}>Top Products Distribution</Typography>
            {topProducts.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%" minWidth={500}>
                <PieChart>
                  <Pie
                    data={topProducts}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={150}
                    fill="#8884d8"
                    dataKey="totalSold"
                  >
                    {topProducts.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <Box display="flex" justifyContent="center" alignItems="center" height="100%">
                <Typography color="textSecondary">No product data available</Typography>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>

      <Paper sx={{ mt: 4, p: 3 }}>
        <Typography variant="h6" mb={3}>Top Products Details</Typography>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontSize: '1.1rem', fontWeight: 'bold' }}>Product Name</TableCell>
                <TableCell sx={{ fontSize: '1.1rem', fontWeight: 'bold' }}>SKU</TableCell>
                <TableCell sx={{ fontSize: '1.1rem', fontWeight: 'bold' }}>Quantity Sold</TableCell>
                <TableCell sx={{ fontSize: '1.1rem', fontWeight: 'bold' }}>Current Stock</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {topProducts.length > 0 ? (
                topProducts.map((item) => (
                  <TableRow key={item.productId}>
                    <TableCell sx={{ fontSize: '1rem' }}>{item.name}</TableCell>
                    <TableCell sx={{ fontSize: '1rem' }}>{item.Product?.sku || 'N/A'}</TableCell>
                    <TableCell sx={{ fontSize: '1rem' }}>{item.totalSold || 0}</TableCell>
                    <TableCell>
                      <Chip 
                        label={item.Product?.inventory || 0} 
                        color={item.Product?.inventory < 10 ? 'error' : 'success'}
                        size="medium"
                      />
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} align="center">
                    <Typography color="textSecondary">No product data available</Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );

  const LowStockReport = () => (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5">Low Stock Report</Typography>
        <FormControl sx={{ minWidth: 120 }}>
          <InputLabel>Threshold</InputLabel>
          <Select
            value={lowStockThreshold}
            label="Threshold"
            onChange={(e) => setLowStockThreshold(e.target.value)}
          >
            <MenuItem value={5}>5</MenuItem>
            <MenuItem value={10}>10</MenuItem>
            <MenuItem value={15}>15</MenuItem>
            <MenuItem value={20}>20</MenuItem>
          </Select>
        </FormControl>
      </Box>

      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" mb={3}>Low Stock Products (≤ {lowStockThreshold})</Typography>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontSize: '1.1rem', fontWeight: 'bold' }}>Product Name</TableCell>
                <TableCell sx={{ fontSize: '1.1rem', fontWeight: 'bold' }}>SKU</TableCell>
                <TableCell sx={{ fontSize: '1.1rem', fontWeight: 'bold' }}>Category</TableCell>
                <TableCell sx={{ fontSize: '1.1rem', fontWeight: 'bold' }}>Current Stock</TableCell>
                <TableCell sx={{ fontSize: '1.1rem', fontWeight: 'bold' }}>Price</TableCell>
                <TableCell sx={{ fontSize: '1.1rem', fontWeight: 'bold' }}>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {lowStockProducts.length > 0 ? (
                lowStockProducts.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell sx={{ fontSize: '1rem' }}>{product.name}</TableCell>
                    <TableCell sx={{ fontSize: '1rem' }}>{product.sku}</TableCell>
                    <TableCell sx={{ fontSize: '1rem' }}>{product.Category?.name || 'N/A'}</TableCell>
                    <TableCell>
                      <Chip 
                        label={product.inventory || 0} 
                        color={product.inventory === 0 ? 'error' : 'warning'}
                        size="medium"
                      />
                    </TableCell>
                    <TableCell sx={{ fontSize: '1rem' }}>{formatCurrency(product.price)}</TableCell>
                    <TableCell>
                      <Chip 
                        label={product.inventory === 0 ? 'Out of Stock' : 'Low Stock'} 
                        color={product.inventory === 0 ? 'error' : 'warning'}
                        size="medium"
                      />
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    <Typography color="textSecondary">No low stock products found</Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  return (
    <Box p={4}>
      <Typography variant="h3" mb={4}>Reports</Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Paper sx={{ mb: 4 }}>
        <Tabs value={activeTab} onChange={handleTabChange} aria-label="report tabs" sx={{ '& .MuiTab-root': { fontSize: '1.1rem', padding: '16px 24px' } }}>
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
          {activeTab === 0 && <SalesReport />}
          {activeTab === 1 && <TopProductsReport />}
          {activeTab === 2 && <LowStockReport />}
        </Box>
      )}
    </Box>
  );
};

export default Reports; 