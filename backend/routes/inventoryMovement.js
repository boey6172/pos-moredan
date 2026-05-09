const express = require('express');
const router = express.Router();
const controller = require('../controllers/inventoryMovementController');
const { authenticateJWT, requirePermission } = require('../middleware/auth');

router.get('/', authenticateJWT, requirePermission('inventory.view'), controller.list);
router.post('/adjust', authenticateJWT, requirePermission('inventory.adjust'), controller.createAdjustment);

module.exports = router;
