const express = require('express');
const router = express.Router();
const controller = require('../controllers/unitConversionController');
const { authenticateJWT, requirePermission } = require('../middleware/auth');

router.get('/', authenticateJWT, requirePermission('units.view'), controller.list);
router.post('/', authenticateJWT, requirePermission('units.update'), controller.create);
router.delete('/:id', authenticateJWT, requirePermission('units.update'), controller.delete);

module.exports = router;
