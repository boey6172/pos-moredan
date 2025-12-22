const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ExpenseType = sequelize.define('ExpenseType', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
}, {
  timestamps: true,
});

module.exports = ExpenseType;


