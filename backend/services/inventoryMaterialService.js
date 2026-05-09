const { Sequelize } = require('sequelize');
const Material = require('../models/Material');
const InventoryMovement = require('../models/InventoryMovement');
const InventorySettings = require('../models/InventorySettings');
const Product = require('../models/Product');
const { expandMaterialNeeds } = require('./bomExplosion');

async function getSettings() {
  let row = await InventorySettings.findByPk(1);
  if (!row) {
    row = await InventorySettings.create({
      id: 1,
      deductionEnabled: false,
      autoDeductFinished: true,
      autoDeductIntermediate: true,
      consumptionMode: 'CONSUME_STOCKED_INTERMEDIATE',
      allowNegativeStock: false,
    });
  }
  return row;
}

async function ensureSettingsRow() {
  return getSettings();
}

/**
 * @param {import('sequelize').Transaction} [transaction]
 */
async function applyMovement(
  { materialId, quantityDeltaBase, movementType, referenceType, referenceId, notes, userId },
  transaction
) {
  const mat = await Material.findByPk(materialId, { transaction });
  if (!mat) throw new Error(`Material not found: ${materialId}`);
  const delta = BigInt(quantityDeltaBase);
  const next = BigInt(mat.quantityBase) + delta;
  const settings = await getSettings();
  if (!settings.allowNegativeStock && next < 0n) {
    throw new Error(`Insufficient stock for material id ${materialId}`);
  }
  mat.quantityBase = next.toString();
  await mat.save({ transaction });
  await InventoryMovement.create(
    {
      materialId,
      movementType,
      quantityDeltaBase: delta.toString(),
      referenceType,
      referenceId,
      notes,
      userId,
    },
    { transaction }
  );
}

function shouldSkipBomDeduction(material, settings) {
  if (!material) return true;
  if (material.materialType === 'FINISHED' && !settings.autoDeductFinished) return true;
  if (material.materialType === 'INTERMEDIATE' && !settings.autoDeductIntermediate) return true;
  return false;
}

/**
 * Compute materials to deduct for one line item (product × qty).
 * @returns {Promise<{ materialId: number, qtyBase: bigint }[]>}
 */
async function computeDeductionForLine(product, saleQty, settings) {
  const mode = product.materialDeductionMode;
  if (!product.materialId || mode === 'NONE' || !settings.deductionEnabled) {
    return [];
  }

  const material = await Material.findByPk(product.materialId);
  if (!material) return [];

  const perUnit = BigInt(product.materialQuantityPerUnit || 1);
  const totalNeed = perUnit * BigInt(saleQty);

  if (mode === 'MATERIAL_ONLY') {
    return [{ materialId: material.id, qtyBase: totalNeed }];
  }

  if (mode === 'BOM_CONSUME' || mode === 'BOM_EXPLODE') {
    if (shouldSkipBomDeduction(material, settings)) return [];
    const bomMode = mode === 'BOM_EXPLODE' ? 'EXPLODE_TO_RAW' : 'CONSUME_STOCKED_INTERMEDIATE';
    return expandMaterialNeeds(material.id, totalNeed, bomMode);
  }

  return [];
}

/**
 * Post OUT_SALE movements for a transaction. Idempotent: skips if movements already exist for this transaction.
 * @param {import('sequelize').Transaction} transaction
 */
async function postSaleMaterialDeduction(transactionId, items, userId, transaction) {
  const settings = await getSettings();
  if (!settings.deductionEnabled) return;

  const existing = await InventoryMovement.count({
    where: { referenceType: 'TRANSACTION', referenceId: transactionId },
    transaction,
  });
  if (existing > 0) return;

  const consolidated = new Map();

  for (const item of items) {
    const product = await Product.findByPk(item.productId);
    if (!product) continue;
    const rows = await computeDeductionForLine(product, item.quantity, settings);
    for (const r of rows) {
      const k = r.materialId;
      consolidated.set(k, (consolidated.get(k) || 0n) + r.qtyBase);
    }
  }

  for (const [materialId, qtyBase] of consolidated) {
    if (qtyBase === 0n) continue;
    await applyMovement(
      {
        materialId,
        quantityDeltaBase: -qtyBase,
        movementType: 'OUT_SALE',
        referenceType: 'TRANSACTION',
        referenceId: transactionId,
        notes: `Sale #${transactionId}`,
        userId,
      },
      transaction
    );
  }
}

module.exports = {
  getSettings,
  ensureSettingsRow,
  applyMovement,
  computeDeductionForLine,
  postSaleMaterialDeduction,
};
