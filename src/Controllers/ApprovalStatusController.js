const { sql } = require('../config/database');
const { ApprovalStatus } = require('../models/ApprovalStatusValidation'); // Ajusta la ruta al archivo de validación
const { validateSqlInjection } = require('../models/UserValidation');

exports.insertApprovalStatus = async (req, res) => {
    const { nombre, descripcion } = req.body;

    // Instanciar el modelo de validación
    const approvalStatus = new ApprovalStatus(req.body);

    // Validar los datos del estado de aprobación
    const validationErrors = approvalStatus.validate();

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
            .execute('nodo.insertar_estado_aprobacion');

        // Devolver una respuesta exitosa si todo va bien
        res.json({ success: true, message: "Estado de aprobación insertado exitosamente" });
    } catch (error) {
        // Manejar errores de SQL Server
        res.status(400).json({ error: `Error al insertar el estado de aprobación: ${error.message}` });
    }
};

exports.getApprovalStatuses = async (req, res) => {
    try {
        // Conectar a la base de datos y ejecutar el procedimiento almacenado
        const pool = await sql.connect();
        const result = await pool.request().execute('nodo.obtener_estados_aprobacion');

        // Devolver la lista de estados de aprobación
        res.json(result.recordset);
    } catch (error) {
        // Manejar errores de SQL Server
        res.status(400).json({ error: `Error al obtener los estados de aprobación: ${error.message}` });
    }
};

exports.getApprovalStatusById = async (req, res) => {
    const { estado_aprobacion_id } = req.params;

    // Validación adicional para inyección SQL
    if (validateSqlInjection(estado_aprobacion_id)) {
        return res.status(400).json({ error: 'Posible intento de inyección SQL detectado' });
    }

    try {
        // Conectar a la base de datos y ejecutar el procedimiento almacenado
        const pool = await sql.connect();
        const result = await pool.request()
            .input('Estado_AprobacionID', sql.Int, estado_aprobacion_id)
            .execute('nodo.obtener_estado_aprobacion_por_id');

        if (result.recordset.length === 0) {
            return res.status(404).json({ error: 'No se encontró el estado de aprobación con el ID especificado.' });
        }

        // Devolver el estado de aprobación encontrado
        res.json(result.recordset[0]);
    } catch (error) {
        // Manejar errores de SQL Server
        res.status(400).json({ error: `Error al obtener el estado de aprobación: ${error.message}` });
    }
};

exports.updateApprovalStatus = async (req, res) => {
    const {estado_aprobacion_id}= req.params;
    const { nombre, descripcion } = req.body;

    // Validación adicional para inyección SQL
    if ( validateSqlInjection(nombre) || validateSqlInjection(descripcion)) {
        return res.status(400).json({ error: 'Posible intento de inyección SQL detectado' });
    }

    try {
        // Conectar a la base de datos y ejecutar el procedimiento almacenado
        const pool = await sql.connect();
        await pool.request()
            .input('Estado_AprobacionID', sql.Int, estado_aprobacion_id)
            .input('Nombre', sql.VarChar(50), nombre)
            .input('Descripcion', sql.VarChar(200), descripcion)
            .execute('nodo.actualizar_estado_aprobacion');

        // Devolver una respuesta exitosa si todo va bien
        res.json({ success: true, message: "Estado de aprobación actualizado exitosamente" });
    } catch (error) {
        // Manejar errores de SQL Server
        res.status(400).json({ error: `Error al actualizar el estado de aprobación: ${error.message}` });
    }
};

exports.deleteApprovalStatus = async (req, res) => {
    const { estado_aprobacion_id } = req.params;

    // Validación adicional para inyección SQL
    if (validateSqlInjection(estado_aprobacion_id)) {
        return res.status(400).json({ error: 'Posible intento de inyección SQL detectado' });
    }

    try {
        // Conectar a la base de datos y ejecutar el procedimiento almacenado
        const pool = await sql.connect();
        await pool.request()
            .input('Estado_AprobacionID', sql.Int, estado_aprobacion_id)
            .execute('nodo.eliminar_estado_aprobacion');

        // Devolver una respuesta exitosa si todo va bien
        res.json({ success: true, message: "Estado de aprobación eliminado exitosamente" });
    } catch (error) {
        // Manejar errores de SQL Server
        res.status(400).json({ error: `Error al eliminar el estado de aprobación: ${error.message}` });
    }
};