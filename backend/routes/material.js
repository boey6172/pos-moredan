const express = require('express');
const router = express.Router();
const materialController = require('../controllers/materialController');
const bomController = require('../controllers/bomController');
const { authenticateJWT, requirePermission } = require('../middleware/auth');

router.get('/', authenticateJWT, requirePermission('raw-materials.view'), materialController.listMaterials);
router.get('/:id/bom', authenticateJWT, requirePermission('raw-materials.view'), bomController.getBomForMaterial);
router.put('/:id/bom', authenticateJWT, requirePermission('raw-materials.update'), bomController.upsertBom);
router.delete('/:id/bom', authenticateJWT, requirePermission('raw-materials.update'), bomController.deleteBom);
router.get('/:id', authenticateJWT, requirePermission('raw-materials.view'), materialController.getMaterial);
router.post('/', authenticateJWT, requirePermission('raw-materials.create'), materialController.createMaterial);
router.put('/:id', authenticateJWT, requirePermission('raw-materials.update'), materialController.updateMaterial);
router.delete('/:id', authenticateJWT, requirePermission('raw-materials.delete'), materialController.deleteMaterial);

module.exports = router;
