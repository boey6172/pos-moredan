const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

/** Stock ingredients (beans, milk, syrups, cups). Recipe lines will reference this table later. */
const RawMaterial = sequelize.define('RawMaterial', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  sku: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  /** Unit of measure: g, kg, ml, L, pcs, etc. */
  unit: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'g',
  },
  /** On-hand quantity in `unit` (supports decimals, e.g. 0.5 kg). */
  quantityOnHand: {
    type: DataTypes.DECIMAL(14, 4),
    allowNull: false,
    defaultValue: 0,
  },
  reorderLevel: {
    type: DataTypes.DECIMAL(14, 4),
    allowNull: false,
    defaultValue: 0,
  },
  costPerUnit: {
    type: DataTypes.DECIMAL(12, 4),
    allowNull: true,
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
});

module.exports = RawMaterial;
