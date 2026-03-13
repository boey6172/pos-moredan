const Transaction = require('../models/Transaction');
const Product = require('../models/Product');
const StartingCash = require('../models/StartingCash');
const EndOfDayReconciliation = require('../models/EndOfDayReconciliation');
const Expense = require('../models/Expense');
const { Sequelize } = require('sequelize');
const { Op } = Sequelize;
const { calculatePaymentMethodTotals } = require('../utils/paymentUtils');
const { getDayBoundsInPH, getDateStringInPH } = require('../utils/phTime');

// Get dashboard metrics (all "today" uses Philippine time so server timezone does not matter)
exports.getDashboardMetrics = async (req, res) => {
  try {
    const { start: startOfDay, end: endOfDay } = getDayBoundsInPH(new Date());

    // Get starting cash for today (PH)
    const startingCash = await StartingCash.findOne({
      where: {
        createdAt: {
          [Op.between]: [startOfDay, endOfDay]
        }
      },
      order: [["createdAt", "DESC"]]
    });

    // Get today's transactions (PH day)
    const transactions = await Transaction.findAll({
      where: {
        createdAt: {
          [Op.between]: [startOfDay, endOfDay]
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
      
      // Use utility function to handle both single and multi-payment transactions
      const totals = calculatePaymentMethodTotals(tx);
      cashSales += totals.cash;
      gcashSales += totals.gcash;
      cardSales += totals.card;
      otherSales += totals.other + totals.paymaya + totals.bankTransfer;
    });

    const totalTransactions = transactions.length;
    const averageTransaction = totalTransactions > 0 ? totalSales / totalTransactions : 0;

    // Get today's expenses (PH day)
    const todayExpenses = await Expense.findAll({
      where: {
        createdAt: {
          [Op.between]: [startOfDay, endOfDay]
        }
      }
    });
    const totalExpenses = todayExpenses.reduce((sum, exp) => sum + parseFloat(exp.amount || 0), 0);

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
    const { parsePaymentMethods } = require('../utils/paymentUtils');
    const recentTransactions = transactions
      .slice(0, 5)
      .map(tx => {
        const payments = parsePaymentMethods(tx.mop);
        // Format payments: if it's new format (has amounts), return array; otherwise return null to use mop
        const formattedPayments = payments && payments.length > 0 && payments[0].amount !== null 
          ? payments 
          : null;
        return {
          id: tx.id,
          customerName: tx.customerName,
          total: parseFloat(tx.total || 0),
          mop: tx.mop, // Keep mop for backward compatibility
          payments: formattedPayments,
          createdAt: tx.createdAt,
          cashier: tx.cashier?.username || 'Unknown'
        };
      });

    // Get sales by hour for today in PH (for chart)
    const salesByHour = [];
    const todayStr = getDateStringInPH(new Date());
    for (let hour = 0; hour < 24; hour++) {
      const hourStart = new Date(`${todayStr}T${String(hour).padStart(2, '0')}:00:00.000+08:00`);
      const hourEnd = new Date(`${todayStr}T${String(hour).padStart(2, '0')}:59:59.999+08:00`);

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

    // Cash summary (expected cash = starting + cash sales; expenses are not subtracted)
    const startingCashAmount = startingCash ? parseFloat(startingCash.starting || 0) : 0;
    const expectedCash = startingCashAmount + cashSales;

    // Check if reconciled (use PH date)
    const reconciliation = await EndOfDayReconciliation.findOne({
      where: {
        date: getDateStringInPH(new Date())
      }
    });

    res.json({
      today: {
        totalSales,
        totalExpenses,
        cashSales,
        gcashSales,
        cardSales,
        otherSales,
        totalTransactions,
        averageTransaction
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


