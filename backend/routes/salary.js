const express = require('express');
const router = express.Router();
const salaryController = require('../controllers/salaryController');
const { authenticateJWT, requirePermission } = require('../middleware/auth');

router.get('/', authenticateJWT, requirePermission('salary.view'), salaryController.getSalaries);
router.post('/', authenticateJWT, requirePermission('salary.create'), salaryController.createSalary);
router.put('/:id', authenticateJWT, requirePermission('salary.update'), salaryController.updateSalary);
router.delete('/:id', authenticateJWT, requirePermission('salary.delete'), salaryController.deleteSalary);

module.exports = router;
