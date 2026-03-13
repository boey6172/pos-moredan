const express = require('express');
const router = express.Router();
const expenseController = require('../controllers/expenseController');
const { authenticateJWT, requirePermission } = require('../middleware/auth');

router.get('/', authenticateJWT, requirePermission('expenses.view'), expenseController.getExpenses);
router.get('/types', authenticateJWT, requirePermission('expenses.view'), expenseController.getExpenseTypes);
router.get('/tin-profiles', authenticateJWT, requirePermission('expenses.view'), expenseController.getTinProfiles);
router.post('/types', authenticateJWT, requirePermission('expenses.create'), expenseController.createExpenseType);
router.post('/', authenticateJWT, requirePermission('expenses.create'), expenseController.createExpense);
router.put('/:id', authenticateJWT, requirePermission('expenses.update'), expenseController.updateExpense);
router.delete('/:id', authenticateJWT, requirePermission('expenses.delete'), expenseController.deleteExpense);

module.exports = router;
