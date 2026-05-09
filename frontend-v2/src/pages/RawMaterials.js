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
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  CircularProgress,
  MenuItem,
  FormControlLabel,
  Switch,
  Chip,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import TableSkeleton from '../components/TableSkeleton';
import axios from '../api/axios';

const emptyForm = () => ({
  name: '',
  code: '',
  sku: '',
  materialType: 'RAW',
  baseUnitId: '',
  quantityBase: '0',
  reorderLevelBase: '0',
  costPerBase: '',
  notes: '',
  canBeSold: false,
});

const RawMaterials = () => {
  const [rows, setRows] = useState([]);
  const [units, setUnits] = useState([]);
  const [open, setOpen] = useState(false);
  const [edit, setEdit] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(null);

  const [bomOpen, setBomOpen] = useState(false);
  const [bomMaterial, setBomMaterial] = useState(null);
  const [bomBatch, setBomBatch] = useState('1');
  const [bomLines, setBomLines] = useState([]);
  const [bomLoading, setBomLoading] = useState(false);
  const [bomSaving, setBomSaving] = useState(false);

  const fetchRows = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/materials');
      setRows(res.data);
    } catch (err) {
      console.error(err);
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchUnits = async () => {
    try {
      const res = await axios.get('/api/units');
      setUnits(res.data || []);
    } catch {
      setUnits([]);
    }
  };

  useEffect(() => {
    fetchRows();
    fetchUnits();
  }, []);

  const handleOpen = (row = null) => {
    setEdit(row);
    if (row) {
      setForm({
        name: row.name || '',
        code: row.code || '',
        sku: row.sku || '',
        materialType: row.materialType || 'RAW',
        baseUnitId: row.baseUnitId || '',
        quantityBase: row.quantityBase != null ? String(row.quantityBase) : '0',
        reorderLevelBase: row.reorderLevelBase != null ? String(row.reorderLevelBase) : '0',
        costPerBase: row.costPerBase != null ? String(row.costPerBase) : '',
        notes: row.notes || '',
        canBeSold: Boolean(row.canBeSold),
      });
    } else {
      setForm(emptyForm());
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEdit(null);
    setForm(emptyForm());
  };

  const handleSave = async () => {
    if (saving) return;
    if (!form.name.trim()) {
      alert('Name is required');
      return;
    }
    if (!form.baseUnitId) {
      alert('Select a base unit');
      return;
    }
    setSaving(true);
    const payload = {
      name: form.name.trim(),
      code: form.code.trim() || null,
      sku: form.sku.trim() || null,
      materialType: form.materialType,
      baseUnitId: Number(form.baseUnitId),
      quantityBase: form.quantityBase === '' ? '0' : form.quantityBase,
      reorderLevelBase: form.reorderLevelBase === '' ? '0' : form.reorderLevelBase,
      costPerBase: form.costPerBase === '' ? null : form.costPerBase,
      notes: form.notes.trim() || null,
      canBeSold: form.canBeSold,
    };
    try {
      if (edit) {
        await axios.put(`/api/materials/${edit.id}`, payload);
      } else {
        await axios.post('/api/materials', payload);
      }
      fetchRows();
      handleClose();
    } catch (err) {
      alert(err.response?.data?.message || err.response?.data?.error || 'Error saving');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (deleting === id) return;
    if (!window.confirm('Delete this material?')) return;
    setDeleting(id);
    try {
      await axios.delete(`/api/materials/${id}`);
      fetchRows();
    } catch (err) {
      alert(err.response?.data?.message || 'Error deleting');
    } finally {
      setDeleting(null);
    }
  };

  const openBom = async (m) => {
    setBomMaterial(m);
    setBomOpen(true);
    setBomLoading(true);
    try {
      const res = await axios.get(`/api/materials/${m.id}/bom`);
      if (res.data) {
        setBomBatch(String(res.data.batchOutputQuantityBase ?? 1));
        setBomLines(
          (res.data.lines || []).map((ln) => ({
            inputMaterialId: ln.inputMaterialId,
            inputQuantityPerBatchBase: String(ln.inputQuantityPerBatchBase),
          }))
        );
      } else {
        setBomBatch('1');
        setBomLines([{ inputMaterialId: '', inputQuantityPerBatchBase: '1' }]);
      }
    } catch {
      setBomBatch('1');
      setBomLines([{ inputMaterialId: '', inputQuantityPerBatchBase: '1' }]);
    } finally {
      setBomLoading(false);
    }
  };

  const saveBom = async () => {
    if (!bomMaterial || bomSaving) return;
    setBomSaving(true);
    try {
      const lines = bomLines
        .filter((l) => l.inputMaterialId && l.inputQuantityPerBatchBase !== '')
        .map((l) => ({
          inputMaterialId: Number(l.inputMaterialId),
          inputQuantityPerBatchBase: l.inputQuantityPerBatchBase,
        }));
      await axios.put(`/api/materials/${bomMaterial.id}/bom`, {
        batchOutputQuantityBase: bomBatch,
        lines,
      });
      setBomOpen(false);
      setBomMaterial(null);
    } catch (err) {
      alert(err.response?.data?.message || err.response?.data?.error || 'BOM save failed');
    } finally {
      setBomSaving(false);
    }
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 600 }}>
            Materials
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Raw, intermediate, and finished goods share one stock model (integer base units). Link products and BOMs for
            recipe deduction.
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpen()}>
          Add material
        </Button>
      </Box>

      <Card>
        <CardContent>
          {loading ? (
            <TableSkeleton rows={8} columns={8} />
          ) : (
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Unit</TableCell>
                    <TableCell align="right">Qty (base)</TableCell>
                    <TableCell>Sellable</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rows.length > 0 ? (
                    rows.map((r) => (
                      <TableRow key={r.id} hover>
                        <TableCell>{r.name}</TableCell>
                        <TableCell>
                          <Chip size="small" label={r.materialType} />
                        </TableCell>
                        <TableCell>{r.baseUnit?.name || '—'}</TableCell>
                        <TableCell align="right">{r.quantityBase ?? '0'}</TableCell>
                        <TableCell>{r.canBeSold ? 'Yes' : '—'}</TableCell>
                        <TableCell align="right">
                          <IconButton size="small" color="secondary" onClick={() => openBom(r)} title="BOM">
                            <AccountTreeIcon />
                          </IconButton>
                          <IconButton size="small" color="primary" onClick={() => handleOpen(r)}>
                            <EditIcon />
                          </IconButton>
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleDelete(r.id)}
                            disabled={deleting === r.id}
                          >
                            {deleting === r.id ? <CircularProgress size={20} /> : <DeleteIcon />}
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} align="center">
                        <Typography color="text.secondary" py={2}>
                          No materials yet (legacy raw rows migrate on server restart if the Materials table was empty).
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

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>{edit ? 'Edit material' : 'Add material'}</DialogTitle>
        <DialogContent>
          <TextField
            label="Name"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            fullWidth
            margin="normal"
            required
            autoFocus
          />
          <TextField
            label="Code (optional)"
            value={form.code}
            onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))}
            fullWidth
            margin="normal"
          />
          <TextField
            label="SKU (optional)"
            value={form.sku}
            onChange={(e) => setForm((f) => ({ ...f, sku: e.target.value }))}
            fullWidth
            margin="normal"
          />
          <TextField
            select
            label="Material type"
            value={form.materialType}
            onChange={(e) => setForm((f) => ({ ...f, materialType: e.target.value }))}
            fullWidth
            margin="normal"
          >
            <MenuItem value="RAW">Raw</MenuItem>
            <MenuItem value="INTERMEDIATE">Intermediate (e.g. shot)</MenuItem>
            <MenuItem value="FINISHED">Finished</MenuItem>
          </TextField>
          <TextField
            select
            label="Base unit"
            value={form.baseUnitId}
            onChange={(e) => setForm((f) => ({ ...f, baseUnitId: e.target.value }))}
            fullWidth
            margin="normal"
            required
          >
            {units.map((u) => (
              <MenuItem key={u.id} value={u.id}>
                {u.name} ({u.groupCode || 'CUSTOM'})
              </MenuItem>
            ))}
          </TextField>
          <TextField
            label="Quantity on hand (base units, integer)"
            value={form.quantityBase}
            onChange={(e) => setForm((f) => ({ ...f, quantityBase: e.target.value }))}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Reorder level (base units)"
            value={form.reorderLevelBase}
            onChange={(e) => setForm((f) => ({ ...f, reorderLevelBase: e.target.value }))}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Cost per base unit (optional)"
            value={form.costPerBase}
            onChange={(e) => setForm((f) => ({ ...f, costPerBase: e.target.value }))}
            fullWidth
            margin="normal"
          />
          <FormControlLabel
            control={
              <Switch
                checked={form.canBeSold}
                onChange={(e) => setForm((f) => ({ ...f, canBeSold: e.target.checked }))}
              />
            }
            label="Can be sold (e.g. espresso shot SKU)"
          />
          <TextField
            label="Notes"
            value={form.notes}
            onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
            fullWidth
            margin="normal"
            multiline
            minRows={2}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={handleSave} variant="contained" disabled={!form.name.trim() || !form.baseUnitId || saving}>
            {saving ? 'Saving...' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={bomOpen} onClose={() => !bomSaving && setBomOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>BOM — {bomMaterial?.name}</DialogTitle>
        <DialogContent>
          {bomLoading ? (
            <CircularProgress />
          ) : (
            <>
              <TextField
                label="Batch output (base units this recipe produces)"
                value={bomBatch}
                onChange={(e) => setBomBatch(e.target.value)}
                fullWidth
                margin="normal"
              />
              <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>
                Inputs per batch
              </Typography>
              {bomLines.map((line, idx) => (
                <Box key={idx} display="flex" gap={1} alignItems="center" mb={1}>
                  <TextField
                    select
                    label="Input material"
                    value={line.inputMaterialId}
                    onChange={(e) => {
                      const next = [...bomLines];
                      next[idx] = { ...next[idx], inputMaterialId: e.target.value };
                      setBomLines(next);
                    }}
                    sx={{ flex: 1 }}
                  >
                    <MenuItem value="">Select</MenuItem>
                    {rows
                      .filter((m) => m.id !== bomMaterial?.id)
                      .map((m) => (
                        <MenuItem key={m.id} value={m.id}>
                          {m.name}
                        </MenuItem>
                      ))}
                  </TextField>
                  <TextField
                    label="Qty per batch (base)"
                    value={line.inputQuantityPerBatchBase}
                    onChange={(e) => {
                      const next = [...bomLines];
                      next[idx] = { ...next[idx], inputQuantityPerBatchBase: e.target.value };
                      setBomLines(next);
                    }}
                    sx={{ width: 200 }}
                  />
                  <IconButton
                    onClick={() => setBomLines(bomLines.filter((_, i) => i !== idx))}
                    disabled={bomLines.length <= 1}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>
              ))}
              <Button
                onClick={() =>
                  setBomLines([...bomLines, { inputMaterialId: '', inputQuantityPerBatchBase: '1' }])
                }
              >
                Add line
              </Button>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBomOpen(false)} disabled={bomSaving}>
            Cancel
          </Button>
          <Button onClick={saveBom} variant="contained" disabled={bomSaving || bomLoading}>
            {bomSaving ? 'Saving...' : 'Save BOM'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default RawMaterials;
