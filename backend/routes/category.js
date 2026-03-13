const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const { authenticateJWT, requirePermission } = require('../middleware/auth');

router.get('/', authenticateJWT, requirePermission('categories.view'), categoryController.getCategories);
router.get('/:id', authenticateJWT, requirePermission('categories.view'), categoryController.getCategoryById);
router.post('/', authenticateJWT, requirePermission('categories.create'), categoryController.createCategory);
router.put('/:id', authenticateJWT, requirePermission('categories.update'), categoryController.updateCategory);
router.delete('/:id', authenticateJWT, requirePermission('categories.delete'), categoryController.deleteCategory);

module.exports = router; 