// models/UserValidation.js
const validator = require('validator');

class UserRegister {
  constructor(data) {
    this.id_rol = data.id_rol;
    this.primer_nombre = data.primer_nombre;
    this.segundo_nombre = data.segundo_nombre;
    this.primer_apellido = data.primer_apellido;
    this.segundo_apellido = data.segundo_apellido;
    this.email = data.email;
    this.telefono = data.telefono;
    this.password = data.password;
  }

  validate() {
    const errors = [];

    // Validación de campos requeridos
    if (!this.id_rol) errors.push('id_rol is required');
    if (!this.primer_nombre) errors.push('primer_nombre is required');
    if (!this.primer_apellido) errors.push('primer_apellido is required');
    if (!this.email) errors.push('email is required');
    if (!this.telefono) errors.push('telefono is required');
    if (!this.password) errors.push('password is required');

    // Validación de email
    if (!validator.isEmail(this.email)) {
      errors.push('Invalid email address');
    }

    // Validación de contraseña
    if (this.password) {
      if (this.password.length < 6) {
        errors.push('Password must be at least 6 characters long');
      }
      if (!/[A-Z]/.test(this.password)) {
        errors.push('Password must contain at least one uppercase letter');
      }
      if (!/[\W_]/.test(this.password)) {
        errors.push('Password must contain at least one special character');
      }
      if (/012|123|234|345|456|567|678|789|890/.test(this.password)) {
        errors.push('Password must not contain a sequence of numbers');
      }
    }

    return errors;
  }
}

function validateSqlInjection(data) {
  // Palabras clave peligrosas específicas de SQL que podrían indicar un intento de inyección
  const dangerousKeywords = ['exec', 'EXEC', 'select', 'SELECT', 'insert', 'INSERT', 'delete', 'DELETE', 'update', 'UPDATE'];
  
  // Carácteres peligrosos que normalmente no se usan en entradas normales, pero comunes como '@' son excluidos
  const dangerousChars = ["'", ';', '--', '/*', '*/', '@@', '`', '"'];

  if (typeof data === 'string') {
    // Si contiene alguna palabra clave peligrosa
    if (dangerousKeywords.some(keyword => data.toLowerCase().includes(keyword.toLowerCase()))) {
      return true;
    }
    // Si contiene caracteres peligrosos
    if (dangerousChars.some(char => data.includes(char))) {
      return true;
    }
  }
  return false;
}


module.exports = { UserRegister, validateSqlInjection };