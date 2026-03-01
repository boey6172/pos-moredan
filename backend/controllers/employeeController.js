const Employee = require('../models/Employee');

exports.getEmployees = async (req, res) => {
  try {
    const employees = await Employee.findAll({
      order: [['name', 'ASC']],
      attributes: ['id', 'name', 'ratePerHour'],
    });
    res.json(employees);
  } catch (err) {
    console.error('Error fetching employees:', err);
    res.status(500).json({ message: 'Failed to fetch employees', error: err.message });
  }
};

exports.createEmployee = async (req, res) => {
  try {
    const { name, ratePerHour } = req.body;
    if (!name || !String(name).trim()) {
      return res.status(400).json({ message: 'Employee name is required.' });
    }
    const rate = parseFloat(ratePerHour);
    if (isNaN(rate) || rate < 0) {
      return res.status(400).json({ message: 'Valid rate per hour is required.' });
    }
    const employee = await Employee.create({
      name: String(name).trim(),
      ratePerHour: rate,
    });
    res.status(201).json(employee);
  } catch (err) {
    console.error('Error creating employee:', err);
    res.status(500).json({ message: 'Failed to create employee', error: err.message });
  }
};

exports.updateEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, ratePerHour } = req.body;
    const employee = await Employee.findByPk(id);
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found.' });
    }
    if (name !== undefined && (!name || !String(name).trim())) {
      return res.status(400).json({ message: 'Employee name cannot be empty.' });
    }
    if (ratePerHour !== undefined) {
      const rate = parseFloat(ratePerHour);
      if (isNaN(rate) || rate < 0) {
        return res.status(400).json({ message: 'Valid rate per hour is required.' });
      }
    }
    await employee.update({
      ...(name !== undefined && { name: String(name).trim() }),
      ...(ratePerHour !== undefined && { ratePerHour: parseFloat(ratePerHour) }),
    });
    res.json(employee);
  } catch (err) {
    console.error('Error updating employee:', err);
    res.status(500).json({ message: 'Failed to update employee', error: err.message });
  }
};

exports.deleteEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    const employee = await Employee.findByPk(id);
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found.' });
    }
    await employee.destroy();
    res.status(204).send();
  } catch (err) {
    console.error('Error deleting employee:', err);
    res.status(500).json({ message: 'Failed to delete employee', error: err.message });
  }
};
