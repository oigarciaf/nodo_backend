// controllers/paymentMethodControllers.js
const PaymentMethod = require('../models/PaymentMenthod');

const paymentMethodController = {
  create: async (req, res) => {
    try {
      const { numero_tarjeta, fecha_expiracion, usuarioId } = req.body;

      // Validar fecha de expiración
      const currentDate = new Date();
      const expirationDate = new Date(fecha_expiracion);
      
      if (expirationDate < currentDate) {
        return res.status(400).json({
          success: false,
          message: 'La tarjeta ha expirado.'
        });
      }

      // Obtener últimos 4 dígitos
      const ultimosDigitos = numero_tarjeta.slice(-4);

      // Crear el método de pago
      const paymentMethod = await PaymentMethod.create({
        numero_tarjeta: ultimosDigitos,
        fecha_expiracion: expirationDate,
        usuarioId
      });

      res.status(201).json({
        success: true,
        message: 'Método de pago insertado exitosamente.',
        data: paymentMethod
      });

    } catch (error) {
      console.error('Error al crear método de pago:', error);
      res.status(500).json({
        success: false,
        message: 'Error al procesar la solicitud',
        error: error.message
      });
    }
  }
};

module.exports = paymentMethodController;