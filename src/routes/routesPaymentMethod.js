// routes/paymentMethod.routes.js
const express = require('express');
const router = express.Router();
const paymentMethodControllers = require('../Controllers/paymentMethodControllers');

router.post('/payment-methods', paymentMethodControllers.create);

module.exports = router;