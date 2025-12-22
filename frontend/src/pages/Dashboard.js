import React, { useState, useEffect } from "react";
import {
  Box, Grid, Card, CardContent, Typography, TextField, Button,
  Alert, Chip, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Dialog, DialogTitle, DialogContent, DialogActions, CircularProgress,
  LinearProgress
} from "@mui/material";
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, Area, AreaChart
} from 'recharts';
import axios from '../api/axios';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningIcon from '@mui/icons-material/Warning';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import ReceiptIcon from '@mui/icons-material/Receipt';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';

export default function Dashboard() {
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
      const today = new Date().toISOString().split("T")[0]; // format YYYY-MM-DD

      // Fetch starting cash - reset to null first to ensure fresh check each day
      const startingCashRes = await axios.get("/api/startingcash", {
        params: { date: today },
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });

      // Reset starting cash - only set if we have data for TODAY
      if (startingCashRes.data && startingCashRes.data.length >= 1) {
        // Verify the date matches today
        const cashDate = new Date(startingCashRes.data[0].createdAt).toISOString().split("T")[0];
        if (cashDate === today) {
          setStartingCash(parseFloat(startingCashRes.data[0].starting || 0));
        } else {
          // Data is from a different day, reset to null
          setStartingCash(null);
        }
      } else {
        // No starting cash found for today - reset to null
        setStartingCash(null);
      }

      // Fetch dashboard metrics
      const metricsRes = await axios.get("/api/dashboard/metrics", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });

      setMetrics(metricsRes.data);
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
      // On error, reset to null to show input form
      setStartingCash(null);
    } finally {
      setLoading(false);
    }
  };
 
  useEffect(() => {
    // Store current date to detect changes
    let lastCheckedDate = new Date().toISOString().split("T")[0];
    
    // Initial fetch
    fetchData();
    
    // Refresh every 30 seconds
    const refreshInterval = setInterval(() => {
      const currentDate = new Date().toISOString().split("T")[0];
      
      // If date changed, reset starting cash before fetching
      if (currentDate !== lastCheckedDate) {
        setStartingCash(null);
        lastCheckedDate = currentDate;
      }
      
      fetchData();
    }, 30000);
    
    return () => clearInterval(refreshInterval);
  }, []);

  const handleSaveStartingCash = async () => {
    try {
      await axios.post(
        "/api/startingcash",
        { starting: parseFloat(cash) },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
        }
      );
      await fetchData();
      setCash('');
    } catch (err) {
      console.error("Error saving starting cash:", err);
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
      await axios.post(
        "/api/reconciliation/close",
        {
          actualCash: parseFloat(actualCash),
          notes: reconciliationNotes
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
        }
      );
      setReconciliationOpen(false);
      setActualCash('');
      setReconciliationNotes('');
      await fetchData();
    } catch (err) {
      console.error("Error closing day:", err);
      alert(err.response?.data?.message || 'Failed to close day');
    } finally {
      setReconciling(false);
    }
  };

  if (loading && !metrics) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  const formatCurrency = (amount) => {
    return `₱${(amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };
  
  return (
    <Box p={{ xs: 2, md: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Dashboard</Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={fetchData}
          disabled={loading}
        >
          Refresh
        </Button>
      </Box>

      {/* Starting Cash Section */}
      <Card sx={{ mb: 3 }}>
      <CardContent>
          {startingCash !== null ? (
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Box>
                <Typography variant="h6" color="text.secondary">
                  Starting Cash
                </Typography>
                <Typography variant="h4" color="primary">
                  {formatCurrency(startingCash)}
          </Typography>
              </Box>
              <CheckCircleIcon color="success" sx={{ fontSize: 40 }} />
            </Box>
        ) : (
            <Box>
            <Typography variant="h6" gutterBottom>
                Enter Starting Cash for Today
            </Typography>
              <Box display="flex" gap={2} alignItems="center">
            <TextField
              type="number"
              label="Starting Cash"
              value={cash}
              onChange={(e) => setCash(e.target.value)}
                  sx={{ flex: 1 }}
            />
            <Button
              variant="contained"
              color="primary"
                  onClick={handleSaveStartingCash}
              disabled={!cash}
            >
              Save
            </Button>
              </Box>
            </Box>
          )}
        </CardContent>
      </Card>

      {metrics && (
        <>
          {/* Sales Summary Cards */}
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Box>
                      <Typography color="text.secondary" gutterBottom>
                        Today's Sales
                      </Typography>
                      <Typography variant="h5">
                        {formatCurrency(metrics.today?.totalSales || 0)}
                      </Typography>
                    </Box>
                    <AttachMoneyIcon color="primary" sx={{ fontSize: 40 }} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Box>
                      <Typography color="text.secondary" gutterBottom>
                        Transactions
                      </Typography>
                      <Typography variant="h5">
                        {metrics.today?.totalTransactions || 0}
                      </Typography>
                    </Box>
                    <ReceiptIcon color="success" sx={{ fontSize: 40 }} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Box>
                      <Typography color="text.secondary" gutterBottom>
                        Avg Transaction
                      </Typography>
                      <Typography variant="h5">
                        {formatCurrency(metrics.today?.averageTransaction || 0)}
                      </Typography>
                    </Box>
                    <TrendingUpIcon color="info" sx={{ fontSize: 40 }} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Box>
                      <Typography color="text.secondary" gutterBottom>
                        Expected Cash
                      </Typography>
                      <Typography variant="h5">
                        {formatCurrency(metrics.cash?.expectedCash || 0)}
                      </Typography>
                    </Box>
                    <CheckCircleIcon color={metrics.cash?.isReconciled ? "success" : "warning"} sx={{ fontSize: 40 }} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Box>
                      <Typography color="text.secondary" gutterBottom>
                        Today's Expenses
                      </Typography>
                      <Typography variant="h5" color="error">
                        {formatCurrency(metrics.today?.totalExpenses || 0)}
                      </Typography>
                    </Box>
                    <AttachMoneyIcon color="error" sx={{ fontSize: 40 }} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Payment Methods Breakdown */}
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Sales by Payment Method
                  </Typography>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={[
                      { name: 'Cash', amount: metrics.today?.cashSales || 0 },
                      { name: 'GCash', amount: metrics.today?.gcashSales || 0 },
                      { name: 'Card', amount: metrics.today?.cardSales || 0 },
                      { name: 'Other', amount: metrics.today?.otherSales || 0 },
                    ]}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip formatter={(value) => formatCurrency(value)} />
                      <Legend />
                      <Bar dataKey="amount" fill="#8884d8" />
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
                      <Tooltip formatter={(value) => formatCurrency(value)} />
                      <Legend />
                      <Area type="monotone" dataKey="sales" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Cash Reconciliation Section */}
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
                <Grid item xs={12} md={3}>
                  <Paper sx={{ p: 2, bgcolor: 'background.default' }}>
                    <Typography color="text.secondary">Starting Cash</Typography>
                    <Typography variant="h6">{formatCurrency(metrics.cash?.startingCash || 0)}</Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12} md={3}>
                  <Paper sx={{ p: 2, bgcolor: 'background.default' }}>
                    <Typography color="text.secondary">Cash Sales</Typography>
                    <Typography variant="h6">{formatCurrency(metrics.today?.cashSales || 0)}</Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12} md={3}>
                  <Paper sx={{ p: 2, bgcolor: 'background.default' }}>
                    <Typography color="text.secondary">Expenses</Typography>
                    <Typography variant="h6" color="error">
                      -{formatCurrency(metrics.today?.totalExpenses || 0)}
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12} md={3}>
                  <Paper sx={{ p: 2, bgcolor: 'background.default' }}>
                    <Typography color="text.secondary">Expected Cash</Typography>
                    <Typography variant="h6">{formatCurrency(metrics.cash?.expectedCash || 0)}</Typography>
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
                      <Typography color="text.secondary">Actual Cash</Typography>
                      <Typography variant="h6">{formatCurrency(metrics.cash?.actualCash || 0)}</Typography>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Typography color="text.secondary">Difference</Typography>
                      <Typography
                        variant="h6"
                        color={metrics.cash?.difference >= 0 ? 'success.main' : 'error.main'}
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
                            <Chip label={tx.mop} size="small" />
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
                          <Typography color="text.secondary">No transactions today</Typography>
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
      <Dialog open={reconciliationOpen} onClose={() => !reconciling && setReconciliationOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Close Day - Cash Reconciliation</DialogTitle>
        <DialogContent>
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Starting Cash: {formatCurrency(metrics?.cash?.startingCash || 0)}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Cash Sales: {formatCurrency(metrics?.today?.cashSales || 0)}
            </Typography>
            <Typography variant="body2" color="error">
              Expenses: -{formatCurrency(metrics?.today?.totalExpenses || 0)}
            </Typography>
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
          />

          <TextField
            fullWidth
            multiline
            rows={3}
            label="Notes (Optional)"
            value={reconciliationNotes}
            onChange={(e) => setReconciliationNotes(e.target.value)}
            margin="normal"
          />

          {actualCash && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Difference:
              </Typography>
              <Typography
                variant="h6"
                color={
                  (parseFloat(actualCash || 0) - (metrics?.cash?.expectedCash || 0)) >= 0
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

          {reconciling && <LinearProgress sx={{ mt: 2 }} />}
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
}
