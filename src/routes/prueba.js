const express = require('express');
const router = express.Router();
const prueba = require('../Controllers/prueba');

router.get('/datos', prueba.getData);

module.exports = router;