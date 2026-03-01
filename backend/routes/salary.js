const express = require('express');
const router = express.Router();
const salaryController = require('../controllers/salaryController');
const { authenticateJWT, authorizeRoles } = require('../middleware/auth');

router.get('/', authenticateJWT, authorizeRoles('admin'), salaryController.getSalaries);
router.post('/', authenticateJWT, authorizeRoles('admin'), salaryController.createSalary);
router.put('/:id', authenticateJWT, authorizeRoles('admin'), salaryController.updateSalary);
router.delete('/:id', authenticateJWT, authorizeRoles('admin'), salaryController.deleteSalary);

module.exports = router;
