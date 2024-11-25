// models/LoanOffer.js
const { sql } = require('../config/database');

class OfertaPrestamo {
    constructor(sql) {
        this.sql = sql;
    }

    async crear(ofertaData) {
        try {
            const pool = await this.sql.connect();
            const result = await pool.request()
                .input('Monto', this.sql.Decimal(18, 2), ofertaData.monto)
                .input('Tasa', this.sql.Decimal(5, 2), ofertaData.tasa)
                .input('Plazo', this.sql.Int, ofertaData.plazo)
                .input('SolicitudID', this.sql.Int, ofertaData.solicitudId)
                .input('PrestamistaID', this.sql.Int, ofertaData.prestamistaId)
                .execute('nodo.SP_CrearOfertaPrestamo');
            return result.recordset[0];
        } catch (error) {
            throw new Error(`Error al crear oferta: ${error.message}`);
        }
    }


    async eliminar(ofertaId) {
        try {
            const pool = await this.sql.connect();
            await pool.request()
                .input('OfertaID', this.sql.Int, ofertaId)
                .execute('nodo.SP_EliminarOfertaPrestamo');
            return true;
        } catch (error) {
            throw new Error(`Error al eliminar oferta: ${error.message}`);
        }
    }


    async actualizar(ofertaId, ofertaData) {
        try {
            const pool = await this.sql.connect();
            await pool.request()
                .input('OfertaID', this.sql.Int, ofertaId)
                .input('Monto', this.sql.Decimal(18, 2), ofertaData.monto)
                .input('Tasa', this.sql.Decimal(5, 2), ofertaData.tasa)
                .input('Plazo', this.sql.Int, ofertaData.plazo)
                .input('Estado_AprobacionID', this.sql.Int, ofertaData.estadoAprobacionId)
                .execute('nodo.SP_ActualizarOfertaPrestamo');
            return true;
        } catch (error) {
            throw new Error(`Error al actualizar oferta: ${error.message}`);
        }
    }


    async obtenerPorId(ofertaId) {
        try {
            const pool = await this.sql.connect();
            const result = await pool.request()
                .input('OfertaID', this.sql.Int, ofertaId)
                .execute('nodo.SP_ObtenerOfertaPrestamo');
            return result.recordset[0];
        } catch (error) {
            throw new Error(`Error al obtener oferta: ${error.message}`);
        }
    }

    async listarTodas() {
        try {
            const pool = await this.sql.connect();
            const result = await pool.request()
                .execute('nodo.SP_ListarOfertasPrestamos');
            return result.recordset;
        } catch (error) {
            throw new Error(`Error al listar ofertas: ${error.message}`);
        }
    }

    async listarPorEstado(estadoId) {
        try {
            const pool = await this.sql.connect();
            const result = await pool.request()
                .input('Estado_AprobacionID', this.sql.Int, estadoId)
                .execute('nodo.SP_ListarOfertasPorEstado');
            return result.recordset;
        } catch (error) {
            throw new Error(`Error al listar ofertas por estado: ${error.message}`);
        }
    }


};

module.exports = OfertaPrestamo;