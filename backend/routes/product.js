const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { authenticateJWT, requirePermission } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.get('/', authenticateJWT, requirePermission('products.view'), productController.getProducts);
router.get('/sku/:sku', authenticateJWT, requirePermission('products.view'), productController.getProductBySku);
router.get('/:id', authenticateJWT, requirePermission('products.view'), productController.getProductById);
router.post('/', authenticateJWT, requirePermission('products.create'), upload.single('image'), productController.createProduct);
router.put('/:id', authenticateJWT, requirePermission('products.update'), upload.single('image'), productController.updateProduct);
router.delete('/:id', authenticateJWT, requirePermission('products.delete'), productController.deleteProduct);

module.exports = router; 