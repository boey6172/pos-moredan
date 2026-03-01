const express = require('express');
const router = express.Router();
const salaryController = require('../controllers/salaryController');
const { authenticateJWT } = require('../middleware/auth');

router.get('/', authenticateJWT, salaryController.getSalaries);
router.post('/', authenticateJWT, salaryController.createSalary);
router.put('/:id', authenticateJWT, salaryController.updateSalary);
router.delete('/:id', authenticateJWT, salaryController.deleteSalary);

module.exports = router;
