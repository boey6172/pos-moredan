const InventoryMovement = require('../models/InventoryMovement');
const Material = require('../models/Material');
const { applyMovement } = require('../services/inventoryMaterialService');

exports.list = async (req, res) => {
  try {
    const { materialId, limit = 200 } = req.query;
    const where = {};
    if (materialId) where.materialId = materialId;
    const rows = await InventoryMovement.findAll({
      where,
      include: [{ model: Material }],
      order: [['createdAt', 'DESC']],
      limit: Math.min(Number(limit) || 200, 1000),
    });
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Failed to list movements', error: err.message });
  }
};

/** Manual adjustment / waste — positive adds stock, negative removes. */
exports.createAdjustment = async (req, res) => {
  const sequelize = InventoryMovement.sequelize;
  const t = await sequelize.transaction();
  try {
    const { materialId, quantityDeltaBase, movementType, notes } = req.body;
    if (!materialId || quantityDeltaBase == null) {
      await t.rollback();
      return res.status(400).json({ message: 'materialId and quantityDeltaBase are required' });
    }
    const mt =
      movementType && ['IN_ADJUSTMENT', 'OUT_ADJUSTMENT', 'OUT_WASTE', 'IN_PURCHASE'].includes(movementType)
        ? movementType
        : Number(quantityDeltaBase) >= 0
          ? 'IN_ADJUSTMENT'
          : 'OUT_ADJUSTMENT';

    await applyMovement(
      {
        materialId: Number(materialId),
        quantityDeltaBase: BigInt(quantityDeltaBase),
        movementType: mt,
        referenceType: 'MANUAL',
        referenceId: null,
        notes: notes || null,
        userId: req.user.id,
      },
      t
    );
    await t.commit();
    res.status(201).json({ message: 'Movement recorded' });
  } catch (err) {
    await t.rollback();
    res.status(500).json({ message: 'Failed to record movement', error: err.message });
  }
};
