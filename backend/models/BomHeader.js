const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Material = require('./Material');

const BomHeader = sequelize.define('BomHeader', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  outputMaterialId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'Materials', key: 'id' },
  },
  /** Output quantity this BOM produces, in output material base UOM (integer). */
  batchOutputQuantityBase: {
    type: DataTypes.BIGINT,
    allowNull: false,
    defaultValue: 1,
  },
  version: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1,
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  },
});

BomHeader.belongsTo(Material, { foreignKey: 'outputMaterialId', as: 'outputMaterial' });
Material.hasMany(BomHeader, { foreignKey: 'outputMaterialId' });

module.exports = BomHeader;
