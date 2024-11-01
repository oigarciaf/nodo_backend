//src/utils/emailService.js
const nodemailer = require('nodemailer');
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

module.exports = { sendPasswordResetEmail };



