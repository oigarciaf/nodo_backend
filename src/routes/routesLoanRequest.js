const express = require('express');

const router = express.Router();

const solicitudPrestamoController = require('../Controllers/solicitudPrestamoController');
const loanRequest = require('../Controllers/LoanRequestController');

/* 
router.post('/solicitud', solicitudPrestamoController.crear);
router.get('/solicitud', solicitudPrestamoController.consultar);
router.put('/solicitud/:id', solicitudPrestamoController.modificar);
router.delete('/solicitud/:id', solicitudPrestamoController.eliminar); */

router.post('/crear-solicitud', loanRequest.insertLoanRequest);
router.get('/obtener-solicitud', loanRequest.getAllLoanRequests);
router.get('/obtener-solicitud/:solicitudId', loanRequest.getLoanRequestById);
router.get('/obtener-solicitud-pendientes', loanRequest.getPendingLoanRequests);
router.get('/obtener-solicitud-pendientes/:usuarioId', loanRequest.getFilteredLoanRequests);
router.post('/crear-cuotas', loanRequest.insertLoanRequestWithInstallments);

module.exports = router;
