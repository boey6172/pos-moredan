const express = require('express');
const router = express.Router();
const expenseController = require('../controllers/expenseController');
const { authenticateJWT, authorizeRoles } = require('../middleware/auth');

// Expense types
router.get('/types', authenticateJWT, expenseController.getExpenseTypes);
router.post('/types', authenticateJWT, expenseController.createOrGetExpenseType);

// Expenses
router.get('/', authenticateJWT, expenseController.getExpenses);
router.get('/today', authenticateJWT, expenseController.getTodayExpenses);
router.get('/:id', authenticateJWT, expenseController.getExpenseById);
router.post('/', authenticateJWT, expenseController.createExpense);
router.put('/:id', authenticateJWT, expenseController.updateExpense);
router.delete('/:id', authenticateJWT, authorizeRoles('admin'), expenseController.deleteExpense);

module.exports = router;


