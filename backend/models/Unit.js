const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

// Simple lookup table for units of measure used by raw materials and recipes.
const Unit = sequelize.define('Unit', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    // Example values: "g", "kg", "ml", "L", "pcs", "shot"
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  description: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  /** MASS | VOLUME | COUNT | CUSTOM — conversions only within the same group. */
  groupCode: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'CUSTOM',
  },
});

module.exports = Unit;

