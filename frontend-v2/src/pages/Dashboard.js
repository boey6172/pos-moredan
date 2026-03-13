import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Alert,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  LinearProgress,
  IconButton,
  Tooltip,
} from '@mui/material';
import { DashboardSkeleton } from '../components/PageSkeleton';
import {
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import axios from '../api/axios';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningIcon from '@mui/icons-material/Warning';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import ReceiptIcon from '@mui/icons-material/Receipt';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import RefreshIcon from '@mui/icons-material/Refresh';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import RemoveIcon from '@mui/icons-material/Remove';

// Today's date in Philippine time (matches backend) so dashboard is correct regardless of server/client timezone
const getTodayInPH = () =>
  new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Manila' });

const Dashboard = () => {
  const [cash, setCash] = useState('');
  const [startingCash, setStartingCash] = useState(null);
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reconciliationOpen, setReconciliationOpen] = useState(false);
  const [actualCash, setActualCash] = useState('');
  const [reconciliationNotes, setReconciliationNotes] = useState('');
  const [reconciling, setReconciling] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const today = getTodayInPH();

      const startingCashRes = await axios.get('/api/startingcash', {
        params: { date: today },
      });

      if (startingCashRes.data && startingCashRes.data.length >= 1) {
        const cashDate = new Date(startingCashRes.data[0].createdAt).toLocaleDateString('en-CA', { timeZone: 'Asia/Manila' });
        if (cashDate === today) {
          setStartingCash(parseFloat(startingCashRes.data[0].starting || 0));
        } else {
          setStartingCash(null);
        }
      } else {
        setStartingCash(null);
      }

      const metricsRes = await axios.get('/api/dashboard/metrics');
      setMetrics(metricsRes.data);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setStartingCash(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let lastCheckedDate = getTodayInPH();
    fetchData();

    const refreshInterval = setInterval(() => {
      const currentDate = getTodayInPH();
      if (currentDate !== lastCheckedDate) {
        setStartingCash(null);
        lastCheckedDate = currentDate;
      }
      fetchData();
    }, 30000);

    return () => clearInterval(refreshInterval);
  }, []);

  const handleSaveStartingCash = async () => {
    const valueToSave = cash !== '' ? cash : (startingCash != null ? String(startingCash) : '');
    if (!valueToSave) return;
    try {
      await axios.post('/api/startingcash', { starting: parseFloat(valueToSave) });
      await fetchData();
      setCash('');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save starting cash');
    }
  };

  const handleCloseDay = async () => {
    if (!actualCash || actualCash === '') {
      alert('Please enter actual cash amount');
      return;
    }

    try {
      setReconciling(true);
      await axios.post('/api/reconciliation/close', {
        actualCash: parseFloat(actualCash),
        notes: reconciliationNotes,
      });
      setReconciliationOpen(false);
      setActualCash('');
      setReconciliationNotes('');
      await fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to close day');
    } finally {
      setReconciling(false);
    }
  };

  const formatCurrency = (amount) => {
    return `₱${(amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  if (loading && !metrics) {
    return <DashboardSkeleton />;
  }

  const StatCard = ({ title, value, icon: Icon, color = 'primary', loading: cardLoading }) => (
    <Card
      sx={{
        height: '100%',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
        '&:hover': {
          transform: 'translateY(-4px)',
        },
      }}
    >
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start">
          <Box>
            <Typography color="text.secondary" variant="body2" gutterBottom>
              {title}
            </Typography>
            {cardLoading ? (
              <CircularProgress size={24} />
            ) : (
              <Typography variant="h4" component="div" sx={{ fontWeight: 600, mt: 1 }}>
                {value}
              </Typography>
            )}
          </Box>
          <Icon color={color} sx={{ fontSize: 48, opacity: 0.8 }} />
        </Box>
      </CardContent>
    </Card>
  );

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 600 }}>
          Dashboard
        </Typography>
        <Tooltip title="Refresh data">
          <IconButton onClick={fetchData} disabled={loading} aria-label="Refresh dashboard">
            <RefreshIcon />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Starting Cash Section - always editable */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box>
            <Typography variant="h6" gutterBottom>
              {startingCash !== null ? 'Starting Cash for Today' : 'Enter Starting Cash for Today'}
            </Typography>
            <Box display="flex" gap={2} alignItems="center" flexWrap="wrap">
              <TextField
                type="number"
                label="Starting Cash"
                value={cash !== '' ? cash : (startingCash != null ? String(startingCash) : '')}
                onChange={(e) => setCash(e.target.value)}
                sx={{ flex: 1, minWidth: 200 }}
                inputProps={{ step: '0.01', min: '0' }}
                aria-label="Starting cash amount"
              />
              <Button
                variant="contained"
                color="primary"
                onClick={handleSaveStartingCash}
                disabled={!(cash !== '' ? cash : (startingCash != null ? String(startingCash) : ''))}
              >
                Save
              </Button>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {metrics && (
        <>
          {/* Sales Summary Cards */}
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Today's Sales"
                value={formatCurrency(metrics.today?.totalSales || 0)}
                icon={AttachMoneyIcon}
                color="primary"
                loading={loading}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Transactions"
                value={metrics.today?.totalTransactions || 0}
                icon={ReceiptIcon}
                color="success"
                loading={loading}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Avg Transaction"
                value={formatCurrency(metrics.today?.averageTransaction || 0)}
                icon={TrendingUpIcon}
                color="info"
                loading={loading}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Expected Cash"
                value={formatCurrency(metrics.cash?.expectedCash || 0)}
                icon={AccountBalanceWalletIcon}
                color={metrics.cash?.isReconciled ? 'success' : 'warning'}
                loading={loading}
              />
            </Grid>
          </Grid>

          {/* Expenses Card */}
          {metrics.today?.totalExpenses > 0 && (
            <Grid container spacing={3} sx={{ mb: 3 }}>
              <Grid item xs={12}>
                <Card>
                  <CardContent>
                    <Box display="flex" alignItems="center" gap={1}>
                      <RemoveIcon color="error" />
                      <Typography variant="h6">Today's Expenses</Typography>
                      <Typography variant="h6" color="error" sx={{ ml: 'auto', fontWeight: 600 }}>
                        {formatCurrency(metrics.today?.totalExpenses || 0)}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          )}

          {/* Charts */}
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Sales by Payment Method
                  </Typography>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart
                      data={[
                        { name: 'Cash', amount: metrics.today?.cashSales || 0 },
                        { name: 'GCash', amount: metrics.today?.gcashSales || 0 },
                        { name: 'Card', amount: metrics.today?.cardSales || 0 },
                        { name: 'Other', amount: metrics.today?.otherSales || 0 },
                      ]}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <RechartsTooltip formatter={(value) => formatCurrency(value)} />
                      <Legend />
                      <Bar dataKey="amount" fill="var(--mui-palette-primary-main)" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Sales by Hour
                  </Typography>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={metrics.salesByHour || []}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="hour" />
                      <YAxis />
                      <RechartsTooltip formatter={(value) => formatCurrency(value)} />
                      <Legend />
                      <Area
                        type="monotone"
                        dataKey="sales"
                        stroke="var(--mui-palette-primary-main)"
                        fill="var(--mui-palette-primary-main)"
                        fillOpacity={0.6}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Cash Reconciliation */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6">Cash Reconciliation</Typography>
                {!metrics.cash?.isReconciled && (
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => setReconciliationOpen(true)}
                  >
                    Close Day
                  </Button>
                )}
              </Box>

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={3}>
                  <Paper sx={{ p: 2, bgcolor: 'background.default' }}>
                    <Typography color="text.secondary" variant="body2">
                      Starting Cash
                    </Typography>
                    <Typography variant="h6" sx={{ mt: 0.5 }}>
                      {formatCurrency(metrics.cash?.startingCash || 0)}
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Paper sx={{ p: 2, bgcolor: 'background.default' }}>
                    <Typography color="text.secondary" variant="body2">
                      Cash Sales
                    </Typography>
                    <Typography variant="h6" sx={{ mt: 0.5 }}>
                      {formatCurrency(metrics.today?.cashSales || 0)}
                    </Typography>
                  </Paper>
                </Grid>
                {metrics.today?.totalExpenses > 0 && (
                  <Grid item xs={12} sm={6} md={3}>
                    <Paper sx={{ p: 2, bgcolor: 'background.default' }}>
                      <Typography color="text.secondary" variant="body2">
                        Expenses
                      </Typography>
                      <Typography variant="h6" color="error" sx={{ mt: 0.5 }}>
                        -{formatCurrency(metrics.today?.totalExpenses || 0)}
                      </Typography>
                    </Paper>
                  </Grid>
                )}
                <Grid item xs={12} sm={6} md={3}>
                  <Paper sx={{ p: 2, bgcolor: 'background.default' }}>
                    <Typography color="text.secondary" variant="body2">
                      Expected Cash
                    </Typography>
                    <Typography variant="h6" sx={{ mt: 0.5 }}>
                      {formatCurrency(metrics.cash?.expectedCash || 0)}
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>

              {metrics.cash?.isReconciled && (
                <Box mt={2}>
                  <Alert severity="success" icon={<CheckCircleIcon />}>
                    Day has been closed
                  </Alert>
                  <Grid container spacing={2} sx={{ mt: 1 }}>
                    <Grid item xs={12} md={6}>
                      <Typography color="text.secondary" variant="body2">
                        Actual Cash
                      </Typography>
                      <Typography variant="h6" sx={{ mt: 0.5 }}>
                        {formatCurrency(metrics.cash?.actualCash || 0)}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Typography color="text.secondary" variant="body2">
                        Difference
                      </Typography>
                      <Typography
                        variant="h6"
                        color={metrics.cash?.difference >= 0 ? 'success.main' : 'error.main'}
                        sx={{ mt: 0.5 }}
                      >
                        {formatCurrency(metrics.cash?.difference || 0)}
                      </Typography>
                    </Grid>
                  </Grid>
                </Box>
              )}
            </CardContent>
          </Card>

          {/* Low Stock Alerts */}
          {metrics.alerts?.lowStockCount > 0 && (
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Box display="flex" alignItems="center" gap={1} mb={2}>
                  <WarningIcon color="warning" />
                  <Typography variant="h6">
                    Low Stock Alert ({metrics.alerts.lowStockCount} products)
                  </Typography>
                </Box>
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Product</TableCell>
                        <TableCell>Category</TableCell>
                        <TableCell>Stock</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {metrics.alerts.lowStockProducts.map((product) => (
                        <TableRow key={product.id}>
                          <TableCell>{product.name}</TableCell>
                          <TableCell>{product.category}</TableCell>
                          <TableCell>
                            <Chip
                              label={product.inventory}
                              color={product.inventory === 0 ? 'error' : 'warning'}
                              size="small"
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          )}

          {/* Recent Transactions */}
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Recent Transactions
              </Typography>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Customer</TableCell>
                      <TableCell>Amount</TableCell>
                      <TableCell>Payment</TableCell>
                      <TableCell>Cashier</TableCell>
                      <TableCell>Time</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {metrics.recentTransactions?.length > 0 ? (
                      metrics.recentTransactions.map((tx) => (
                        <TableRow key={tx.id}>
                          <TableCell>{tx.customerName}</TableCell>
                          <TableCell>{formatCurrency(tx.total)}</TableCell>
                          <TableCell>
                            {tx.payments && Array.isArray(tx.payments) ? (
                              <Box>
                                {tx.payments.map((p, idx) => (
                                  <Chip
                                    key={idx}
                                    label={`${p.method}: ${formatCurrency(p.amount)}`}
                                    size="small"
                                    sx={{ mr: 0.5, mb: 0.5 }}
                                  />
                                ))}
                              </Box>
                            ) : (
                              <Chip label={tx.mop || 'N/A'} size="small" />
                            )}
                          </TableCell>
                          <TableCell>{tx.cashier}</TableCell>
                          <TableCell>
                            {new Date(tx.createdAt).toLocaleTimeString()}
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} align="center">
                          <Typography color="text.secondary">
                            No transactions today
                          </Typography>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </>
      )}

      {/* Reconciliation Dialog */}
      <Dialog
        open={reconciliationOpen}
        onClose={() => !reconciling && setReconciliationOpen(false)}
        maxWidth="sm"
        fullWidth
        aria-labelledby="reconciliation-dialog-title"
      >
        <DialogTitle id="reconciliation-dialog-title">Close Day - Cash Reconciliation</DialogTitle>
        <DialogContent>
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Starting Cash: {formatCurrency(metrics?.cash?.startingCash || 0)}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Cash Sales: {formatCurrency(metrics?.today?.cashSales || 0)}
            </Typography>
            {metrics?.today?.totalExpenses > 0 && (
              <Typography variant="body2" color="error">
                Expenses: -{formatCurrency(metrics?.today?.totalExpenses || 0)}
              </Typography>
            )}
            <Typography variant="h6" sx={{ mt: 1 }}>
              Expected Cash: {formatCurrency(metrics?.cash?.expectedCash || 0)}
            </Typography>
          </Box>

          <TextField
            fullWidth
            type="number"
            label="Actual Cash Count"
            value={actualCash}
            onChange={(e) => setActualCash(e.target.value)}
            margin="normal"
            required
            inputProps={{ step: '0.01', min: '0' }}
            aria-label="Actual cash count"
          />

          <TextField
            fullWidth
            multiline
            rows={3}
            label="Notes (Optional)"
            value={reconciliationNotes}
            onChange={(e) => setReconciliationNotes(e.target.value)}
            margin="normal"
            aria-label="Reconciliation notes"
          />

          {actualCash && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Difference:
              </Typography>
              <Typography
                variant="h6"
                color={
                  parseFloat(actualCash || 0) - (metrics?.cash?.expectedCash || 0) >= 0
                    ? 'success.main'
                    : 'error.main'
                }
              >
                {formatCurrency(
                  parseFloat(actualCash || 0) - (metrics?.cash?.expectedCash || 0)
                )}
              </Typography>
            </Box>
          )}

          {reconciling && <LinearProgress sx={{ mt: 2 }} aria-label="Reconciling" />}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setReconciliationOpen(false)} disabled={reconciling}>
            Cancel
          </Button>
          <Button
            onClick={handleCloseDay}
            variant="contained"
            disabled={reconciling || !actualCash}
          >
            {reconciling ? 'Closing...' : 'Close Day'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Dashboard;






