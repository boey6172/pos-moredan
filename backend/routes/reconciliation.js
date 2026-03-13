const express = require('express');
const router = express.Router();
const reconciliationController = require('../controllers/reconciliationController');
const { authenticateJWT, requirePermission } = require('../middleware/auth');

router.get('/today', authenticateJWT, requirePermission('reconciliation.view'), reconciliationController.getTodayReconciliation);
router.post('/close', authenticateJWT, requirePermission('reconciliation.close'), reconciliationController.closeDay);
router.get('/history', authenticateJWT, requirePermission('reconciliation.view'), reconciliationController.getReconciliationHistory);

module.exports = router;


