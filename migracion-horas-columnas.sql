-- ============================================================
-- MIGRACIÓN: Agregar columnas faltantes a la tabla `horas`
-- 
-- La tabla `horas` fue creada originalmente con solo 3 columnas
-- (Desde, Hasta, Docente_Cedula), pero la aplicación espera
-- 12 columnas. Este script agrega las columnas faltantes,
-- cambia la PK a un ID auto-incremental y actualiza los FKs.
-- ============================================================

-- 1. Agregar columna ID auto-incremental como nueva PK
ALTER TABLE `horas` ADD COLUMN `ID` INT(11) NOT NULL AUTO_INCREMENT FIRST,
  DROP PRIMARY KEY,
  ADD PRIMARY KEY (`ID`);

-- 2. Agregar columnas faltantes
ALTER TABLE `horas`
  ADD COLUMN `Dias` VARCHAR(100) DEFAULT NULL AFTER `Hasta`,
  ADD COLUMN `Turno` VARCHAR(50) DEFAULT NULL AFTER `Dias`,
  ADD COLUMN `Carrera` VARCHAR(50) DEFAULT NULL AFTER `Turno`,
  ADD COLUMN `Pensum` VARCHAR(50) DEFAULT NULL AFTER `Carrera`,
  ADD COLUMN `Periodo_Academico` VARCHAR(20) DEFAULT NULL AFTER `Pensum`,
  ADD COLUMN `Seccion` VARCHAR(20) DEFAULT NULL AFTER `Periodo_Academico`,
  ADD COLUMN `Nivel` VARCHAR(50) DEFAULT NULL AFTER `Seccion`,
  ADD COLUMN `Asignatura` VARCHAR(50) DEFAULT NULL AFTER `Nivel`,
  ADD COLUMN `Docente` VARCHAR(100) DEFAULT NULL AFTER `Docente_Cedula`;

-- 3. Agregar índices para las nuevas FK
ALTER TABLE `horas`
  ADD KEY `fk_horas_asignatura` (`Asignatura`),
  ADD KEY `fk_horas_periodo` (`Periodo_Academico`),
  ADD KEY `fk_horas_carrera` (`Carrera`);

-- ============================================================
-- NOTA: Después de ejecutar esta migración, los registros
-- existentes tendrán NULL en todas las nuevas columnas.
-- El módulo de asistencia (FIND_IN_SET con h.Dias) no
-- encontrará horario para esos registros hasta que se
-- ingresen datos con días de semana asignados.
-- ============================================================
