const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const StartingCash = sequelize.define('StartingCash', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  starting: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: true,
  },
});

module.exports = StartingCash; 