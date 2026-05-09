const UnitConversion = require('../models/UnitConversion');
const Unit = require('../models/Unit');

exports.list = async (req, res) => {
  try {
    const rows = await UnitConversion.findAll({
      include: [
        { model: Unit, as: 'fromUnit' },
        { model: Unit, as: 'toUnit' },
      ],
      order: [['id', 'ASC']],
    });
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Failed to list conversions', error: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    const { fromUnitId, toUnitId, numerator, denominator } = req.body;
    if (!fromUnitId || !toUnitId || numerator == null) {
      return res.status(400).json({ message: 'fromUnitId, toUnitId, numerator are required' });
    }
    const fromU = await Unit.findByPk(fromUnitId);
    const toU = await Unit.findByPk(toUnitId);
    if (!fromU || !toU) return res.status(400).json({ message: 'Invalid unit id' });
    if (fromU.groupCode !== toU.groupCode) {
      return res.status(400).json({ message: 'Units must share the same groupCode for conversion' });
    }
    const den = denominator != null && String(denominator) !== '' ? BigInt(denominator) : 1n;
    if (den === 0n) return res.status(400).json({ message: 'denominator cannot be 0' });
    const row = await UnitConversion.create({
      fromUnitId,
      toUnitId,
      numerator: String(BigInt(numerator)),
      denominator: String(den),
    });
    const full = await UnitConversion.findByPk(row.id, {
      include: [
        { model: Unit, as: 'fromUnit' },
        { model: Unit, as: 'toUnit' },
      ],
    });
    res.status(201).json(full);
  } catch (err) {
    res.status(500).json({ message: 'Failed to create conversion', error: err.message });
  }
};

exports.delete = async (req, res) => {
  try {
    const row = await UnitConversion.findByPk(req.params.id);
    if (!row) return res.status(404).json({ message: 'Not found' });
    await row.destroy();
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete', error: err.message });
  }
};
