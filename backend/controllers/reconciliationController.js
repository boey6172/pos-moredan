const EndOfDayReconciliation = require('../models/EndOfDayReconciliation');
const Transaction = require('../models/Transaction');
const StartingCash = require('../models/StartingCash');
const { Sequelize } = require('sequelize');
const { Op } = Sequelize;
const { getCashAmount, getNonCashAmount } = require('../utils/paymentUtils');
const { getDayBoundsInPH, getDateStringInPH } = require('../utils/phTime');

// Get today's reconciliation data (Philippine time)
exports.getTodayReconciliation = async (req, res) => {
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

    // Get today's transactions (PH)
    const transactions = await Transaction.findAll({
      where: {
        createdAt: {
          [Op.between]: [startOfDay, endOfDay]
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
      // Use utility functions to handle both single and multi-payment transactions
      totalCashSales += getCashAmount(tx);
      totalNonCashSales += getNonCashAmount(tx);
    });

    const startingCashAmount = startingCash ? parseFloat(startingCash.starting || 0) : 0;
    const expectedCash = startingCashAmount + totalCashSales;

    // Check if already reconciled today (PH date)
    const reconciliation = await EndOfDayReconciliation.findOne({
      where: {
        date: getDateStringInPH(new Date())
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

// Close day / Create reconciliation (Philippine time)
exports.closeDay = async (req, res) => {
  try {
    const { actualCash, notes } = req.body;
    const dateStr = getDateStringInPH(new Date());
    const { start: startOfDay, end: endOfDay } = getDayBoundsInPH(new Date());

    // Check if already closed
    const existing = await EndOfDayReconciliation.findOne({
      where: { date: dateStr }
    });

    if (existing) {
      return res.status(400).json({ message: 'Day has already been closed' });
    }

    // Get starting cash for today (PH)
    const startingCash = await StartingCash.findOne({
      where: {
        createdAt: {
          [Op.between]: [startOfDay, endOfDay]
        }
      },
      order: [["createdAt", "DESC"]]
    });

    // Get today's transactions (PH)
    const transactions = await Transaction.findAll({
      where: {
        createdAt: {
          [Op.between]: [startOfDay, endOfDay]
        }
      }
    });

    // Calculate totals
    let totalCashSales = 0;
    let totalNonCashSales = 0;

    transactions.forEach(tx => {
      // Use utility functions to handle both single and multi-payment transactions
      totalCashSales += getCashAmount(tx);
      totalNonCashSales += getNonCashAmount(tx);
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


