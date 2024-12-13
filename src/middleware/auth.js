// src/middleware/auth.js
const admin = require('../config/firebase');
const { getAuth } = require('firebase-admin/auth');

const authMiddleware = async (req, res, next) => {
  try {
    // Obtener el token del header
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return res.status(401).json({ 
        error: 'No se proporcionó token de autenticación' 
      });
    }

    // Verificar formato del token
    if (!authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        error: 'Formato de token inválido' 
      });
    }

    // Extraer el token
    const token = authHeader.split('Bearer ')[1];

    try {
      // Verificar el token con Firebase Admin
      const decodedToken = await getAuth().verifyIdToken(token);
      
      // Agregar la información del usuario decodificada a la request
      req.user = {
        uid: decodedToken.uid,
        email: decodedToken.email,
        emailVerified: decodedToken.email_verified,
      };

      // Obtener información adicional del usuario desde Firebase
      const userRecord = await getAuth().getUser(decodedToken.uid);
      req.userRecord = userRecord;

      next();
    } catch (error) {
      console.error('Error al verificar el token:', error);
      
      // Manejar diferentes tipos de errores
      if (error.code === 'auth/id-token-expired') {
        return res.status(401).json({ 
          error: 'El token ha expirado' 
        });
      }
      
      if (error.code === 'auth/id-token-revoked') {
        return res.status(401).json({ 
          error: 'El token ha sido revocado' 
        });
      }
      
      return res.status(401).json({ 
        error: 'Token inválido' 
      });
    }
  } catch (error) {
    console.error('Error en el middleware de autenticación:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor' 
    });
  }
};

module.exports = authMiddleware;