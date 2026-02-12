import React from 'react';
import { Box, Typography, Card, CardContent } from '@mui/material';
import AssessmentIcon from '@mui/icons-material/Assessment';

const Reports = () => {
  return (
    <Box>
      <Typography variant="h4" component="h1" sx={{ fontWeight: 600, mb: 3 }}>
        Reports
      </Typography>
      <Card>
        <CardContent>
          <Box display="flex" flexDirection="column" alignItems="center" py={8}>
            <AssessmentIcon sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary">
              Reports & Analytics
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              This page will be implemented with comprehensive reporting features.
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Reports;






