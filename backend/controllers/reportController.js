const Transaction = require('../models/Transaction');
const TransactionItem = require('../models/TransactionItem');
const Product = require('../models/Product');
const { Sequelize } = require('sequelize');
const sequelize = require('../config/database');

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
        [Sequelize.fn('SUM', Sequelize.literal(`CASE WHEN mop = 'Cash' THEN total ELSE 0 END`)), 'cashSales'],
        [Sequelize.fn('SUM', Sequelize.literal(`CASE WHEN mop = 'GCash' THEN total ELSE 0 END`)), 'gcashSales'],
        [Sequelize.fn('SUM', Sequelize.col('total')), 'totalSales'],
        [groupBy[0], 'period']
      ],
      group: groupBy,
      order: [[groupBy[0], 'ASC']]
    });
    res.json(sales);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch sales report', error: err.message });
  }
};

exports.getTopProducts = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 5;
    
    // Use a raw query to ensure proper column naming
    const topProductsData = await sequelize.query(`
      SELECT 
        ti."productId",
        SUM(ti.quantity) as "totalSold"
      FROM "TransactionItems" ti
      GROUP BY ti."productId"
      ORDER BY "totalSold" DESC
      LIMIT :limit
    `, {
      replacements: { limit },
      type: Sequelize.QueryTypes.SELECT
    });

    // Then get the product details for these top products
    const productIds = topProductsData.map(item => item.productId);
    const products = await Product.findAll({
      where: { id: productIds },
      attributes: ['id', 'name', 'sku', 'inventory', 'price'],
      raw: true
    });

    // Combine the data
    const formattedProducts = topProductsData.map(item => {
      const product = products.find(p => p.id === item.productId);
      return {
        productId: item.productId,
        totalSold: parseInt(item.totalSold || 0),
        Product: product ? {
          id: product.id,
          name: product.name,
          sku: product.sku,
          inventory: product.inventory,
          price: product.price
        } : null
      };
    });

    res.json(formattedProducts);
  } catch (err) {
    console.error('Error in getTopProducts:', err);
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