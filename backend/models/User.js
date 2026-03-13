const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Role = require('./Role');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  username: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  role: {
    type: DataTypes.ENUM('admin', 'cashier'),
    allowNull: false,
    defaultValue: 'cashier',
  },
  roleId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: { model: 'Roles', key: 'id' },
  },
});

User.belongsTo(Role, { foreignKey: 'roleId', as: 'roleRef' });

module.exports = User; 