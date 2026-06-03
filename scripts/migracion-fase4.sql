-- ============================================================
-- FASE IV: Recuperación de Contraseña y Módulos Pendientes
-- ============================================================

-- 4.1 Tabla para códigos de recuperación de contraseña
CREATE TABLE IF NOT EXISTS recuperacion_contrasena (
    ID INT AUTO_INCREMENT PRIMARY KEY,
    Correo VARCHAR(255) NOT NULL,
    Codigo VARCHAR(6) NOT NULL,
    Token VARCHAR(64) DEFAULT NULL,
    Expiracion DATETIME NOT NULL,
    INDEX idx_correo (Correo),
    INDEX idx_expiracion (Expiracion)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4.6 Líneas de Investigación
CREATE TABLE IF NOT EXISTS linea_investigacion (
    Codigo_Linea VARCHAR(50) PRIMARY KEY,
    Nombre_Linea VARCHAR(255) NOT NULL,
    Descripcion TEXT DEFAULT NULL,
    activo TINYINT(1) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT IGNORE INTO linea_investigacion (Codigo_Linea, Nombre_Linea) VALUES
('DESARROLLO-SOCIAL', 'Desarrollo Social y Comunitario'),
('TECNOLOGIA', 'Tecnología e Innovación'),
('EDUCACION', 'Educación y Pedagogía'),
('SALUD', 'Salud y Bienestar'),
('AMBIENTE', 'Ambiente y Sostenibilidad'),
('EMPRENDIMIENTO', 'Emprendimiento y Gestión');

-- 4.7 Configuración General del Sistema
CREATE TABLE IF NOT EXISTS configuracion (
    Clave VARCHAR(100) PRIMARY KEY,
    Valor TEXT NOT NULL,
    Descripcion VARCHAR(255) DEFAULT NULL,
    Fecha_Actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT IGNORE INTO configuracion (Clave, Valor, Descripcion) VALUES
('modulo_inscripciones_activo', '1', 'Habilita o deshabilita el módulo de inscripciones'),
('modulo_reinscripcion_activo', '1', 'Habilita o deshabilita la reinscripción automatizada'),
('modulo_retiro_materias_activo', '1', 'Habilita o deshabilita el módulo de retiro de materias');
