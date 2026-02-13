import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  TextField,
  MenuItem,
  Alert,
} from '@mui/material';
import axios from '../../../api/axios';

const InventoryHistory = () => {
  const [movements, setMovements] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filterDate, setFilterDate] = useState(new Date().toISOString().split('T')[0]);
  const [filterType, setFilterType] = useState('');
  const [error, setError] = useState('');

  const fetchMovements = async () => {
    try {
      setLoading(true);
      setError('');
      const params = {};
      if (filterDate) {
        const start = new Date(filterDate);
        start.setHours(0, 0, 0, 0);
        const end = new Date(filterDate);
        end.setHours(23, 59, 59, 999);
        params.startDate = start.toISOString();
        params.endDate = end.toISOString();
      }
      if (filterType) {
        params.type = filterType;
      }
      const res = await axios.get('/api/inventory/movements', { params });
      setMovements(res.data);
    } catch (err) {
      console.error('Error fetching inventory movements:', err);
      setError('Failed to fetch inventory movements');
      setMovements([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMovements();
  }, [filterDate, filterType]);

  return (
    <Box>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
        flexWrap="wrap"
        gap={2}
      >
        <TextField
          type="date"
          label="Filter by Date"
          value={filterDate}
          onChange={(e) => setFilterDate(e.target.value)}
          InputLabelProps={{ shrink: true }}
          size="small"
        />
        <TextField
          select
          label="Filter by Type"
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          size="small"
          sx={{ minWidth: 150 }}
        >
          <MenuItem value="">All Types</MenuItem>
          <MenuItem value="in">In</MenuItem>
          <MenuItem value="out">Out</MenuItem>
        </TextField>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Card>
        <CardContent>
          {loading ? (
            <Box display="flex" justifyContent="center" p={4}>
              <CircularProgress />
            </Box>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Date</TableCell>
                    <TableCell>Product</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Quantity</TableCell>
                    <TableCell>Notes</TableCell>
                    <TableCell>User</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {movements.length > 0 ? (
                    movements.map((movement) => (
                      <TableRow key={movement.id} hover>
                        <TableCell>
                          {new Date(movement.createdAt).toLocaleString()}
                        </TableCell>
                        <TableCell>{movement.Product?.name || 'N/A'}</TableCell>
                        <TableCell>
                          <Chip
                            label={movement.type}
                            size="small"
                            color={movement.type === 'in' ? 'success' : 'error'}
                          />
                        </TableCell>
                        <TableCell>{movement.quantity}</TableCell>
                        <TableCell>{movement.notes || '-'}</TableCell>
                        <TableCell>
                          {movement.User?.username || 'N/A'}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} align="center">
                        <Typography color="text.secondary" py={2}>
                          No inventory movements found
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default InventoryHistory;

