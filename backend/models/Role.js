const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Permission = require('./Permission');

const Role = sequelize.define('Role', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  description: {
    type: DataTypes.STRING,
    allowNull: true,
  },
});

Role.belongsToMany(Permission, { through: 'RolePermissions', foreignKey: 'roleId', otherKey: 'permissionId' });
Permission.belongsToMany(Role, { through: 'RolePermissions', foreignKey: 'permissionId', otherKey: 'roleId' });

module.exports = Role;
