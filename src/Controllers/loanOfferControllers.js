

// controllers/loanOfferControllers.js

const OfertaPrestamo = require('../models/LoanOffer');
const { sql } = require('../config/database');

const ofertaPrestamoModel = new OfertaPrestamo(sql);

const offerLoan = {
    async crear(req, res) {
        try {
            const resultado = await ofertaPrestamoModel.crear(req.body);
            res.json({ success: true, data: resultado });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    },


    async eliminar(req, res) {
        try {
            await ofertaPrestamoModel.eliminar(req.params.id);
            res.json({ success: true, message: 'Oferta eliminada exitosamente' });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    },


    async actualizar(req, res) {
        try {
            await ofertaPrestamoModel.actualizar(req.params.id, req.body);
            res.json({ success: true, message: 'Oferta actualizada exitosamente' });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    },

    async obtenerPorId(req, res) {
        try {
            const oferta = await ofertaPrestamoModel.obtenerPorId(req.params.id);
            res.json({ success: true, data: oferta });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    },

    async listarTodas(req, res) {
        try {
            const ofertas = await ofertaPrestamoModel.listarTodas();
            res.json({ success: true, data: ofertas });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    },

    async listarPorEstado(req, res) {
        try {
            const ofertas = await ofertaPrestamoModel.listarPorEstado(req.params.estadoId);
            res.json({ success: true, data: ofertas });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    },


    async listarPorPrestamista(req, res) {
        try {
            // Obtener el ID del prestamista desde el token JWT o parámetro
            const prestamistaId = req.params.prestamistaId;
            
            // Validar que el prestamistaId existe
            if (!prestamistaId) {
                return res.status(400).json({ 
                    success: false, 
                    error: 'Se requiere el ID del prestamista' 
                });
            }

            const ofertas = await ofertaPrestamoModel.listarPorPrestamista(prestamistaId);
            
            // Transformar los datos si es necesario
            const ofertasFormateadas = ofertas.map(oferta => ({
                id: oferta.OfertaID,
                monto: oferta.Monto,
                tasa: oferta.Tasa,
                plazo: oferta.Plazo,
                estadoAprobacion: oferta.EstadoAprobacion,
                solicitud: {
                    id: oferta.SolicitudID,
                    monto: oferta.MontoSolicitado,
                    plazo: oferta.PlazoSolicitado,
                    tasa: oferta.TasaSolicitada
                },
                solicitante: {
                    nombre: `${oferta.Primer_nombre} ${oferta.Primer_apellido}`,
                    email: oferta.Email
                }
            }));

            res.json({ 
                success: true, 
                data: ofertasFormateadas,
                total: ofertasFormateadas.length
            });
        } catch (error) {
            res.status(500).json({ 
                success: false, 
                error: error.message 
            });
        }
    }


};

module.exports = offerLoan;





