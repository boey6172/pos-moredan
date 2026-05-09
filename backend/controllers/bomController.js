const BomHeader = require('../models/BomHeader');
const BomLine = require('../models/BomLine');
const Material = require('../models/Material');
const Unit = require('../models/Unit');

exports.getBomForMaterial = async (req, res) => {
  try {
    const outputMaterialId = Number(req.params.id);
    const bom = await BomHeader.findOne({
      where: { outputMaterialId, isActive: true },
      include: [
        {
          model: BomLine,
          as: 'lines',
          separate: true,
          order: [['sortOrder', 'ASC']],
          include: [{ model: Material, as: 'inputMaterial', include: [{ model: Unit, as: 'baseUnit' }] }],
        },
      ],
    });
    if (!bom) return res.json(null);
    res.json(bom);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch BOM', error: err.message });
  }
};

/** Replace active BOM for a material (full body). */
exports.upsertBom = async (req, res) => {
  const sequelize = BomHeader.sequelize;
  const t = await sequelize.transaction();
  try {
    const outputMaterialId = Number(req.params.id);
    const mat = await Material.findByPk(outputMaterialId);
    if (!mat) {
      await t.rollback();
      return res.status(404).json({ message: 'Material not found' });
    }

    const { batchOutputQuantityBase, lines } = req.body;
    if (!batchOutputQuantityBase || BigInt(batchOutputQuantityBase) <= 0n) {
      await t.rollback();
      return res.status(400).json({ message: 'batchOutputQuantityBase must be a positive integer' });
    }
    if (!Array.isArray(lines) || lines.length === 0) {
      await t.rollback();
      return res.status(400).json({ message: 'lines[] is required' });
    }

    let bom = await BomHeader.findOne({ where: { outputMaterialId, isActive: true }, transaction: t });
    if (bom) {
      await BomLine.destroy({ where: { bomHeaderId: bom.id }, transaction: t });
      await bom.update(
        {
          batchOutputQuantityBase: String(batchOutputQuantityBase),
          version: bom.version + 1,
        },
        { transaction: t }
      );
    } else {
      bom = await BomHeader.create(
        {
          outputMaterialId,
          batchOutputQuantityBase: String(batchOutputQuantityBase),
          version: 1,
          isActive: true,
        },
        { transaction: t }
      );
    }

    for (let i = 0; i < lines.length; i++) {
      const ln = lines[i];
      if (!ln.inputMaterialId || ln.inputQuantityPerBatchBase == null) {
        throw new Error(`Invalid line at index ${i}`);
      }
      if (Number(ln.inputMaterialId) === outputMaterialId) {
        throw new Error('BOM cannot reference the same material as output');
      }
      await BomLine.create(
        {
          bomHeaderId: bom.id,
          inputMaterialId: Number(ln.inputMaterialId),
          inputQuantityPerBatchBase: String(ln.inputQuantityPerBatchBase),
          sortOrder: ln.sortOrder != null ? Number(ln.sortOrder) : i,
        },
        { transaction: t }
      );
    }

    await t.commit();
    const full = await BomHeader.findByPk(bom.id, {
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
    res.json(full);
  } catch (err) {
    await t.rollback();
    res.status(500).json({ message: 'Failed to save BOM', error: err.message });
  }
};

exports.deleteBom = async (req, res) => {
  try {
    const outputMaterialId = Number(req.params.id);
    const bom = await BomHeader.findOne({ where: { outputMaterialId, isActive: true } });
    if (!bom) return res.status(404).json({ message: 'No active BOM' });
    await BomLine.destroy({ where: { bomHeaderId: bom.id } });
    await bom.destroy();
    res.json({ message: 'BOM deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete BOM', error: err.message });
  }
};
