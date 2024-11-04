const express = require('express');

const router = express.Router();

const solicitudPrestamoController = require('../Controllers/solicitudPrestamoController');



router.post('/solicitud', solicitudPrestamoController.crear);
router.get('/solicitud', solicitudPrestamoController.consultar);
router.put('/solicitud/:id', solicitudPrestamoController.modificar);
router.delete('/solicitud/:id', solicitudPrestamoController.eliminar);


module.exports = router;
