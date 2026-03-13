const express = require('express');
const router = express.Router();
const permissionController = require('../controllers/permissionController');
const { authenticateJWT, requirePermission } = require('../middleware/auth');

router.get('/', authenticateJWT, requirePermission('rbac.view', 'rbac.manage'), permissionController.listPermissions);
router.post('/', authenticateJWT, requirePermission('rbac.manage'), permissionController.createPermission);
router.put('/:id', authenticateJWT, requirePermission('rbac.manage'), permissionController.updatePermission);
router.delete('/:id', authenticateJWT, requirePermission('rbac.manage'), permissionController.deletePermission);

module.exports = router;
