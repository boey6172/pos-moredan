const Transaction = require('../models/Transaction');
const TransactionItem = require('../models/TransactionItem');
const Product = require('../models/Product');
const Category = require('../models/Category');
const { Sequelize } = require('sequelize');
const sequelize = require('../config/database');
const { calculatePaymentMethodTotals } = require('../utils/paymentUtils');

exports.getSalesReport = async (req, res) => {
  try {
    const period = req.query.period || 'daily';
    const { startDate, endDate } = req.query; // Example: ?startDate=2025-10-01&endDate=2025-10-14

    const where = {};
    if (startDate && endDate) {
      where.createdAt = { [Sequelize.Op.between]: [new Date(startDate), new Date(endDate)] };
    } else if (startDate) {
      where.createdAt = { [Sequelize.Op.gte]: new Date(startDate) };
    } else if (endDate) {
      where.createdAt = { [Sequelize.Op.lte]: new Date(endDate) };
    }
    
    let groupBy;
    if (period === 'daily') groupBy = [Sequelize.fn('DATE', Sequelize.col('createdAt'))];
    else if (period === 'weekly') groupBy = [Sequelize.fn('DATE_TRUNC', 'week', Sequelize.col('createdAt'))];
    else if (period === 'monthly') groupBy = [Sequelize.fn('DATE_TRUNC', 'month', Sequelize.col('createdAt'))];
    else return res.status(400).json({ message: 'Invalid period' });

    // Get all transactions first to process payment methods
    const transactions = await Transaction.findAll({
      attributes: ['id', 'total', 'mop', 'createdAt'],
      where,
      order: [['createdAt', 'ASC']]
    });

    // Group transactions by period and calculate payment method totals
    const groupedData = {};
    
    transactions.forEach(tx => {
      const txDate = new Date(tx.createdAt);
      let periodKey;
      
      if (period === 'daily') {
        periodKey = txDate.toISOString().split('T')[0];
      } else if (period === 'weekly') {
        const weekStart = new Date(txDate);
        weekStart.setDate(txDate.getDate() - txDate.getDay());
        periodKey = weekStart.toISOString().split('T')[0];
      } else if (period === 'monthly') {
        periodKey = `${txDate.getFullYear()}-${String(txDate.getMonth() + 1).padStart(2, '0')}`;
      }
      
      if (!groupedData[periodKey]) {
        groupedData[periodKey] = {
          period: periodKey,
          transactionCount: 0,
          cashSales: 0,
          gcashSales: 0,
          totalSales: 0
        };
      }
      
      const totals = calculatePaymentMethodTotals(tx);
      groupedData[periodKey].transactionCount += 1;
      groupedData[periodKey].cashSales += totals.cash;
      groupedData[periodKey].gcashSales += totals.gcash;
      groupedData[periodKey].totalSales += parseFloat(tx.total || 0);
    });

    // Convert to array and format
    const sales = Object.values(groupedData).map(item => ({
      ...item,
      cashSales: parseFloat(item.cashSales.toFixed(2)),
      gcashSales: parseFloat(item.gcashSales.toFixed(2)),
      totalSales: parseFloat(item.totalSales.toFixed(2))
    }));

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

exports.getSalesItemsByCategory = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    // Build date filter for transactions
    const transactionWhere = {};
    if (startDate && endDate) {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      transactionWhere.createdAt = { [Sequelize.Op.between]: [start, end] };
    } else if (startDate) {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      transactionWhere.createdAt = { [Sequelize.Op.gte]: start };
    } else if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      transactionWhere.createdAt = { [Sequelize.Op.lte]: end };
    }

    // Get all transaction items with product and category info, filtered by date
    const salesItems = await TransactionItem.findAll({
      include: [
        {
          model: Transaction,
          where: transactionWhere,
          required: true,
          attributes: ['id', 'createdAt', 'customerName', 'mop']
        },
        {
          model: Product,
          required: true,
          include: [
            {
              model: Category,
              required: true,
              attributes: ['id', 'name']
            }
          ],
          attributes: ['id', 'name', 'sku', 'price']
        }
      ],
      attributes: ['id', 'quantity', 'price', 'subtotal']
    });

    // Group by category
    const groupedByCategory = {};
    
    salesItems.forEach(item => {
      const categoryName = item.Product?.Category?.name || 'Uncategorized';
      const categoryId = item.Product?.Category?.id || 0;
      
      if (!groupedByCategory[categoryName]) {
        groupedByCategory[categoryName] = {
          categoryId,
          categoryName,
          items: [],
          totalQuantity: 0,
          totalRevenue: 0
        };
      }
      
      const itemData = {
        id: item.id,
        productId: item.Product?.id,
        productName: item.Product?.name,
        sku: item.Product?.sku,
        quantity: item.quantity,
        price: parseFloat(item.price),
        subtotal: parseFloat(item.subtotal),
        transactionId: item.Transaction?.id,
        transactionDate: item.Transaction?.createdAt,
        customerName: item.Transaction?.customerName,
        mop: item.Transaction?.mop
      };
      
      groupedByCategory[categoryName].items.push(itemData);
      groupedByCategory[categoryName].totalQuantity += item.quantity;
      groupedByCategory[categoryName].totalRevenue += parseFloat(item.subtotal);
    });

    // Convert to array and sort by category name
    const result = Object.values(groupedByCategory).sort((a, b) => 
      a.categoryName.localeCompare(b.categoryName)
    );

    res.json(result);
  } catch (err) {
    console.error('Error in getSalesItemsByCategory:', err);
    res.status(500).json({ message: 'Failed to fetch sales items by category', error: err.message });
  }
}; 