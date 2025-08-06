const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transactionController');
const { authenticateJWT, authorizeRoles } = require('../middleware/auth');

router.post('/', authenticateJWT, transactionController.createTransaction);
router.get('/', authenticateJWT, transactionController.getTransactions);
router.get('/:id', authenticateJWT, transactionController.getTransactionById);
router.delete('/:id', authenticateJWT, authorizeRoles('admin'), transactionController.deleteTransaction);
router.put('/:id', authenticateJWT, transactionController.updateTransaction);

module.exports = router; 