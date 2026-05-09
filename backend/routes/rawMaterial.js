const express = require('express');
const router = express.Router();
const rawMaterialController = require('../controllers/rawMaterialController');
const { authenticateJWT, requirePermission } = require('../middleware/auth');

router.get('/', authenticateJWT, requirePermission('raw-materials.view'), rawMaterialController.getRawMaterials);
router.get('/:id', authenticateJWT, requirePermission('raw-materials.view'), rawMaterialController.getRawMaterialById);
router.post('/', authenticateJWT, requirePermission('raw-materials.create'), rawMaterialController.createRawMaterial);
router.put('/:id', authenticateJWT, requirePermission('raw-materials.update'), rawMaterialController.updateRawMaterial);
router.delete('/:id', authenticateJWT, requirePermission('raw-materials.delete'), rawMaterialController.deleteRawMaterial);

module.exports = router;
