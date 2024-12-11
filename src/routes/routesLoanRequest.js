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
router.post('/obtener-cuotas', loanRequest.getLoanInstallmentsByStatusAndRequest);
router.post('/realizar-pago', loanRequest.payLoanInstallment);
router.get('/obtener-cuotas/:SolicitudID', loanRequest.getInstallmentsByRequest);
router.get('/obtener-recibo/:CuotaPrestamoID', loanRequest.getReceiptByInstallment);
router.get('/obtener-solicitud-prestamista/:prestamistaId', loanRequest.getLoanRequestsByLender);
router.get('/obtener-solicitud-usuario/:usuarioId', loanRequest.getLoanRequestsByUser);

module.exports = router;
