---TL_CuotasPrestamos
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [nodo].[TL_CuotasPrestamos](
	[CuotaPrestamoID] [int] IDENTITY(1,1) NOT NULL,
	[NumeroCuota] [int] NOT NULL,
	[Monto] [decimal](18, 2) NOT NULL,
	[Fecha_Vencimiento] [date] NOT NULL,
	[ReciboID] [int] NULL,
	[Estado] [varchar](50) NOT NULL,
	[SolicitudID] [int] NOT NULL
) ON [PRIMARY]
GO
ALTER TABLE [nodo].[TL_CuotasPrestamos] ADD PRIMARY KEY CLUSTERED 
(
	[CuotaPrestamoID] ASC
)WITH (STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ONLINE = OFF, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
ALTER TABLE [nodo].[TL_CuotasPrestamos]  WITH CHECK ADD FOREIGN KEY([SolicitudID])
REFERENCES [nodo].[TL_SolicitudesPrestamos] ([SolicitudID])
GO
ALTER TABLE [nodo].[TL_CuotasPrestamos]  WITH CHECK ADD  CONSTRAINT [FK_CuotasPrestamos_ReciboID] FOREIGN KEY([ReciboID])
REFERENCES [nodo].[TL_Recibo] ([ReciboID])
GO
ALTER TABLE [nodo].[TL_CuotasPrestamos] CHECK CONSTRAINT [FK_CuotasPrestamos_ReciboID]
GO

----TL_Estado_Aprobacion

SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [nodo].[TL_Estado_Aprobacion](
	[Estado_AprobacionID] [int] IDENTITY(1,1) NOT NULL,
	[Nombre] [varchar](50) NOT NULL,
	[Descripcion] [varchar](200) NULL
) ON [PRIMARY]
GO
ALTER TABLE [nodo].[TL_Estado_Aprobacion] ADD PRIMARY KEY CLUSTERED 
(
	[Estado_AprobacionID] ASC
)WITH (STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ONLINE = OFF, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO


---TL_Estado_Cuotas
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [nodo].[TL_Estado_Cuotas](
	[Estado_CuotaID] [int] IDENTITY(1,1) NOT NULL,
	[Nombre] [varchar](50) NOT NULL,
	[Descripcion] [varchar](200) NULL
) ON [PRIMARY]
GO
ALTER TABLE [nodo].[TL_Estado_Cuotas] ADD PRIMARY KEY CLUSTERED 
(
	[Estado_CuotaID] ASC
)WITH (STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ONLINE = OFF, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO


---TL_MetodoPagos

SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [nodo].[TL_MetodoPagos](
	[MetodoPagosID] [int] IDENTITY(1,1) NOT NULL,
	[Numero_Tarjeta] [varchar](20) NOT NULL,
	[Fecha_Expiracion] [date] NOT NULL,
	[UsuarioID] [int] NOT NULL
) ON [PRIMARY]
GO
ALTER TABLE [nodo].[TL_MetodoPagos] ADD PRIMARY KEY CLUSTERED 
(
	[MetodoPagosID] ASC
)WITH (STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ONLINE = OFF, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
ALTER TABLE [nodo].[TL_MetodoPagos]  WITH CHECK ADD FOREIGN KEY([UsuarioID])
REFERENCES [nodo].[TL_Usuarios] ([UsuarioID])
GO


--TL_Ocupaciones
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [nodo].[TL_Ocupaciones](
	[OcupacionID] [int] IDENTITY(1,1) NOT NULL,
	[Nombre] [varchar](100) NOT NULL,
	[Descripcion] [varchar](200) NULL
) ON [PRIMARY]
GO
ALTER TABLE [nodo].[TL_Ocupaciones] ADD PRIMARY KEY CLUSTERED 
(
	[OcupacionID] ASC
)WITH (STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ONLINE = OFF, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO


--TL_OfertaPrestamos
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [nodo].[TL_OfertaPrestamos](
	[OfertaID] [int] IDENTITY(1,1) NOT NULL,
	[Monto] [decimal](18, 2) NOT NULL,
	[Tasa] [decimal](5, 2) NOT NULL,
	[Plazo] [int] NOT NULL,
	[Estado] [varchar](50) NOT NULL,
	[SolicitudID] [int] NOT NULL,
	[PrestamistaID] [int] NOT NULL
) ON [PRIMARY]
GO
ALTER TABLE [nodo].[TL_OfertaPrestamos] ADD PRIMARY KEY CLUSTERED 
(
	[OfertaID] ASC
)WITH (STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ONLINE = OFF, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
ALTER TABLE [nodo].[TL_OfertaPrestamos]  WITH CHECK ADD FOREIGN KEY([PrestamistaID])
REFERENCES [nodo].[TL_Usuarios] ([UsuarioID])
GO
ALTER TABLE [nodo].[TL_OfertaPrestamos]  WITH CHECK ADD FOREIGN KEY([SolicitudID])
REFERENCES [nodo].[TL_SolicitudesPrestamos] ([SolicitudID])
GO


--TL_Recibo
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [nodo].[TL_Recibo](
	[ReciboID] [int] IDENTITY(1,1) NOT NULL,
	[Fecha_Emision] [date] NULL,
	[Monto_Cuota] [decimal](18, 2) NOT NULL,
	[Saldo_Restante] [decimal](18, 2) NULL,
	[Monto_Transaccion] [decimal](18, 2) NOT NULL,
	[Monto_Total] [decimal](18, 2) NOT NULL,
	[SolicitudID] [int] NOT NULL,
	[PrestamistaID] [int] NOT NULL,
	[UsuarioID] [int] NOT NULL,
	[CuotaPrestamoID] [int] NOT NULL
) ON [PRIMARY]
GO
ALTER TABLE [nodo].[TL_Recibo] ADD PRIMARY KEY CLUSTERED 
(
	[ReciboID] ASC
)WITH (STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ONLINE = OFF, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
ALTER TABLE [nodo].[TL_Recibo] ADD  DEFAULT (getdate()) FOR [Fecha_Emision]
GO
ALTER TABLE [nodo].[TL_Recibo] ADD  DEFAULT ((0.00)) FOR [Saldo_Restante]
GO
ALTER TABLE [nodo].[TL_Recibo]  WITH CHECK ADD FOREIGN KEY([PrestamistaID])
REFERENCES [nodo].[TL_Usuarios] ([UsuarioID])
GO
ALTER TABLE [nodo].[TL_Recibo]  WITH CHECK ADD FOREIGN KEY([SolicitudID])
REFERENCES [nodo].[TL_SolicitudesPrestamos] ([SolicitudID])
GO
ALTER TABLE [nodo].[TL_Recibo]  WITH CHECK ADD FOREIGN KEY([UsuarioID])
REFERENCES [nodo].[TL_Usuarios] ([UsuarioID])
GO
ALTER TABLE [nodo].[TL_Recibo]  WITH CHECK ADD  CONSTRAINT [fk_CuotaPrestamoID] FOREIGN KEY([CuotaPrestamoID])
REFERENCES [nodo].[TL_CuotasPrestamos] ([CuotaPrestamoID])
GO
ALTER TABLE [nodo].[TL_Recibo] CHECK CONSTRAINT [fk_CuotaPrestamoID]
GO

--TL_Roles
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [nodo].[TL_Roles](
	[RolID] [int] IDENTITY(1,1) NOT NULL,
	[Nombre] [varchar](100) NOT NULL,
	[Descripcion] [varchar](200) NULL
) ON [PRIMARY]
GO
ALTER TABLE [nodo].[TL_Roles] ADD PRIMARY KEY CLUSTERED 
(
	[RolID] ASC
)WITH (STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ONLINE = OFF, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO


--TL_RolesUsuarios
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [nodo].[TL_RolesUsuarios](
	[RolesUsuarioID] [int] IDENTITY(1,1) NOT NULL,
	[RolID] [int] NOT NULL,
	[UsuarioID] [int] NOT NULL,
	[Fecha_Asignacion] [date] NULL
) ON [PRIMARY]
GO
ALTER TABLE [nodo].[TL_RolesUsuarios] ADD PRIMARY KEY CLUSTERED 
(
	[RolesUsuarioID] ASC
)WITH (STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ONLINE = OFF, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
ALTER TABLE [nodo].[TL_RolesUsuarios] ADD  DEFAULT (getdate()) FOR [Fecha_Asignacion]
GO
ALTER TABLE [nodo].[TL_RolesUsuarios]  WITH CHECK ADD FOREIGN KEY([RolID])
REFERENCES [nodo].[TL_Roles] ([RolID])
GO
ALTER TABLE [nodo].[TL_RolesUsuarios]  WITH CHECK ADD FOREIGN KEY([UsuarioID])
REFERENCES [nodo].[TL_Usuarios] ([UsuarioID])
GO

---TL_SolicitudesPrestamos
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [nodo].[TL_SolicitudesPrestamos](
	[SolicitudID] [int] IDENTITY(1,1) NOT NULL,
	[Monto] [decimal](18, 2) NOT NULL,
	[Tasa] [decimal](5, 2) NOT NULL,
	[Plazo] [int] NOT NULL,
	[Saldo_Pendiente] [decimal](18, 2) NULL,
	[Estado] [varchar](50) NOT NULL,
	[Tipo_Prestamo] [int] NOT NULL,
	[UsuarioID] [int] NOT NULL,
	[PrestamistaID] [int] NULL
) ON [PRIMARY]
GO
ALTER TABLE [nodo].[TL_SolicitudesPrestamos] ADD PRIMARY KEY CLUSTERED 
(
	[SolicitudID] ASC
)WITH (STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ONLINE = OFF, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
ALTER TABLE [nodo].[TL_SolicitudesPrestamos] ADD  DEFAULT ((0.00)) FOR [Saldo_Pendiente]
GO
ALTER TABLE [nodo].[TL_SolicitudesPrestamos]  WITH CHECK ADD FOREIGN KEY([PrestamistaID])
REFERENCES [nodo].[TL_RolesUsuarios] ([RolesUsuarioID])
GO
ALTER TABLE [nodo].[TL_SolicitudesPrestamos]  WITH CHECK ADD FOREIGN KEY([Tipo_Prestamo])
REFERENCES [nodo].[TL_Tipo_Prestamo] ([Tipo_PrestamoID])
GO
ALTER TABLE [nodo].[TL_SolicitudesPrestamos]  WITH CHECK ADD FOREIGN KEY([UsuarioID])
REFERENCES [nodo].[TL_RolesUsuarios] ([RolesUsuarioID])
GO

---TL_Tipo_Prestamo
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [nodo].[TL_Tipo_Prestamo](
	[Tipo_PrestamoID] [int] IDENTITY(1,1) NOT NULL,
	[Nombre] [varchar](50) NOT NULL,
	[Descripcion] [varchar](200) NULL
) ON [PRIMARY]
GO
ALTER TABLE [nodo].[TL_Tipo_Prestamo] ADD PRIMARY KEY CLUSTERED 
(
	[Tipo_PrestamoID] ASC
)WITH (STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ONLINE = OFF, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO


---TL_Usuarios
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [nodo].[TL_Usuarios](
	[UsuarioID] [int] IDENTITY(1,1) NOT NULL,
	[Primer_nombre] [varchar](200) NOT NULL,
	[Segundo_nombre] [varchar](200) NULL,
	[Primer_apellido] [varchar](200) NOT NULL,
	[Segundo_apellido] [varchar](200) NULL,
	[Fecha_Nacimiento] [date] NOT NULL,
	[DNI] [varchar](20) NOT NULL,
	[Email] [varchar](100) NOT NULL,
	[Telefono] [varchar](20) NULL,
	[Contraseña] [varchar](100) NOT NULL,
	[Constancia_Cuenta] [text] NULL,
	[Fecha_Actualizacion_Constancia] [date] NULL,
	[Visibilidad_Perfil] [bit] NULL,
	[Constancia_SAR] [text] NULL,
	[Fecha_Actualizacion_SAR] [date] NULL,
	[OcupacionID] [int] NOT NULL,
	[Ingresos_Mensuales] [decimal](18, 2) NULL
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
ALTER TABLE [nodo].[TL_Usuarios] ADD PRIMARY KEY CLUSTERED 
(
	[UsuarioID] ASC
)WITH (STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ONLINE = OFF, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
ALTER TABLE [nodo].[TL_Usuarios] ADD UNIQUE NONCLUSTERED 
(
	[Email] ASC
)WITH (STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ONLINE = OFF, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
ALTER TABLE [nodo].[TL_Usuarios] ADD UNIQUE NONCLUSTERED 
(
	[DNI] ASC
)WITH (STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ONLINE = OFF, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
ALTER TABLE [nodo].[TL_Usuarios] ADD  DEFAULT (getdate()) FOR [Fecha_Actualizacion_Constancia]
GO
ALTER TABLE [nodo].[TL_Usuarios] ADD  DEFAULT ((1)) FOR [Visibilidad_Perfil]
GO
ALTER TABLE [nodo].[TL_Usuarios] ADD  DEFAULT (getdate()) FOR [Fecha_Actualizacion_SAR]
GO
ALTER TABLE [nodo].[TL_Usuarios] ADD  DEFAULT ((0.00)) FOR [Ingresos_Mensuales]
GO
ALTER TABLE [nodo].[TL_Usuarios]  WITH CHECK ADD FOREIGN KEY([OcupacionID])
REFERENCES [nodo].[TL_Ocupaciones] ([OcupacionID])
GO
ALTER TABLE [nodo].[TL_Usuarios]  WITH CHECK ADD  CONSTRAINT [chk_Ingresos_Mensuales] CHECK  (([Ingresos_Mensuales]>=(0)))
GO
ALTER TABLE [nodo].[TL_Usuarios] CHECK CONSTRAINT [chk_Ingresos_Mensuales]
GO

