const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const BomHeader = require('./BomHeader');
const Material = require('./Material');

const BomLine = sequelize.define('BomLine', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  bomHeaderId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'BomHeaders', key: 'id' },
  },
  inputMaterialId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'Materials', key: 'id' },
  },
  /** Input quantity consumed per batch (batch size = header.batchOutputQuantityBase), in input material base UOM. */
  inputQuantityPerBatchBase: {
    type: DataTypes.BIGINT,
    allowNull: false,
  },
  sortOrder: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
});

BomLine.belongsTo(BomHeader, { foreignKey: 'bomHeaderId' });
BomHeader.hasMany(BomLine, { foreignKey: 'bomHeaderId', as: 'lines' });
BomLine.belongsTo(Material, { foreignKey: 'inputMaterialId', as: 'inputMaterial' });

module.exports = BomLine;
