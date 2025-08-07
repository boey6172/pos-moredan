const Transaction = require('../models/Transaction');
const TransactionItem = require('../models/TransactionItem');
const Product = require('../models/Product');
const User = require('../models/User');
const { Sequelize } = require('sequelize');

exports.createTransaction = async (req, res) => {
  const t = await Transaction.sequelize.transaction();
  try {
    const { items, discount = 0, mop, customerName } = req.body;
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'No items provided.' });
    }
    let total = 0;
    for (const item of items) {
      const product = await Product.findByPk(item.productId);
      if (!product) throw new Error('Product not found: ' + item.productId);
      if (product.inventory < item.quantity) throw new Error('Insufficient stock for: ' + product.name);
      total += parseFloat(product.price) * item.quantity;
    }
    total = total - discount;
    const transaction = await Transaction.create({
      total,
      discount,
      mop,
      cashierId: req.user.id,
      customerName
    }, { transaction: t });
    for (const item of items) {
      const product = await Product.findByPk(item.productId);
      await TransactionItem.create({
        transactionId: transaction.id,
        productId: product.id,
        quantity: item.quantity,
        price: product.price,
        subtotal: parseFloat(product.price) * item.quantity,
      }, { transaction: t });
      // Update inventory
      product.inventory -= item.quantity;
      await product.save({ transaction: t });
    }
    await t.commit();
    res.status(201).json({ message: 'Transaction completed', transactionId: transaction.id, mop });
  } catch (err) {
    await t.rollback();
    res.status(500).json({ message: 'Transaction failed', error: err.message });
  }
};

exports.getTransactions = async (req, res) => {
  try {
    const where = {};
    if (req.query.cashierId) where.cashierId = req.query.cashierId;
    if (req.query.startDate && req.query.endDate) {
      where.createdAt = {
        [Sequelize.Op.between]: [new Date(req.query.startDate), new Date(req.query.endDate)]
      };
    }
    const transactions = await Transaction.findAll({
      where,
      include: [
        { model: User, as: 'cashier', attributes: ['id', 'username', 'role'] },
        { model: TransactionItem, include: [Product] }
      ],
      order: [['createdAt', 'DESC']]
    });
    res.json(transactions);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch transactions', error: err.message });
  }
};

exports.getTransactionById = async (req, res) => {
  try {
    const transaction = await Transaction.findByPk(req.params.id, {
      include: [
        { model: User, as: 'cashier', attributes: ['id', 'username', 'role'] },
        { model: TransactionItem, include: [Product] }
      ]
    });
    if (!transaction) return res.status(404).json({ message: 'Transaction not found' });
    res.json(transaction);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch transaction', error: err.message });
  }
};

exports.deleteTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findByPk(req.params.id);
    if (!transaction) return res.status(404).json({ message: 'Transaction not found' });
    await TransactionItem.destroy({ where: { transactionId: transaction.id } });
    await transaction.destroy();
    res.json({ message: 'Transaction deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete transaction', error: err.message });
  }
}; 

exports.updateTransaction = async (req, res) => {
  const t = await Transaction.sequelize.transaction();
  try {
    const { items, mop } = req.body;
    const transactionId = req.params.id;

    const transaction = await Transaction.findByPk(transactionId, {
      include: [{ model: TransactionItem }]
    });

    if (!transaction) return res.status(404).json({ message: 'Transaction not found' });

    // Restore inventory from old items
    for (const oldItem of transaction.TransactionItems) {
      const product = await Product.findByPk(oldItem.productId);
      product.inventory += oldItem.quantity;
      await product.save({ transaction: t });
    }

    // Delete old items
    await TransactionItem.destroy({ where: { transactionId }, transaction: t });

    let newTotal = 0;
    for (const item of items) {
      const product = await Product.findByPk(item.productId);
      if (!product) throw new Error(`Product not found: ${item.productId}`);
      if (product.inventory < item.quantity) throw new Error(`Insufficient stock for: ${product.name}`);

      const subtotal = parseFloat(product.price) * item.quantity;
      newTotal += subtotal;

      await TransactionItem.create({
        transactionId,
        productId: product.id,
        quantity: item.quantity,
        price: product.price,
        subtotal
      }, { transaction: t });

      product.inventory -= item.quantity;
      await product.save({ transaction: t });
    }

    transaction.total = newTotal;
    transaction.mop = mop;
    await transaction.save({ transaction: t });

    await t.commit();
    res.json({ message: 'Transaction updated successfully' });
  } catch (err) {
    await t.rollback();
    res.status(500).json({ message: 'Failed to update transaction', error: err.message });
  }
};
