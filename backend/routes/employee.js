const express = require('express');
const router = express.Router();
const employeeController = require('../controllers/employeeController');
const { authenticateJWT, requirePermission } = require('../middleware/auth');

router.get('/', authenticateJWT, requirePermission('employees.view'), employeeController.getEmployees);
router.post('/', authenticateJWT, requirePermission('employees.create'), employeeController.createEmployee);
router.put('/:id', authenticateJWT, requirePermission('employees.update'), employeeController.updateEmployee);
router.delete('/:id', authenticateJWT, requirePermission('employees.delete'), employeeController.deleteEmployee);

module.exports = router;
