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
router.post('/login/custom', authController.loginUser);

/* agregando rutas para crud de TL_Ocupaciones */

router.post('/guardar-ocupacion', occupation.insertOccupation);
router.get('/obtener-ocupaciones', occupation.getAllOccupations);
router.get('/obtener-ocupacion/:ocupacionId', occupation.getOccupationById);
router.put('/actualizar-ocupacion/:ocupacionId', occupation.updateOccupation);
router.delete('/eliminar-ocupacion/:ocupacionId', occupation.deleteOccupation);


/* agregando rutas para crud de TL_Tipo_Prestamo */
router.post('/guardar-tipo-prestamo', loanType.insertLoanType);
router.get('/obtener-tipo-prestamo', loanType.getAllLoanTypes);
router.get('/obtener-tipo-prestamo/:tipo_PrestamoID',loanType.getLoanTypeById);
router.put('/actualizar-tipo-prestamo/:tipo_PrestamoID', loanType.updateLoanType);
router.delete('/eliminar-tipo-prestamo/:tipo_PrestamoID',loanType.deleteLoanType);


/* agregando rutas para crud de TL_Estado_Aprobacion */
router.post('/guardar-estado-aprobacion', approvalStatus.insertApprovalStatus);
router.get('/obtener-estado-aprobacion', approvalStatus.getApprovalStatuses);
router.get('/obtener-estado-aprobacion/:estado_aprobacion_id',approvalStatus.getApprovalStatusById);
router.put('/actualizar-estado-aprobacion/:estado_aprobacion_id',approvalStatus.updateApprovalStatus);
router.delete('/eliminar-estado-aprobacion/:estado_aprobacion_id',approvalStatus.deleteApprovalStatus);

/* agregando rutas para crud de TL_Estado_Cuotas */
router.post('/guardar-estado-cuota', quotaStatus.insertQuotaStatus);
router.get('/obtener-estado-cuota', quotaStatus.getQuotaStatuses)
router.get('/obtener-estado-cuota/:estadoCuotaID',quotaStatus.getQuotaStatusById);
router.put('/actualizar-estado-cuota/:estadoCuotaID',quotaStatus.updateQuotaStatus);
router.delete('/eliminar-estado-cuota/:estadoCuotaID',quotaStatus.deleteQuotaStatus);
module.exports = router;