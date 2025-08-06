const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const { authenticateJWT, authorizeRoles } = require('../middleware/auth');

router.get('/', authenticateJWT, categoryController.getCategories);
router.get('/:id', authenticateJWT, categoryController.getCategoryById);
router.post('/', authenticateJWT, authorizeRoles('admin'), categoryController.createCategory);
router.put('/:id', authenticateJWT, authorizeRoles('admin'), categoryController.updateCategory);
router.delete('/:id', authenticateJWT, authorizeRoles('admin'), categoryController.deleteCategory);

module.exports = router; 