const express = require('express');
const router = express.Router();
const occupation = require('../Controllers/OccupationController');



/* agregando rutas para crud de TL_Ocupaciones */

router.post('/guardar-ocupacion', occupation.insertOccupation);
router.get('/obtener-ocupaciones', occupation.getAllOccupations);
router.get('/obtener-ocupacion/:ocupacionId', occupation.getOccupationById);
router.put('/actualizar-ocupacion/:ocupacionId', occupation.updateOccupation);
router.delete('/eliminar-ocupacion/:ocupacionId', occupation.deleteOccupation);


module.exports = router;