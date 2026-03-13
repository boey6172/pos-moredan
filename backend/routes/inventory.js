const express = require('express');
const router = express.Router();
const inventoryController = require('../controllers/inventoryController');
const { authenticateJWT, requirePermission } = require('../middleware/auth');

router.post('/adjust', authenticateJWT, requirePermission('inventory.adjust'), inventoryController.adjustInventory);
router.get('/movements', authenticateJWT, requirePermission('inventory.view'), inventoryController.getMovements);

module.exports = router; 