const { sql } = require('../config/database');
const { Occupation } = require('../models/OccupationValidation'); // Ajusta la ruta al archivo de validación
const { validateSqlInjection } = require('../models/UserValidation');

exports.insertOccupation = async (req, res) => {
  const { nombre, descripcion } = req.body;

  // Instanciar el modelo de validación
  const occupation = new Occupation(req.body);

  // Validar los datos de la ocupación
  const validationErrors = occupation.validate();

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
      .input('Nombre', sql.VarChar(100), nombre)
      .input('Descripcion', sql.VarChar(200), descripcion)
      .execute('nodo.insertar_ocupacion');

    // Devolver una respuesta exitosa si todo va bien
    res.json({ success: true, message: "Ocupación insertada exitosamente" });
  } catch (error) {
    // Manejar errores de SQL Server
    res.status(400).json({ error: `Error al insertar la ocupación: ${error.message}` });
  }
};

exports.getOccupationById = async (req, res) => {
    const { ocupacionId } = req.params;
  
    try {
      // Conectar a la base de datos y ejecutar el procedimiento almacenado
      const pool = await sql.connect();
      const result = await pool.request()
        .input('OcupacionID', sql.Int, ocupacionId)
        .execute('nodo.obtener_ocupacion');
  
      if (result.recordset.length > 0) {
        res.json({ success: true, data: result.recordset[0] });
      } else {
        res.status(404).json({ success: false, message: 'No se encontró ninguna ocupación con el ID dado.' });
      }
    } catch (error) {
      res.status(500).json({ error: `Error al obtener la ocupación: ${error.message}` });
    }
  };

exports.getAllOccupations = async (req, res) => {
  try {
    // Conectar a la base de datos y ejecutar el procedimiento almacenado
    const pool = await sql.connect();
    const result = await pool.request()
      .execute('nodo.obtener_todas_ocupaciones');

    if (result.recordset.length > 0) {
      res.json({ success: true, data: result.recordset });
    } else {
      res.status(404).json({ success: false, message: 'No existen ocupaciones registradas.' });
    }
  } catch (error) {
    res.status(500).json({ error: `Error al obtener las ocupaciones: ${error.message}` });
  }
};
  

exports.updateOccupation = async (req, res) => {
    const { ocupacionId } = req.params;
    const { nombre, descripcion } = req.body;
  
    // Validación: El nombre no debe estar vacío
    if (!nombre) {
      return res.status(400).json({ error: 'El nombre de la ocupación no puede estar vacío.' });
    }
  
    try {
      // Conectar a la base de datos y ejecutar el procedimiento almacenado
      const pool = await sql.connect();
      const result = await pool.request()
        .input('OcupacionID', sql.Int, ocupacionId)
        .input('Nombre', sql.VarChar(100), nombre)
        .input('Descripcion', sql.VarChar(200), descripcion)
        .execute('nodo.actualizar_ocupacion');
  
      if (result.rowsAffected[0] === 0) {
        res.status(404).json({ success: false, message: 'No se encontró ninguna ocupación con el ID dado.' });
      } else {
        res.json({ success: true, message: 'Ocupación actualizada exitosamente' });
      }
    } catch (error) {
      if (error.number === 2627) {
        res.status(400).json({ error: 'La ocupación ya existe con el nombre dado.' });
      } else {
        res.status(500).json({ error: `Error al actualizar la ocupación: ${error.message}` });
      }
    }
  };
  
  // Eliminar ocupación
  exports.deleteOccupation = async (req, res) => {
    const { ocupacionId } = req.params;
  
    try {
      // Conectar a la base de datos y ejecutar el procedimiento almacenado
      const pool = await sql.connect();
      const result = await pool.request()
        .input('OcupacionID', sql.Int, ocupacionId)
        .execute('nodo.eliminar_ocupacion');
  
      if (result.rowsAffected[0] === 0) {
        res.status(404).json({ success: false, message: 'No se encontró ninguna ocupación con el ID dado para eliminar.' });
      } else {
        res.json({ success: true, message: 'Ocupación eliminada exitosamente' });
      }
    } catch (error) {
      res.status(500).json({ error: `Error al eliminar la ocupación: ${error.message}` });
    }
  };