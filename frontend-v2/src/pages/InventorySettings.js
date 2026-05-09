import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Switch,
  FormControlLabel,
  Button,
  CircularProgress,
} from '@mui/material';
import axios from '../api/axios';

const InventorySettings = () => {
  const [row, setRow] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/inventory-settings');
      setRow(res.data);
    } catch (e) {
      console.error(e);
      setRow(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const save = async () => {
    if (!row || saving) return;
    setSaving(true);
    try {
      const res = await axios.put('/api/inventory-settings', row);
      setRow(res.data);
    } catch (e) {
      alert(e.response?.data?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  if (loading || !row) {
    return (
      <Box display="flex" justifyContent="center" p={4}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" sx={{ fontWeight: 600, mb: 1 }}>
        Inventory settings
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Control automatic material deduction when sales are posted. Product links use Materials + BOM (see Products and
        Materials screens).
      </Typography>
      <Card>
        <CardContent sx={{ maxWidth: 560 }}>
          <FormControlLabel
            control={
              <Switch
                checked={Boolean(row.deductionEnabled)}
                onChange={(e) => setRow({ ...row, deductionEnabled: e.target.checked })}
              />
            }
            label="Enable material deduction on sale"
          />
          <Typography variant="caption" display="block" color="text.secondary" sx={{ mb: 2 }}>
            When off, no material stock moves are recorded (POS product inventory still updates as before).
          </Typography>
          <FormControlLabel
            control={
              <Switch
                checked={Boolean(row.autoDeductFinished)}
                onChange={(e) => setRow({ ...row, autoDeductFinished: e.target.checked })}
              />
            }
            label="Auto-deduct for finished goods (BOM modes)"
          />
          <FormControlLabel
            control={
              <Switch
                checked={Boolean(row.autoDeductIntermediate)}
                onChange={(e) => setRow({ ...row, autoDeductIntermediate: e.target.checked })}
              />
            }
            label="Auto-deduct for intermediate materials (BOM modes)"
          />
          <FormControlLabel
            control={
              <Switch
                checked={Boolean(row.allowNegativeStock)}
                onChange={(e) => setRow({ ...row, allowNegativeStock: e.target.checked })}
              />
            }
            label="Allow negative material stock"
          />
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            BOM behaviour per product: set <strong>Material deduction mode</strong> on each product (BOM_CONSUME vs
            BOM_EXPLODE). MATERIAL_ONLY deducts only the linked material (e.g. selling espresso shots from stock).
          </Typography>
          <Button variant="contained" onClick={save} disabled={saving} sx={{ mt: 2 }}>
            {saving ? 'Saving…' : 'Save'}
          </Button>
        </CardContent>
      </Card>
    </Box>
  );
};

export default InventorySettings;
