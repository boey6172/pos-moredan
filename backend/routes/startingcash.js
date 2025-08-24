const express = require('express');
const router = express.Router();
const startingCashController = require('../controllers/startingCashController');
const { authenticateJWT, authorizeRoles } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.get('/', authenticateJWT, startingCashController.getStartingCash);
router.get('/:date', authenticateJWT, startingCashController.getStartingCashByDate);
router.get('/:id', authenticateJWT, startingCashController.getStartingCashById);
router.post('/', authenticateJWT, authorizeRoles('admin'), startingCashController.createStartingCash);
router.put('/:id', authenticateJWT, authorizeRoles('admin'), startingCashController.updateStartingCash);
router.delete('/:id', authenticateJWT, authorizeRoles('admin'), startingCashController.deleteStartingCash);

module.exports = router; 