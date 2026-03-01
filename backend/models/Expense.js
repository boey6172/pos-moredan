const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');

const Expense = sequelize.define('Expense', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  type: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  location: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  // Tin-related fields (optional, when expense has Tin Number)
  particulars: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  tinNumber: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  address: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  referenceNo: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  // Store the user who created the expense.
  // Map to existing DB column "createdBy".
  createdBy: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id',
    },
  },
}, {
  timestamps: true,
  updatedAt: false,
});

Expense.belongsTo(User, { foreignKey: 'createdBy', as: 'creator' });

module.exports = Expense;
