const express = require('express');
const app = express();
const port = 3000;
const { Sequelize } = require('sequelize');

// Database connection
const sequelize = new Sequelize('pos-moredan', 'root', 'password', {
  host: 'localhost',
  dialect: 'mysql'
});

// Test database connection
sequelize.authenticate()
  .then(() => console.log('Database connected...'))
  .catch(err => console.log('Error: ' + err));

app.use(express.json());

// Define a simple route
app.get('/', (req, res) => res.send('Hello World!'));

// Sync models
sequelize.sync()
  .then(() => console.log('Models synced...'))
  .catch(err => console.log('Error syncing models: ' + err));

app.listen(port, () => console.log(`Server running on http://localhost:${port}`));
