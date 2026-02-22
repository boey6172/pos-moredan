import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { formatCurrency } from '../utils/helpers';

const SalesTrendChart = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <Paper sx={{ p: { xs: 2, md: 3 }, height: { xs: 200, md: 600 }, width: { xs: '100%', md: 600 } }}>
        <Typography variant="h6" mb={3}>
          Sales Trend
        </Typography>
        <Box display="flex" justifyContent="center" alignItems="center" height="100%">
          <Typography color="text.secondary">No sales data available</Typography>
        </Box>
      </Paper>
    );
  }

  return (
    <Paper sx={{ p: { xs: 2, md: 3 }, height: { xs: 200, md: 600 }, width: { xs: '100%', md: 600 }, display: 'flex', flexWrap: 'wrap' }}>
      <Typography variant="h6" mb={3}>
        Sales Trend
      </Typography>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} layout="horizontal">
          <CartesianGrid strokeDasharray="3 3" />
          <YAxis type="number" />
          <XAxis dataKey="period" type="category" />
          <Tooltip formatter={(value) => formatCurrency(value)} />
          <Legend />
          <Line
            type="monotone"
            dataKey="totalSales"
            stroke="#8884d8"
            name="Total Sales"
            strokeWidth={3}
          />
        </LineChart>
      </ResponsiveContainer>
    </Paper>
  );
};

export default SalesTrendChart;






