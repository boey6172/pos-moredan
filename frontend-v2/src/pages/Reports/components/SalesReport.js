import React from 'react';
import { Box, Grid, Paper, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import SalesTrendChart from './SalesTrendChart';
import ReportSummary from './ReportSummary';
import SalesReportFilters from './SalesReportFilters';
import { formatCurrency, formatDate } from '../utils/helpers';

const SalesReport = ({
  salesData,
  period,
  startDate,
  endDate,
  onPeriodChange,
  onStartDateChange,
  onEndDateChange,
}) => {
  return (
    <Box>
      <SalesReportFilters
        period={period}
        startDate={startDate}
        endDate={endDate}
        onPeriodChange={onPeriodChange}
        onStartDateChange={onStartDateChange}
        onEndDateChange={onEndDateChange}
      />

      <Grid container spacing={{ xs: 1, md: 2 }}>
        <Grid item xs={12} lg={8}>
          <SalesTrendChart data={salesData} />
        </Grid>
        <Grid item xs={12} lg={4}>
          <ReportSummary salesData={salesData} />
        </Grid>
      </Grid>

      <Paper sx={{ mt: 4, p: { xs: 2, md: 3 } }}>
        <Typography variant="h6" mb={3}>
          Sales Data
        </Typography>
        <TableContainer sx={{ overflowX: 'auto' }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontSize: { xs: '0.9rem', md: '1.1rem' }, fontWeight: 'bold' }}>
                  Period
                </TableCell>
                <TableCell sx={{ fontSize: { xs: '0.9rem', md: '1.1rem' }, fontWeight: 'bold' }}>
                  Transactions
                </TableCell>
                <TableCell sx={{ fontSize: { xs: '0.9rem', md: '1.1rem' }, fontWeight: 'bold' }}>
                  GCash Sales
                </TableCell>
                <TableCell sx={{ fontSize: { xs: '0.9rem', md: '1.1rem' }, fontWeight: 'bold' }}>
                  Cash Sales
                </TableCell>
                <TableCell sx={{ fontSize: { xs: '0.9rem', md: '1.1rem' }, fontWeight: 'bold' }}>
                  Total Sales
                </TableCell>
                <TableCell sx={{ fontSize: { xs: '0.9rem', md: '1.1rem' }, fontWeight: 'bold' }}>
                  Average Sale
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {salesData.length > 0 ? (
                salesData.map((item, index) => (
                  <TableRow key={index} hover>
                    <TableCell sx={{ fontSize: { xs: '0.8rem', md: '1rem' } }}>
                      {formatDate(item.period)}
                    </TableCell>
                    <TableCell sx={{ fontSize: { xs: '0.8rem', md: '1rem' } }}>
                      {item.transactionCount || 0}
                    </TableCell>
                    <TableCell sx={{ fontSize: { xs: '0.8rem', md: '1rem' } }}>
                      {formatCurrency(item.gcashSales || 0)}
                    </TableCell>
                    <TableCell sx={{ fontSize: { xs: '0.8rem', md: '1rem' } }}>
                      {formatCurrency(item.cashSales || 0)}
                    </TableCell>
                    <TableCell sx={{ fontSize: { xs: '0.8rem', md: '1rem' } }}>
                      {formatCurrency(item.totalSales)}
                    </TableCell>
                    <TableCell sx={{ fontSize: { xs: '0.8rem', md: '1rem' } }}>
                      {formatCurrency(
                        item.transactionCount > 0 ? item.totalSales / item.transactionCount : 0
                      )}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    <Typography color="text.secondary">No sales data available</Typography>
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

export default SalesReport;






