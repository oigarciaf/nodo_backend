const { sql } = require('../config/database');
const SolicitudPrestamo = require('../models/SolicitudPrestamo');
const { validateSqlInjection } = require('../models/UserValidation');

exports.insertLoanRequest = async (req, res) => {
  const { monto, tasa, plazo, estado_aprobacionid, tipo_prestamoid, usuarioId, prestamistaId } = req.body;

  // Instanciar el modelo de validación
  const nuevaSolicitud = new SolicitudPrestamo(req.body);

  // Validación adicional para inyección SQL
  if (
    validateSqlInjection(monto) ||
    validateSqlInjection(tasa) ||
    validateSqlInjection(estado_aprobacionid) ||
    validateSqlInjection(tipo_prestamoid) ||
    validateSqlInjection(usuarioId) ||
    validateSqlInjection(prestamistaId)
  ) {
    return res.status(400).json({ error: 'Posible intento de inyección SQL detectado' });
  }

  try {
    // Conectar a la base de datos y ejecutar el procedimiento almacenado
    const pool = await sql.connect();
    const result = await pool.request()
      .input('Monto', sql.Decimal(18, 2), monto)
      .input('Tasa', sql.Decimal(5, 2), tasa)
      .input('Plazo', sql.Int, plazo)
      .input('Estado_AprobacionID', sql.Int, estado_aprobacionid)
      .input('Tipo_PrestamoID', sql.Int, tipo_prestamoid)
      .input('UsuarioID', sql.Int, usuarioId)
      .input('PrestamistaID', sql.Int, prestamistaId || null)
      .execute('nodo.SP_InsertarSolicitudPrestamo');

    // Verificar si hubo un error en el procedimiento almacenado
    if (result.recordset && result.recordset[0].ErrorNumber) {
      throw new Error(result.recordset[0].ErrorMessage);
    }

    // Devolver una respuesta exitosa
    res.status(201).json({
      success: true,
      solicitudId: result.recordset[0].SolicitudID,
      message: 'Solicitud de préstamo creada exitosamente'
    });
  } catch (error) {
    // Manejar errores de SQL Server
    res.status(400).json({
      success: false,
      message: 'Error al crear la solicitud de préstamo',
      error: error.message
    });
  }
};



exports.getAllLoanRequests = async (req, res) => {
  try {
    // Conectar a la base de datos y ejecutar el procedimiento almacenado
    const pool = await sql.connect();
    const result = await pool.request()
      .execute('nodo.SP_Obtener_Solicitudes_Prestamos');

    // Enviar los resultados en la respuesta
    res.json(result.recordset);
  } catch (error) {
    // Manejo de errores de SQL Server
    res.status(500).json({ error: `Error al consultar todas las solicitudes de préstamo: ${error.message}` });
  }
};

exports.getLoanRequestById = async (req, res) => {
    const { solicitudId } = req.params;
  
    // Validación básica del ID de la solicitud
    if (!solicitudId || isNaN(solicitudId)) {
      return res.status(400).json({ error: 'ID de solicitud inválido' });
    }
  
    try {
      // Conectar a la base de datos y ejecutar el procedimiento almacenado
      const pool = await sql.connect();
      const result = await pool.request()
        .input('SolicitudID', sql.Int, solicitudId)
        .execute('nodo.SP_ConsultarSolicitudPorID');
  
      // Comprobar si se encontró la solicitud
      if (result.recordset.length === 0) {
        return res.status(404).json({ error: 'No se encontró la solicitud con el ID especificado' });
      }
  
      // Devolver los datos de la solicitud en la respuesta
      res.json({
        success: true,
        data: result.recordset[0]
      });
    } catch (error) {
      // Manejo de errores de SQL Server
      res.status(500).json({
        success: false,
        message: 'Error al consultar la solicitud de préstamo',
        error: error.message
      });
    }
  };
  