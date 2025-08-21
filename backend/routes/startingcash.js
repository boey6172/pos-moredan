const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { authenticateJWT, authorizeRoles } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.get('/', authenticateJWT, productController.getProducts);
router.get('/:id', authenticateJWT, productController.getProductById);
router.post('/', authenticateJWT, authorizeRoles('admin'), upload.single('image'), productController.createProduct);
router.put('/:id', authenticateJWT, authorizeRoles('admin'), upload.single('image'), productController.updateProduct);
router.delete('/:id', authenticateJWT, authorizeRoles('admin'), productController.deleteProduct);

module.exports = router; 