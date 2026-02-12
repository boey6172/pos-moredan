import React from 'react';
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
} from '@mui/material';
import TopProductsBarChart from './TopProductsBarChart';
import TopProductsPieChart from './TopProductsPieChart';
import { TOP_PRODUCTS_LIMITS } from '../utils/constants';

const TopProductsReport = ({ topProducts, limit, onLimitChange }) => {
  return (
    <Box>
      <Box
        display="flex"
        flexDirection={{ xs: 'column', sm: 'row' }}
        justifyContent="space-between"
        alignItems={{ xs: 'stretch', sm: 'center' }}
        gap={2}
        mb={3}
      >
        <Typography variant="h5">Top Products</Typography>
        <FormControl sx={{ minWidth: 120 }} size="small">
          <InputLabel>Limit</InputLabel>
          <Select value={limit} label="Limit" onChange={(e) => onLimitChange(e.target.value)}>
            {TOP_PRODUCTS_LIMITS.map((limitValue) => (
              <MenuItem key={limitValue} value={limitValue}>
                Top {limitValue}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      <Grid container spacing={{ xs: 2, md: 4 }}>
        <Grid item xs={12} lg={6}>
          <TopProductsBarChart data={topProducts} />
        </Grid>
        <Grid item xs={12} lg={6}>
          <TopProductsPieChart data={topProducts} />
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
              {topProducts.length > 0 ? (
                topProducts.map((item) => (
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






