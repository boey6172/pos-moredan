const { Op } = require('sequelize');
const InventoryMovement = require('../models/InventoryMovement');
const Product = require('../models/Product');
const Material = require('../models/Material');
const User = require('../models/User');
const { applyMovement } = require('../services/inventoryMaterialService');

/**
 * Per-product stock adjustment (legacy UI). Always updates Product.inventory so the existing
 * Inventory page keeps working. When the product is linked to a Material, the movement is also
 * mirrored into the unified InventoryMovement ledger so the new material system stays consistent.
 */
exports.adjustInventory = async (req, res) => {
  const sequelize = InventoryMovement.sequelize;
  const t = await sequelize.transaction();
  try {
    const { productId, type, quantity, reason } = req.body;
    if (!productId || !type || !quantity) {
      await t.rollback();
      return res.status(400).json({ message: 'Missing required fields.' });
    }
    if (type !== 'in' && type !== 'out') {
      await t.rollback();
      return res.status(400).json({ message: 'Invalid type.' });
    }
    const qty = Number(quantity);
    if (!Number.isFinite(qty) || qty <= 0) {
      await t.rollback();
      return res.status(400).json({ message: 'Quantity must be a positive number.' });
    }

    const product = await Product.findByPk(productId, { transaction: t });
    if (!product) {
      await t.rollback();
      return res.status(404).json({ message: 'Product not found.' });
    }

    if (type === 'in') {
      product.inventory += qty;
    } else {
      if (product.inventory < qty) {
        await t.rollback();
        return res.status(400).json({ message: 'Insufficient stock.' });
      }
      product.inventory -= qty;
    }
    await product.save({ transaction: t });

    if (product.materialId) {
      const perUnit = BigInt(product.materialQuantityPerUnit || 1);
      const deltaBase = (type === 'in' ? 1n : -1n) * BigInt(qty) * perUnit;
      await applyMovement(
        {
          materialId: product.materialId,
          quantityDeltaBase: deltaBase,
          movementType: type === 'in' ? 'IN_ADJUSTMENT' : 'OUT_ADJUSTMENT',
          referenceType: 'PRODUCT_ADJUSTMENT',
          referenceId: product.id,
          notes: reason || null,
          userId: req.user?.id || null,
        },
        t
      );
    }

    await t.commit();
    res.json({ message: 'Inventory adjusted.' });
  } catch (err) {
    await t.rollback();
    res.status(500).json({ message: 'Failed to adjust inventory', error: err.message });
  }
};

/**
 * History of stock movements, shaped for the legacy Inventory page (movement.Product, .type, .quantity, .User).
 * Reads from the new InventoryMovement table, joins back to Product via Product.materialId, and
 * translates movementType → legacy 'in' | 'out'.
 */
exports.getMovements = async (req, res) => {
  try {
    const where = {};

    if (req.query.productId) {
      const product = await Product.findByPk(req.query.productId);
      if (!product || !product.materialId) {
        return res.json([]);
      }
      where.materialId = product.materialId;
    }

    // movementType is a Postgres ENUM; LIKE/`~~` doesn't work on enums without an explicit
    // text cast, so filter with an Op.in list of the relevant enum values instead.
    if (req.query.type === 'in') {
      where.movementType = {
        [Op.in]: ['IN_PURCHASE', 'IN_PRODUCTION', 'IN_ADJUSTMENT'],
      };
    } else if (req.query.type === 'out') {
      where.movementType = {
        [Op.in]: ['OUT_SALE', 'OUT_PRODUCTION', 'OUT_WASTE', 'OUT_ADJUSTMENT'],
      };
    }

    if (req.query.startDate && req.query.endDate) {
      where.createdAt = {
        [Op.between]: [new Date(req.query.startDate), new Date(req.query.endDate)],
      };
    }

    const rows = await InventoryMovement.findAll({
      where,
      include: [
        { model: Material },
        { model: User, as: 'user', attributes: ['id', 'username'] },
      ],
      order: [['createdAt', 'DESC']],
      limit: 1000,
    });

    const materialIds = Array.from(new Set(rows.map((r) => r.materialId).filter(Boolean)));
    const linkedProducts = materialIds.length
      ? await Product.findAll({
          where: { materialId: { [Op.in]: materialIds } },
          attributes: ['id', 'name', 'materialId'],
        })
      : [];
    const productByMaterialId = new Map();
    linkedProducts.forEach((p) => {
      if (!productByMaterialId.has(p.materialId)) productByMaterialId.set(p.materialId, p);
    });

    const shaped = rows.map((row) => {
      const j = row.toJSON();
      const delta = BigInt(j.quantityDeltaBase || 0);
      const isIn = String(j.movementType || '').startsWith('IN_');
      const linkedProduct = productByMaterialId.get(j.materialId) || null;
      return {
        id: j.id,
        createdAt: j.createdAt,
        type: isIn ? 'in' : 'out',
        quantity: Number(delta < 0n ? -delta : delta),
        notes: j.notes,
        movementType: j.movementType,
        materialId: j.materialId,
        Material: j.Material || null,
        Product: linkedProduct
          ? { id: linkedProduct.id, name: linkedProduct.name }
          : j.Material
            ? { id: null, name: j.Material.name }
            : null,
        User: j.user ? { id: j.user.id, username: j.user.username } : null,
      };
    });

    res.json(shaped);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch inventory movements', error: err.message });
  }
};
