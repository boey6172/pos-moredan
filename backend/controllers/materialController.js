const Material = require('../models/Material');
const Unit = require('../models/Unit');

const toBigIntStr = (v, fallback = '0') => {
  if (v === undefined || v === null || v === '') return fallback;
  try {
    return BigInt(v).toString();
  } catch {
    return fallback;
  }
};

exports.listMaterials = async (req, res) => {
  try {
    const where = {};
    if (req.query.type) where.materialType = req.query.type;
    const rows = await Material.findAll({
      where,
      include: [{ model: Unit, as: 'baseUnit' }],
      order: [['name', 'ASC']],
    });
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch materials', error: err.message });
  }
};

exports.getMaterial = async (req, res) => {
  try {
    const row = await Material.findByPk(req.params.id, {
      include: [{ model: Unit, as: 'baseUnit' }],
    });
    if (!row) return res.status(404).json({ message: 'Material not found' });
    res.json(row);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch material', error: err.message });
  }
};

exports.createMaterial = async (req, res) => {
  try {
    const {
      code,
      name,
      sku,
      materialType,
      baseUnitId,
      quantityBase,
      reorderLevelBase,
      costPerBase,
      notes,
      canBeSold,
    } = req.body;
    if (!name || !String(name).trim()) return res.status(400).json({ message: 'Name is required' });
    if (!baseUnitId) return res.status(400).json({ message: 'baseUnitId is required' });
    const unit = await Unit.findByPk(baseUnitId);
    if (!unit) return res.status(400).json({ message: 'Invalid baseUnitId' });

    const row = await Material.create({
      code: code != null && String(code).trim() ? String(code).trim() : null,
      name: String(name).trim(),
      sku: sku != null && String(sku).trim() ? String(sku).trim() : null,
      materialType: materialType || 'RAW',
      baseUnitId: Number(baseUnitId),
      quantityBase: toBigIntStr(quantityBase, '0'),
      reorderLevelBase: toBigIntStr(reorderLevelBase, '0'),
      costPerBase: costPerBase === '' || costPerBase === undefined ? null : costPerBase,
      notes: notes != null && String(notes).trim() ? String(notes).trim() : null,
      canBeSold: Boolean(canBeSold),
    });
    const full = await Material.findByPk(row.id, { include: [{ model: Unit, as: 'baseUnit' }] });
    res.status(201).json(full);
  } catch (err) {
    res.status(500).json({ message: 'Failed to create material', error: err.message });
  }
};

exports.updateMaterial = async (req, res) => {
  try {
    const row = await Material.findByPk(req.params.id);
    if (!row) return res.status(404).json({ message: 'Material not found' });
    const {
      code,
      name,
      sku,
      materialType,
      baseUnitId,
      quantityBase,
      reorderLevelBase,
      costPerBase,
      notes,
      canBeSold,
    } = req.body;

    if (name !== undefined) {
      const n = String(name).trim();
      if (!n) return res.status(400).json({ message: 'Name cannot be empty' });
      row.name = n;
    }
    if (code !== undefined) row.code = code != null && String(code).trim() ? String(code).trim() : null;
    if (sku !== undefined) row.sku = sku != null && String(sku).trim() ? String(sku).trim() : null;
    if (materialType !== undefined) row.materialType = materialType;
    if (baseUnitId !== undefined) {
      const u = await Unit.findByPk(baseUnitId);
      if (!u) return res.status(400).json({ message: 'Invalid baseUnitId' });
      row.baseUnitId = baseUnitId;
    }
    if (quantityBase !== undefined) row.quantityBase = toBigIntStr(quantityBase, row.quantityBase);
    if (reorderLevelBase !== undefined) row.reorderLevelBase = toBigIntStr(reorderLevelBase, row.reorderLevelBase);
    if (costPerBase !== undefined) row.costPerBase = costPerBase === '' || costPerBase === null ? null : costPerBase;
    if (notes !== undefined) row.notes = notes != null && String(notes).trim() ? String(notes).trim() : null;
    if (canBeSold !== undefined) row.canBeSold = Boolean(canBeSold);

    await row.save();
    const full = await Material.findByPk(row.id, { include: [{ model: Unit, as: 'baseUnit' }] });
    res.json(full);
  } catch (err) {
    res.status(500).json({ message: 'Failed to update material', error: err.message });
  }
};

exports.deleteMaterial = async (req, res) => {
  try {
    const row = await Material.findByPk(req.params.id);
    if (!row) return res.status(404).json({ message: 'Material not found' });
    await row.destroy();
    res.json({ message: 'Material deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete material', error: err.message });
  }
};
