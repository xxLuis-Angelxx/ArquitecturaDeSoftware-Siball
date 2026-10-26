-- Siball: cuentas de acceso para huéspedes y administradores.
-- Ejecutar una sola vez sobre la base de datos `siball`, después de crear las
-- tablas `clientes`, `habitaciones`, `reservas`, `estancias`, `pagos` y `comprobantes`.
-- No almacena contraseñas ni crea el administrador: el backend lo aprovisiona
-- usando BCrypt al iniciar, según SIBALL_ADMIN_EMAIL / SIBALL_ADMIN_PASSWORD.

CREATE TABLE IF NOT EXISTS usuarios (
    id INT NOT NULL AUTO_INCREMENT,
    cliente_id INT NULL,
    correo VARCHAR(150) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    rol VARCHAR(20) NOT NULL DEFAULT 'USER',
    activo TINYINT(1) NOT NULL DEFAULT 1,
    fecha_creacion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    CONSTRAINT uk_usuarios_correo UNIQUE (correo),
    CONSTRAINT uk_usuarios_cliente UNIQUE (cliente_id),
    CONSTRAINT fk_usuarios_cliente
        FOREIGN KEY (cliente_id) REFERENCES clientes(id)
        ON DELETE SET NULL,
    CONSTRAINT chk_usuarios_rol CHECK (rol IN ('USER', 'ADMIN'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
