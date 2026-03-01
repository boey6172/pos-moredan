const express = require('express');
const router = express.Router();
const employeeController = require('../controllers/employeeController');
const { authenticateJWT } = require('../middleware/auth');

router.get('/', authenticateJWT, employeeController.getEmployees);
router.post('/', authenticateJWT, employeeController.createEmployee);
router.put('/:id', authenticateJWT, employeeController.updateEmployee);
router.delete('/:id', authenticateJWT, employeeController.deleteEmployee);

module.exports = router;
