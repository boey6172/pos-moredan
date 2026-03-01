const Salary = require('../models/Salary');
const Employee = require('../models/Employee');
const User = require('../models/User');
const { Op } = require('sequelize');

exports.getSalaries = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const where = {};
    if (startDate && endDate) {
      where.startDate = { [Op.gte]: startDate };
      where.endDate = { [Op.lte]: endDate };
    }
    const salaries = await Salary.findAll({
      where,
      order: [['startDate', 'DESC'], ['createdAt', 'DESC']],
      include: [
        { model: Employee, as: 'employee', attributes: ['id', 'name', 'ratePerHour'] },
        { model: User, as: 'creator', attributes: ['id', 'username'] },
      ],
    });
    res.json(salaries);
  } catch (err) {
    console.error('Error fetching salaries:', err);
    res.status(500).json({ message: 'Failed to fetch salaries', error: err.message });
  }
};

exports.createSalary = async (req, res) => {
  try {
    const { employeeId, hoursWorked, startDate, endDate } = req.body;
    if (!employeeId) {
      return res.status(400).json({ message: 'Employee is required.' });
    }
    const hours = parseFloat(hoursWorked);
    if (isNaN(hours) || hours <= 0) {
      return res.status(400).json({ message: 'Valid hours worked is required.' });
    }
    if (!startDate || !endDate) {
      return res.status(400).json({ message: 'Start date and end date are required.' });
    }
    const employee = await Employee.findByPk(employeeId);
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found.' });
    }
    const rate = parseFloat(employee.ratePerHour);
    const totalAmount = Math.round(rate * hours * 100) / 100;
    const salary = await Salary.create({
      employeeId: Number(employeeId),
      hoursWorked: hours,
      startDate: String(startDate).trim(),
      endDate: String(endDate).trim(),
      totalAmount,
      createdBy: req.user.id,
    });
    const withIncludes = await Salary.findByPk(salary.id, {
      include: [
        { model: Employee, as: 'employee', attributes: ['id', 'name', 'ratePerHour'] },
        { model: User, as: 'creator', attributes: ['id', 'username'] },
      ],
    });
    res.status(201).json(withIncludes);
  } catch (err) {
    console.error('Error creating salary:', err);
    res.status(500).json({ message: 'Failed to create salary', error: err.message });
  }
};

exports.updateSalary = async (req, res) => {
  try {
    const { id } = req.params;
    const { employeeId, hoursWorked, startDate, endDate } = req.body;
    const salary = await Salary.findByPk(id, {
      include: [{ model: Employee, as: 'employee', attributes: ['id', 'name', 'ratePerHour'] }],
    });
    if (!salary) {
      return res.status(404).json({ message: 'Salary entry not found.' });
    }
    let employee = salary.employee;
    if (employeeId !== undefined && Number(employeeId) !== salary.employeeId) {
      employee = await Employee.findByPk(employeeId);
      if (!employee) {
        return res.status(404).json({ message: 'Employee not found.' });
      }
    }
    const hours = hoursWorked !== undefined ? parseFloat(hoursWorked) : parseFloat(salary.hoursWorked);
    if (isNaN(hours) || hours <= 0) {
      return res.status(400).json({ message: 'Valid hours worked is required.' });
    }
    const rate = parseFloat(employee.ratePerHour);
    const totalAmount = Math.round(rate * hours * 100) / 100;
    await salary.update({
      ...(employeeId !== undefined && { employeeId: Number(employeeId) }),
      ...(hoursWorked !== undefined && { hoursWorked: hours }),
      ...(startDate !== undefined && { startDate: String(startDate).trim() }),
      ...(endDate !== undefined && { endDate: String(endDate).trim() }),
      totalAmount,
    });
    const updated = await Salary.findByPk(salary.id, {
      include: [
        { model: Employee, as: 'employee', attributes: ['id', 'name', 'ratePerHour'] },
        { model: User, as: 'creator', attributes: ['id', 'username'] },
      ],
    });
    res.json(updated);
  } catch (err) {
    console.error('Error updating salary:', err);
    res.status(500).json({ message: 'Failed to update salary', error: err.message });
  }
};

exports.deleteSalary = async (req, res) => {
  try {
    const { id } = req.params;
    const salary = await Salary.findByPk(id);
    if (!salary) {
      return res.status(404).json({ message: 'Salary entry not found.' });
    }
    await salary.destroy();
    res.status(204).send();
  } catch (err) {
    console.error('Error deleting salary:', err);
    res.status(500).json({ message: 'Failed to delete salary', error: err.message });
  }
};
