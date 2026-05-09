const RawMaterial = require('../models/RawMaterial');

const num = (v, fallback = null) => {
  if (v === undefined || v === null || v === '') return fallback;
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
};

exports.createRawMaterial = async (req, res) => {
  try {
    const { name, sku, unit, quantityOnHand, reorderLevel, costPerUnit, notes } = req.body;
    if (!name || !String(name).trim()) {
      return res.status(400).json({ message: 'Name is required' });
    }
    const u = unit != null && String(unit).trim() ? String(unit).trim() : 'g';
    const row = await RawMaterial.create({
      name: String(name).trim(),
      sku: sku != null && String(sku).trim() ? String(sku).trim() : null,
      unit: u,
      quantityOnHand: num(quantityOnHand, 0),
      reorderLevel: num(reorderLevel, 0),
      costPerUnit: costPerUnit === '' || costPerUnit === undefined ? null : num(costPerUnit, 0),
      notes: notes != null && String(notes).trim() ? String(notes).trim() : null,
    });
    res.status(201).json(row);
  } catch (err) {
    res.status(500).json({ message: 'Failed to create raw material', error: err.message });
  }
};

exports.getRawMaterials = async (req, res) => {
  try {
    const rows = await RawMaterial.findAll({ order: [['name', 'ASC']] });
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch raw materials', error: err.message });
  }
};

exports.getRawMaterialById = async (req, res) => {
  try {
    const row = await RawMaterial.findByPk(req.params.id);
    if (!row) return res.status(404).json({ message: 'Raw material not found' });
    res.json(row);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch raw material', error: err.message });
  }
};

exports.updateRawMaterial = async (req, res) => {
  try {
    const row = await RawMaterial.findByPk(req.params.id);
    if (!row) return res.status(404).json({ message: 'Raw material not found' });
    const { name, sku, unit, quantityOnHand, reorderLevel, costPerUnit, notes } = req.body;
    if (name !== undefined) {
      const n = String(name).trim();
      if (!n) return res.status(400).json({ message: 'Name cannot be empty' });
      row.name = n;
    }
    if (sku !== undefined) row.sku = sku != null && String(sku).trim() ? String(sku).trim() : null;
    if (unit !== undefined) row.unit = String(unit).trim() || row.unit;
    if (quantityOnHand !== undefined) row.quantityOnHand = num(quantityOnHand, row.quantityOnHand);
    if (reorderLevel !== undefined) row.reorderLevel = num(reorderLevel, row.reorderLevel);
    if (costPerUnit !== undefined) row.costPerUnit = costPerUnit === '' || costPerUnit === null ? null : num(costPerUnit, row.costPerUnit);
    if (notes !== undefined) row.notes = notes != null && String(notes).trim() ? String(notes).trim() : null;
    await row.save();
    res.json(row);
  } catch (err) {
    res.status(500).json({ message: 'Failed to update raw material', error: err.message });
  }
};

exports.deleteRawMaterial = async (req, res) => {
  try {
    const row = await RawMaterial.findByPk(req.params.id);
    if (!row) return res.status(404).json({ message: 'Raw material not found' });
    await row.destroy();
    res.json({ message: 'Raw material deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete raw material', error: err.message });
  }
};
