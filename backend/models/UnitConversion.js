const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Unit = require('./Unit');

/** Rational conversion: toBase = fromAmount * numerator / denominator (same dimension as Unit.groupCode). */
const UnitConversion = sequelize.define(
  'UnitConversion',
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    fromUnitId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'Units', key: 'id' },
    },
    toUnitId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'Units', key: 'id' },
    },
    numerator: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },
    denominator: {
      type: DataTypes.BIGINT,
      allowNull: false,
      defaultValue: 1,
    },
  },
  {
    indexes: [{ unique: true, fields: ['fromUnitId', 'toUnitId'] }],
  }
);

UnitConversion.belongsTo(Unit, { foreignKey: 'fromUnitId', as: 'fromUnit' });
UnitConversion.belongsTo(Unit, { foreignKey: 'toUnitId', as: 'toUnit' });

module.exports = UnitConversion;
