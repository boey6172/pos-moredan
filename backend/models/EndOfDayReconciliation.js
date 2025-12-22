const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');

const EndOfDayReconciliation = sequelize.define('EndOfDayReconciliation', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    unique: true,
  },
  startingCash: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  expectedCash: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  actualCash: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  cashDifference: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0,
  },
  totalCashSales: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0,
  },
  totalNonCashSales: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0,
  },
  totalTransactions: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
  totalExpenses: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0,
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  closedBy: {
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

EndOfDayReconciliation.belongsTo(User, { foreignKey: 'closedBy', as: 'closedByUser' });

module.exports = EndOfDayReconciliation;

