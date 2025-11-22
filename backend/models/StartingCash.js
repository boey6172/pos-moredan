const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const StartingCash = sequelize.define('StartingCash', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  starting: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
});

module.exports = StartingCash; 