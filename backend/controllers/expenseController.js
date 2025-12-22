const Expense = require('../models/Expense');
const ExpenseType = require('../models/ExpenseType');
const { Sequelize } = require('sequelize');
const { Op } = Sequelize;

// Get all expense types
exports.getExpenseTypes = async (req, res) => {
  try {
    const types = await ExpenseType.findAll({
      order: [['name', 'ASC']]
    });
    res.json(types);
  } catch (err) {
    console.error('Error in getExpenseTypes:', err);
    res.status(500).json({ message: 'Failed to fetch expense types', error: err.message });
  }
};

// Create or get expense type
exports.createOrGetExpenseType = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name || name.trim() === '') {
      return res.status(400).json({ message: 'Expense type name is required' });
    }

    const [expenseType, created] = await ExpenseType.findOrCreate({
      where: { name: name.trim() },
      defaults: { name: name.trim() }
    });

    res.json(expenseType);
  } catch (err) {
    console.error('Error in createOrGetExpenseType:', err);
    res.status(500).json({ message: 'Failed to create expense type', error: err.message });
  }
};

// Create expense
exports.createExpense = async (req, res) => {
  try {
    const { amount, type, location, notes } = req.body;

    if (!amount || !type || !location) {
      return res.status(400).json({ message: 'Amount, type, and location are required' });
    }

    // Ensure expense type exists
    const [expenseType] = await ExpenseType.findOrCreate({
      where: { name: type.trim() },
      defaults: { name: type.trim() }
    });

    const expense = await Expense.create({
      amount: parseFloat(amount),
      type: expenseType.name,
      location: location.trim(),
      notes: notes || null,
      createdBy: req.user.id
    });

    const expenseWithRelations = await Expense.findByPk(expense.id, {
      include: [
        { model: require('../models/User'), as: 'creator', attributes: ['id', 'username'] }
      ]
    });

    res.status(201).json(expenseWithRelations);
  } catch (err) {
    console.error('Error in createExpense:', err);
    res.status(500).json({ message: 'Failed to create expense', error: err.message });
  }
};

// Get expenses
exports.getExpenses = async (req, res) => {
  try {
    const { startDate, endDate, type, location } = req.query;

    let where = {};
    
    if (startDate && endDate) {
      where.createdAt = {
        [Op.between]: [new Date(startDate), new Date(endDate + 'T23:59:59.999Z')]
      };
    } else if (startDate) {
      where.createdAt = {
        [Op.gte]: new Date(startDate)
      };
    } else if (endDate) {
      where.createdAt = {
        [Op.lte]: new Date(endDate + 'T23:59:59.999Z')
      };
    }

    if (type) {
      where.type = type;
    }

    if (location) {
      where.location = location;
    }

    const expenses = await Expense.findAll({
      where,
      include: [
        { model: require('../models/User'), as: 'creator', attributes: ['id', 'username'] }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.json(expenses);
  } catch (err) {
    console.error('Error in getExpenses:', err);
    res.status(500).json({ message: 'Failed to fetch expenses', error: err.message });
  }
};

// Get today's expenses
exports.getTodayExpenses = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const endOfDay = new Date(today);
    endOfDay.setHours(23, 59, 59, 999);

    const expenses = await Expense.findAll({
      where: {
        createdAt: {
          [Op.between]: [today, endOfDay]
        }
      },
      include: [
        { model: require('../models/User'), as: 'creator', attributes: ['id', 'username'] }
      ],
      order: [['createdAt', 'DESC']]
    });

    const totalExpenses = expenses.reduce((sum, exp) => sum + parseFloat(exp.amount || 0), 0);

    res.json({
      expenses,
      totalExpenses
    });
  } catch (err) {
    console.error('Error in getTodayExpenses:', err);
    res.status(500).json({ message: 'Failed to fetch today\'s expenses', error: err.message });
  }
};

// Get expense by ID
exports.getExpenseById = async (req, res) => {
  try {
    const { id } = req.params;
    const expense = await Expense.findByPk(id, {
      include: [
        { model: require('../models/User'), as: 'creator', attributes: ['id', 'username'] }
      ]
    });

    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    res.json(expense);
  } catch (err) {
    console.error('Error in getExpenseById:', err);
    res.status(500).json({ message: 'Failed to fetch expense', error: err.message });
  }
};

// Update expense
exports.updateExpense = async (req, res) => {
  try {
    const { id } = req.params;
    const { amount, type, location, notes } = req.body;

    const expense = await Expense.findByPk(id);
    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    // Ensure expense type exists if type is being updated
    if (type && type !== expense.type) {
      await ExpenseType.findOrCreate({
        where: { name: type.trim() },
        defaults: { name: type.trim() }
      });
    }

    await expense.update({
      amount: amount !== undefined ? parseFloat(amount) : expense.amount,
      type: type ? type.trim() : expense.type,
      location: location ? location.trim() : expense.location,
      notes: notes !== undefined ? notes : expense.notes
    });

    const updatedExpense = await Expense.findByPk(id, {
      include: [
        { model: require('../models/User'), as: 'creator', attributes: ['id', 'username'] }
      ]
    });

    res.json(updatedExpense);
  } catch (err) {
    console.error('Error in updateExpense:', err);
    res.status(500).json({ message: 'Failed to update expense', error: err.message });
  }
};

// Delete expense
exports.deleteExpense = async (req, res) => {
  try {
    const { id } = req.params;
    const expense = await Expense.findByPk(id);
    
    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    await expense.destroy();
    res.json({ message: 'Expense deleted successfully' });
  } catch (err) {
    console.error('Error in deleteExpense:', err);
    res.status(500).json({ message: 'Failed to delete expense', error: err.message });
  }
};


