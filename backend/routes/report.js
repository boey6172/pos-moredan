const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const { authenticateJWT } = require('../middleware/auth');

router.get('/sales', authenticateJWT, reportController.getSalesReport);
router.get('/top-products', authenticateJWT, reportController.getTopProducts);
router.get('/low-stock', authenticateJWT, reportController.getLowStock);
router.get('/sales-items', authenticateJWT, reportController.getSalesItemsByCategory);

module.exports = router; 