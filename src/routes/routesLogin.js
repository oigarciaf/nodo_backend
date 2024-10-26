const express = require('express');
const router = express.Router();
const prueba = require('../Controllers/prueba');
const authController = require('../Controllers/authController');
const occupation = require('../Controllers/OccupationController');
const loanType = require('../Controllers/LoanTypeController');
const approvalStatus = require('../Controllers/ApprovalStatusController');
const quotaStatus = require('../Controllers/QuotaStatusController');


router.get('/datos', prueba.getData);
router.post('/registro-usuarios', authController.registerUser);
router.post('/custom', authController.loginUser);


module.exports = router;
