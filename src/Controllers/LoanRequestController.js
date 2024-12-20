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


  exports.getPendingLoanRequests = async (req, res) => {
    try {
      // Conectar a la base de datos y ejecutar el procedimiento almacenado
      const pool = await sql.connect();
      const result = await pool.request()
        .execute('nodo.SP_Obtener_Solicitudes_Pendientes'); // Nombre del nuevo procedimiento
  
      // Enviar los resultados en la respuesta
      res.json(result.recordset);
    } catch (error) {
      // Manejo de errores de SQL Server
      res.status(500).json({ 
        error: `Error al consultar las solicitudes de préstamo pendientes: ${error.message}` 
      });
    }
  };
  
  exports.getFilteredLoanRequests = async (req, res) => {
    const { usuarioId } = req.params; // Obtener el UsuarioID desde los parámetros de la solicitud
  
    // Validación básica del ID de usuario
    if (!usuarioId || isNaN(usuarioId)) {
      return res.status(400).json({ error: 'ID de usuario inválido' });
    }
  
    try {
      // Conectar a la base de datos y ejecutar el procedimiento almacenado
      const pool = await sql.connect();
      const result = await pool.request()
        .input('UsuarioID', sql.Int, usuarioId) // Pasar el parámetro UsuarioID
        .execute('nodo.SP_Obtener_Solicitudes_Filtradas'); // Llamar al procedimiento almacenado
  
      // Comprobar si se encontraron registros
      if (result.recordset.length === 0) {
        return res.status(404).json({ error: 'No se encontraron solicitudes con los filtros especificados' });
      }
  
      // Devolver los datos de las solicitudes en la respuesta
      res.json(
         result.recordset
      );
    } catch (error) {
      // Manejo de errores de SQL Server
      res.status(500).json({
        success: false,
        message: 'Error al consultar las solicitudes filtradas',
        error: error.message
      });
    }
  };



  exports.insertLoanRequestWithInstallments = async (req, res) => {
    const { solicitudId, usuarioId, prestamistaId } = req.body;
  
    // Validaciones de entrada
    if (!solicitudId || !usuarioId) {
      return res.status(400).json({ error: 'El SolicitudID y UsuarioID son obligatorios' });
    }
  
    try {
      // Conectar a la base de datos
      const pool = await sql.connect();
  
      // Ejecutar el procedimiento almacenado
      const result = await pool.request()
        .input('SolicitudID', sql.Int, solicitudId)
        .input('UsuarioID', sql.Int, usuarioId)
        .input('PrestamistaID', sql.Int, prestamistaId || null)  // Si no hay prestamista, se asigna NULL
        .execute('nodo.SP_InsertarSolicitudPrestamoYCuotas');
  
      // Verificar si hubo errores en el procedimiento almacenado
      if (result.recordset && result.recordset[0].ErrorNumber) {
        throw new Error(result.recordset[0].ErrorMessage);
      }
  
      // Devolver una respuesta exitosa
      res.status(201).json({
        success: true,
        solicitudId: result.recordset[0].SolicitudID,
        message: 'Solicitud de préstamo y cuotas creadas exitosamente'
      });
    } catch (error) {
      // Manejar errores de SQL Server
      res.status(400).json({
        success: false,
        message: 'Error al crear la solicitud de préstamo y cuotas',
        error: error.message
      });
    }
  };
  


exports.getLoanInstallmentsByStatusAndRequest = async (req, res) => {
  const { SolicitudID, Estado_CuotaID } = req.body; // Obtener parámetros del cuerpo de la solicitud

  // Validar los parámetros
  if (!SolicitudID) {
      return res.status(400).json({ error: 'El parámetro SolicitudID es obligatorio.' });
  }

  try {
      // Conectar a la base de datos y ejecutar el procedimiento almacenado
      const pool = await sql.connect();
      const result = await pool.request()
          .input('SolicitudID', sql.Int, SolicitudID)
          .input('Estado_CuotaID', sql.Int, Estado_CuotaID || 2) // Valor por defecto: 2
          .execute('nodo.SP_ObtenerCuotasPorEstadoYSolicitud');

      // Verificar si se obtuvieron resultados
      if (result.recordset.length === 0) {
          return res.status(404).json({ message: 'No se encontraron cuotas para los criterios especificados.' });
      }

      // Enviar los resultados en la respuesta
      res.json(result.recordset);
  } catch (error) {
      // Manejo de errores de SQL Server
      res.status(500).json({
          error: `Error al consultar las cuotas: ${error.message}`
      });
  }
};

exports.payLoanInstallment = async (req, res) => {
  try {
      // Obtener datos del cuerpo de la solicitud (body)
      const { CuotaPrestamoID, MontoTransaccion, UsuarioID } = req.body;

      // Validar que todos los parámetros necesarios estén presentes
      if (!CuotaPrestamoID || !MontoTransaccion || !UsuarioID) {
          return res.status(400).json({
              error: 'Todos los campos son obligatorios: CuotaPrestamoID, MontoTransaccion, UsuarioID.'
          });
      }

      // Conectar a la base de datos
      const pool = await sql.connect();

      // Ejecutar el procedimiento almacenado
      const result = await pool.request()
          .input('CuotaPrestamoID', sql.Int, CuotaPrestamoID)
          .input('MontoTransaccion', sql.Decimal(18, 2), MontoTransaccion)
          .input('UsuarioID', sql.Int, UsuarioID)
          .execute('nodo.SP_PagarCuota'); // Nombre del procedimiento almacenado

      // Verificar si se devolvió un error desde el procedimiento
      if (result.recordset && result.recordset[0]?.ErrorNumber) {
          return res.status(400).json({
              error: `Error desde el procedimiento: ${result.recordset[0].ErrorMessage}`
          });
      }

      // Enviar la respuesta con los datos del recibo generado
      res.json({
          message: 'Pago registrado exitosamente.',
          recibo: result.recordset[0], // Datos del recibo generado
      });
  } catch (error) {
      // Manejo de errores generales
      res.status(500).json({
          error: `Error al procesar el pago de la cuota: ${error.message}`
      });
  }
};

  



exports.getInstallmentsByRequest = async (req, res) => {
  try {
    const { SolicitudID } = req.params; // Obtener el parámetro de la solicitud (SolicitudID)

    if (!SolicitudID) {
      return res.status(400).json({ error: 'SolicitudID es requerido.' });
    }

    // Conectar a la base de datos y ejecutar el procedimiento almacenado
    const pool = await sql.connect();
    const result = await pool.request()
      .input('SolicitudID', sql.Int, SolicitudID) // Enviar el parámetro al procedimiento
      .execute('nodo.SP_ObtenerCuotasPorSolicitud'); // Nombre del procedimiento almacenado

    // Enviar los resultados en la respuesta
    res.json(result.recordset);
  } catch (error) {
    // Manejo de errores de SQL Server
    res.status(500).json({ 
      error: `Error al consultar las cuotas por solicitud: ${error.message}` 
    });
  }
};


exports.getReceiptByInstallment = async (req, res) => {
  try {
    const { CuotaPrestamoID } = req.body; // Obtener el ID desde el cuerpo de la solicitud

    if (!CuotaPrestamoID) {
      return res.status(400).json({ error: 'CuotaPrestamoID es requerido.' });
    }

    // Conectar a la base de datos y ejecutar el procedimiento almacenado
    const pool = await sql.connect();
    const result = await pool.request()
      .input('CuotaPrestamoID', sql.Int, CuotaPrestamoID) // Enviar el parámetro al procedimiento
      .execute('nodo.SP_ObtenerReciboPorCuota'); // Nombre del procedimiento almacenado

    // Enviar los resultados en la respuesta
    res.json(result.recordset);
  } catch (error) {
    // Manejo de errores de SQL Server
    res.status(500).json({ 
      error: `Error al consultar el recibo por cuota: ${error.message}` 
    });
  }
};


exports.getLoanRequestsByLender = async (req, res) => {
  const { prestamistaId } = req.params;

  // Validación básica del ID del prestamista
  if (!prestamistaId || isNaN(prestamistaId)) {
    return res.status(400).json({ error: 'ID de prestamista inválido' });
  }

  try {
    // Conectar a la base de datos y ejecutar el procedimiento almacenado
    const pool = await sql.connect();
    const result = await pool.request()
      .input('PrestamistaID', sql.Int, prestamistaId)
      .execute('nodo.SP_Obtener_Solicitudes_Por_Prestamista');

    // Comprobar si se encontraron solicitudes
    if (result.recordset.length === 0) {
      return res.status(404).json({ error: 'No se encontraron solicitudes para el prestamista especificado' });
    }

    // Devolver las solicitudes en la respuesta
    res.json(
       result.recordset
    );
  } catch (error) {
    // Manejo de errores de SQL Server
    res.status(500).json({
      success: false,
      message: 'Error al consultar las solicitudes de préstamo',
      error: error.message
    });
  }
};


exports.getLoanRequestsByUser = async (req, res) => {
  const { usuarioId } = req.params;

  // Validación básica del ID del usuario
  if (!usuarioId || isNaN(usuarioId)) {
    return res.status(400).json({ error: 'ID de usuario inválido' });
  }

  try {
    // Conectar a la base de datos y ejecutar el procedimiento almacenado
    const pool = await sql.connect();
    const result = await pool.request()
      .input('UsuarioID', sql.Int, usuarioId)
      .execute('nodo.SP_Obtener_Solicitudes_Por_Usuario');

    // Comprobar si se encontraron solicitudes
    if (result.recordset.length === 0) {
      return res.status(404).json({ error: 'No se encontraron solicitudes para el usuario especificado' });
    }

    // Devolver las solicitudes en la respuesta
    res.json(result.recordset);
  } catch (error) {
    // Manejo de errores de SQL Server
    res.status(500).json({
      success: false,
      message: 'Error al consultar las solicitudes de préstamo',
      error: error.message
    });
  }
};




