const express = require('express');
const router = express.Router();
const expenseController = require('../controllers/expenseController');
const { authenticateJWT } = require('../middleware/auth');

router.get('/', authenticateJWT, expenseController.getExpenses);
router.get('/types', authenticateJWT, expenseController.getExpenseTypes);
router.get('/tin-profiles', authenticateJWT, expenseController.getTinProfiles);
router.post('/types', authenticateJWT, expenseController.createExpenseType);
router.post('/', authenticateJWT, expenseController.createExpense);
router.put('/:id', authenticateJWT, expenseController.updateExpense);
router.delete('/:id', authenticateJWT, expenseController.deleteExpense);

module.exports = router;
