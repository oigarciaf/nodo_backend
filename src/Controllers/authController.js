// src/controllers/authController.js
const { sql, connectDB, config } = require('../config/database');
const { createJwtToken } = require('../utils/security');
const admin = require('../config/firebase');
const { UserRegister, validateSqlInjection } = require('../models/UserValidation'); 
const jwt = require('jsonwebtoken');
const { sendPasswordResetEmail } = require('../utils/emailService');
const axios = require('axios');
//const admin = require('firebase-admin');
const { getAuth } = require('firebase-admin/auth');
const {generateVerificationCode } = require('../utils/emailService')
//const {storeVerificationCode} = require('../utils/emailService')
const {sendVerificationEmail} = require('../utils/emailService')


exports.loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Verificar si el usuario está activo en la base de datos
    const pool = await sql.connect();
    const userStatus = await pool.request()
      .input('email', sql.VarChar, email)
      .query('SELECT active FROM nodo.TL_Usuarios WHERE email = @email');

    if (userStatus.recordset.length === 0 || !userStatus.recordset[0].active) {
      return res.status(403).json({ 
        error: "Por favor verifica tu cuenta antes de iniciar sesión" 
      });
    }

    // Proceder con la autenticación en Firebase
    const response = await axios.post(
      `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${process.env.FIREBASE_API_KEY}`,
      {
        email: email,
        password: password,
        returnSecureToken: true
      }
    );

    // Obtener información del usuario
    const userResult = await pool.request()
      .input('email', sql.VarChar, email)
      .query('SELECT UsuarioID, primer_nombre, primer_apellido, active, email FROM nodo.TL_Usuarios WHERE email = @email');

    const user = userResult.recordset[0];
    
    // Obtener rol del usuario
    const roleResult = await pool.request()
      .input('UsuarioID', sql.Int, user.UsuarioID)
      .query(`
        SELECT R.Nombre as role
        FROM nodo.TL_RolesUsuarios RU
        JOIN nodo.TL_Roles R ON RU.RolID = R.RolID
        WHERE RU.UsuarioID = @UsuarioID
      `);

    const role = roleResult.recordset.length > 0 ? roleResult.recordset[0].role : null;

    // Crear token JWT
    const token = createJwtToken(
      user.UsuarioID, 
      user.primer_nombre, 
      user.primer_apellido, 
      user.email, 
      user.active, 
      role
    );

    res.json({
      message: "Usuario autenticado exitosamente",
      idToken: token
    });
  } catch (error) {
    res.status(400).json({ 
      error: `Error al autenticar usuario: ${error.message}` 
    });
  }
};

exports.registerUser = async (req, res) => {
  const { email, password, nombre_completo, apellido_completo, fecha_nacimiento } = req.body;

  // Instanciar el modelo de validación
  const user = new UserRegister(req.body);
  
  // Validar los datos del usuario
  const validationErrors = user.validate();
  if (validationErrors.length > 0) {
    return res.status(400).json({ errors: validationErrors });
  }

  try {
    // Crear el usuario en Firebase
    const userRecord = await admin.auth().createUser({ email, password });

    // Generar el código de verificación
    const verificationCode = generateVerificationCode();
    const expirationDate = new Date(Date.now() + 15 * 60 * 1000); // Código expira en 15 minutos

    // Conectar a la base de datos y ejecutar el procedimiento de inserción de usuario
    const pool = await sql.connect();
    const result = await pool.request()
      .input('nombre_completo', sql.VarChar, nombre_completo)
      .input('apellido_completo', sql.VarChar, apellido_completo)
      .input('email', sql.VarChar, email)
      .input('fecha_nacimiento', sql.Date, new Date(fecha_nacimiento))
      .execute('nodo.SP_InsertarUsuarios');
    
    const { UsuarioID } = result.recordset[0];

    // Guardar el código de verificación en la tabla TL_Verificacion
    await pool.request()
      .input('UsuarioID', sql.Int, UsuarioID)
      .input('Codigo', sql.VarChar, verificationCode)
      .input('Fecha_Expiracion', sql.DateTime, expirationDate)
      .query('INSERT INTO nodo.TL_Verificacion (UsuarioID, Codigo, Fecha_Expiracion) VALUES (@UsuarioID, @Codigo, @Fecha_Expiracion)');

    // Enviar el código de verificación al correo del usuario
    await sendVerificationEmail(email, verificationCode);

    res.json({ success: true, message: 'Usuario registrado exitosamente. Verifique su correo para activar la cuenta.' });
  } catch (error) {
    res.status(400).json({ error: `Error al registrar usuario: ${error.message}` });
  }
};





//////////////////////
/*
exports.verifyEmail = async (req, res) => {
  const { email, code } = req.body;

  try {
    const pool = await sql.connect();
    
    // Verificar el código
    const result = await pool.request()
      .input('email', sql.VarChar, email)
      .input('code', sql.VarChar, code)
      .query(`
        SELECT * FROM nodo.TL_VerificationCodes 
        WHERE email = @email 
        AND code = @code 
        AND expiration_date > GETDATE()
        AND used = 0
      `);

    if (result.recordset.length === 0) {
      return res.status(400).json({ error: "Código inválido o expirado" });
    }

    // Actualizar estado de verificación
    await pool.request()
      .input('email', sql.VarChar, email)
      .query(`
        UPDATE nodo.TL_Usuarios 
        SET active = 1 
        WHERE email = @email
      `);

    // Marcar código como usado
    await pool.request()
      .input('email', sql.VarChar, email)
      .input('code', sql.VarChar, code)
      .query(`
        UPDATE nodo.TL_VerificationCodes 
        SET used = 1 
        WHERE email = @email AND code = @code
      `);

    // Actualizar estado en Firebase
    const userRecord = await admin.auth().getUserByEmail(email);
    await admin.auth().updateUser(userRecord.uid, {
      emailVerified: true
    });

    res.json({ 
      success: true, 
      message: "Email verificado exitosamente" 
    });
  } catch (error) {
    res.status(400).json({ error: `Error al verificar email: ${error.message}` });
  }
};*/

exports.verifyUser = async (req, res) => {
  const { email, verificationCode } = req.body;

  try {
    const pool = await sql.connect();

    // Obtener el usuario y verificar el código
    const userResult = await pool.request()
      .input('email', sql.VarChar, email)
      .query(`
        SELECT u.UsuarioID, v.Codigo, v.Fecha_Expiracion 
        FROM nodo.TL_Usuarios u
        JOIN nodo.TL_Verificacion v ON u.UsuarioID = v.UsuarioID 
        WHERE u.Email = @email
      `);

    if (userResult.recordset.length === 0) {
      return res.status(400).json({ error: 'Usuario no encontrado o código incorrecto.' });
    }

    const { UsuarioID, Codigo, Fecha_Expiracion } = userResult.recordset[0];
    if (verificationCode !== Codigo || new Date() > Fecha_Expiracion) {
      return res.status(400).json({ error: 'Código incorrecto o expirado.' });
    }

    // Activar el usuario
    await pool.request()
      .input('UsuarioID', sql.Int, UsuarioID)
      .query('UPDATE nodo.TL_Usuarios SET active = 1 WHERE UsuarioID = @UsuarioID');

    res.json({ success: true, message: 'Cuenta activada exitosamente. Ahora puede iniciar sesión.' });
  } catch (error) {
    res.status(500).json({ error: `Error al verificar el código: ${error.message}` });
  }
};



exports.forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    // Genera un enlace de restablecimiento de contraseña
    const link = await getAuth().generatePasswordResetLink(email);

    // Enviar el correo usando la función de envío de correo
    await sendPasswordResetEmail(email, link);

    res.json({
      success: true,
      message: "Correo de restablecimiento de contraseña enviado exitosamente"
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(400).json({ 
      error: `Error al procesar la solicitud de restablecimiento: ${error.message}` 
    });
  }
};

