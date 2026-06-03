-- =============================================================
-- MIGRACIÓN: SOFT DELETE (Fase I - Persistencia y Core)
-- Agrega columna `activo` a todas las tablas del sistema
-- =============================================================

-- 1. Tablas sin ningún tipo de Estado/activo
ALTER TABLE asignaturas ADD COLUMN IF NOT EXISTS activo TINYINT(1) DEFAULT 1;
ALTER TABLE aulas ADD COLUMN IF NOT EXISTS activo TINYINT(1) DEFAULT 1;
ALTER TABLE horas ADD COLUMN IF NOT EXISTS activo TINYINT(1) DEFAULT 1;
ALTER TABLE nivel_pensum ADD COLUMN IF NOT EXISTS activo TINYINT(1) DEFAULT 1;
ALTER TABLE secciones ADD COLUMN IF NOT EXISTS activo TINYINT(1) DEFAULT 1;
ALTER TABLE reinscripciones ADD COLUMN IF NOT EXISTS activo TINYINT(1) DEFAULT 1;

-- 2. Tablas con columna Estado (se agrega activo como soft-delete unificado)
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS activo TINYINT(1) DEFAULT 1;
ALTER TABLE estudiantes ADD COLUMN IF NOT EXISTS activo TINYINT(1) DEFAULT 1;
ALTER TABLE docentes ADD COLUMN IF NOT EXISTS activo TINYINT(1) DEFAULT 1;
ALTER TABLE carreras ADD COLUMN IF NOT EXISTS activo TINYINT(1) DEFAULT 1;
ALTER TABLE pensum ADD COLUMN IF NOT EXISTS activo TINYINT(1) DEFAULT 1;
ALTER TABLE periodo_academico ADD COLUMN IF NOT EXISTS activo TINYINT(1) DEFAULT 1;
ALTER TABLE calificaciones ADD COLUMN IF NOT EXISTS activo TINYINT(1) DEFAULT 1;
ALTER TABLE docente_asignatura ADD COLUMN IF NOT EXISTS activo TINYINT(1) DEFAULT 1;
ALTER TABLE estudiantes_asignatura ADD COLUMN IF NOT EXISTS activo TINYINT(1) DEFAULT 1;
ALTER TABLE estudiante_periodo_academico ADD COLUMN IF NOT EXISTS activo TINYINT(1) DEFAULT 1;
ALTER TABLE trabajo_investigacion ADD COLUMN IF NOT EXISTS activo TINYINT(1) DEFAULT 1;
ALTER TABLE solicitudes_tutor_interno ADD COLUMN IF NOT EXISTS activo TINYINT(1) DEFAULT 1;
ALTER TABLE solicitudes_tutor_externo ADD COLUMN IF NOT EXISTS activo TINYINT(1) DEFAULT 1;
ALTER TABLE asistencia_docente ADD COLUMN IF NOT EXISTS activo TINYINT(1) DEFAULT 1;
ALTER TABLE tutores_externos ADD COLUMN IF NOT EXISTS activo TINYINT(1) DEFAULT 1;

-- 3. Backfill: todos los registros existentes quedan como activos
UPDATE asignaturas SET activo = 1 WHERE activo IS NULL;
UPDATE aulas SET activo = 1 WHERE activo IS NULL;
UPDATE horas SET activo = 1 WHERE activo IS NULL;
UPDATE nivel_pensum SET activo = 1 WHERE activo IS NULL;
UPDATE secciones SET activo = 1 WHERE activo IS NULL;
UPDATE reinscripciones SET activo = 1 WHERE activo IS NULL;
UPDATE usuarios SET activo = 1 WHERE activo IS NULL;
UPDATE estudiantes SET activo = 1 WHERE activo IS NULL;
UPDATE docentes SET activo = 1 WHERE activo IS NULL;
UPDATE carreras SET activo = 1 WHERE activo IS NULL;
UPDATE pensum SET activo = 1 WHERE activo IS NULL;
UPDATE periodo_academico SET activo = 1 WHERE activo IS NULL;
UPDATE calificaciones SET activo = 1 WHERE activo IS NULL;
UPDATE docente_asignatura SET activo = 1 WHERE activo IS NULL;
UPDATE estudiantes_asignatura SET activo = 1 WHERE activo IS NULL;
UPDATE estudiante_periodo_academico SET activo = 1 WHERE activo IS NULL;
UPDATE trabajo_investigacion SET activo = 1 WHERE activo IS NULL;
UPDATE solicitudes_tutor_interno SET activo = 1 WHERE activo IS NULL;
UPDATE solicitudes_tutor_externo SET activo = 1 WHERE activo IS NULL;
UPDATE asistencia_docente SET activo = 1 WHERE activo IS NULL;
UPDATE tutores_externos SET activo = 1 WHERE activo IS NULL;
