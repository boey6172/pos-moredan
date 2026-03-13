const { Sequelize } = require('sequelize');
require('dotenv').config();

// Use minimal pool when running seed (avoids pthread limits on shared hosting)
const isSeed = process.env.SEED === '1' || process.env.npm_lifecycle_event === 'seed';

const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASS, {
  host: process.env.DB_HOST,
  dialect: 'postgres',
  logging: false,
  ...(isSeed && { pool: { max: 1, min: 0 } }),
});

module.exports = sequelize; 