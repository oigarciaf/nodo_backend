/** procedimiento para registro de usuario*/

CREATE PROCEDURE nodo.insertar_usuarios (
    @nombre_completo VARCHAR(400),
    @apellido_completo VARCHAR(400),
    @email VARCHAR(100)
) AS
BEGIN
    -- Declarar variables para separar nombres y apellidos
    DECLARE @primer_nombre VARCHAR(200)
    DECLARE @segundo_nombre VARCHAR(200)
    DECLARE @primer_apellido VARCHAR(200)
    DECLARE @segundo_apellido VARCHAR(200)
    
    -- Separar nombre completo en primer y segundo nombre
    IF CHARINDEX(' ', @nombre_completo) > 0
    BEGIN
        SET @primer_nombre = SUBSTRING(@nombre_completo, 1, CHARINDEX(' ', @nombre_completo) - 1)
        SET @segundo_nombre = SUBSTRING(@nombre_completo, CHARINDEX(' ', @nombre_completo) + 1, LEN(@nombre_completo))
    END
    ELSE
    BEGIN
        SET @primer_nombre = @nombre_completo
        SET @segundo_nombre = NULL
    END
    
    -- Separar apellido completo en primer y segundo apellido
    IF CHARINDEX(' ', @apellido_completo) > 0
    BEGIN
        SET @primer_apellido = SUBSTRING(@apellido_completo, 1, CHARINDEX(' ', @apellido_completo) - 1)
        SET @segundo_apellido = SUBSTRING(@apellido_completo, CHARINDEX(' ', @apellido_completo) + 1, LEN(@apellido_completo))
    END
    ELSE
    BEGIN
        SET @primer_apellido = @apellido_completo
        SET @segundo_apellido = NULL
    END

    BEGIN TRY
        BEGIN TRANSACTION;
            -- Insertar el nuevo usuario
            INSERT INTO nodo.TL_Usuarios (
                Primer_nombre,
                Segundo_nombre,
                Primer_apellido,
                Segundo_apellido,
                Email,
                active
            )
            VALUES (
                @primer_nombre,
                @segundo_nombre,
                @primer_apellido,
                @segundo_apellido,
                @email,
                1  -- Usuario activo por defecto
            );

            -- Obtener el ID del usuario recién insertado
            DECLARE @UsuarioID INT = SCOPE_IDENTITY();

            -- Asignar el rol por defecto (RolID = 1)
            INSERT INTO nodo.TL_RolesUsuarios (RolID, UsuarioID)
            VALUES (1, @UsuarioID);

        COMMIT TRANSACTION;
        
        SELECT 'Usuario registrado exitosamente' AS Mensaje;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0
            ROLLBACK TRANSACTION;

        DECLARE @ErrorMessage NVARCHAR(4000) = ERROR_MESSAGE();
        DECLARE @ErrorSeverity INT = ERROR_SEVERITY();
        DECLARE @ErrorState INT = ERROR_STATE();

        RAISERROR (@ErrorMessage, @ErrorSeverity, @ErrorState);
    END CATCH
END;

/**uso*/
EXEC nodo.insertar_usuarios
    @nombre_completo = 'Juan Carlos',
    @apellido_completo = 'Pérez González',
    @email = 'juan.perez@email.com'


/** procedimiento para CRUD TL_Ocupacion*/
/** procedimiento para insertar ocupacion*/


CREATE PROCEDURE [nodo].[insertar_ocupacion]
    @Nombre VARCHAR(100),
    @Descripcion VARCHAR(200)
AS
BEGIN
    SET NOCOUNT ON;
    
    -- Validación: El nombre no puede estar vacío
    IF @Nombre IS NULL OR LEN(@Nombre) = 0
    BEGIN
        RAISERROR('El nombre de la ocupación no puede estar vacío.', 16, 1);
        RETURN;
    END

    BEGIN TRY
        -- Inserción en la tabla TL_Ocupaciones
        INSERT INTO nodo.TL_Ocupaciones (Nombre, Descripcion)
        VALUES (@Nombre, @Descripcion);
        
        PRINT 'Ocupación insertada exitosamente';
    END TRY
    BEGIN CATCH
        IF ERROR_NUMBER() = 2627 -- Código de error para UNIQUE VIOLATION
        BEGIN
            RAISERROR('La ocupación ya existe con el nombre dado.', 16, 1);
        END
        ELSE
        BEGIN
            RAISERROR('Error al insertar la ocupación: %s', 16, 1);
        END
    END CATCH
END;
GO




/** procedimiento para obtener ocupaciones*/

PROCEDURE [nodo].[obtener_todas_ocupaciones]
AS
BEGIN
    SET NOCOUNT ON;

    BEGIN TRY
        -- Verificar si existen registros en la tabla TL_Ocupaciones
        IF NOT EXISTS (SELECT 1 FROM nodo.TL_Ocupaciones)
        BEGIN
            RAISERROR('No existen ocupaciones registradas.', 16, 1);
            RETURN;
        END

        -- Seleccionar todas las ocupaciones de la tabla TL_Ocupaciones
        SELECT OcupacionID, Nombre, Descripcion
        FROM nodo.TL_Ocupaciones;
        
    END TRY
    BEGIN CATCH
        -- Manejo de errores: Captura cualquier error y muestra el mensaje de error
        RAISERROR('Error al obtener las ocupaciones: %s', 16, 1);
    END CATCH
END;
GO




/** procedimiento para obtener ocupacion por id*/

PROCEDURE [nodo].[obtener_ocupacion]
    @OcupacionID INT
AS
BEGIN
    SET NOCOUNT ON;

    -- Seleccionar la ocupación por ID
    IF EXISTS (SELECT 1 FROM nodo.TL_Ocupaciones WHERE OcupacionID = @OcupacionID)
    BEGIN
        SELECT OcupacionID, Nombre, Descripcion
        FROM nodo.TL_Ocupaciones
        WHERE OcupacionID = @OcupacionID;
    END
    ELSE
    BEGIN
        PRINT 'No se encontró ninguna ocupación con el ID dado.';
    END
END;
GO


/** procedimiento para obtener actualizar ocupacion*/

CREATE PROCEDURE [nodo].[actualizar_ocupacion]
    @OcupacionID INT,
    @Nombre VARCHAR(100),
    @Descripcion VARCHAR(200)
AS
BEGIN
    SET NOCOUNT ON;

    -- Validación: El nombre no puede estar vacío
    IF @Nombre IS NULL OR LEN(@Nombre) = 0
    BEGIN
        RAISERROR('El nombre de la ocupación no puede estar vacío.', 16, 1);
        RETURN;
    END

    BEGIN TRY
        -- Actualizar la ocupación
        UPDATE nodo.TL_Ocupaciones
        SET Nombre = @Nombre, Descripcion = @Descripcion
        WHERE OcupacionID = @OcupacionID;

        IF @@ROWCOUNT = 0
        BEGIN
            RAISERROR('No se encontró ninguna ocupación con el ID dado.', 16, 1);
        END
        ELSE
        BEGIN
            PRINT 'Ocupación actualizada exitosamente';
        END
    END TRY
    BEGIN CATCH
        IF ERROR_NUMBER() = 2627 -- Código de error para UNIQUE VIOLATION
        BEGIN
            RAISERROR('La ocupación ya existe con el nombre dado.', 16, 1);
        END
        ELSE
        BEGIN
            RAISERROR('Error al actualizar la ocupación: %s', 16, 1);
        END
    END CATCH
END;
GO



/** procedimiento para obtener eliminar ocupacion*/

 PROCEDURE [nodo].[eliminar_ocupacion]
    @OcupacionID INT
AS
BEGIN
    SET NOCOUNT ON;

    BEGIN TRY
        -- Eliminar la ocupación
        DELETE FROM nodo.TL_Ocupaciones
        WHERE OcupacionID = @OcupacionID;

        IF @@ROWCOUNT = 0
        BEGIN
            RAISERROR('No se encontró ninguna ocupación con el ID dado para eliminar.', 16, 1);
        END
        ELSE
        BEGIN
            PRINT 'Ocupación eliminada exitosamente';
        END
    END TRY
    BEGIN CATCH
        RAISERROR('Error al eliminar la ocupación: %s', 16, 1);
    END CATCH
END;
GO



/** procedimiento para CRUD TL_Tipo_Prestamo*/
/** procedimiento para insertar tipo de prestamo*/

PROCEDURE [nodo].[insertar_tipo_prestamo]
    @Nombre VARCHAR(50),
    @Descripcion VARCHAR(200)
AS
BEGIN
    SET NOCOUNT ON;

    -- Validación: El nombre no puede estar vacío
    IF @Nombre IS NULL OR LEN(@Nombre) = 0
    BEGIN
        RAISERROR('El nombre del tipo de préstamo no puede estar vacío.', 16, 1);
        RETURN;
    END

    BEGIN TRY
        -- Inserción en la tabla TL_Tipo_Prestamo
        INSERT INTO nodo.TL_Tipo_Prestamo (Nombre, Descripcion)
        VALUES (@Nombre, @Descripcion);

        PRINT 'Tipo de préstamo insertado exitosamente';
    END TRY
    BEGIN CATCH
        RAISERROR('Error al insertar el tipo de préstamo: %s', 16, 1);
    END CATCH
END;
GO


/** procedimiento para obtener tipo de prestamo*/
PROCEDURE [nodo].[obtener_tipos_prestamo]
AS
BEGIN
    SET NOCOUNT ON;

    BEGIN TRY
        -- Seleccionar todos los tipos de préstamo
        SELECT Tipo_PrestamoID, Nombre, Descripcion
        FROM nodo.TL_Tipo_Prestamo;
    END TRY
    BEGIN CATCH
        RAISERROR('Error al obtener los tipos de préstamo: %s', 16, 1);
    END CATCH
END;
GO


/** procedimiento para obtener tipo de prestamo por id*/

PROCEDURE [nodo].[obtener_tipo_prestamo_por_id]
    @Tipo_PrestamoID INT
AS
BEGIN
    SET NOCOUNT ON;

    -- Validación: El ID debe ser válido
    IF @Tipo_PrestamoID <= 0
    BEGIN
        RAISERROR('ID de tipo de préstamo inválido.', 16, 1);
        RETURN;
    END

    BEGIN TRY
        -- Seleccionar el tipo de préstamo por ID
        SELECT Tipo_PrestamoID, Nombre, Descripcion
        FROM nodo.TL_Tipo_Prestamo
        WHERE Tipo_PrestamoID = @Tipo_PrestamoID;

        IF @@ROWCOUNT = 0
        BEGIN
            RAISERROR('No se encontró el tipo de préstamo con el ID especificado.', 16, 1);
        END
    END TRY
    BEGIN CATCH
        RAISERROR('Error al obtener el tipo de préstamo: %s', 16, 1);
    END CATCH
END;
GO

/** procedimiento para actualizar tipo de prestamo*/
PROCEDURE [nodo].[actualizar_tipo_prestamo]
    @Tipo_PrestamoID INT,
    @Nombre VARCHAR(50),
    @Descripcion VARCHAR(200)
AS
BEGIN
    SET NOCOUNT ON;

    -- Validación: El ID debe ser válido
    IF @Tipo_PrestamoID <= 0
    BEGIN
        RAISERROR('ID de tipo de préstamo inválido.', 16, 1);
        RETURN;
    END

    -- Validación: El nombre no puede estar vacío
    IF @Nombre IS NULL OR LEN(@Nombre) = 0
    BEGIN
        RAISERROR('El nombre del tipo de préstamo no puede estar vacío.', 16, 1);
        RETURN;
    END

    BEGIN TRY
        -- Actualizar el tipo de préstamo
        UPDATE nodo.TL_Tipo_Prestamo
        SET Nombre = @Nombre,
            Descripcion = @Descripcion
        WHERE Tipo_PrestamoID = @Tipo_PrestamoID;

        IF @@ROWCOUNT = 0
        BEGIN
            RAISERROR('No se encontró el tipo de préstamo con el ID especificado.', 16, 1);
        END
        ELSE
        BEGIN
            PRINT 'Tipo de préstamo actualizado exitosamente';
        END
    END TRY
    BEGIN CATCH
        RAISERROR('Error al actualizar el tipo de préstamo: %s', 16, 1);
    END CATCH
END;
GO


/** procedimiento para eliminar tipo de prestamo*/

PROCEDURE [nodo].[eliminar_tipo_prestamo]
    @Tipo_PrestamoID INT
AS
BEGIN
    SET NOCOUNT ON;

    -- Validación: El ID debe ser válido
    IF @Tipo_PrestamoID <= 0
    BEGIN
        RAISERROR('ID de tipo de préstamo inválido.', 16, 1);
        RETURN;
    END

    BEGIN TRY
        -- Eliminar el tipo de préstamo
        DELETE FROM nodo.TL_Tipo_Prestamo
        WHERE Tipo_PrestamoID = @Tipo_PrestamoID;

        IF @@ROWCOUNT = 0
        BEGIN
            RAISERROR('No se encontró el tipo de préstamo con el ID especificado.', 16, 1);
        END
        ELSE
        BEGIN
            PRINT 'Tipo de préstamo eliminado exitosamente';
        END
    END TRY
    BEGIN CATCH
        RAISERROR('Error al eliminar el tipo de préstamo: %s', 16, 1);
    END CATCH
END;
GO


/** procedimiento para CRUD TL_Estado_Aprobacion*/
/** procedimiento para insertar estado de aprobacion*/



PROCEDURE [nodo].[insertar_estado_aprobacion]
    @Nombre VARCHAR(50),
    @Descripcion VARCHAR(200)
AS
BEGIN
    SET NOCOUNT ON;

    -- Validación: El nombre no puede estar vacío
    IF @Nombre IS NULL OR LEN(@Nombre) = 0
    BEGIN
        RAISERROR('El nombre del estado de aprobación no puede estar vacío.', 16, 1);
        RETURN;
    END

    BEGIN TRY
        -- Inserción en la tabla TL_Estado_Aprobacion
        INSERT INTO nodo.TL_Estado_Aprobacion (Nombre, Descripcion)
        VALUES (@Nombre, @Descripcion);

        PRINT 'Estado de aprobación insertado exitosamente';
    END TRY
    BEGIN CATCH
        RAISERROR('Error al insertar el estado de aprobación: %s', 16, 1);
    END CATCH
END;
GO

/** procedimiento para obtener estado de aprobacion*/


PROCEDURE [nodo].[obtener_estados_aprobacion]
AS
BEGIN
    SET NOCOUNT ON;

    BEGIN TRY
        -- Seleccionar todos los estados de aprobación
        SELECT Estado_AprobacionID, Nombre, Descripcion
        FROM nodo.TL_Estado_Aprobacion;
    END TRY
    BEGIN CATCH
        RAISERROR('Error al obtener los estados de aprobación: %s', 16, 1);
    END CATCH
END;
GO


/** procedimiento para obtener estado de aprobacion por id*/

PROCEDURE [nodo].[obtener_tipo_prestamo_por_id]
    @Tipo_PrestamoID INT
AS
BEGIN
    SET NOCOUNT ON;

    -- Validación: El ID debe ser válido
    IF @Tipo_PrestamoID <= 0
    BEGIN
        RAISERROR('ID de tipo de préstamo inválido.', 16, 1);
        RETURN;
    END

    BEGIN TRY
        -- Seleccionar el tipo de préstamo por ID
        SELECT Tipo_PrestamoID, Nombre, Descripcion
        FROM nodo.TL_Tipo_Prestamo
        WHERE Tipo_PrestamoID = @Tipo_PrestamoID;

        IF @@ROWCOUNT = 0
        BEGIN
            RAISERROR('No se encontró el tipo de préstamo con el ID especificado.', 16, 1);
        END
    END TRY
    BEGIN CATCH
        RAISERROR('Error al obtener el tipo de préstamo: %s', 16, 1);
    END CATCH
END;
GO

/** procedimiento para actualizar estado de aprobacion */

PROCEDURE [nodo].[actualizar_estado_aprobacion]
    @Estado_AprobacionID INT,
    @Nombre VARCHAR(50),
    @Descripcion VARCHAR(200)
AS
BEGIN
    SET NOCOUNT ON;

    -- Validación: El ID debe ser válido
    IF @Estado_AprobacionID <= 0
    BEGIN
        RAISERROR('ID de estado de aprobación inválido.', 16, 1);
        RETURN;
    END

    -- Validación: El nombre no puede estar vacío
    IF @Nombre IS NULL OR LEN(@Nombre) = 0
    BEGIN
        RAISERROR('El nombre del estado de aprobación no puede estar vacío.', 16, 1);
        RETURN;
    END

    BEGIN TRY
        -- Actualizar el estado de aprobación
        UPDATE nodo.TL_Estado_Aprobacion
        SET Nombre = @Nombre,
            Descripcion = @Descripcion
        WHERE Estado_AprobacionID = @Estado_AprobacionID;

        IF @@ROWCOUNT = 0
        BEGIN
            RAISERROR('No se encontró el estado de aprobación con el ID especificado.', 16, 1);
        END
        ELSE
        BEGIN
            PRINT 'Estado de aprobación actualizado exitosamente';
        END
    END TRY
    BEGIN CATCH
        RAISERROR('Error al actualizar el estado de aprobación: %s', 16, 1 );
    END CATCH
END;
GO

/** procedimiento para eliminar estado de aprobacion */

PROCEDURE [nodo].[eliminar_estado_aprobacion]
    @Estado_AprobacionID INT
AS
BEGIN
    SET NOCOUNT ON;

    -- Validación: El ID debe ser válido
    IF @Estado_AprobacionID <= 0
    BEGIN
        RAISERROR('ID de estado de aprobación inválido.', 16, 1);
        RETURN;
    END

    BEGIN TRY
        -- Eliminar el estado de aprobación
        DELETE FROM nodo.TL_Estado_Aprobacion
        WHERE Estado_AprobacionID = @Estado_AprobacionID;

        IF @@ROWCOUNT = 0
        BEGIN
            RAISERROR('No se encontró el estado de aprobación con el ID especificado.', 16, 1);
        END
        ELSE
        BEGIN
            PRINT 'Estado de aprobación eliminado exitosamente';
        END
    END TRY
    BEGIN CATCH
        RAISERROR('Error al eliminar el estado de aprobación: %s', 16, 1);
    END CATCH
END;
GO

/** procedimiento para CRUD TL_Estado_Cuotas*/
/** procedimiento para insertar estado de cuota*/

PROCEDURE [nodo].[insertar_estado_cuota]
    @Nombre VARCHAR(50),
    @Descripcion VARCHAR(200)
AS
BEGIN
    SET NOCOUNT ON;

    -- Validación: El nombre no puede estar vacío
    IF @Nombre IS NULL OR LEN(@Nombre) = 0
    BEGIN
        RAISERROR('El nombre del estado de cuota no puede estar vacío.', 16, 1);
        RETURN;
    END

    BEGIN TRY
        -- Inserción en la tabla TL_Estado_Cuotas
        INSERT INTO nodo.TL_Estado_Cuotas (Nombre, Descripcion)
        VALUES (@Nombre, @Descripcion);

        PRINT 'Estado de cuota insertado exitosamente';
    END TRY
    BEGIN CATCH
        RAISERROR('Error al insertar el estado de cuota: %s', 16, 1);
    END CATCH
END;
GO


/** procedimiento para obtener estado de cuota*/


 PROCEDURE [nodo].[obtener_estados_cuota]
AS
BEGIN
    SET NOCOUNT ON;

    BEGIN TRY
        -- Seleccionar todos los estados de cuota
        SELECT Estado_CuotaID, Nombre, Descripcion
        FROM nodo.TL_Estado_Cuotas;
    END TRY
    BEGIN CATCH
        RAISERROR('Error al obtener los estados de cuota: %s', 16, 1);
    END CATCH
END;
GO

/** procedimiento para obtener estado de cuota por id*/

PROCEDURE [nodo].[obtener_estado_cuota_por_id]
    @Estado_CuotaID INT
AS
BEGIN
    SET NOCOUNT ON;

    -- Validación: El ID debe ser válido
    IF @Estado_CuotaID <= 0
    BEGIN
        RAISERROR('ID de estado de cuota inválido.', 16, 1);
        RETURN;
    END

    BEGIN TRY
        -- Seleccionar el estado de cuota por ID
        SELECT Estado_CuotaID, Nombre, Descripcion
        FROM nodo.TL_Estado_Cuotas
        WHERE Estado_CuotaID = @Estado_CuotaID;

        IF @@ROWCOUNT = 0
        BEGIN
            RAISERROR('No se encontró el estado de cuota con el ID especificado.', 16, 1);
        END
    END TRY
    BEGIN CATCH
        RAISERROR('Error al obtener el estado de cuota: %s', 16, 1);
    END CATCH
END;
GO

/** procedimiento para actualizar estado de cuota */

PROCEDURE [nodo].[actualizar_estado_cuota]
    @Estado_CuotaID INT,
    @Nombre VARCHAR(50),
    @Descripcion VARCHAR(200)
AS
BEGIN
    SET NOCOUNT ON;

    -- Validación: El ID debe ser válido
    IF @Estado_CuotaID <= 0
    BEGIN
        RAISERROR('ID de estado de cuota inválido.', 16, 1);
        RETURN;
    END

    -- Validación: El nombre no puede estar vacío
    IF @Nombre IS NULL OR LEN(@Nombre) = 0
    BEGIN
        RAISERROR('El nombre del estado de cuota no puede estar vacío.', 16, 1);
        RETURN;
    END

    BEGIN TRY
        -- Actualizar el estado de cuota
        UPDATE nodo.TL_Estado_Cuotas
        SET Nombre = @Nombre,
            Descripcion = @Descripcion
        WHERE Estado_CuotaID = @Estado_CuotaID;

        IF @@ROWCOUNT = 0
        BEGIN
            RAISERROR('No se encontró el estado de cuota con el ID especificado.', 16, 1);
        END
        ELSE
        BEGIN
            PRINT 'Estado de cuota actualizado exitosamente';
        END
    END TRY
    BEGIN CATCH
        RAISERROR('Error al actualizar el estado de cuota: %s', 16, 1);
    END CATCH
END;
GO

/** procedimiento para eliminar estado de cuota */


PROCEDURE [nodo].[eliminar_estado_cuota]
    @Estado_CuotaID INT
AS
BEGIN
    SET NOCOUNT ON;

    -- Validación: El ID debe ser válido
    IF @Estado_CuotaID <= 0
    BEGIN
        RAISERROR('ID de estado de cuota inválido.', 16, 1);
        RETURN;
    END

    BEGIN TRY
        -- Eliminar el estado de cuota
        DELETE FROM nodo.TL_Estado_Cuotas
        WHERE Estado_CuotaID = @Estado_CuotaID;

        IF @@ROWCOUNT = 0
        BEGIN
            RAISERROR('No se encontró el estado de cuota con el ID especificado.', 16, 1);
        END
        ELSE
        BEGIN
            PRINT 'Estado de cuota eliminado exitosamente';
        END
    END TRY
    BEGIN CATCH
        RAISERROR('Error al eliminar el estado de cuota: %s', 16, 1);
    END CATCH
END;
GO
