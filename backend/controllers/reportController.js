const Transaction = require('../models/Transaction');
const TransactionItem = require('../models/TransactionItem');
const Product = require('../models/Product');
const Category = require('../models/Category');
const InventoryMovement = require('../models/InventoryMovement');
const { Sequelize } = require('sequelize');
const sequelize = require('../config/database');
const { calculatePaymentMethodTotals } = require('../utils/paymentUtils');
const { getDateStringInPH, getDayBoundsInPH, getWeekStartDateInPH } = require('../utils/phTime');

exports.getSalesReport = async (req, res) => {
  try {
    const period = req.query.period || 'daily';
    const { startDate, endDate } = req.query;

    // Use Philippine time day boundaries so "Jan 1–Jan 31" includes full days in PH (not UTC)
    const where = {};
    if (startDate && endDate) {
      where.createdAt = {
        [Sequelize.Op.between]: [getDayBoundsInPH(startDate).start, getDayBoundsInPH(endDate).end]
      };
    } else if (startDate) {
      where.createdAt = { [Sequelize.Op.gte]: getDayBoundsInPH(startDate).start };
    } else if (endDate) {
      where.createdAt = { [Sequelize.Op.lte]: getDayBoundsInPH(endDate).end };
    }

    if (period !== 'daily' && period !== 'weekly' && period !== 'monthly') {
      return res.status(400).json({ message: 'Invalid period' });
    }

    // Get all transactions in range (grouping done in PH time below)
    const transactions = await Transaction.findAll({
      attributes: ['id', 'total', 'mop', 'createdAt'],
      where,
      order: [['createdAt', 'ASC']]
    });

    // Group by period in Philippine time so report matches local date (and SQL in Asia/Manila)
    const groupedData = {};
    transactions.forEach(tx => {
      const txDate = new Date(tx.createdAt);
      let periodKey;
      if (period === 'daily') {
        periodKey = getDateStringInPH(txDate);
      } else if (period === 'weekly') {
        periodKey = getWeekStartDateInPH(txDate);
      } else {
        periodKey = getDateStringInPH(txDate).slice(0, 7); // YYYY-MM
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

    // Convert to array, sort by period, and format
    const sales = Object.values(groupedData)
      .sort((a, b) => a.period.localeCompare(b.period))
      .map(item => ({
        ...item,
        cashSales: parseFloat(Number(item.cashSales).toFixed(2)),
        gcashSales: parseFloat(Number(item.gcashSales).toFixed(2)),
        totalSales: parseFloat(Number(item.totalSales).toFixed(2))
      }));

    res.json(sales);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch sales report', error: err.message });
  }
};

exports.getTopProducts = async (req, res) => {
  try {
    const limitParam = req.query.limit;
    const limit = limitParam === 'all' || limitParam === '' ? 9999 : Math.max(1, parseInt(limitParam, 10) || 5);
    const { startDate, endDate } = req.query;

    let dateClause = '';
    const replacements = { limit };

    if (startDate && endDate) {
      dateClause = ' AND t."createdAt" BETWEEN :startDate AND :endDate';
      replacements.startDate = new Date(startDate);
      replacements.endDate = new Date(endDate);
    } else if (startDate) {
      dateClause = ' AND t."createdAt" >= :startDate';
      replacements.startDate = new Date(startDate);
    } else if (endDate) {
      dateClause = ' AND t."createdAt" <= :endDate';
      replacements.endDate = new Date(endDate);
    }

    const topProductsData = await sequelize.query(`
      SELECT 
        ti."productId",
        SUM(ti.quantity) as "totalSold"
      FROM "TransactionItems" ti
      INNER JOIN "Transactions" t ON t.id = ti."transactionId"
      WHERE 1=1 ${dateClause}
      GROUP BY ti."productId"
      ORDER BY "totalSold" DESC
      LIMIT :limit
    `, {
      replacements,
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

    // Same date window for inventory adjustments. The new InventoryMovement ledger keys movements
    // by materialId + movementType (IN_*/OUT_*); we'll map products → materials below.
    const inventoryMovementWhere = {
      movementType: {
        [Sequelize.Op.in]: [
          'IN_PURCHASE',
          'IN_PRODUCTION',
          'IN_ADJUSTMENT',
          'OUT_PRODUCTION',
          'OUT_WASTE',
          'OUT_ADJUSTMENT',
        ],
      },
    };
    if (startDate && endDate) {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      inventoryMovementWhere.createdAt = { [Sequelize.Op.between]: [start, end] };
    } else if (startDate) {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      inventoryMovementWhere.createdAt = { [Sequelize.Op.gte]: start };
    } else if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      inventoryMovementWhere.createdAt = { [Sequelize.Op.lte]: end };
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
          attributes: ['id', 'name', 'sku', 'price', 'inventory']
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

    // Build product-level summary: beginning stocks, sold in period, remaining stocks
    const productMap = {};
    salesItems.forEach(item => {
      const productId = item.Product?.id;
      if (!productId) return;
      const categoryName = item.Product?.Category?.name || 'Uncategorized';
      const productName = item.Product?.name;
      const remaining = Number(item.Product?.inventory ?? 0);
      if (!productMap[productId]) {
        productMap[productId] = {
          productId,
          productName,
          categoryName,
          soldInPeriod: 0,
          remainingStock: remaining,
        };
      }
      productMap[productId].soldInPeriod += item.quantity;
    });

    // Bridge old per-product stock-adjustment math to the new material-based ledger.
    // Strategy: look up each product's linked materialId, aggregate InventoryMovement by
    // materialId + IN_/OUT_ direction, then map results back to the owning productId.
    // Products without a linked material (materialId = null) simply report stockIn/stockOut = 0.
    const movementByProduct = {};
    const productIdsInSummary = Object.keys(productMap).map(id => Number(id));
    if (productIdsInSummary.length > 0) {
      const productsWithMaterial = await Product.findAll({
        where: { id: { [Sequelize.Op.in]: productIdsInSummary } },
        attributes: ['id', 'materialId', 'materialQuantityPerUnit'],
        raw: true,
      });

      const materialIdToProductIds = new Map(); // materialId → [productId, ...]
      const productIdToConversion = new Map();  // productId → { materialId, perUnit }
      productsWithMaterial.forEach((p) => {
        if (!p.materialId) return;
        const perUnit = Number(p.materialQuantityPerUnit || 1) || 1;
        productIdToConversion.set(p.id, { materialId: p.materialId, perUnit });
        if (!materialIdToProductIds.has(p.materialId)) {
          materialIdToProductIds.set(p.materialId, []);
        }
        materialIdToProductIds.get(p.materialId).push(p.id);
      });

      const materialIds = Array.from(materialIdToProductIds.keys());
      if (materialIds.length > 0) {
        const movementAgg = await InventoryMovement.findAll({
          attributes: [
            'materialId',
            'movementType',
            [Sequelize.fn('SUM', Sequelize.col('quantityDeltaBase')), 'totalDelta'],
          ],
          where: {
            ...inventoryMovementWhere,
            materialId: { [Sequelize.Op.in]: materialIds },
          },
          group: ['materialId', 'movementType'],
          raw: true,
        });

        // Aggregate per material first (sum across movement subtypes within IN_/OUT_).
        const stockByMaterial = new Map(); // materialId → { stockInBase, stockOutBase }
        movementAgg.forEach((row) => {
          const matId = Number(row.materialId);
          const delta = Number(row.totalDelta || 0); // base units (signed in DB; outs are negative)
          const isIn = String(row.movementType || '').startsWith('IN_');
          const bucket = stockByMaterial.get(matId) || { stockInBase: 0, stockOutBase: 0 };
          if (isIn) {
            bucket.stockInBase += Math.abs(delta);
          } else {
            bucket.stockOutBase += Math.abs(delta);
          }
          stockByMaterial.set(matId, bucket);
        });

        // Fan out to each product that links to the material, converting base units → product units.
        productIdToConversion.forEach(({ materialId, perUnit }, productId) => {
          const totals = stockByMaterial.get(materialId);
          if (!totals) return;
          movementByProduct[productId] = {
            stockIn: Math.round(totals.stockInBase / perUnit),
            stockOut: Math.round(totals.stockOutBase / perUnit),
          };
        });
      }
    }

    // beginning + stockIn - stockOut - soldInPeriod = remainingStock (inventory adjustments + sales)
    const productStockSummary = Object.values(productMap)
      .map(p => {
        const adj = movementByProduct[p.productId] || { stockIn: 0, stockOut: 0 };
        const stockIn = adj.stockIn;
        const stockOut = adj.stockOut;
        const beginningStock = p.remainingStock + p.soldInPeriod + stockOut - stockIn;
        return {
          productId: p.productId,
          productName: p.productName,
          categoryName: p.categoryName,
          beginningStock,
          stockIn,
          stockOut,
          soldInPeriod: p.soldInPeriod,
          remainingStock: p.remainingStock,
        };
      })
      .sort((a, b) => a.categoryName.localeCompare(b.categoryName) || a.productName.localeCompare(b.productName));

    // Category totals: total quantity sold per category
    const categoryTotals = Object.values(groupedByCategory)
      .sort((a, b) => a.categoryName.localeCompare(b.categoryName))
      .map(c => ({ categoryName: c.categoryName, totalSold: c.totalQuantity }));

    // Convert to array and sort by category name
    const categories = Object.values(groupedByCategory).sort((a, b) =>
      a.categoryName.localeCompare(b.categoryName)
    );

    res.json({ categories, productStockSummary, categoryTotals });
  } catch (err) {
    console.error('Error in getSalesItemsByCategory:', err);
    res.status(500).json({ message: 'Failed to fetch sales items by category', error: err.message });
  }
}; 