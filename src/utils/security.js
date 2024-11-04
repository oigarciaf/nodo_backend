// utils/security.js
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const { Token } = require('tedious/lib/token/token');
require('dotenv').config();

const SECRET_KEY = process.env.SECRET_KEY;

// Generar PKCE Verifier
function generatePkceVerifier() {
  return crypto.randomBytes(32).toString('base64url');
}

// Generar PKCE Challenge
function generatePkceChallenge(verifier) {
  return crypto.createHash('sha256')
    .update(verifier)
    .digest('base64url');
}

// Crear JWT Token
console.log("SECRET_KEY:", SECRET_KEY);

function createJwtToken(UsuarioID, primer_nombre, primer_apellido, email, active, role) {
  const expiration = Math.floor(Date.now() / 1000) + (60 * 60); // 1 hora de expiración
  return jwt.sign(
    {
      UsuarioID,          
      primer_nombre,
      primer_apellido,
      email,
      active,
      exp: expiration,
      role,
      iat: Math.floor(Date.now() / 1000)
    },
    SECRET_KEY,
    { algorithm: 'HS256' }
  );
}

// Middleware para validar JWT
function validateJwt(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(403).json({ detail: "Authorization header missing" });
  }

  const [scheme, token] = authHeader.split(' ');
  if (scheme.toLowerCase() !== 'bearer') {
    return res.status(403).json({ detail: "Invalid authentication scheme" });
  }

  try {
    const payload = jwt.verify(token, SECRET_KEY, { algorithms: 'HS256' });
    console.log('Token valido', payload);


    const { UsuarioID, email, exp, active, primer_nombre, primer_apellido, role } = payload;

    // Validación de campos requeridos en el token
    if (!UsuarioID || !email || !exp || active === undefined) {
      return res.status(403).json({ detail: "Invalid token" });
    }

    // Verificación de expiración del token
    if (exp < Math.floor(Date.now() / 1000)) {
      return res.status(403).json({ detail: "Expired token" });
    }

    // Verificación de estado activo del usuario
    if (!active) {
      return res.status(403).json({ detail: "Inactive user" });
    }

    // Almacena los datos del usuario en req.user para acceso posterior
    req.user = { UsuarioID, email, primer_nombre, primer_apellido, role };
    next();
  } catch (error) {
    console.log('Token invalido:', error.message );
    return res.status(403).json({ detail: "Invalid token or expired token" });
  }
}

module.exports = {
  generatePkceVerifier,
  generatePkceChallenge,
  createJwtToken,
  validateJwt
};