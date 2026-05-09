const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Unit = require('./Unit');

/** Unified inventory item: raw, intermediate (semi-finished), or finished good. Stock is integer in base UOM. */
const Material = sequelize.define(
  'Material',
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    code: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    sku: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    materialType: {
      type: DataTypes.ENUM('RAW', 'INTERMEDIATE', 'FINISHED'),
      allowNull: false,
      defaultValue: 'RAW',
    },
    baseUnitId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'Units', key: 'id' },
    },
    /** Stock amount in base UOM (whole grams, whole ml, or whole each — see Unit.groupCode). */
    quantityBase: {
      type: DataTypes.BIGINT,
      allowNull: false,
      defaultValue: 0,
    },
    reorderLevelBase: {
      type: DataTypes.BIGINT,
      allowNull: false,
      defaultValue: 0,
    },
    costPerBase: {
      type: DataTypes.DECIMAL(14, 6),
      allowNull: true,
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    /** When true, this material may be sold like a product (link Product.materialId here). */
    canBeSold: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
  },
  {
    indexes: [{ fields: ['materialType'] }, { fields: ['name'] }],
  }
);

Material.belongsTo(Unit, { foreignKey: 'baseUnitId', as: 'baseUnit' });
Unit.hasMany(Material, { foreignKey: 'baseUnitId' });

module.exports = Material;
