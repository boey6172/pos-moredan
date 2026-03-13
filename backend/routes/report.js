const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const { authenticateJWT, requirePermission } = require('../middleware/auth');

router.get('/sales', authenticateJWT, requirePermission('reports.view'), reportController.getSalesReport);
router.get('/top-products', authenticateJWT, requirePermission('reports.view'), reportController.getTopProducts);
router.get('/low-stock', authenticateJWT, requirePermission('reports.view'), reportController.getLowStock);
router.get('/sales-items', authenticateJWT, requirePermission('sales-items.view'), reportController.getSalesItemsByCategory);

module.exports = router; 