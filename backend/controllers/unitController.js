const Unit = require('../models/Unit');

exports.getUnits = async (req, res) => {
  try {
    const rows = await Unit.findAll({ order: [['name', 'ASC']] });
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch units', error: err.message });
  }
};

exports.getUnitById = async (req, res) => {
  try {
    const row = await Unit.findByPk(req.params.id);
    if (!row) return res.status(404).json({ message: 'Unit not found' });
    res.json(row);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch unit', error: err.message });
  }
};

exports.createUnit = async (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name || !String(name).trim()) {
      return res.status(400).json({ message: 'Name is required' });
    }
    const trimmed = String(name).trim();
    const existing = await Unit.findOne({ where: { name: trimmed } });
    if (existing) {
      return res.status(409).json({ message: 'A unit with this name already exists' });
    }
    const { groupCode } = req.body;
    const gc = groupCode && String(groupCode).trim() ? String(groupCode).trim().toUpperCase() : 'CUSTOM';
    const row = await Unit.create({
      name: trimmed,
      description: description != null && String(description).trim() ? String(description).trim() : null,
      groupCode: ['MASS', 'VOLUME', 'COUNT', 'CUSTOM'].includes(gc) ? gc : 'CUSTOM',
    });
    res.status(201).json(row);
  } catch (err) {
    res.status(500).json({ message: 'Failed to create unit', error: err.message });
  }
};

exports.updateUnit = async (req, res) => {
  try {
    const row = await Unit.findByPk(req.params.id);
    if (!row) return res.status(404).json({ message: 'Unit not found' });

    const { name, description, groupCode } = req.body;
    if (name !== undefined) {
      const trimmed = String(name).trim();
      if (!trimmed) {
        return res.status(400).json({ message: 'Name cannot be empty' });
      }
      if (trimmed !== row.name) {
        const existing = await Unit.findOne({ where: { name: trimmed } });
        if (existing) {
          return res.status(409).json({ message: 'A unit with this name already exists' });
        }
      }
      row.name = trimmed;
    }
    if (description !== undefined) {
      row.description = description != null && String(description).trim()
        ? String(description).trim()
        : null;
    }
    if (groupCode !== undefined) {
      const gc = String(groupCode).trim().toUpperCase();
      row.groupCode = ['MASS', 'VOLUME', 'COUNT', 'CUSTOM'].includes(gc) ? gc : 'CUSTOM';
    }
    await row.save();
    res.json(row);
  } catch (err) {
    res.status(500).json({ message: 'Failed to update unit', error: err.message });
  }
};

exports.deleteUnit = async (req, res) => {
  try {
    const row = await Unit.findByPk(req.params.id);
    if (!row) return res.status(404).json({ message: 'Unit not found' });
    await row.destroy();
    res.json({ message: 'Unit deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete unit', error: err.message });
  }
};

