import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Tabs,
  Tab,
} from '@mui/material';
import ProductManagement from './components/ProductManagement';
import InventoryHistory from './components/InventoryHistory';

const Inventory = () => {
  const [activeTab, setActiveTab] = useState(0);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  return (
    <Box>
      <Typography variant="h4" component="h1" sx={{ fontWeight: 600, mb: 4 }}>
        Inventory
      </Typography>

      <Paper sx={{ mb: 4 }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          aria-label="inventory tabs"
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            '& .MuiTab-root': {
              fontSize: { xs: '0.9rem', md: '1.1rem' },
              padding: { xs: '12px 16px', md: '16px 24px' },
              minWidth: { xs: 'auto', md: '160px' },
            },
          }}
        >
          <Tab label="Product Management" />
          <Tab label="Inventory History" />
        </Tabs>
      </Paper>

      <Box>
        {activeTab === 0 && <ProductManagement />}
        {activeTab === 1 && <InventoryHistory />}
      </Box>
    </Box>
  );
};

export default Inventory;

