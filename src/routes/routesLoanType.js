const express = require('express');
const router = express.Router();

const loanType = require('../Controllers/LoanTypeController');

/* agregando rutas para crud de TL_Tipo_Prestamo */
router.post('/guardar-tipo-prestamo', loanType.insertLoanType);
router.get('/obtener-tipo-prestamo', loanType.getAllLoanTypes);
router.get('/obtener-tipo-prestamo/:tipo_PrestamoID',loanType.getLoanTypeById);
router.put('/actualizar-tipo-prestamo/:tipo_PrestamoID', loanType.updateLoanType);
router.delete('/eliminar-tipo-prestamo/:tipo_PrestamoID',loanType.deleteLoanType);


module.exports = router;