const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Product = require('./Product');
const Transaction = require('./Transaction');
const User = require('./User');

const InventoryMovement = sequelize.define('InventoryMovement', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  productId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'Products', key: 'id' },
  },
  type: {
    type: DataTypes.ENUM('in', 'out', 'transaction'),
    allowNull: false,
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  reason: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  relatedTransactionId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: { model: 'Transactions', key: 'id' },
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'Users', key: 'id' },
  },
}, {
  timestamps: true,
  updatedAt: false,
});

InventoryMovement.belongsTo(Product, { foreignKey: 'productId' });
InventoryMovement.belongsTo(Transaction, { foreignKey: 'relatedTransactionId' });
InventoryMovement.belongsTo(User, { foreignKey: 'userId' });

module.exports = InventoryMovement; 