import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { CHART_COLORS } from '../utils/constants';

const TopProductsPieChart = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <Paper sx={{ p: { xs: 2, md: 3 }, height: { xs: 400, md: 600 } }}>
        <Typography variant="h6" mb={3}>
          Top Products Distribution
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
        Top Products Distribution
      </Typography>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            outerRadius="80%"
            fill="#8884d8"
            dataKey="totalSold"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    </Paper>
  );
};

export default TopProductsPieChart;






