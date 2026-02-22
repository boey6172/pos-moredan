import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import { formatCurrency, calculateTotalSales, calculateTotalTransactions, calculateAverageSale } from '../utils/helpers';

const ReportSummary = ({ salesData }) => {
  const totalSales = calculateTotalSales(salesData);
  const totalTransactions = calculateTotalTransactions(salesData);
  const averageSale = calculateAverageSale(salesData);

  return (
    <Paper sx={{ p: { xs: 2, md: 3 }, height: { xs: 'auto', md: 600 }, width: '100%' }}>
      <Typography variant="h6" mb={3}>
        Summary
      </Typography>
      <Box>
        <Typography variant="h6" color="text.secondary" mb={2}>
          Total Sales: {formatCurrency(totalSales)}
        </Typography>
        <Typography variant="h6" color="text.secondary" mb={2}>
          Total Transactions: {totalTransactions}
        </Typography>
        <Typography variant="h6" color="text.secondary">
          Average Sale: {formatCurrency(averageSale)}
        </Typography>
      </Box>
    </Paper>
  );
};

export default ReportSummary;






