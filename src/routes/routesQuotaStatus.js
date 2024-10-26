const express = require('express');
const router = express.Router();

const quotaStatus = require('../Controllers/QuotaStatusController');



/* agregando rutas para crud de TL_Estado_Cuotas */
router.post('/guardar-estado-cuota', quotaStatus.insertQuotaStatus);
router.get('/obtener-estado-cuota', quotaStatus.getQuotaStatuses)
router.get('/obtener-estado-cuota/:estadoCuotaID',quotaStatus.getQuotaStatusById);
router.put('/actualizar-estado-cuota/:estadoCuotaID',quotaStatus.updateQuotaStatus);
router.delete('/eliminar-estado-cuota/:estadoCuotaID',quotaStatus.deleteQuotaStatus);
module.exports = router;
