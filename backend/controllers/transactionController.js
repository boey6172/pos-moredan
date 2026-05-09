const Transaction = require('../models/Transaction');
const TransactionItem = require('../models/TransactionItem');
const Product = require('../models/Product');
const User = require('../models/User');
const { Sequelize } = require('sequelize');
const { parsePaymentMethods } = require('../utils/paymentUtils');
const { postSaleMaterialDeduction } = require('../services/inventoryMaterialService');

/**
 * Validate payment methods and calculate total
 */
const validatePayments = (payments, transactionTotal) => {
  if (!Array.isArray(payments) || payments.length === 0) {
    throw new Error('At least one payment method is required');
  }
  
  let totalPaid = 0;
  for (const payment of payments) {
    if (!payment.method || typeof payment.method !== 'string') {
      throw new Error('Each payment must have a valid method');
    }
    const amount = parseFloat(payment.amount);
    if (isNaN(amount) || amount <= 0) {
      throw new Error(`Invalid payment amount for ${payment.method}`);
    }
    totalPaid += amount;
  }
  
  if (totalPaid < transactionTotal) {
    throw new Error(`Total payments (₱${totalPaid.toFixed(2)}) is less than transaction total (₱${transactionTotal.toFixed(2)})`);
  }
  
  return totalPaid;
};

/**
 * Format payment methods for display
 */
const formatPaymentMethods = (mop) => {
  const payments = parsePaymentMethods(mop);
  if (!payments) return 'N/A';
  
  if (payments.length === 1 && payments[0].amount === null) {
    // Old format
    return payments[0].method;
  }
  
  // New format: return array of payment objects
  return payments;
};

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
    
    // Validate payment methods if mop is JSON (new format)
    let mopToStore = mop;
    try {
      const payments = JSON.parse(mop);
      if (Array.isArray(payments) && payments.length > 0) {
        // Validate payments for new format
        validatePayments(payments, total);
        mopToStore = mop; // Store as JSON string
      }
    } catch (e) {
      // If not JSON, treat as old format (single string) - no validation needed
      mopToStore = mop || 'Cash';
    }
    
    const transaction = await Transaction.create({
      total,
      discount,
      mop: mopToStore,
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
    await postSaleMaterialDeduction(transaction.id, items, req.user.id, t);
    await t.commit();
    
    // Return formatted payment info
    const paymentInfo = formatPaymentMethods(mopToStore);
    res.status(201).json({ 
      message: 'Transaction completed', 
      transactionId: transaction.id, 
      mop: mopToStore,
      payments: Array.isArray(paymentInfo) ? paymentInfo : null
    });
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
    
    // Format payment methods for each transaction
    const formattedTransactions = transactions.map(t => {
      const transactionData = t.toJSON();
      transactionData.payments = formatPaymentMethods(transactionData.mop);
      return transactionData;
    });
    
    res.json(formattedTransactions);
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
    
    // Format payment methods
    const transactionData = transaction.toJSON();
    transactionData.payments = formatPaymentMethods(transactionData.mop);
    
    res.json(transactionData);
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
    const { items, mop, discount = 0 } = req.body;
    const transactionId = req.params.id;

    const transaction = await Transaction.findByPk(transactionId, {
      include: [{ model: TransactionItem }]
    });

    if (!transaction) return res.status(404).json({ message: 'Transaction not found' });

    const oldItems = transaction.TransactionItems || transaction.transactionItems || [];
    const oldQtyByProduct = {};
    for (const oldItem of oldItems) {
      const pid = oldItem.productId;
      oldQtyByProduct[pid] = (oldQtyByProduct[pid] || 0) + Number(oldItem.quantity || 0);
    }

    const newQtyByProduct = {};
    for (const item of items) {
      const pid = item.productId;
      newQtyByProduct[pid] = (newQtyByProduct[pid] || 0) + Number(item.quantity || 0);
    }

    const allProductIds = new Set([...Object.keys(oldQtyByProduct).map(Number), ...Object.keys(newQtyByProduct).map(Number)]);

    for (const productId of allProductIds) {
      const oldQty = oldQtyByProduct[productId] || 0;
      const newQty = newQtyByProduct[productId] || 0;
      const delta = newQty - oldQty;
      if (delta === 0) continue;

      const product = await Product.findByPk(productId);
      if (!product) throw new Error(`Product not found: ${productId}`);

      const currentInventory = Number(product.inventory ?? 0);
      const afterAdjust = currentInventory - delta;
      if (afterAdjust < 0) throw new Error(`Insufficient stock for: ${product.name} (need ${delta} more, have ${currentInventory})`);

      product.inventory = afterAdjust;
      await product.save({ transaction: t });
    }

    await TransactionItem.destroy({ where: { transactionId }, transaction: t });

    let subtotal = 0;
    for (const item of items) {
      const product = await Product.findByPk(item.productId);
      if (!product) throw new Error(`Product not found: ${item.productId}`);

      const itemSubtotal = parseFloat(product.price) * item.quantity;
      subtotal += itemSubtotal;

      await TransactionItem.create({
        transactionId,
        productId: product.id,
        quantity: item.quantity,
        price: product.price,
        subtotal: itemSubtotal
      }, { transaction: t });
    }

    const newTotal = Math.max(0, subtotal - parseFloat(discount || 0));

    // Validate payment methods if mop is JSON (new format)
    let mopToStore = mop;
    try {
      const payments = JSON.parse(mop);
      if (Array.isArray(payments) && payments.length > 0) {
        // Validate payments for new format
        validatePayments(payments, newTotal);
        mopToStore = mop; // Store as JSON string
      }
    } catch (e) {
      // If not JSON, treat as old format (single string) - no validation needed
      mopToStore = mop || 'Cash';
    }

    transaction.total = newTotal;
    transaction.discount = parseFloat(discount || 0);
    transaction.mop = mopToStore;
    await transaction.save({ transaction: t });

    await t.commit();
    res.json({ message: 'Transaction updated successfully' });
  } catch (err) {
    await t.rollback();
    res.status(500).json({ message: 'Failed to update transaction', error: err.message });
  }
};
