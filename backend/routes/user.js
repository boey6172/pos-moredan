const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticateJWT, authorizeRoles } = require('../middleware/auth');

router.get('/', authenticateJWT, authorizeRoles('admin'), userController.listUsers);
router.post('/', authenticateJWT, authorizeRoles('admin'), userController.createUser);
router.put('/:id', authenticateJWT, authorizeRoles('admin'), userController.updateUser);
router.delete('/:id', authenticateJWT, authorizeRoles('admin'), userController.deleteUser);
router.post('/:id/reset-password', authenticateJWT, authorizeRoles('admin'), userController.resetPassword);

module.exports = router; 