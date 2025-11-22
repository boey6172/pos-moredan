const express = require('express');
const router = express.Router();
const reconciliationController = require('../controllers/reconciliationController');
const { authenticateJWT, authorizeRoles } = require('../middleware/auth');

router.get('/today', authenticateJWT, reconciliationController.getTodayReconciliation);
router.post('/close', authenticateJWT, reconciliationController.closeDay);
router.get('/history', authenticateJWT, authorizeRoles('admin'), reconciliationController.getReconciliationHistory);

module.exports = router;


