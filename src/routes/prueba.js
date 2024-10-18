const express = require('express');
const router = express.Router();
const prueba = require('../Controllers/prueba');
const authController = require('../Controllers/authController');

router.get('/datos', prueba.getData);
router.post('/registro-usuarios', authController.registerUser);
router.post('/login', authController.loginUser);


module.exports = router;