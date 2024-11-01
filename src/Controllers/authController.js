// src/controllers/authController.js
const { sql } = require('../config/database');
const { createJwtToken } = require('../utils/security');
const admin = require('../config/firebase');
const { UserRegister, validateSqlInjection } = require('../models/UserValidation'); 
const jwt = require('jsonwebtoken');
const { sendPasswordResetEmail } = require('../utils/emailService');
const axios = require('axios');
//const admin = require('firebase-admin');
const { getAuth } = require('firebase-admin/auth');

// Configuración del token
const SECRET_KEY = process.env.JWT_SECRET; // Configura una clave secreta en tu .env
const RESET_EXPIRATION = '1h'; // Tiempo de expiración del enlace (1 hora en este caso)




exports.handlePasswordResetRequest = async function(userEmail) {
  try {
      // Genera un token JWT con el email del usuario y una expiración
      const token = jwt.sign({ email: userEmail }, SECRET_KEY, { expiresIn: RESET_EXPIRATION });
      
      // Enlace de restablecimiento que apunta a tu frontend y contiene el token
      const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;

      // Envía el correo con el enlace
      await sendPasswordResetEmail(userEmail, resetLink);
      
      console.log("Correo de restablecimiento enviado");
  } catch (error) {
      console.error("Error al generar o enviar el enlace de restablecimiento:", error);
  }
}


exports.verifyResetToken = async function (token) {
  try {
      const decoded = jwt.verify(token, SECRET_KEY);
      return decoded.email; // Devuelve el email si el token es válido
  } catch (error) {
      console.error("Token inválido o caducado:", error);
      throw new Error("Token inválido o caducado");
  }
}



exports.registerUser = async (req, res) => {
  const { email, password, nombre_completo, apellido_completo } = req.body;
 
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
      .input('nombre_completo', sql.VarChar, nombre_completo)
      .input('apellido_completo', sql.VarChar, apellido_completo)
      .input('email', sql.VarChar, email)
      .execute('nodo.insertar_usuarios');

      // Devolver una respuesta exitosa si todo va bien
      res.json({
          success: true,
          message: "Usuario registrado exitosamente",
          uid:userRecord.uid
         });
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
      .query('SELECT email, primer_nombre, primer_apellido, active FROM nodo.TL_Usuarios WHERE email = @email');

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


exports.resetPassword = async (req, res) => {
  const { token, newPassword } = req.body;
  try {
      // Verificar el token
      const email = await exports.verifyResetToken(token);

      // Actualizar la contraseña en Firebase o tu base de datos
      const userRecord = await admin.auth().getUserByEmail(email);
      await admin.auth().updateUser(userRecord.uid, { password: newPassword });

      res.json({ success: true, message: "Contraseña actualizada exitosamente" });
  } catch (error) {
      res.status(400).json({ error: `Error al actualizar la contraseña: ${error.message}` });
  }
};


/*
// Opción 1: Usando Firebase directamente (RECOMENDADA)
exports.forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    // Genera un enlace de restablecimiento de contraseña
    const link = await getAuth()
      .generatePasswordResetLink(email);

    // Configurar el correo electrónico
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Restablecimiento de contraseña",
      text: `Haz clic en el siguiente enlace para restablecer tu contraseña: ${link}`,
      html: `
        <h2>Restablecimiento de contraseña</h2>
        <p>Haz clic en el siguiente enlace para restablecer tu contraseña:</p>
        <a href="${link}">${link}</a>
        <p>Este enlace expirará en 1 hora.</p>
        <p>Si no solicitaste este cambio, puedes ignorar este correo.</p>
      `
    };

    // Enviar el correo usando tu servicio de correo
    await transporter.sendMail(mailOptions);

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
};*/

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

