import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

const TopProductsBarChart = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <Paper sx={{ p: { xs: 2, md: 3 }, height: { xs: 400, md: 600 } }}>
        <Typography variant="h6" mb={3}>
          Top Products by Quantity Sold
        </Typography>
        <Box display="flex" justifyContent="center" alignItems="center" height="100%">
          <Typography color="text.secondary">No product data available</Typography>
        </Box>
      </Paper>
    );
  }

  return (
    <Paper sx={{ p: { xs: 2, md: 3 }, height: { xs: 400, md: 600 } }}>
      <Typography variant="h6" mb={3}>
        Top Products by Quantity Sold
      </Typography>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="totalSold" fill="#8884d8" />
        </BarChart>
      </ResponsiveContainer>
    </Paper>
  );
};

export default TopProductsBarChart;






