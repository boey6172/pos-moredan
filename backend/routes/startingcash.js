const express = require('express');
const router = express.Router();
const startingCashController = require('../controllers/startingCashController');
const { authenticateJWT, requirePermission } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.get('/', authenticateJWT, requirePermission('starting-cash.view'), startingCashController.getStartingCash);
router.get('/:date', authenticateJWT, requirePermission('starting-cash.view'), startingCashController.getStartingCashByDate);
router.get('/:id', authenticateJWT, requirePermission('starting-cash.view'), startingCashController.getStartingCashById);
router.post('/', authenticateJWT, requirePermission('starting-cash.create'), startingCashController.createStartingCash);
router.put('/:id', authenticateJWT, requirePermission('starting-cash.update'), startingCashController.updateStartingCash);
router.delete('/:id', authenticateJWT, requirePermission('starting-cash.delete'), startingCashController.deleteStartingCash);

module.exports = router; 