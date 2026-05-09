const Material = require('../models/Material');
require('../models/BomLine'); // registers BomHeader ↔ BomLine associations
const BomHeader = require('../models/BomHeader');
const BomLine = require('../models/BomLine');

/** @param {bigint} a @param {bigint} b @param {bigint} c */
function mulDivCeil(a, b, c) {
  if (c === 0n) throw new Error('batchOutputQuantityBase cannot be 0');
  return (a * b + c - 1n) / c;
}

/**
 * Merge rows with same materialId by summing qtyBase.
 * @param {{ materialId: number, qtyBase: bigint }[]} rows
 */
function consolidate(rows) {
  const map = new Map();
  for (const r of rows) {
    const k = r.materialId;
    const prev = map.get(k) || 0n;
    map.set(k, prev + r.qtyBase);
  }
  return [...map.entries()].map(([materialId, qtyBase]) => ({ materialId, qtyBase }));
}

/**
 * @param {'EXPLODE_TO_RAW' | 'CONSUME_STOCKED_INTERMEDIATE'} mode
 * @returns {Promise<{ materialId: number, qtyBase: bigint }[]>}
 */
async function expandMaterialNeeds(materialId, quantityNeededBase, mode) {
  const qty = BigInt(quantityNeededBase);
  if (qty <= 0n) return [];

  const bom = await BomHeader.findOne({
    where: { outputMaterialId: materialId, isActive: true },
    include: [
      {
        model: BomLine,
        as: 'lines',
        separate: true,
        order: [['sortOrder', 'ASC']],
        include: [{ model: Material, as: 'inputMaterial' }],
      },
    ],
  });

  if (!bom || !bom.lines || bom.lines.length === 0) {
    return [{ materialId, qtyBase: qty }];
  }

  const batch = BigInt(bom.batchOutputQuantityBase);
  if (batch <= 0n) throw new Error('Invalid batchOutputQuantityBase');

  if (mode === 'CONSUME_STOCKED_INTERMEDIATE') {
    const out = [];
    for (const line of bom.lines) {
      const lineQty = mulDivCeil(BigInt(line.inputQuantityPerBatchBase), qty, batch);
      out.push({ materialId: line.inputMaterialId, qtyBase: lineQty });
    }
    return consolidate(out);
  }

  // EXPLODE_TO_RAW
  const out = [];
  for (const line of bom.lines) {
    const lineQty = mulDivCeil(BigInt(line.inputQuantityPerBatchBase), qty, batch);
    const sub = await expandMaterialNeeds(line.inputMaterialId, lineQty, mode);
    out.push(...sub);
  }
  return consolidate(out);
}

module.exports = {
  expandMaterialNeeds,
  consolidate,
  mulDivCeil,
};
