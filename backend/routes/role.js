const express = require('express');
const router = express.Router();
const roleController = require('../controllers/roleController');
const { authenticateJWT, requirePermission } = require('../middleware/auth');

router.get('/', authenticateJWT, requirePermission('rbac.view', 'rbac.manage'), roleController.listRoles);
router.get('/:id', authenticateJWT, requirePermission('rbac.view', 'rbac.manage'), roleController.getRoleById);
router.post('/', authenticateJWT, requirePermission('rbac.manage'), roleController.createRole);
router.put('/:id', authenticateJWT, requirePermission('rbac.manage'), roleController.updateRole);
router.delete('/:id', authenticateJWT, requirePermission('rbac.manage'), roleController.deleteRole);

module.exports = router;
