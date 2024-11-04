// models/SolicitudPrestamo.js
class SolicitudPrestamo {
    constructor(solicitud) {
        this.monto = solicitud.monto;
        this.tasa = solicitud.tasa;
        this.plazo = solicitud.plazo;
        this.estado = solicitud.estado;
        this.tipo_prestamo = solicitud.tipo_prestamo;
        this.usuarioId = solicitud.usuarioId;
        this.prestamistaId = solicitud.prestamistaId;
    }
}

module.exports = {SolicitudPrestamo};

