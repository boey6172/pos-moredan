import React from 'react';
import {
  Box,
  Typography,
  Paper,
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
import { LOW_STOCK_THRESHOLDS } from '../utils/constants';
import { formatCurrency } from '../utils/helpers';

const LowStockReport = ({ lowStockProducts, threshold, onThresholdChange }) => {
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
        <Typography variant="h5">Low Stock Report</Typography>
        <FormControl sx={{ minWidth: 120 }} size="small">
          <InputLabel>Threshold</InputLabel>
          <Select
            value={threshold}
            label="Threshold"
            onChange={(e) => onThresholdChange(e.target.value)}
          >
            {LOW_STOCK_THRESHOLDS.map((thresholdValue) => (
              <MenuItem key={thresholdValue} value={thresholdValue}>
                {thresholdValue}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      <Paper sx={{ p: { xs: 2, md: 3 } }}>
        <Typography variant="h6" mb={3}>
          Low Stock Products (≤ {threshold})
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
                  Category
                </TableCell>
                <TableCell sx={{ fontSize: { xs: '0.9rem', md: '1.1rem' }, fontWeight: 'bold' }}>
                  Current Stock
                </TableCell>
                <TableCell sx={{ fontSize: { xs: '0.9rem', md: '1.1rem' }, fontWeight: 'bold' }}>
                  Price
                </TableCell>
                <TableCell sx={{ fontSize: { xs: '0.9rem', md: '1.1rem' }, fontWeight: 'bold' }}>
                  Status
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {lowStockProducts.length > 0 ? (
                lowStockProducts.map((product) => (
                  <TableRow key={product.id} hover>
                    <TableCell sx={{ fontSize: { xs: '0.8rem', md: '1rem' } }}>
                      {product.name}
                    </TableCell>
                    <TableCell sx={{ fontSize: { xs: '0.8rem', md: '1rem' } }}>
                      {product.sku || 'N/A'}
                    </TableCell>
                    <TableCell sx={{ fontSize: { xs: '0.8rem', md: '1rem' } }}>
                      {product.Category?.name || 'N/A'}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={product.inventory || 0}
                        color={product.inventory === 0 ? 'error' : 'warning'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell sx={{ fontSize: { xs: '0.8rem', md: '1rem' } }}>
                      {formatCurrency(product.price)}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={product.inventory === 0 ? 'Out of Stock' : 'Low Stock'}
                        color={product.inventory === 0 ? 'error' : 'warning'}
                        size="small"
                      />
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    <Typography color="text.secondary">No low stock products found</Typography>
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

export default LowStockReport;






