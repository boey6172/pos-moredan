import React from 'react';
import { Box, Paper, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
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
    <Box sx={{ width: '100%' }}>
      <SalesReportFilters
        period={period}
        startDate={startDate}
        endDate={endDate}
        onPeriodChange={onPeriodChange}
        onStartDateChange={onStartDateChange}
        onEndDateChange={onEndDateChange}
      />

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: { xs: 2, md: 3 }, width: '100%' }}>
        <Box sx={{ width: '100%', minHeight: 280 }}>
          <SalesTrendChart data={salesData} />
        </Box>
        <Box sx={{ width: '100%' }}>
          <ReportSummary salesData={salesData} />
        </Box>
      </Box>

      <Paper sx={{ mt: { xs: 3, md: 4 }, p: { xs: 1.5, sm: 2, md: 3 } }}>
        <Typography variant="h6" mb={{ xs: 2, md: 3 }} sx={{ fontSize: { xs: '1.1rem', md: '1.25rem' } }}>
          Sales Data
        </Typography>
        <TableContainer 
          sx={{ 
            overflowX: 'auto',
            '&::-webkit-scrollbar': {
              height: '8px',
            },
            '&::-webkit-scrollbar-track': {
              backgroundColor: 'rgba(0,0,0,0.05)',
            },
            '&::-webkit-scrollbar-thumb': {
              backgroundColor: 'rgba(0,0,0,0.2)',
              borderRadius: '4px',
            },
          }}
        >
          <Table sx={{ minWidth: 650 }}>
            <TableHead>
              <TableRow>
                <TableCell sx={{ 
                  fontSize: { xs: '0.75rem', sm: '0.875rem', md: '1.1rem' }, 
                  fontWeight: 'bold',
                  whiteSpace: 'nowrap',
                  px: { xs: 1, sm: 2, md: 3 }
                }}>
                  Period
                </TableCell>
                <TableCell sx={{ 
                  fontSize: { xs: '0.75rem', sm: '0.875rem', md: '1.1rem' }, 
                  fontWeight: 'bold',
                  whiteSpace: 'nowrap',
                  px: { xs: 1, sm: 2, md: 3 }
                }}>
                  Transactions
                </TableCell>
                <TableCell sx={{ 
                  fontSize: { xs: '0.75rem', sm: '0.875rem', md: '1.1rem' }, 
                  fontWeight: 'bold',
                  whiteSpace: 'nowrap',
                  px: { xs: 1, sm: 2, md: 3 }
                }}>
                  GCash Sales
                </TableCell>
                <TableCell sx={{ 
                  fontSize: { xs: '0.75rem', sm: '0.875rem', md: '1.1rem' }, 
                  fontWeight: 'bold',
                  whiteSpace: 'nowrap',
                  px: { xs: 1, sm: 2, md: 3 }
                }}>
                  Cash Sales
                </TableCell>
                <TableCell sx={{ 
                  fontSize: { xs: '0.75rem', sm: '0.875rem', md: '1.1rem' }, 
                  fontWeight: 'bold',
                  whiteSpace: 'nowrap',
                  px: { xs: 1, sm: 2, md: 3 }
                }}>
                  Total Sales
                </TableCell>
                <TableCell sx={{ 
                  fontSize: { xs: '0.75rem', sm: '0.875rem', md: '1.1rem' }, 
                  fontWeight: 'bold',
                  whiteSpace: 'nowrap',
                  px: { xs: 1, sm: 2, md: 3 }
                }}>
                  Average Sale
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {salesData.length > 0 ? (
                salesData.map((item, index) => (
                  <TableRow key={index} hover>
                    <TableCell sx={{ 
                      fontSize: { xs: '0.7rem', sm: '0.8rem', md: '1rem' },
                      px: { xs: 1, sm: 2, md: 3 }
                    }}>
                      {formatDate(item.period)}
                    </TableCell>
                    <TableCell sx={{ 
                      fontSize: { xs: '0.7rem', sm: '0.8rem', md: '1rem' },
                      px: { xs: 1, sm: 2, md: 3 }
                    }}>
                      {item.transactionCount || 0}
                    </TableCell>
                    <TableCell sx={{ 
                      fontSize: { xs: '0.7rem', sm: '0.8rem', md: '1rem' },
                      px: { xs: 1, sm: 2, md: 3 }
                    }}>
                      {formatCurrency(item.gcashSales || 0)}
                    </TableCell>
                    <TableCell sx={{ 
                      fontSize: { xs: '0.7rem', sm: '0.8rem', md: '1rem' },
                      px: { xs: 1, sm: 2, md: 3 }
                    }}>
                      {formatCurrency(item.cashSales || 0)}
                    </TableCell>
                    <TableCell sx={{ 
                      fontSize: { xs: '0.7rem', sm: '0.8rem', md: '1rem' },
                      px: { xs: 1, sm: 2, md: 3 }
                    }}>
                      {formatCurrency(item.totalSales)}
                    </TableCell>
                    <TableCell sx={{ 
                      fontSize: { xs: '0.7rem', sm: '0.8rem', md: '1rem' },
                      px: { xs: 1, sm: 2, md: 3 }
                    }}>
                      {formatCurrency(
                        item.transactionCount > 0 ? item.totalSales / item.transactionCount : 0
                      )}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                    <Typography color="text.secondary" sx={{ fontSize: { xs: '0.875rem', md: '1rem' } }}>
                      No sales data available
                    </Typography>
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






