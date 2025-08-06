const express = require('express');
const router = express.Router();
const inventoryController = require('../controllers/inventoryController');
const { authenticateJWT, authorizeRoles } = require('../middleware/auth');

router.post('/adjust', authenticateJWT, authorizeRoles('admin'), inventoryController.adjustInventory);
router.get('/movements', authenticateJWT, inventoryController.getMovements);

module.exports = router; 