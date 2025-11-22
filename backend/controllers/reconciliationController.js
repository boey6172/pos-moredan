const EndOfDayReconciliation = require('../models/EndOfDayReconciliation');
const Transaction = require('../models/Transaction');
const StartingCash = require('../models/StartingCash');
const { Sequelize } = require('sequelize');
const { Op } = Sequelize;

// Get today's reconciliation data (for dashboard and closing)
exports.getTodayReconciliation = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const endOfDay = new Date(today);
    endOfDay.setHours(23, 59, 59, 999);

    // Get starting cash for today
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
      }
    });

    // Calculate totals
    let totalCashSales = 0;
    let totalNonCashSales = 0;
    let totalTransactions = transactions.length;
    let totalSales = 0;

    transactions.forEach(tx => {
      const amount = parseFloat(tx.total || 0);
      totalSales += amount;
      if (tx.mop === 'Cash') {
        totalCashSales += amount;
      } else {
        totalNonCashSales += amount;
      }
    });

    const startingCashAmount = startingCash ? parseFloat(startingCash.starting || 0) : 0;
    const expectedCash = startingCashAmount + totalCashSales;

    // Check if already reconciled today
    const reconciliation = await EndOfDayReconciliation.findOne({
      where: {
        date: today.toISOString().split('T')[0]
      },
      include: [{ model: require('../models/User'), as: 'closedByUser', attributes: ['id', 'username'] }]
    });

    res.json({
      startingCash: startingCashAmount,
      totalCashSales,
      totalNonCashSales,
      totalSales,
      totalTransactions,
      expectedCash,
      actualCash: reconciliation ? reconciliation.actualCash : null,
      cashDifference: reconciliation ? reconciliation.cashDifference : null,
      isReconciled: !!reconciliation,
      reconciliation: reconciliation,
      averageTransaction: totalTransactions > 0 ? totalSales / totalTransactions : 0
    });
  } catch (err) {
    console.error('Error in getTodayReconciliation:', err);
    res.status(500).json({ message: 'Failed to fetch reconciliation data', error: err.message });
  }
};

// Close day / Create reconciliation
exports.closeDay = async (req, res) => {
  try {
    const { actualCash, notes } = req.body;
    const today = new Date();
    const dateStr = today.toISOString().split('T')[0];
    today.setHours(0, 0, 0, 0);
    const endOfDay = new Date(today);
    endOfDay.setHours(23, 59, 59, 999);

    // Check if already closed
    const existing = await EndOfDayReconciliation.findOne({
      where: { date: dateStr }
    });

    if (existing) {
      return res.status(400).json({ message: 'Day has already been closed' });
    }

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
      }
    });

    // Calculate totals
    let totalCashSales = 0;
    let totalNonCashSales = 0;

    transactions.forEach(tx => {
      const amount = parseFloat(tx.total || 0);
      if (tx.mop === 'Cash') {
        totalCashSales += amount;
      } else {
        totalNonCashSales += amount;
      }
    });

    const startingCashAmount = startingCash ? parseFloat(startingCash.starting || 0) : 0;
    const expectedCash = startingCashAmount + totalCashSales;
    const actualCashAmount = parseFloat(actualCash || 0);
    const cashDifference = actualCashAmount - expectedCash;

    const reconciliation = await EndOfDayReconciliation.create({
      date: dateStr,
      startingCash: startingCashAmount,
      expectedCash,
      actualCash: actualCashAmount,
      cashDifference,
      totalCashSales,
      totalNonCashSales,
      totalTransactions: transactions.length,
      notes: notes || null,
      closedBy: req.user.id
    });

    const reconciliationWithUser = await EndOfDayReconciliation.findByPk(reconciliation.id, {
      include: [{ model: require('../models/User'), as: 'closedByUser', attributes: ['id', 'username'] }]
    });

    res.status(201).json(reconciliationWithUser);
  } catch (err) {
    console.error('Error in closeDay:', err);
    res.status(500).json({ message: 'Failed to close day', error: err.message });
  }
};

// Get reconciliation history
exports.getReconciliationHistory = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    let where = {};
    if (startDate && endDate) {
      where.date = {
        [Op.between]: [startDate, endDate]
      };
    } else if (startDate) {
      where.date = {
        [Op.gte]: startDate
      };
    } else if (endDate) {
      where.date = {
        [Op.lte]: endDate
      };
    }

    const reconciliations = await EndOfDayReconciliation.findAll({
      where,
      include: [{ model: require('../models/User'), as: 'closedByUser', attributes: ['id', 'username'] }],
      order: [['date', 'DESC']],
      limit: 30 // Last 30 days by default
    });

    res.json(reconciliations);
  } catch (err) {
    console.error('Error in getReconciliationHistory:', err);
    res.status(500).json({ message: 'Failed to fetch reconciliation history', error: err.message });
  }
};


