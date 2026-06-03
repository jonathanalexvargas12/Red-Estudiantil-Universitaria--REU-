-- =============================================================
-- MIGRACIÓN: RE-NORMALIZACIÓN (Fase I - Persistencia y Core)
-- Elimina columnas nominales duplicadas en toda la base de datos
-- =============================================================

-- 1. horas.Docente (duplica CONCAT de docentes.Nombres + ' ' + docentes.Apellidos)
ALTER TABLE horas DROP COLUMN IF EXISTS Docente;

-- 2. calificaciones.Nombre_Estudiante (duplica CONCAT de estudiantes.Nombres + ' ' + estudiantes.Apellidos)
ALTER TABLE calificaciones DROP COLUMN IF EXISTS Nombre_Estudiante;

-- 3. calificaciones.Nombre_Docente (duplica CONCAT de docentes.Nombres + ' ' + docentes.Apellidos)
ALTER TABLE calificaciones DROP COLUMN IF EXISTS Nombre_Docente;

-- 4. docente_asignatura.Docente_Nombre (duplica CONCAT de docentes.Nombres + ' ' + docentes.Apellidos)
ALTER TABLE docente_asignatura DROP COLUMN IF EXISTS Docente_Nombre;

-- 5. estudiantes_asignatura.Estudiante_Nombre (duplica CONCAT de estudiantes.Nombres + ' ' + estudiantes.Apellidos)
ALTER TABLE estudiantes_asignatura DROP COLUMN IF EXISTS Estudiante_Nombre;

-- 6. trabajo_investigacion.Nombre_Estudiante (duplica CONCAT de estudiantes.Nombres + ' ' + estudiantes.Apellidos)
ALTER TABLE trabajo_investigacion DROP COLUMN IF EXISTS Nombre_Estudiante;

-- 7. trabajo_investigacion.Tutor_Nombre (duplica CONCAT de docentes.Nombres + ' ' + docentes.Apellidos)
ALTER TABLE trabajo_investigacion DROP COLUMN IF EXISTS Tutor_Nombre;

-- 8. solicitudes_tutor_interno.Nombre_Docente (duplica CONCAT de docentes)
ALTER TABLE solicitudes_tutor_interno DROP COLUMN IF EXISTS Nombre_Docente;

-- 9. solicitudes_tutor_interno.Nombre_Estudiante (duplica CONCAT de estudiantes)
ALTER TABLE solicitudes_tutor_interno DROP COLUMN IF EXISTS Nombre_Estudiante;

-- 10. solicitudes_tutor_externo.Nombre_Tutor (duplica CONCAT de tutores_externos)
ALTER TABLE solicitudes_tutor_externo DROP COLUMN IF EXISTS Nombre_Tutor;

-- 11. solicitudes_tutor_externo.Nombre_Estudiante (duplica CONCAT de estudiantes)
ALTER TABLE solicitudes_tutor_externo DROP COLUMN IF EXISTS Nombre_Estudiante;
