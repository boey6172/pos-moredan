const express = require('express');
const router = express.Router();
const controller = require('../controllers/inventorySettingsController');
const { authenticateJWT, requirePermission } = require('../middleware/auth');

router.get('/', authenticateJWT, requirePermission('inventory.adjust'), controller.getSettings);
router.put('/', authenticateJWT, requirePermission('inventory.adjust'), controller.updateSettings);

module.exports = router;
