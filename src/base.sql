CREATE TABLE nodo.TL_Roles (
    RolID INT PRIMARY KEY,
    Nombre VARCHAR(100) NOT NULL,
    Descripcion VARCHAR(200)
);




CREATE TABLE nodo.TL_Ocupaciones (
    OcupacionID INT PRIMARY KEY,
    Nombre VARCHAR(100) NOT NULL,
    Descripcion VARCHAR(200)
);




CREATE TABLE nodo.TL_Usuarios (
    UsuarioID INT PRIMARY KEY,
    Primer_nombre VARCHAR(200) NOT NULL,
    Segundo_nombre VARCHAR(200),
    Primer_apellido VARCHAR(200) NOT NULL,
    Segundo_apellido VARCHAR(200),
    Fecha_Nacimiento DATE NOT NULL,
    DNI VARCHAR(20) NOT NULL UNIQUE,
    Email VARCHAR(100) NOT NULL UNIQUE,
    Telefono VARCHAR(20),
    Contraseña VARCHAR(100) NOT NULL,
    Constancia_Cuenta TEXT,
    Fecha_Actualizacion_Constancia DATE DEFAULT GETDATE(),
    Visibilidad_Perfil BIT DEFAULT 1,
    Constancia_SAR TEXT,
    Fecha_Actualizacion_SAR DATE DEFAULT GETDATE(),
    OcupacionID INT NOT NULL,
    Ingresos_Mensuales DECIMAL(18, 2) DEFAULT 0.00,
    CONSTRAINT chk_Ingresos_Mensuales CHECK (Ingresos_Mensuales >= 0),
    FOREIGN KEY (OcupacionID) REFERENCES nodo.TL_Ocupaciones(OcupacionID)
);



CREATE TABLE nodo.TL_RolesUsuarios (
    RolesUsuarioID INT PRIMARY KEY,
    RolID INT NOT NULL,
    UsuarioID INT NOT NULL,
    Fecha_Asignacion DATE DEFAULT GETDATE(),
    FOREIGN KEY (RolID) REFERENCES nodo.TL_Roles(RolID),
    FOREIGN KEY (UsuarioID) REFERENCES nodo.TL_Usuarios(UsuarioID)
);




CREATE TABLE nodo.TL_MetodoPagos (
    MetodoPagosID INT PRIMARY KEY,
    Numero_Tarjeta VARCHAR(20) NOT NULL,
    Fecha_Expiracion DATE NOT NULL,
    UsuarioID INT NOT NULL,
    FOREIGN KEY (UsuarioID) REFERENCES nodo.TL_Usuarios(UsuarioID)
);



CREATE TABLE nodo.TL_Tipo_Prestamo (
    Tipo_PrestamoID INT PRIMARY KEY,
    Nombre VARCHAR(50) NOT NULL,
    Descripcion VARCHAR(200)
);






CREATE TABLE nodo.TL_Estado_Aprobacion (
    Estado_AprobacionID INT PRIMARY KEY,
    Nombre VARCHAR(50) NOT NULL,
    Descripcion VARCHAR(200)
);





CREATE TABLE nodo.TL_Estado_Cuotas (
    Estado_CuotaID INT PRIMARY KEY,
    Nombre VARCHAR(50) NOT NULL,
    Descripcion VARCHAR(200)
);





CREATE TABLE nodo.TL_SolicitudesPrestamos (
    SolicitudID INT PRIMARY KEY,
    Monto DECIMAL(18, 2) NOT NULL,
    Tasa DECIMAL(5, 2) NOT NULL,
    Plazo INT NOT NULL,
    Saldo_Pendiente DECIMAL(18, 2) DEFAULT 0.00,
    Estado VARCHAR(50) NOT NULL,
    Tipo_Prestamo INT NOT NULL,
    UsuarioID INT NOT NULL,
    PrestamistaID INT,
    FOREIGN KEY (Tipo_Prestamo) REFERENCES nodo.TL_Tipo_Prestamo(Tipo_PrestamoID),
    FOREIGN KEY (UsuarioID) REFERENCES nodo.TL_Usuarios(UsuarioID),
    FOREIGN KEY (PrestamistaID) REFERENCES nodo.TL_Usuarios(UsuarioID)
);


CREATE TABLE nodo.TL_OfertaPrestamos (
    OfertaID INT PRIMARY KEY,
    Monto DECIMAL(18, 2) NOT NULL,
    Tasa DECIMAL(5, 2) NOT NULL,
    Plazo INT NOT NULL,
    Estado VARCHAR(50) NOT NULL,
    SolicitudID INT NOT NULL,
    PrestamistaID INT NOT NULL,
    FOREIGN KEY (SolicitudID) REFERENCES nodo.TL_SolicitudesPrestamos(SolicitudID),
    FOREIGN KEY (PrestamistaID) REFERENCES nodo.TL_Usuarios(UsuarioID)
);



CREATE TABLE nodo.TL_CuotasPrestamos (
    CuotaPrestamoID INT PRIMARY KEY,
    NumeroCuota INT NOT NULL,
    Monto DECIMAL(18, 2) NOT NULL,
    Fecha_Vencimiento DATE NOT NULL,
    ReciboID INT NOT NULL,
    Estado VARCHAR(50) NOT NULL,
    SolicitudID INT NOT NULL,
    FOREIGN KEY (ReciboID) REFERENCES nodo.TL_Recibo(ReciboID),
    FOREIGN KEY (SolicitudID) REFERENCES nodo.TL_SolicitudesPrestamos(SolicitudID)
);





CREATE TABLE nodo.TL_Recibo (
    ReciboID INT PRIMARY KEY,
    Fecha_Emision DATE DEFAULT GETDATE(),
    Monto_Cuota DECIMAL(18, 2) NOT NULL,
    Saldo_Restante DECIMAL(18, 2) DEFAULT 0.00,
    Monto_Transaccion DECIMAL(18, 2) NOT NULL,
    Monto_Total DECIMAL(18, 2) NOT NULL,
    SolicitudID INT NOT NULL,
    PrestamistaID INT NOT NULL,
    UsuarioID INT NOT NULL,
    CuotaPrestamoID INT NOT NULL,
    FOREIGN KEY (SolicitudID) REFERENCES nodo.TL_SolicitudesPrestamos(SolicitudID),
    FOREIGN KEY (PrestamistaID) REFERENCES nodo.TL_Usuarios(UsuarioID),
    FOREIGN KEY (UsuarioID) REFERENCES nodo.TL_Usuarios(UsuarioID)
);

CREATE TABLE nodo.TL_CuotasPrestamos (
    CuotaPrestamoID INT PRIMARY KEY,
    NumeroCuota INT NOT NULL,
    Monto DECIMAL(18, 2) NOT NULL,
    Fecha_Vencimiento DATE NOT NULL,
    ReciboID INT NOT NULL,
    Estado VARCHAR(50) NOT NULL,
    SolicitudID INT NOT NULL,
    FOREIGN KEY (ReciboID) REFERENCES nodo.TL_Recibo(ReciboID),
    FOREIGN KEY (SolicitudID) REFERENCES nodo.TL_SolicitudesPrestamos(SolicitudID)
);


ALTER TABLE nodo.TL_Recibo
ADD CONSTRAINT fk_CuotaPrestamoID
FOREIGN KEY (CuotaPrestamoID) REFERENCES nodo.TL_CuotasPrestamos(CuotaPrestamoID);

