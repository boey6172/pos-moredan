const { DataTypes } = require('sequelize');

/**
 * Adds columns that existed in models before the DB was created, so sequelize.sync()
 * can add indexes without failing (e.g. index on materialId before column exists).
 * Safe to run repeatedly. Targets PostgreSQL (project default).
 */
async function ensureSchemaPatches(sequelize) {
  if (sequelize.getDialect() !== 'postgres') {
    return;
  }

  const qi = sequelize.getQueryInterface();

  const describe = async (table) => {
    try {
      return await qi.describeTable(table);
    } catch {
      return null;
    }
  };

  const hasCol = (desc, name) => desc && (desc[name] || desc[name.toLowerCase()]);

  // --- Units.groupCode ---
  let units = await describe('Units');
  if (units && !hasCol(units, 'groupCode')) {
    await qi.addColumn('Units', 'groupCode', {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'CUSTOM',
    });
    console.log('Schema patch: added Units.groupCode');
  }

  // --- Products material columns (need Materials for FK on materialId) ---
  const materials = await describe('Materials');
  const products = await describe('Products');
  if (products && materials) {
    if (!hasCol(products, 'materialId')) {
      await qi.addColumn('Products', 'materialId', {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: { model: 'Materials', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      });
      console.log('Schema patch: added Products.materialId');
    }
    if (!hasCol(products, 'materialQuantityPerUnit')) {
      await qi.addColumn('Products', 'materialQuantityPerUnit', {
        type: DataTypes.BIGINT,
        allowNull: false,
        defaultValue: 1,
      });
      console.log('Schema patch: added Products.materialQuantityPerUnit');
    }
    if (!hasCol(products, 'materialDeductionMode')) {
      try {
        await qi.addColumn('Products', 'materialDeductionMode', {
          type: DataTypes.ENUM('NONE', 'MATERIAL_ONLY', 'BOM_CONSUME', 'BOM_EXPLODE'),
          allowNull: false,
          defaultValue: 'NONE',
        });
        console.log('Schema patch: added Products.materialDeductionMode');
      } catch (e) {
        console.warn('Schema patch: Products.materialDeductionMode:', e.message);
      }
    }
  }

  // --- InventoryMovements: all model columns (legacy / partial tables) ---
  await patchInventoryMovementsTable(sequelize, qi, describe, hasCol, materials);
}

const MOVEMENT_ENUM = DataTypes.ENUM(
  'IN_PURCHASE',
  'IN_PRODUCTION',
  'IN_ADJUSTMENT',
  'OUT_SALE',
  'OUT_PRODUCTION',
  'OUT_WASTE',
  'OUT_ADJUSTMENT',
  'TRANSFER'
);

async function patchInventoryMovementsTable(sequelize, qi, describe, hasCol, materials) {
  let inv = await describe('InventoryMovements');
  if (!inv) return;

  if (!materials) {
    try {
      await sequelize.query('DROP TABLE IF EXISTS "InventoryMovements" CASCADE');
      console.log('Schema patch: dropped InventoryMovements (Materials table missing; sync will recreate)');
    } catch (e) {
      console.error('Schema patch: could not fix InventoryMovements:', e.message);
    }
    return;
  }

  const usersTable = await describe('Users');

  const refreshInv = async () => {
    inv = await describe('InventoryMovements');
  };

  if (!hasCol(inv, 'materialId')) {
    await qi.addColumn('InventoryMovements', 'materialId', {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: { model: 'Materials', key: 'id' },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    });
    await refreshInv();
    console.log('Schema patch: added InventoryMovements.materialId');
  }

  if (!hasCol(inv, 'movementType')) {
    try {
      await qi.addColumn('InventoryMovements', 'movementType', {
        type: MOVEMENT_ENUM,
        allowNull: true,
      });
    } catch (e) {
      console.warn('Schema patch: movementType addColumn:', e.message);
    }
    await sequelize.query(`
      UPDATE "InventoryMovements" SET "movementType" = 'IN_ADJUSTMENT' WHERE "movementType" IS NULL
    `);
    try {
      await sequelize.query(
        'ALTER TABLE "InventoryMovements" ALTER COLUMN "movementType" SET NOT NULL'
      );
    } catch (e) {
      console.warn('Schema patch: movementType NOT NULL:', e.message);
    }
    await refreshInv();
    console.log('Schema patch: added InventoryMovements.movementType');
  }

  if (!hasCol(inv, 'quantityDeltaBase')) {
    await qi.addColumn('InventoryMovements', 'quantityDeltaBase', {
      type: DataTypes.BIGINT,
      allowNull: true,
    });
    await sequelize.query(`
      UPDATE "InventoryMovements" SET "quantityDeltaBase" = 0 WHERE "quantityDeltaBase" IS NULL
    `);
    try {
      await sequelize.query(
        'ALTER TABLE "InventoryMovements" ALTER COLUMN "quantityDeltaBase" SET NOT NULL'
      );
    } catch (e) {
      console.warn('Schema patch: quantityDeltaBase NOT NULL:', e.message);
    }
    await refreshInv();
    console.log('Schema patch: added InventoryMovements.quantityDeltaBase');
  }

  if (!hasCol(inv, 'referenceType')) {
    await qi.addColumn('InventoryMovements', 'referenceType', {
      type: DataTypes.STRING,
      allowNull: true,
    });
    await refreshInv();
    console.log('Schema patch: added InventoryMovements.referenceType');
  }

  if (!hasCol(inv, 'referenceId')) {
    await qi.addColumn('InventoryMovements', 'referenceId', {
      type: DataTypes.INTEGER,
      allowNull: true,
    });
    await refreshInv();
    console.log('Schema patch: added InventoryMovements.referenceId');
  }

  if (!hasCol(inv, 'notes')) {
    await qi.addColumn('InventoryMovements', 'notes', {
      type: DataTypes.TEXT,
      allowNull: true,
    });
    await refreshInv();
    console.log('Schema patch: added InventoryMovements.notes');
  }

  if (!hasCol(inv, 'userId')) {
    const userOpts = usersTable
      ? {
          type: DataTypes.INTEGER,
          allowNull: true,
          references: { model: 'Users', key: 'id' },
          onUpdate: 'CASCADE',
          onDelete: 'SET NULL',
        }
      : { type: DataTypes.INTEGER, allowNull: true };
    await qi.addColumn('InventoryMovements', 'userId', userOpts);
    await refreshInv();
    console.log('Schema patch: added InventoryMovements.userId');
  }

  inv = await describe('InventoryMovements');
  if (!hasCol(inv, 'createdAt')) {
    await qi.addColumn('InventoryMovements', 'createdAt', {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    });
    await refreshInv();
    console.log('Schema patch: added InventoryMovements.createdAt');
  }

  inv = await describe('InventoryMovements');
  if (!hasCol(inv, 'updatedAt')) {
    await qi.addColumn('InventoryMovements', 'updatedAt', {
      type: DataTypes.DATE,
      allowNull: true,
    });
    await refreshInv();
    console.log('Schema patch: added InventoryMovements.updatedAt');
  }

  // Backfill materialId and enforce NOT NULL when possible
  inv = await describe('InventoryMovements');
  if (hasCol(inv, 'materialId')) {
    const [countResult] = await sequelize.query('SELECT COUNT(*)::int AS c FROM "InventoryMovements"');
    const cnt = countResult?.[0]?.c ?? 0;
    const [mCountRows] = await sequelize.query('SELECT COUNT(*)::int AS c FROM "Materials"');
    const mCnt = mCountRows?.[0]?.c ?? 0;
    if (Number(mCnt) === 0 && Number(cnt) > 0) {
      await sequelize.query('DELETE FROM "InventoryMovements"');
      console.log('Schema patch: cleared InventoryMovements rows (no Materials in DB to reference yet)');
    } else if (Number(cnt) > 0) {
      await sequelize.query(`
        UPDATE "InventoryMovements" SET "materialId" = (SELECT id FROM "Materials" ORDER BY id ASC LIMIT 1)
        WHERE "materialId" IS NULL
      `);
    }
    try {
      await sequelize.query(
        'ALTER TABLE "InventoryMovements" ALTER COLUMN "materialId" SET NOT NULL'
      );
    } catch (e) {
      console.warn('Schema patch: materialId NOT NULL:', e.message);
    }
  }
}

module.exports = { ensureSchemaPatches };
