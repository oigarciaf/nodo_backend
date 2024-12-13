const { validateSqlInjection } = require("./UserValidation");

class QuotaStatus {
    constructor(data) {
        this.nombre = data.nombre;
        this.descripcion = data.descripcion;
    }

    validate() {
        const errors = [];

        // Validación de campos requeridos
        if (!this.nombre || this.nombre.trim().length === 0) {
            errors.push('El nombre del estado de cuota no puede estar vacío');
        }

        // Validación de inyección SQL
        if (validateSqlInjection(this.nombre)) {
            errors.push('Nombre contiene caracteres o palabras clave no permitidas');
        }
        if (validateSqlInjection(this.descripcion)) {
            errors.push('Descripción contiene caracteres o palabras clave no permitidas');
        }

        return errors;
    }
}

module.exports = { QuotaStatus };
