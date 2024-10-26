const { sql } = require('../config/database');
const { LoanType } = require('../models/LoanTypeValidation'); // Ajusta la ruta al archivo de validación
const { validateSqlInjection } = require('../models/UserValidation');

exports.insertLoanType = async (req, res) => {
  const { nombre, descripcion } = req.body;

  // Instanciar el modelo de validación
  const loanType = new LoanType(req.body);

  // Validar los datos del tipo de préstamo
  const validationErrors = loanType.validate();

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
      .execute('nodo.insertar_tipo_prestamo');

    // Devolver una respuesta exitosa si todo va bien
    res.json({ success: true, message: "Tipo de préstamo insertado exitosamente" });
  } catch (error) {
    // Manejar errores de SQL Server
    res.status(400).json({ error: `Error al insertar el tipo de préstamo: ${error.message}` });
  }
};


exports.getAllLoanTypes = async (req, res) => {
    try {
      const pool = await sql.connect();
      const result = await pool.request().execute('nodo.obtener_tipos_prestamo');
      res.json(result.recordset);
    } catch (error) {
      res.status(500).json({ error: `Error al obtener los tipos de préstamo: ${error.message}` });
    }
  };
  
  // Obtener un tipo de préstamo por ID
  exports.getLoanTypeById = async (req, res) => {
    const { tipo_PrestamoID } = req.params;
  
    // Validación del ID
    if (isNaN(tipo_PrestamoID) || tipo_PrestamoID <= 0) {
      return res.status(400).json({ error: 'ID de tipo de préstamo inválido' });
    }
  
    try {
      const pool = await sql.connect();
      const result = await pool.request()
        .input('Tipo_PrestamoID', sql.Int, tipo_PrestamoID)
        .execute('nodo.obtener_tipo_prestamo_por_id');
  
      if (result.recordset.length === 0) {
        return res.status(404).json({ error: 'No se encontró el tipo de préstamo con el ID especificado' });
      }
  
      res.json(result.recordset[0]);
    } catch (error) {
      res.status(500).json({ error: `Error al obtener el tipo de préstamo: ${error.message}` });
    }
  };
  
  // Actualizar un tipo de préstamo
  exports.updateLoanType = async (req, res) => {
    const { tipo_PrestamoID } = req.params;
    const { nombre, descripcion } = req.body;
  
    // Validaciones
    if (isNaN(tipo_PrestamoID) || tipo_PrestamoID <= 0) {
      return res.status(400).json({ error: 'ID de tipo de préstamo inválido' });
    }
    if (!nombre || nombre.trim().length === 0) {
      return res.status(400).json({ error: 'El nombre del tipo de préstamo no puede estar vacío' });
    }
    if (validateSqlInjection(nombre) || validateSqlInjection(descripcion)) {
      return res.status(400).json({ error: 'Posible intento de inyección SQL detectado' });
    }
  
    try {
      const pool = await sql.connect();
      const result = await pool.request()
        .input('Tipo_PrestamoID', sql.Int, tipo_PrestamoID)
        .input('Nombre', sql.VarChar(50), nombre)
        .input('Descripcion', sql.VarChar(200), descripcion)
        .execute('nodo.actualizar_tipo_prestamo');
  
      if (result.rowsAffected[0] === 0) {
        return res.status(404).json({ error: 'No se encontró el tipo de préstamo con el ID especificado' });
      }
  
      res.json({ success: true, message: 'Tipo de préstamo actualizado exitosamente' });
    } catch (error) {
      res.status(500).json({ error: `Error al actualizar el tipo de préstamo: ${error.message}` });
    }
  };
  
  // Eliminar un tipo de préstamo
  exports.deleteLoanType = async (req, res) => {
    const { tipo_PrestamoID } = req.params;
  
    // Validación del ID
    if (isNaN(tipo_PrestamoID) || tipo_PrestamoID <= 0) {
      return res.status(400).json({ error: 'ID de tipo de préstamo inválido' });
    }
  
    try {
      const pool = await sql.connect();
      const result = await pool.request()
        .input('Tipo_PrestamoID', sql.Int, tipo_PrestamoID)
        .execute('nodo.eliminar_tipo_prestamo');
  
      if (result.rowsAffected[0] === 0) {
        return res.status(404).json({ error: 'No se encontró el tipo de préstamo con el ID especificado' });
      }
  
      res.json({ success: true, message: 'Tipo de préstamo eliminado exitosamente' });
    } catch (error) {
      res.status(500).json({ error: `Error al eliminar el tipo de préstamo: ${error.message}` });
    }
  };