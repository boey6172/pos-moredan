require('dotenv').config();
// Use Philippine time for all server-side date logic
process.env.TZ = process.env.TZ || 'Asia/Manila';

const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 5000;
const authRoutes = require('./routes/auth');
const categoryRoutes = require('./routes/category');
const productRoutes = require('./routes/product');
const transactionRoutes = require('./routes/transaction');
const reportRoutes = require('./routes/report');
const inventoryRoutes = require('./routes/inventory');
const userRoutes = require('./routes/user');
const startingCash = require('./routes/startingcash');
const reconciliationRoutes = require('./routes/reconciliation');
const dashboardRoutes = require('./routes/dashboard');
const expenseRoutes = require('./routes/expense');
const employeeRoutes = require('./routes/employee');
const salaryRoutes = require('./routes/salary');
const permissionRoutes = require('./routes/permission');
const roleRoutes = require('./routes/role');
const path = require('path');
const sequelize = require('./config/database');
const helmet = require('helmet');
const BASE_PATH = '/pidols_bakery_backend'
// Ensure models are registered before sync (so tables are created)
require('./models/Permission');
require('./models/Role');
require('./models/User');
require('./models/Expense');
require('./models/ExpenseType');
require('./models/Employee');
require('./models/Salary');

app.use(cors({
  origin: '*' // Replace with your frontend's origin
}));
app.use(helmet());
app.use(express.json());
app.use(`${BASE_PATH}/api/auth`, authRoutes);
app.use(`${BASE_PATH}/api/categories`, categoryRoutes);
app.use(`${BASE_PATH}/uploads`, (req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*'); // Allow from any domain
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  next();
}, express.static(path.join(__dirname, 'uploads')));
app.use(`${BASE_PATH}/api/products`, productRoutes);
app.use(`${BASE_PATH}/api/transactions`, transactionRoutes);
app.use(`${BASE_PATH}/api/reports`, reportRoutes);
app.use(`${BASE_PATH}/api/inventory`, inventoryRoutes);
app.use(`${BASE_PATH}/api/users`, userRoutes);
app.use(`${BASE_PATH}/api/startingcash`, startingCash);
app.use(`${BASE_PATH}/api/reconciliation`, reconciliationRoutes);
app.use(`${BASE_PATH}/api/dashboard`, dashboardRoutes);
app.use(`${BASE_PATH}/api/expenses`, expenseRoutes);
app.use(`${BASE_PATH}/api/employees`, employeeRoutes);
app.use(`${BASE_PATH}/api/salaries`, salaryRoutes);
app.use(`${BASE_PATH}/api/permissions`, permissionRoutes);
app.use(`${BASE_PATH}/api/roles`, roleRoutes);

// Health/availability endpoints – always JSON so host panel checks get consistent Content-Type
const healthPayload = { status: 'OK' };
const sendJson = (req, res) => {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.status(200).json(healthPayload);
};

app.get(`${BASE_PATH}/api/health`, sendJson);
app.get(BASE_PATH, sendJson);
// Root – so panel hitting application root gets JSON, not HTML from proxy
app.get('/', sendJson);

// Run RBAC seed from the running app (avoids "pthread_create" limit on shared hosting)
// Supports GET and POST (some proxies only forward GET)
const { runRbacSeed } = require('./seed/rbacSeed');
const SEED_SECRET = process.env.SEED_SECRET;
const handleSeed = (req, res) => {
  const key = req.query.key || req.headers['x-seed-key'];
  if (!SEED_SECRET || key !== SEED_SECRET) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  runRbacSeed()
    .then(() => res.json({ ok: true, message: 'Seed completed.' }))
    .catch((err) => {
      console.error('Seed failed:', err);
      res.status(500).json({ error: 'Seed failed', message: err.message });
    });
};
app.get(`${BASE_PATH}/api/seed`, handleSeed);
app.post(`${BASE_PATH}/api/seed`, handleSeed);

// Use standard sync without alter to avoid breaking existing data constraints
(async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connected');

    await sequelize.sync();
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err.message);
    process.exit(1); // STOP instead of retrying
  }
})();