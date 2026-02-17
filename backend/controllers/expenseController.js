const Expense = require('../models/Expense');
const ExpenseType = require('../models/ExpenseType');
const User = require('../models/User');
const { Op } = require('sequelize');

exports.getExpenses = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const where = {};
    if (startDate && endDate) {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      where.createdAt = {
        [Op.gte]: start,
        [Op.lte]: end,
      };
    }
    const expenses = await Expense.findAll({
      where,
      order: [['createdAt', 'DESC']],
      include: [{ model: User, as: 'creator', attributes: ['id', 'username'] }],
    });
    res.json(expenses);
  } catch (err) {
    console.error('Error fetching expenses:', err);
    res.status(500).json({ message: 'Failed to fetch expenses', error: err.message });
  }
};

exports.getExpenseTypes = async (req, res) => {
  try {
    const types = await ExpenseType.findAll({ order: [['name', 'ASC']], attributes: ['id', 'name'] });
    res.json(types);
  } catch (err) {
    console.error('Error fetching expense types:', err);
    res.status(500).json({ message: 'Failed to fetch expense types', error: err.message });
  }
};

exports.createExpenseType = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name || !String(name).trim()) {
      return res.status(400).json({ message: 'Type name is required.' });
    }
    const [type] = await ExpenseType.findOrCreate({
      where: { name: String(name).trim() },
      defaults: { name: String(name).trim() },
    });
    res.status(201).json(type);
  } catch (err) {
    console.error('Error creating expense type:', err);
    res.status(500).json({ message: 'Failed to create expense type', error: err.message });
  }
};

exports.createExpense = async (req, res) => {
  try {
    const { amount, type, location, notes } = req.body;
    if (amount == null || amount === '' || isNaN(parseFloat(amount)) || parseFloat(amount) < 0) {
      return res.status(400).json({ message: 'Valid amount is required.' });
    }
    if (!type || !String(type).trim()) {
      return res.status(400).json({ message: 'Expense type is required.' });
    }
    if (!location || !String(location).trim()) {
      return res.status(400).json({ message: 'Location is required.' });
    }
    const expense = await Expense.create({
      amount: parseFloat(amount),
      type: String(type).trim(),
      location: String(location).trim(),
      notes: notes ? String(notes).trim() : null,
      createdBy: req.user.id,
    });
    const withCreator = await Expense.findByPk(expense.id, {
      include: [{ model: User, as: 'creator', attributes: ['id', 'username'] }],
    });
    res.status(201).json(withCreator);
  } catch (err) {
    console.error('Error creating expense:', err);
    res.status(500).json({ message: 'Failed to create expense', error: err.message });
  }
};

exports.updateExpense = async (req, res) => {
  try {
    const { id } = req.params;
    const { amount, type, location, notes } = req.body;
    const expense = await Expense.findByPk(id);
    if (!expense) {
      return res.status(404).json({ message: 'Expense not found.' });
    }
    if (amount != null && (isNaN(parseFloat(amount)) || parseFloat(amount) < 0)) {
      return res.status(400).json({ message: 'Valid amount is required.' });
    }
    await expense.update({
      ...(amount != null && amount !== '' && { amount: parseFloat(amount) }),
      ...(type != null && { type: String(type).trim() }),
      ...(location != null && { location: String(location).trim() }),
      ...(notes !== undefined && { notes: notes ? String(notes).trim() : null }),
    });
    const updated = await Expense.findByPk(expense.id, {
      include: [{ model: User, as: 'creator', attributes: ['id', 'username'] }],
    });
    res.json(updated);
  } catch (err) {
    console.error('Error updating expense:', err);
    res.status(500).json({ message: 'Failed to update expense', error: err.message });
  }
};

exports.deleteExpense = async (req, res) => {
  try {
    const { id } = req.params;
    const expense = await Expense.findByPk(id);
    if (!expense) {
      return res.status(404).json({ message: 'Expense not found.' });
    }
    await expense.destroy();
    res.status(204).send();
  } catch (err) {
    console.error('Error deleting expense:', err);
    res.status(500).json({ message: 'Failed to delete expense', error: err.message });
  }
};
