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
      <Paper
        sx={{
          p: { xs: 2, md: 3 },
          width: '100%',
          height: 'min(400px, 45vh)',
          minHeight: 200,
          boxSizing: 'border-box',
        }}
      >
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
    <Paper
      sx={{
        p: { xs: 2, md: 3 },
        width: '100%',
        height: 'min(500px, 45vh)',
        minHeight: 280,
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Typography variant="h6" mb={3} sx={{ flexShrink: 0 }}>
        Sales Trend
      </Typography>
      <Box sx={{ flex: 1, minHeight: 0 }}>
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
      </Box>
    </Paper>
  );
};

export default SalesTrendChart;






