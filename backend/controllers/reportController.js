const Transaction = require('../models/Transaction');
const TransactionItem = require('../models/TransactionItem');
const Product = require('../models/Product');
const { Sequelize } = require('sequelize');

exports.getSalesReport = async (req, res) => {
  try {
    const period = req.query.period || 'daily';
    let groupBy;
    if (period === 'daily') groupBy = [Sequelize.fn('DATE', Sequelize.col('createdAt'))];
    else if (period === 'weekly') groupBy = [Sequelize.fn('DATE_TRUNC', 'week', Sequelize.col('createdAt'))];
    else if (period === 'monthly') groupBy = [Sequelize.fn('DATE_TRUNC', 'month', Sequelize.col('createdAt'))];
    else return res.status(400).json({ message: 'Invalid period' });

    const sales = await Transaction.findAll({
      attributes: [
        [Sequelize.fn('COUNT', Sequelize.col('id')), 'transactionCount'],
        [Sequelize.fn('SUM', Sequelize.col('total')), 'totalSales'],
        [groupBy[0], 'period']
      ],
      group: groupBy,
      order: [[groupBy[0], 'DESC']]
    });
    res.json(sales);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch sales report', error: err.message });
  }
};

exports.getTopProducts = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 5;
    const topProducts = await TransactionItem.findAll({
      attributes: [
        'productId',
        [Sequelize.fn('SUM', Sequelize.col('quantity')), 'totalSold']
      ],
      include: [{ model: Product }],
      group: ['productId', 'Product.id'],
      order: [[Sequelize.literal('totalSold'), 'DESC']],
      limit
    });
    res.json(topProducts);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch top products', error: err.message });
  }
};

exports.getLowStock = async (req, res) => {
  try {
    const threshold = parseInt(req.query.threshold) || 10;
    const lowStock = await Product.findAll({
      where: { inventory: { [Sequelize.Op.lte]: threshold } }
    });
    res.json(lowStock);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch low stock products', error: err.message });
  }
}; 