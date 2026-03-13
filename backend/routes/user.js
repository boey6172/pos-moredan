const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticateJWT, requirePermission } = require('../middleware/auth');

router.get('/', authenticateJWT, requirePermission('users.view'), userController.listUsers);
router.post('/', authenticateJWT, requirePermission('users.create'), userController.createUser);
router.put('/:id', authenticateJWT, requirePermission('users.update'), userController.updateUser);
router.delete('/:id', authenticateJWT, requirePermission('users.delete'), userController.deleteUser);
router.post('/:id/reset-password', authenticateJWT, requirePermission('users.update'), userController.resetPassword);

module.exports = router; 