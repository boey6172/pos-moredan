import React from 'react';
import { Box, Typography, Card, CardContent } from '@mui/material';
import PointOfSaleIcon from '@mui/icons-material/PointOfSale';

const POS = () => {
  return (
    <Box>
      <Typography variant="h4" component="h1" sx={{ fontWeight: 600, mb: 3 }}>
        Point of Sale
      </Typography>
      <Card>
        <CardContent>
          <Box display="flex" flexDirection="column" alignItems="center" py={8}>
            <PointOfSaleIcon sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary">
              POS Interface
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              This page will be implemented with the full POS functionality.
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default POS;






