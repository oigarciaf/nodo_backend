
//src/routes/routesLoanOffer.js
const express = require('express');
const router = express.Router();
 

const offerLoan = require('../Controllers/loanOfferControllers');

router.post('/crear-oferta' , offerLoan.crear);
router.delete('/eliminar/:id', offerLoan.eliminar);
router.put('/actualizar/:id', offerLoan.actualizar);
router.get('/ofertas/:id', offerLoan.obtenerPorId);
router.get('/ofertas', offerLoan.listarTodas);
router.get('/ofertas/estado/:estadoId', offerLoan.listarPorEstado );
router.get('/ofertas/prestamista/:prestamistaId', offerLoan.listarPorPrestamista)



module.exports = router;