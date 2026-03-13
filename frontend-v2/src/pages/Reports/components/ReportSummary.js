import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import { formatCurrency, calculateTotalSales, calculateTotalTransactions, calculateAverageSale } from '../utils/helpers';

const ReportSummary = ({ salesData }) => {
  const totalSales = calculateTotalSales(salesData);
  const totalTransactions = calculateTotalTransactions(salesData);
  const averageSale = calculateAverageSale(salesData);

  return (
    <Paper
      sx={{
        p: { xs: 2, md: 3 },
        width: '100%',
        maxWidth: '100%',
        boxSizing: 'border-box',
      }}
    >
      <Typography variant="h6" mb={3}>
        Summary
      </Typography>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center' }}>
        <Typography variant="h6" color="text.secondary" mb={0}>
          Total Sales: {formatCurrency(totalSales)}
        </Typography>
        <Typography variant="h6" color="text.secondary" mb={0}>
          Total Transactions: {totalTransactions}
        </Typography>
        <Typography variant="h6" color="text.secondary" mb={0}>
          Average Sale: {formatCurrency(averageSale)}
        </Typography>
      </Box>
    </Paper>
  );
};

export default ReportSummary;






