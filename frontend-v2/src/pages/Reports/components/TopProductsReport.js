import React, { useMemo } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  TextField,
} from '@mui/material';
import TopProductsBarChart from './TopProductsBarChart';
import TopProductsPieChart from './TopProductsPieChart';

const TopProductsReport = ({
  topProducts,
  limit,
  onLimitChange,
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
}) => {
  const itemCount = topProducts.length;

  const limitOptions = useMemo(() => {
    const options = [];
    for (let n = 5; n <= itemCount; n += 5) options.push(n);
    if (itemCount > 0 && (options.length === 0 || options[options.length - 1] !== itemCount)) {
      options.push('all');
    }
    if (options.length === 0) options.push('all');
    return options;
  }, [itemCount]);

  const displayLimit = limit === 'all' ? itemCount : Math.min(Number(limit) || 5, itemCount);
  const displayedProducts = useMemo(
    () => topProducts.slice(0, displayLimit),
    [topProducts, displayLimit]
  );

  return (
    <Box>
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          flexWrap: 'wrap',
          alignItems: { xs: 'stretch', sm: 'center' },
          gap: 2,
          mb: 3,
        }}
      >
        <Typography variant="h5" sx={{ alignSelf: 'center' }}>
          Top Products
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center' }}>
          <TextField
            size="small"
            label="Start date"
            type="date"
            value={startDate || ''}
            onChange={(e) => onStartDateChange(e.target.value)}
            InputLabelProps={{ shrink: true }}
            sx={{ minWidth: 160 }}
          />
          <TextField
            size="small"
            label="End date"
            type="date"
            value={endDate || ''}
            onChange={(e) => onEndDateChange(e.target.value)}
            InputLabelProps={{ shrink: true }}
            sx={{ minWidth: 160 }}
          />
          <FormControl sx={{ minWidth: 120 }} size="small">
            <InputLabel>Limit</InputLabel>
            <Select
              value={limitOptions.includes(limit) ? limit : (limitOptions[0] ?? 'all')}
              label="Limit"
              onChange={(e) => onLimitChange(e.target.value === 'all' ? 'all' : Number(e.target.value))}
            >
              {limitOptions.map((opt) => (
                <MenuItem key={opt} value={opt}>
                  {opt === 'all' ? 'All' : `Top ${opt}`}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      </Box>

      <Grid container spacing={{ xs: 2, md: 4 }}>
        <Grid item xs={12} lg={6}>
          <TopProductsBarChart data={displayedProducts} />
        </Grid>
        <Grid item xs={12} lg={6}>
          <TopProductsPieChart data={displayedProducts} />
        </Grid>
      </Grid>

      <Paper sx={{ mt: 4, p: { xs: 2, md: 3 } }}>
        <Typography variant="h6" mb={3}>
          Top Products Details
        </Typography>
        <TableContainer sx={{ overflowX: 'auto' }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontSize: { xs: '0.9rem', md: '1.1rem' }, fontWeight: 'bold' }}>
                  Product Name
                </TableCell>
                <TableCell sx={{ fontSize: { xs: '0.9rem', md: '1.1rem' }, fontWeight: 'bold' }}>
                  SKU
                </TableCell>
                <TableCell sx={{ fontSize: { xs: '0.9rem', md: '1.1rem' }, fontWeight: 'bold' }}>
                  Quantity Sold
                </TableCell>
                <TableCell sx={{ fontSize: { xs: '0.9rem', md: '1.1rem' }, fontWeight: 'bold' }}>
                  Current Stock
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {displayedProducts.length > 0 ? (
                displayedProducts.map((item) => (
                  <TableRow key={item.productId} hover>
                    <TableCell sx={{ fontSize: { xs: '0.8rem', md: '1rem' } }}>{item.name}</TableCell>
                    <TableCell sx={{ fontSize: { xs: '0.8rem', md: '1rem' } }}>
                      {item.Product?.sku || 'N/A'}
                    </TableCell>
                    <TableCell sx={{ fontSize: { xs: '0.8rem', md: '1rem' } }}>
                      {item.totalSold || 0}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={item.Product?.inventory || 0}
                        color={item.Product?.inventory < 10 ? 'error' : 'success'}
                        size="small"
                      />
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} align="center">
                    <Typography color="text.secondary">No product data available</Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
};

export default TopProductsReport;






