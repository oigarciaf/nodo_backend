// src/controllers/authController.js
const { sql } = require('../config/database');
const { createJwtToken } = require('../utils/security');
const admin = require('../config/firebase');
const { UserRegister, validateSqlInjection } = require('../models/UserValidation'); 

const axios = require('axios');

exports.registerUser = async (req, res) => {
  const { email, password, id_rol, primer_nombre, segundo_nombre, primer_apellido, segundo_apellido, telefono } = req.body;
  
  // Instanciar el modelo de validación
  const user = new UserRegister(req.body);
  
  // Validar los datos del usuario
  const validationErrors = user.validate();
  

  
  // Si hay errores de validación, devolverlos
  if (validationErrors.length > 0) {
    return res.status(400).json({ errors: validationErrors });
  }

  // Validación adicional para inyección SQL
  for (let key in req.body) {
    if (validateSqlInjection(req.body[key])) {
      return res.status(400).json({ error: 'Posible intento de inyección SQL detectado' });
    }
  }

  try {
    // Crear el usuario en el sistema de autenticación (Firebase por ejemplo)
    const userRecord = await admin.auth().createUser({
      email: email,
      password: password
    });

    // Conectar a la base de datos y ejecutar el procedimiento almacenado
    const pool = await sql.connect();
    try {
      await pool.request()
        .input('id_rol', sql.Int, id_rol)
        .input('primer_nombre', sql.VarChar, primer_nombre)
        .input('segundo_nombre', sql.VarChar, segundo_nombre)
        .input('primer_apellido', sql.VarChar, primer_apellido)
        .input('segundo_apellido', sql.VarChar, segundo_apellido)
        .input('email', sql.VarChar, email)
        .input('telefono', sql.VarChar, telefono)
        .input('active', sql.Bit, true) // Por defecto, el usuario está activo
        .execute('nodo.insertar_usuario');

      // Devolver una respuesta exitosa si todo va bien
      res.json({ success: true, message: "Usuario registrado exitosamente" });
    } catch (error) {
      // Si hay un error, eliminar el usuario creado en Firebase
      await admin.auth().deleteUser(userRecord.uid);
      throw error;
    }
  } catch (error) {
    // Manejar errores de autenticación o conexión
    res.status(400).json({ error: `Error al registrar usuario: ${error.message}` });
  }
};

exports.loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Autenticación en Firebase
    const response = await axios.post(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${process.env.FIREBASE_API_KEY}`, {
      email: email,
      password: password,
      returnSecureToken: true
    });

    // Conexión a la base de datos
    const pool = await sql.connect();
    
    // Obtener información del usuario de la base de datos
    const result = await pool.request()
      .input('email', sql.VarChar, email)
      .query('SELECT email, primer_nombre, primer_apellido, active FROM nodo.Usuarios WHERE email = @email');

    if (result.recordset.length > 0) {
      const user = result.recordset[0];
      const token = createJwtToken(user.primer_nombre, user.primer_apellido, user.email, user.active);

      res.json({
        message: "Usuario autenticado exitosamente",
        idToken: token
      });
    } else {
      res.status(404).json({ error: "Usuario no encontrado" });
    }
  } catch (error) {
    res.status(400).json({ error: `Error al autenticar usuario: ${error.message}` });
  }
};