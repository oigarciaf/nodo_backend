// models/UserValidation.js
const validator = require('validator');

class UserRegister {
  constructor(data) {
    this.nombre_completo = data.nombre_completo;
    this.apellido_completo = data.apellido_completo;
    this.email = data.email;
    this.password = data.password;
  }

  validate() {
    const errors = [];

    // Validación de campos requeridos
    if (!this.nombre_completo) errors.push('nombre_completo is required');
    if (!this.apellido_completo) errors.push('apellido_completo is required');
    if (!this.email) errors.push('email is required');
    if (!this.password) errors.push('password is required');
    
    // Validación de email
    if (!validator.isEmail(this.email)) {
      errors.push('Invalid email address');
    }


      // Validación de nombre completo y apellido completo
      if (this.nombre_completo && this.nombre_completo.length < 2) {
        errors.push('nombre_completo must be at least 2 characters long');
      }
      if (this.apellido_completo && this.apellido_completo.length < 2) {
        errors.push('apellido_completo must be at least 2 characters long');
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