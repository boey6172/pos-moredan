/**
 * Run RBAC seed manually (creates default permissions, Admin/Cashier roles, migrates users).
 * Usage: from backend folder: node seed/runSeed.js   OR   npm run seed
 * Uses minimal threads/pool to avoid "pthread_create: Resource temporarily unavailable" on shared hosting.
 */
process.env.UV_THREADPOOL_SIZE = '1';
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
process.env.SEED = '1';
const sequelize = require('../config/database');

// Load models so tables exist
require('../models/Permission');
require('../models/Role');
require('../models/User');

const { runRbacSeed } = require('./rbacSeed');

sequelize.sync()
  .then(() => runRbacSeed())
  .then(() => {
    console.log('Seed completed.');
    process.exit(0);
  })
  .catch((err) => {
    console.error('Seed failed:', err);
    process.exit(1);
  });
