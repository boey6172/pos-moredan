const { Op } = require('sequelize');
const RawMaterial = require('../models/RawMaterial');
const Material = require('../models/Material');
const Unit = require('../models/Unit');

/**
 * Best-effort: map legacy string quantity + unit name to integer base amount.
 * Assumes base storage is whole grams for MASS, whole ml for VOLUME, whole each for COUNT.
 */
function legacyQuantityToBase(quantityFloat, unitName, groupCode) {
  const q = Number(quantityFloat);
  if (!Number.isFinite(q)) return 0n;
  const n = unitName.toLowerCase().trim();

  if (groupCode === 'MASS') {
    if (n === 'kg') return BigInt(Math.round(q * 1000));
    if (n === 'g' || n === 'gram' || n === 'grams') return BigInt(Math.round(q));
    return BigInt(Math.round(q));
  }
  if (groupCode === 'VOLUME') {
    if (n === 'l' || n === 'liter' || n === 'litre') return BigInt(Math.round(q * 1000));
    if (n === 'ml') return BigInt(Math.round(q));
    return BigInt(Math.round(q));
  }
  return BigInt(Math.max(0, Math.round(q)));
}

/**
 * One-time style sync: copy RawMaterials table into Materials if Materials is empty.
 */
async function migrateRawMaterialsIfEmpty() {
  const matCount = await Material.count();
  if (matCount > 0) return { migrated: 0 };

  const raws = await RawMaterial.findAll();
  if (raws.length === 0) return { migrated: 0 };

  let migrated = 0;
  for (const r of raws) {
    const nameTrim = (r.unit || 'g').trim();
    let unit = await Unit.findOne({ where: { name: { [Op.iLike]: nameTrim } } });
    if (!unit) {
      unit = await Unit.create({
        name: nameTrim.length ? nameTrim : 'g',
        groupCode: 'CUSTOM',
      });
    }

    const group = unit.groupCode || 'CUSTOM';
    const qb = legacyQuantityToBase(r.quantityOnHand, nameTrim, group);
    const rl = legacyQuantityToBase(r.reorderLevel, nameTrim, group);

    await Material.create({
      code: r.sku || null,
      name: r.name,
      sku: r.sku || null,
      materialType: 'RAW',
      baseUnitId: unit.id,
      quantityBase: qb.toString(),
      reorderLevelBase: rl.toString(),
      costPerBase: r.costPerUnit,
      notes: r.notes || null,
      canBeSold: false,
    });
    migrated += 1;
  }
  return { migrated };
}

module.exports = { migrateRawMaterialsIfEmpty, legacyQuantityToBase };
