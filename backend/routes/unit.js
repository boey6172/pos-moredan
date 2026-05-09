const express = require('express');
const router = express.Router();
const unitController = require('../controllers/unitController');
const { authenticateJWT, requirePermission } = require('../middleware/auth');

router.get('/', authenticateJWT, requirePermission('units.view'), unitController.getUnits);
router.get('/:id', authenticateJWT, requirePermission('units.view'), unitController.getUnitById);
router.post('/', authenticateJWT, requirePermission('units.create'), unitController.createUnit);
router.put('/:id', authenticateJWT, requirePermission('units.update'), unitController.updateUnit);
router.delete('/:id', authenticateJWT, requirePermission('units.delete'), unitController.deleteUnit);

module.exports = router;

