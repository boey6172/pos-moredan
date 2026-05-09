const InventorySettings = require('../models/InventorySettings');
const { ensureSettingsRow } = require('../services/inventoryMaterialService');

exports.getSettings = async (req, res) => {
  try {
    const row = await ensureSettingsRow();
    res.json(row);
  } catch (err) {
    res.status(500).json({ message: 'Failed to load settings', error: err.message });
  }
};

exports.updateSettings = async (req, res) => {
  try {
    const row = await ensureSettingsRow();
    const {
      deductionEnabled,
      autoDeductFinished,
      autoDeductIntermediate,
      consumptionMode,
      allowNegativeStock,
    } = req.body;

    if (deductionEnabled !== undefined) row.deductionEnabled = Boolean(deductionEnabled);
    if (autoDeductFinished !== undefined) row.autoDeductFinished = Boolean(autoDeductFinished);
    if (autoDeductIntermediate !== undefined) row.autoDeductIntermediate = Boolean(autoDeductIntermediate);
    if (consumptionMode !== undefined) row.consumptionMode = consumptionMode;
    if (allowNegativeStock !== undefined) row.allowNegativeStock = Boolean(allowNegativeStock);

    await row.save();
    res.json(row);
  } catch (err) {
    res.status(500).json({ message: 'Failed to update settings', error: err.message });
  }
};
