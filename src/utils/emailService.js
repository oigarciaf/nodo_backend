//src/utils/emailService.js
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const { sql } = require('../config/database');



require('dotenv').config();


const transporter = nodemailer.createTransport({
    service: 'gmail',  
    port: 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    },
    debug: true,
    logger: true
  });




  // Función para enviar el correo de restablecimiento de contraseña
const sendPasswordResetEmail = async (toEmail, resetLink) => {
  const mailOptions = {
      from: process.env.EMAIL_USER,
      to: toEmail,
      subject: "Restablecimiento de contraseña",
      text: `Haz clic en el siguiente enlace para restablecer tu contraseña: ${resetLink}`,
      html: `<p>Haz clic en el siguiente enlace para restablecer tu contraseña:</p><a href="${resetLink}">${resetLink}</a>`
  };

  try {
      await transporter.sendMail(mailOptions);
      console.log("Correo de restablecimiento enviado");
  } catch (error) {
      console.error("Error al enviar el correo:", error);
  }
};


const generateVerificationCode = () => {
  return crypto.randomBytes(3).toString('hex').toUpperCase();
};

const sendVerificationEmail = async (email, verificationCode) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Verificación de cuenta",
    html: `
      <h1>Bienvenido</h1>
      <p>Tu código de verificación es: <strong>${verificationCode}</strong></p>
      <p>Este código expirará en 1 hora.</p>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Error sending verification email:', error);
    throw error;
  }
};

const storeVerificationCode = async (email, code) => {
  const pool = await sql.connect();
  await pool.request()
    .input('email', sql.VarChar, email)
    .input('code', sql.VarChar, code)
    .input('expiration', sql.DateTime, new Date(Date.now() + 1 * 60 * 60 * 1000))
    .query(`
      INSERT INTO nodo.TL_VerificationCodes (email, code, expiration_date)
      VALUES (@email, @code, @expiration)
    `);
};

module.exports = {
  sendPasswordResetEmail,
  generateVerificationCode,
  sendVerificationEmail,
  storeVerificationCode
};



