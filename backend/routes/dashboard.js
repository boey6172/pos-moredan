const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const { authenticateJWT, requirePermission } = require('../middleware/auth');

router.get('/metrics', authenticateJWT, requirePermission('dashboard.view'), dashboardController.getDashboardMetrics);

module.exports = router;


