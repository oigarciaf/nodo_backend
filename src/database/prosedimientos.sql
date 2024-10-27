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

