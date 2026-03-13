const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transactionController');
const { authenticateJWT, requirePermission } = require('../middleware/auth');

router.post('/', authenticateJWT, requirePermission('transactions.create'), transactionController.createTransaction);
router.get('/', authenticateJWT, requirePermission('transactions.view'), transactionController.getTransactions);
router.get('/:id', authenticateJWT, requirePermission('transactions.view'), transactionController.getTransactionById);
router.delete('/:id', authenticateJWT, requirePermission('transactions.delete'), transactionController.deleteTransaction);
router.put('/:id', authenticateJWT, requirePermission('transactions.update'), transactionController.updateTransaction);

module.exports = router; 