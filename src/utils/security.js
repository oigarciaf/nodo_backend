// utils/security.js
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
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
function createJwtToken(primer_nombre, primer_apellido, email, active) {
  const expiration = Math.floor(Date.now() / 1000) + (60 * 60); // 1 hora de expiración
  return jwt.sign(
    {
      primer_nombre,
      primer_apellido,
      email,
      exp: expiration,
      active,
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
    const payload = jwt.verify(token, SECRET_KEY);
    const { email, exp, active, primer_nombre, primer_apellido } = payload;

    if (!email || !exp || active === undefined) {
      return res.status(403).json({ detail: "Invalid token" });
    }

    if (exp < Math.floor(Date.now() / 1000)) {
      return res.status(403).json({ detail: "Expired token" });
    }

    if (!active) {
      return res.status(403).json({ detail: "Inactive user" });
    }

    req.user = { email, primer_nombre, primer_apellido };
    next();
  } catch (error) {
    return res.status(403).json({ detail: "Invalid token or expired token" });
  }
}

module.exports = {
  generatePkceVerifier,
  generatePkceChallenge,
  createJwtToken,
  validateJwt
};