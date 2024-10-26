const express = require('express');
const router = express.Router();

const approvalStatus = require('../Controllers/ApprovalStatusController');

/* agregando rutas para crud de TL_Estado_Aprobacion */
router.post('/guardar-estado-aprobacion', approvalStatus.insertApprovalStatus);
router.get('/obtener-estado-aprobacion', approvalStatus.getApprovalStatuses);
router.get('/obtener-estado-aprobacion/:estado_aprobacion_id',approvalStatus.getApprovalStatusById);
router.put('/actualizar-estado-aprobacion/:estado_aprobacion_id',approvalStatus.updateApprovalStatus);
router.delete('/eliminar-estado-aprobacion/:estado_aprobacion_id',approvalStatus.deleteApprovalStatus);


module.exports = router;