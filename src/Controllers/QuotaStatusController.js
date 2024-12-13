const { sql } = require('../config/database');
const { QuotaStatus } = require('../models/QuotaStatusValidation'); // Ajusta la ruta al archivo de validación
const { validateSqlInjection } = require('../models/UserValidation');

exports.insertQuotaStatus = async (req, res) => {
    const { nombre, descripcion } = req.body;

    // Instanciar el modelo de validación
    const quotaStatus = new QuotaStatus(req.body);

    // Validar los datos del estado de cuota
    const validationErrors = quotaStatus.validate();

    // Si hay errores de validación, devolverlos
    if (validationErrors.length > 0) {
        return res.status(400).json({ errors: validationErrors });
    }

    // Validación adicional para inyección SQL
    if (validateSqlInjection(nombre) || validateSqlInjection(descripcion)) {
        return res.status(400).json({ error: 'Posible intento de inyección SQL detectado' });
    }

    try {
        // Conectar a la base de datos y ejecutar el procedimiento almacenado
        const pool = await sql.connect();
        await pool.request()
            .input('Nombre', sql.VarChar(50), nombre)
            .input('Descripcion', sql.VarChar(200), descripcion)
            .execute('nodo.insertar_estado_cuota');

        // Devolver una respuesta exitosa si todo va bien
        res.json({ success: true, message: "Estado de cuota insertado exitosamente" });
    } catch (error) {
        // Manejar errores de SQL Server
        res.status(400).json({ error: `Error al insertar el estado de cuota: ${error.message}` });
    }
};


exports.getQuotaStatuses = async (req, res) => {
    try {
        // Conectar a la base de datos y ejecutar el procedimiento almacenado
        const pool = await sql.connect();
        const result = await pool.request().execute('nodo.obtener_estados_cuota');
        
        // Devolver la lista de estados de cuota
        res.json(result.recordset);
    } catch (error) {
        // Manejar errores de SQL Server
        res.status(400).json({ error: `Error al obtener los estados de cuota: ${error.message}` });
    }
};

// Obtener estado de cuota por ID
exports.getQuotaStatusById = async (req, res) => {
    const { estadoCuotaID } = req.params;

    // Validación adicional para inyección SQL
    if (validateSqlInjection(estadoCuotaID)) {
        return res.status(400).json({ error: 'Posible intento de inyección SQL detectado' });
    }

    try {
        // Conectar a la base de datos y ejecutar el procedimiento almacenado
        const pool = await sql.connect();
        const result = await pool.request()
            .input('Estado_CuotaID', sql.Int, estadoCuotaID)
            .execute('nodo.obtener_estado_cuota_por_id');

        // Comprobar si se encontró el estado de cuota
        if (result.recordset.length === 0) {
            return res.status(404).json({ error: 'No se encontró el estado de cuota con el ID especificado.' });
        }

        // Devolver el estado de cuota encontrado
        res.json(result.recordset[0]);
    } catch (error) {
        // Manejar errores de SQL Server
        res.status(400).json({ error: `Error al obtener el estado de cuota: ${error.message}` });
    }
};

// Actualizar estado de cuota
exports.updateQuotaStatus = async (req, res) => {
    const {estadoCuotaID}= req.params;
    const { nombre, descripcion } = req.body;

    // Validación adicional para inyección SQL
    if (validateSqlInjection(estadoCuotaID) || validateSqlInjection(nombre) || validateSqlInjection(descripcion)) {
        return res.status(400).json({ error: 'Posible intento de inyección SQL detectado' });
    }

    try {
        // Conectar a la base de datos y ejecutar el procedimiento almacenado
        const pool = await sql.connect();
        await pool.request()
            .input('Estado_CuotaID', sql.Int, estadoCuotaID)
            .input('Nombre', sql.VarChar(50), nombre)
            .input('Descripcion', sql.VarChar(200), descripcion)
            .execute('nodo.actualizar_estado_cuota');

        // Devolver una respuesta exitosa
        res.json({ success: true, message: "Estado de cuota actualizado exitosamente" });
    } catch (error) {
        // Manejar errores de SQL Server
        res.status(400).json({ error: `Error al actualizar el estado de cuota: ${error.message}` });
    }
};

// Eliminar estado de cuota
exports.deleteQuotaStatus = async (req, res) => {
    const { estadoCuotaID } = req.params;

    // Validación adicional para inyección SQL
    if (validateSqlInjection(estadoCuotaID)) {
        return res.status(400).json({ error: 'Posible intento de inyección SQL detectado' });
    }

    try {
        // Conectar a la base de datos y ejecutar el procedimiento almacenado
        const pool = await sql.connect();
        await pool.request()
            .input('Estado_CuotaID', sql.Int, estadoCuotaID)
            .execute('nodo.eliminar_estado_cuota');

        // Devolver una respuesta exitosa
        res.json({ success: true, message: "Estado de cuota eliminado exitosamente" });
    } catch (error) {
        // Manejar errores de SQL Server
        res.status(400).json({ error: `Error al eliminar el estado de cuota: ${error.message}` });
    }
};