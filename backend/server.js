require('dotenv').config();
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
const path = require('path');
const sequelize = require('./config/database');
const helmet = require('helmet');

app.use(cors({
  origin: '*' // Replace with your frontend's origin
}));
app.use(helmet());
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/uploads', (req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*'); // Allow from any domain
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  next();
}, express.static(path.join(__dirname, 'uploads')));
app.use('/api/products', productRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/users', userRoutes);
app.use('/api/startingcash', startingCash);
app.use('/api/reconciliation', reconciliationRoutes);
app.use('/api/dashboard', dashboardRoutes);


app.get('/api/health', (req, res) => {
  res.json({ status: 'OK' });
});
app.get('/', (req, res) => {
  res.json({ status: 'OK' });
});
sequelize.sync()
  .then(() => {
    app.listen(5000,'0.0.0.0', () => console.log('Server running on port 5000'));
  })
  .catch((err) => {
    console.error('Failed to sync database:', err);
  }); 