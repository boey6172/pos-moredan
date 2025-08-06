const InventoryMovement = require('../models/InventoryMovement');
const Product = require('../models/Product');
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const { Sequelize } = require('sequelize');

exports.adjustInventory = async (req, res) => {
  try {
    const { productId, type, quantity, reason } = req.body;
    if (!productId || !type || !quantity) {
      return res.status(400).json({ message: 'Missing required fields.' });
    }
    const product = await Product.findByPk(productId);
    if (!product) return res.status(404).json({ message: 'Product not found.' });
    if (type === 'in') product.inventory += quantity;
    else if (type === 'out') {
      if (product.inventory < quantity) return res.status(400).json({ message: 'Insufficient stock.' });
      product.inventory -= quantity;
    } else {
      return res.status(400).json({ message: 'Invalid type.' });
    }
    await product.save();
    await InventoryMovement.create({
      productId,
      type,
      quantity,
      reason,
      userId: req.user.id,
    });
    res.json({ message: 'Inventory adjusted.' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to adjust inventory', error: err.message });
  }
};

exports.getMovements = async (req, res) => {
  try {
    const where = {};
    if (req.query.productId) where.productId = req.query.productId;
    if (req.query.type) where.type = req.query.type;
    if (req.query.startDate && req.query.endDate) {
      where.createdAt = {
        [Sequelize.Op.between]: [new Date(req.query.startDate), new Date(req.query.endDate)]
      };
    }
    const movements = await InventoryMovement.findAll({
      where,
      include: [Product, User, Transaction],
      order: [['createdAt', 'DESC']]
    });
    res.json(movements);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch inventory movements', error: err.message });
  }
}; 