const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Transaction = require('./Transaction');
const Product = require('./Product');

const TransactionItem = sequelize.define('TransactionItem', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  transactionId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Transactions',
      key: 'id',
    },
  },
  productId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Products',
      key: 'id',
    },
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  subtotal: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
});

TransactionItem.belongsTo(Transaction, { foreignKey: 'transactionId' });
Transaction.hasMany(TransactionItem, { foreignKey: 'transactionId' });
TransactionItem.belongsTo(Product, { foreignKey: 'productId' });
Product.hasMany(TransactionItem, { foreignKey: 'productId' });

module.exports = TransactionItem; 