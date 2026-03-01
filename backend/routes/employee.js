const express = require('express');
const router = express.Router();
const employeeController = require('../controllers/employeeController');
const { authenticateJWT, authorizeRoles } = require('../middleware/auth');

router.get('/', authenticateJWT, authorizeRoles('admin'), employeeController.getEmployees);
router.post('/', authenticateJWT, authorizeRoles('admin'), employeeController.createEmployee);
router.put('/:id', authenticateJWT, authorizeRoles('admin'), employeeController.updateEmployee);
router.delete('/:id', authenticateJWT, authorizeRoles('admin'), employeeController.deleteEmployee);

module.exports = router;
