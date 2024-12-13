// controllers/solicitudPrestamoController.js
const SolicitudPrestamo = require('../models/SolicitudPrestamo');
const { sql } = require('../config/database');

const solicitudPrestamoController = {
    // Crear nueva solicitud
    async crear(req, res) {
        try {
            const nuevaSolicitud = new SolicitudPrestamo(req.body);
            
            const result = await sql.execute('nodo.SP_InsertarSolicitudPrestamo',
                {
                    Monto: nuevaSolicitud.monto,
                    Tasa: nuevaSolicitud.tasa,
                    Plazo: nuevaSolicitud.plazo,
                    Estado: nuevaSolicitud.estado,
                    Tipo_Prestamo: nuevaSolicitud.tipo_prestamo,
                    UsuarioID: nuevaSolicitud.usuarioId,
                    PrestamistaID: nuevaSolicitud.prestamistaId
                }
            );

            if (result.recordset && result.recordset[0].ErrorNumber) {
                throw new Error(result.recordset[0].ErrorMessage);
            }

            res.status(201).json({
                success: true,
                solicitudId: result.recordset[0].SolicitudID,
                message: 'Solicitud de préstamo creada exitosamente'
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                message: 'Error al crear la solicitud de préstamo',
                error: error.message
            });
        }
    },

    // Modificar solicitud existente
    async modificar(req, res) {
        try {
            const solicitudId = req.params.id;
            const solicitudActualizada = new SolicitudPrestamo(req.body);

            const result = await sql.execute('nodo.SP_ModificarSolicitudPrestamo',
                {
                    SolicitudID: solicitudId,
                    Monto: solicitudActualizada.monto,
                    Tasa: solicitudActualizada.tasa,
                    Plazo: solicitudActualizada.plazo,
                    Estado: solicitudActualizada.estado,
                    Tipo_Prestamo: solicitudActualizada.tipo_prestamo,
                    UsuarioID: solicitudActualizada.usuarioId,
                    PrestamistaID: solicitudActualizada.prestamistaId,
                    Saldo_Pendiente: req.body.saldo_pendiente
                }
            );

            if (result.recordset && result.recordset[0].ErrorNumber) {
                throw new Error(result.recordset[0].ErrorMessage);
            }

            res.json({
                success: true,
                message: result.recordset[0].Mensaje
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                message: 'Error al modificar la solicitud de préstamo',
                error: error.message
            });
        }
    },

    // Eliminar solicitud
    async eliminar(req, res) {
        try {
            const solicitudId = req.params.id;
            
            const result = await sql.execute('nodo.SP_EliminarSolicitudPrestamo',
                {
                    SolicitudID: solicitudId
                }
            );

            if (result.recordset && result.recordset[0].ErrorNumber) {
                throw new Error(result.recordset[0].ErrorMessage);
            }

            res.json({
                success: true,
                message: result.recordset[0].Mensaje
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                message: 'Error al eliminar la solicitud de préstamo',
                error: error.message
            });
        }
    },

    // Consultar solicitudes
    async consultar(req, res) {
        try {
            const { solicitudId, usuarioId, prestamistaId, estado } = req.query;

            const result = await sql.execute('nodo.SP_ConsultarSolicitudesPrestamos',
                {
                    SolicitudID: solicitudId || null,
                    UsuarioID: usuarioId || null,
                    PrestamistaID: prestamistaId || null,
                    Estado: estado || null
                }
            );

            res.json({
                success: true,
                data: result.recordset
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                message: 'Error al consultar las solicitudes de préstamo',
                error: error.message
            });
        }
    }
};

module.exports = solicitudPrestamoController;