const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Material = require('./Material');
const User = require('./User');

const InventoryMovement = sequelize.define(
  'InventoryMovement',
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    materialId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'Materials', key: 'id' },
    },
    movementType: {
      type: DataTypes.ENUM(
        'IN_PURCHASE',
        'IN_PRODUCTION',
        'IN_ADJUSTMENT',
        'OUT_SALE',
        'OUT_PRODUCTION',
        'OUT_WASTE',
        'OUT_ADJUSTMENT',
        'TRANSFER'
      ),
      allowNull: false,
    },
    quantityDeltaBase: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },
    referenceType: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    referenceId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: { model: 'Users', key: 'id' },
    },
  },
  {
    indexes: [
      { fields: ['materialId'] },
      { fields: ['referenceType', 'referenceId'] },
    ],
  }
);

InventoryMovement.belongsTo(Material, { foreignKey: 'materialId' });
InventoryMovement.belongsTo(User, { foreignKey: 'userId', as: 'user' });

module.exports = InventoryMovement;
