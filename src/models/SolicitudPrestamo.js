// models/SolicitudPrestamo.js
class SolicitudPrestamo {
    constructor(solicitud) {
        this.monto = solicitud.monto;
        this.tasa = solicitud.tasa;
        this.plazo = solicitud.plazo;
        this.estado_aprobacionid = solicitud.estado_aprobacionid;
        this.tipo_prestamoid = solicitud.tipo_prestamoid;
        this.usuarioId = solicitud.usuarioId;
        this.prestamistaId = solicitud.prestamistaId;
    }
}

module.exports = SolicitudPrestamo;

