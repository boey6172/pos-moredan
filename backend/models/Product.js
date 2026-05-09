const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Category = require('./Category');
const Material = require('./Material');

const Product = sequelize.define('Product', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  sku: {
    type: DataTypes.STRING,
    allowNull: false,
    // unique: true,
  },
  image: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  inventory: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
  costToMake: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
  categoryId: {
    type: DataTypes.INTEGER,
    references: {
      model: 'Categories',
      key: 'id',
    },
    allowNull: false,
  },
  /** Optional link to unified material for recipe / inventory deduction. */
  materialId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'Materials',
      key: 'id',
    },
  },
  /** How many material base units one sold product unit represents (e.g. 1 cup = 250 ml → 250 if base is ml). */
  materialQuantityPerUnit: {
    type: DataTypes.BIGINT,
    allowNull: false,
    defaultValue: 1,
  },
  /**
   * NONE: legacy — only Product.inventory.
   * MATERIAL_ONLY: deduct linked material only (e.g. sell stocked espresso shot).
   * BOM_CONSUME: deduct BOM inputs without exploding intermediates.
   * BOM_EXPLODE: recursively explode to raw materials.
   */
  materialDeductionMode: {
    type: DataTypes.ENUM('NONE', 'MATERIAL_ONLY', 'BOM_CONSUME', 'BOM_EXPLODE'),
    allowNull: false,
    defaultValue: 'NONE',
  },
});

Product.belongsTo(Category, { foreignKey: 'categoryId' });
Category.hasMany(Product, { foreignKey: 'categoryId' });
Product.belongsTo(Material, { foreignKey: 'materialId', as: 'linkedMaterial' });

module.exports = Product; 