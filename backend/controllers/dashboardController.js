const Transaction = require('../models/Transaction');
const Product = require('../models/Product');
const StartingCash = require('../models/StartingCash');
const EndOfDayReconciliation = require('../models/EndOfDayReconciliation');
const Expense = require('../models/Expense');
const { Sequelize } = require('sequelize');
const { Op } = Sequelize;

// Get dashboard metrics
exports.getDashboardMetrics = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const endOfDay = new Date(today);
    endOfDay.setHours(23, 59, 59, 999);

    // Get starting cash
    const startingCash = await StartingCash.findOne({
      where: {
        createdAt: {
          [Op.gte]: today,
          [Op.lt]: new Date(today.getTime() + 24 * 60 * 60 * 1000)
        }
      },
      order: [["createdAt", "DESC"]]
    });

    // Get today's transactions
    const transactions = await Transaction.findAll({
      where: {
        createdAt: {
          [Op.between]: [today, endOfDay]
        }
      },
      include: [{ model: require('../models/User'), as: 'cashier', attributes: ['id', 'username'] }]
    });

    // Calculate sales metrics
    let totalSales = 0;
    let cashSales = 0;
    let gcashSales = 0;
    let cardSales = 0;
    let otherSales = 0;

    transactions.forEach(tx => {
      const amount = parseFloat(tx.total || 0);
      totalSales += amount;
      
      if (tx.mop === 'Cash') {
        cashSales += amount;
      } else if (tx.mop === 'GCash') {
        gcashSales += amount;
      } else if (tx.mop === 'Card') {
        cardSales += amount;
      } else {
        otherSales += amount;
      }
    });

    const totalTransactions = transactions.length;
    const averageTransaction = totalTransactions > 0 ? totalSales / totalTransactions : 0;

    // Get low stock products
    const lowStockProducts = await Product.findAll({
      where: {
        inventory: {
          [Op.lte]: 10
        }
      },
      include: [{ model: require('../models/Category'), attributes: ['name'] }],
      limit: 5
    });

    // Get recent transactions (last 5)
    const recentTransactions = transactions
      .slice(0, 5)
      .map(tx => ({
        id: tx.id,
        customerName: tx.customerName,
        total: parseFloat(tx.total || 0),
        mop: tx.mop,
        createdAt: tx.createdAt,
        cashier: tx.cashier?.username || 'Unknown'
      }));

    // Get sales by hour for today (for chart)
    const salesByHour = [];
    for (let hour = 0; hour < 24; hour++) {
      const hourStart = new Date(today);
      hourStart.setHours(hour, 0, 0, 0);
      const hourEnd = new Date(today);
      hourEnd.setHours(hour, 59, 59, 999);

      const hourTransactions = transactions.filter(tx => {
        const txDate = new Date(tx.createdAt);
        return txDate >= hourStart && txDate <= hourEnd;
      });

      const hourSales = hourTransactions.reduce((sum, tx) => sum + parseFloat(tx.total || 0), 0);

      salesByHour.push({
        hour: `${hour.toString().padStart(2, '0')}:00`,
        sales: hourSales,
        transactions: hourTransactions.length
      });
    }

    // Get today's expenses
    const todayExpenses = await Expense.findAll({
      where: {
        createdAt: {
          [Op.between]: [today, endOfDay]
        }
      }
    });

    const totalExpenses = todayExpenses.reduce((sum, exp) => sum + parseFloat(exp.amount || 0), 0);

    // Cash summary
    const startingCashAmount = startingCash ? parseFloat(startingCash.starting || 0) : 0;
    const expectedCash = startingCashAmount + cashSales - totalExpenses;

    // Check if reconciled
    const reconciliation = await EndOfDayReconciliation.findOne({
      where: {
        date: today.toISOString().split('T')[0]
      }
    });

    res.json({
      today: {
        totalSales,
        cashSales,
        gcashSales,
        cardSales,
        otherSales,
        totalTransactions,
        averageTransaction,
        totalExpenses
      },
      cash: {
        startingCash: startingCashAmount,
        expectedCash,
        isReconciled: !!reconciliation,
        actualCash: reconciliation ? parseFloat(reconciliation.actualCash || 0) : null,
        difference: reconciliation ? parseFloat(reconciliation.cashDifference || 0) : null
      },
      alerts: {
        lowStockCount: lowStockProducts.length,
        lowStockProducts: lowStockProducts.map(p => ({
          id: p.id,
          name: p.name,
          inventory: p.inventory,
          category: p.Category?.name || 'Uncategorized'
        }))
      },
      recentTransactions,
      salesByHour
    });
  } catch (err) {
    console.error('Error in getDashboardMetrics:', err);
    res.status(500).json({ message: 'Failed to fetch dashboard metrics', error: err.message });
  }
};


