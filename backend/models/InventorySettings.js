const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

/** Singleton row (id = 1) for global inventory behaviour. */
const InventorySettings = sequelize.define('InventorySettings', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    defaultValue: 1,
  },
  /** Master switch: post material movements when sales are recorded. */
  deductionEnabled: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
  /** When true, apply BOM deduction for finished goods linked to materials. */
  autoDeductFinished: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  },
  /** When true, intermediate lines are expanded per consumptionMode; when false, still consume BOM lines but settings only affect messaging in future. */
  autoDeductIntermediate: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  },
  consumptionMode: {
    type: DataTypes.ENUM('EXPLODE_TO_RAW', 'CONSUME_STOCKED_INTERMEDIATE'),
    allowNull: false,
    defaultValue: 'CONSUME_STOCKED_INTERMEDIATE',
  },
  allowNegativeStock: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
});

module.exports = InventorySettings;
