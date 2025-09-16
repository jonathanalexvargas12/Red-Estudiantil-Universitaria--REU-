-- --------------------------------------------------------
-- Host:                         127.0.0.1
-- Versión del servidor:         11.7.2-MariaDB - mariadb.org binary distribution
-- SO del servidor:              Win64
-- HeidiSQL Versión:             12.10.0.7000
-- --------------------------------------------------------

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8 */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;


-- Volcando estructura de base de datos para reu_db
CREATE DATABASE IF NOT EXISTS `reu_db` /*!40100 DEFAULT CHARACTER SET utf8mb3 COLLATE utf8mb3_spanish_ci */;
USE `reu_db`;

-- Volcando estructura para tabla reu_db.asignaturas
CREATE TABLE IF NOT EXISTS `asignaturas` (
  `Codigo_Asignatura` varchar(13) NOT NULL COMMENT 'Formato: FFF000 o FFFIII000 o FFF-FFFIII000',
  `Nombre_Asignatura` varchar(20) NOT NULL,
  `Carrera` varchar(13) NOT NULL COMMENT 'Formato: FFF000',
  `Trayecto` int(1) NOT NULL,
  `Sem/Trim` int(1) NOT NULL,
  `Valor_UC` int(2) NOT NULL COMMENT 'Valor de Unidades de Credito',
  PRIMARY KEY (`Codigo_Asignatura`),
  KEY `Carrera` (`Carrera`),
  CONSTRAINT `Carrera` FOREIGN KEY (`Carrera`) REFERENCES `carreras` (`Codigo_Carrera`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_spanish_ci;

-- Volcando datos para la tabla reu_db.asignaturas: ~3 rows (aproximadamente)
INSERT INTO `asignaturas` (`Codigo_Asignatura`, `Nombre_Asignatura`, `Carrera`, `Trayecto`, `Sem/Trim`, `Valor_UC`) VALUES
	('ING-001', 'Ingles I', 'P-INF-2025', 1, 2, 25),
	('MAT-001', 'Matematica I', 'P-INF-2025', 1, 2, 20),
	('RED-001', 'Redes', 'P-INF-2025', 1, 2, 20);

-- Volcando estructura para tabla reu_db.aulas
CREATE TABLE IF NOT EXISTS `aulas` (
  `Nombre_Aula` varchar(12) NOT NULL COMMENT 'Ejemplo: Aula-01, Virtual-01 etc..',
  `Capacidad` int(2) NOT NULL,
  PRIMARY KEY (`Nombre_Aula`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_spanish_ci;

-- Volcando datos para la tabla reu_db.aulas: ~6 rows (aproximadamente)
INSERT INTO `aulas` (`Nombre_Aula`, `Capacidad`) VALUES
	('Aula 04', 30),
	('Aula 05', 21),
	('Aula 08', 30),
	('Aula 11', 30),
	('Aula 111', 30),
	('Aula 12', 35);

-- Volcando estructura para tabla reu_db.bitacora
CREATE TABLE IF NOT EXISTS `bitacora` (
  `ID` int(11) NOT NULL AUTO_INCREMENT,
  `Fecha` date NOT NULL,
  `Hora` varchar(15) NOT NULL DEFAULT '',
  `IP` varchar(45) NOT NULL,
  `Usuario_ID` varchar(20) NOT NULL,
  `Accion` varchar(100) NOT NULL,
  `Fecha_Registro` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`ID`),
  KEY `FK_bitacora_usuarios` (`Usuario_ID`),
  CONSTRAINT `FK_bitacora_usuarios` FOREIGN KEY (`Usuario_ID`) REFERENCES `usuarios` (`ID_Usuario`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=30 DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_spanish_ci;

-- Volcando datos para la tabla reu_db.bitacora: ~23 rows (aproximadamente)
INSERT INTO `bitacora` (`ID`, `Fecha`, `Hora`, `IP`, `Usuario_ID`, `Accion`, `Fecha_Registro`) VALUES
	(1, '2025-05-04', '21:56:24', '87.249.132.155', 'DNLB1072', 'Inicio de Sesión', '2025-05-05 01:56:24'),
	(2, '2025-05-04', '21:56:24', '87.249.132.155', 'DNLB1072', 'Cierre de Sesión', '2025-05-05 02:02:08'),
	(4, '2025-05-04', '22:12:09', '87.249.132.155', 'DNLB1072', 'Inicio de Sesión', '2025-05-05 02:12:09'),
	(5, '2025-05-04', '22:12:55', '87.249.132.155', 'DNLB1072', 'Cierre de Sesión', '2025-05-05 02:12:55'),
	(6, '2025-05-04', '22:23:32', '87.249.132.155', 'DNLB1072', 'Inicio de Sesión', '2025-05-05 02:23:32'),
	(7, '2025-05-04', '22:25:24', '87.249.132.155', 'DNLB1072', 'Cierre de Sesión', '2025-05-05 02:25:24'),
	(8, '2025-05-04', '22:29:09', '87.249.132.155', 'DNLB1072', 'Inicio de Sesión', '2025-05-05 02:29:09'),
	(9, '2025-05-04', '22:29:15', '87.249.132.155', 'DNLB1072', 'Cierre de Sesión', '2025-05-05 02:29:15'),
	(10, '2025-05-04', '22:33:47', '87.249.132.155', 'DNLB1072', 'Inicio de Sesión', '2025-05-05 02:33:47'),
	(11, '2025-05-04', '22:34:04', '87.249.132.155', 'DNLB1072', 'Cierre de Sesión', '2025-05-05 02:34:04'),
	(12, '2025-05-04', '22:44:49', '87.249.132.155', 'DNLB1072', 'Inicio de Sesión', '2025-05-05 02:44:49'),
	(13, '2025-05-04', '22:44:59', '87.249.132.155', 'DNLB1072', 'Cierre de Sesión', '2025-05-05 02:44:59'),
	(14, '2025-05-04', '22:50:38', '87.249.132.155', 'DNLB1072', 'Inicio de Sesión', '2025-05-05 02:50:38'),
	(15, '2025-05-04', '22:50:45', '87.249.132.155', 'DNLB1072', 'Cierre de Sesión', '2025-05-05 02:50:45'),
	(16, '2025-05-04', '22:51:36', '87.249.132.155', 'DNLB1072', 'Inicio de Sesión', '2025-05-05 02:51:36'),
	(17, '2025-05-04', '22:51:45', '87.249.132.155', 'DNLB1072', 'Cierre de Sesión', '2025-05-05 02:51:45'),
	(18, '2025-05-04', '22:52:43', '87.249.132.155', 'DNLB1072', 'Inicio de Sesión', '2025-05-05 02:52:43'),
	(19, '2025-05-04', '22:52:50', '87.249.132.155', 'DNLB1072', 'Cierre de Sesión', '2025-05-05 02:52:50'),
	(20, '2025-05-04', '22:53:17', '87.249.132.155', 'DNLB1072', 'Inicio de Sesión', '2025-05-05 02:53:17'),
	(21, '2025-05-04', '22:56:36', '87.249.132.155', 'DNLB1072', 'Cierre de Sesión', '2025-05-05 02:56:36'),
	(22, '2025-05-04', '22:57:00', '87.249.132.155', 'DNLB1072', 'Inicio de Sesión', '2025-05-05 02:57:00'),
	(23, '2025-05-04', '22:57:07', '87.249.132.155', 'DNLB1072', 'Cierre de Sesión', '2025-05-05 02:57:07'),
	(24, '2025-05-04', '23:01:50', '87.249.132.155', 'DNLB1072', 'Inicio de Sesión', '2025-05-05 03:01:50'),
	(25, '2025-05-05', '0:05:49', '38.196.193.220', 'DNLB1072', 'Inicio de Sesión', '2025-05-05 04:05:49'),
	(26, '2025-05-05', '0:11:14', '38.196.193.220', 'DNLB1072', 'Cierre de Sesión', '2025-05-05 04:11:14'),
	(27, '2025-05-05', '0:11:21', '38.196.193.217', 'JONATHAV', 'Inicio de Sesión', '2025-05-05 04:11:21'),
	(28, '2025-05-05', '0:33:15', '38.196.193.218', 'JONATHAV', 'Inicio de Sesión', '2025-05-05 04:33:15'),
	(29, '2025-05-05', '0:33:37', '38.196.193.218', 'JONATHAV', 'Cierre de Sesión', '2025-05-05 04:33:37');

-- Volcando estructura para tabla reu_db.calificaciones
CREATE TABLE IF NOT EXISTS `calificaciones` (
  `ID` int(5) unsigned zerofill NOT NULL AUTO_INCREMENT,
  `Cedula_Estudiante` varchar(8) DEFAULT NULL,
  `Nombre_Estudiante` varchar(50) DEFAULT NULL COMMENT 'Concatenacion de Nombres y Apellidos',
  `Carrera` varchar(13) DEFAULT NULL,
  `Trayecto` int(1) DEFAULT NULL,
  `Sem/Trim` int(1) DEFAULT NULL,
  `Seccion` int(5) unsigned DEFAULT NULL,
  `Unidad_Curricular` varchar(13) DEFAULT NULL,
  `Cedula_Docente` varchar(8) DEFAULT NULL,
  `Nombre_Docente` varchar(50) DEFAULT NULL COMMENT 'Concatenacion de Nombres y Apellidos',
  `Estado` varchar(15) DEFAULT NULL COMMENT 'Asistente, Cargando Notas, Inasistente',
  `Calificacion_Numerica` int(2) DEFAULT NULL,
  `Calificacion_Cualitativa` varchar(9) DEFAULT NULL COMMENT 'Aprobado o Reprobado',
  `Periodo_Academico` char(6) DEFAULT NULL,
  PRIMARY KEY (`ID`),
  KEY `FK_calificaciones_estudiantes` (`Cedula_Estudiante`),
  KEY `FK_calificaciones_carreras` (`Carrera`),
  KEY `FK_calificaciones_secciones` (`Seccion`),
  KEY `FK_calificaciones_asignaturas` (`Unidad_Curricular`),
  KEY `FK_calificaciones_docentes` (`Cedula_Docente`),
  KEY `FK_calificaciones_periodo_academico` (`Periodo_Academico`),
  CONSTRAINT `FK_calificaciones_asignaturas` FOREIGN KEY (`Unidad_Curricular`) REFERENCES `asignaturas` (`Codigo_Asignatura`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `FK_calificaciones_carreras` FOREIGN KEY (`Carrera`) REFERENCES `carreras` (`Codigo_Carrera`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `FK_calificaciones_docentes` FOREIGN KEY (`Cedula_Docente`) REFERENCES `docentes` (`Cedula`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `FK_calificaciones_estudiantes` FOREIGN KEY (`Cedula_Estudiante`) REFERENCES `estudiantes` (`Cedula`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `FK_calificaciones_periodo_academico` FOREIGN KEY (`Periodo_Academico`) REFERENCES `periodo_academico` (`Periodo_Academico`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `FK_calificaciones_secciones` FOREIGN KEY (`Seccion`) REFERENCES `secciones` (`Codigo_Seccion`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_spanish_ci;

-- Volcando datos para la tabla reu_db.calificaciones: ~1 rows (aproximadamente)

-- Volcando estructura para tabla reu_db.carreras
CREATE TABLE IF NOT EXISTS `carreras` (
  `Codigo_Carrera` varchar(13) NOT NULL COMMENT 'Primera letra de Pensum y un guion. Primeras 3 letras de cada palabra en mayusculas seguido del año de registro. Formato P-FFF-0000 o tambien P-FFF-FFF-0000',
  `Nombre_Carrera` varchar(25) NOT NULL,
  `Tipo` varchar(10) NOT NULL COMMENT 'Semestral, Trimestral',
  `Estado` varchar(8) NOT NULL COMMENT 'Activa o Inactiva',
  `Total_UC` int(3) NOT NULL COMMENT 'Formato 000',
  PRIMARY KEY (`Codigo_Carrera`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_spanish_ci;

-- Volcando datos para la tabla reu_db.carreras: ~2 rows (aproximadamente)
INSERT INTO `carreras` (`Codigo_Carrera`, `Nombre_Carrera`, `Tipo`, `Estado`, `Total_UC`) VALUES
	('P-ADM-2025', 'Administraciones', 'Trimestral', 'Activa', 33),
	('P-INF-2025', 'Informatica', 'Semestral', 'Activa', 25);

-- Volcando estructura para tabla reu_db.docentes
CREATE TABLE IF NOT EXISTS `docentes` (
  `Cedula` varchar(8) NOT NULL,
  `Usuario` varchar(20) NOT NULL,
  `Nombres` varchar(25) NOT NULL,
  `Apellidos` varchar(25) NOT NULL,
  `Estado_Docente` varchar(50) DEFAULT NULL COMMENT 'activo, inactivo',
  `Tipo` varchar(15) DEFAULT NULL COMMENT 'normal, virtual',
  `Telefono_1` varchar(11) NOT NULL,
  `Telefono_2` varchar(11) DEFAULT NULL,
  `Correo` varchar(50) NOT NULL,
  `Codigo_Carnet` varchar(25) DEFAULT NULL,
  `Fecha_Registro` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`Cedula`),
  KEY `FK_docentes_usuarios` (`Usuario`),
  CONSTRAINT `FK_docentes_usuarios` FOREIGN KEY (`Usuario`) REFERENCES `usuarios` (`ID_Usuario`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_spanish_ci;

-- Volcando datos para la tabla reu_db.docentes: ~0 rows (aproximadamente)
INSERT INTO `docentes` (`Cedula`, `Usuario`, `Nombres`, `Apellidos`, `Estado_Docente`, `Tipo`, `Telefono_1`, `Telefono_2`, `Correo`, `Codigo_Carnet`, `Fecha_Registro`) VALUES
	('0000000', 'PROFE', 'PROFE', 'PROFE', 'activo', 'normal', '04120000000', NULL, 'JKJKJKJ', 'PROF-64787971', '2025-05-04 15:48:12');

-- Volcando estructura para tabla reu_db.docente_asignatura
CREATE TABLE IF NOT EXISTS `docente_asignatura` (
  `ID` int(5) unsigned zerofill NOT NULL AUTO_INCREMENT,
  `Docente_Cedula` varchar(8) NOT NULL,
  `Docente_Nombre` varchar(50) NOT NULL,
  `Asignatura` varchar(13) NOT NULL,
  `Num_Alumnos` int(11) DEFAULT NULL,
  `Carrera` varchar(13) NOT NULL,
  `Pensum` varchar(25) NOT NULL DEFAULT '' COMMENT 'Primeras 3 letras de cada palabra en mayusculas seguido de un numero secuencial entero de 3 en este formato FFF000 o tambien FFF-FFF000',
  `Trayecto` int(1) NOT NULL,
  `Sem/Trim` int(1) NOT NULL,
  `Seccion` int(5) unsigned NOT NULL,
  `Clases_Semana` int(11) NOT NULL,
  `Estado` varchar(25) NOT NULL COMMENT 'Cargado Correctamente, Cargado Incorrectamente',
  `Periodo_Academico` char(6) NOT NULL,
  PRIMARY KEY (`ID`),
  KEY `FK_docente_asignatura_docentes` (`Docente_Cedula`),
  KEY `FK_docente_asignatura_asignaturas` (`Asignatura`),
  KEY `FK_docente_asignatura_carreras` (`Carrera`),
  KEY `FK_docente_asignatura_secciones` (`Seccion`),
  KEY `FK_docente_asignatura_periodo_academico` (`Periodo_Academico`),
  KEY `FK_docente_asignatura_pensum` (`Pensum`),
  CONSTRAINT `FK_docente_asignatura_asignaturas` FOREIGN KEY (`Asignatura`) REFERENCES `asignaturas` (`Codigo_Asignatura`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `FK_docente_asignatura_carreras` FOREIGN KEY (`Carrera`) REFERENCES `carreras` (`Codigo_Carrera`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `FK_docente_asignatura_docentes` FOREIGN KEY (`Docente_Cedula`) REFERENCES `docentes` (`Cedula`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `FK_docente_asignatura_pensum` FOREIGN KEY (`Pensum`) REFERENCES `pensum` (`Codigo_Pensum`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `FK_docente_asignatura_periodo_academico` FOREIGN KEY (`Periodo_Academico`) REFERENCES `periodo_academico` (`Periodo_Academico`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `FK_docente_asignatura_secciones` FOREIGN KEY (`Seccion`) REFERENCES `secciones` (`Codigo_Seccion`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_spanish_ci COMMENT='En esta tabla se asigna la asignatura que un docente registrado debera impartir en un periodo academico.';

-- Volcando datos para la tabla reu_db.docente_asignatura: ~0 rows (aproximadamente)

-- Volcando estructura para tabla reu_db.estudiantes
CREATE TABLE IF NOT EXISTS `estudiantes` (
  `Cedula` varchar(8) NOT NULL,
  `Usuario` varchar(20) NOT NULL,
  `Nombres` varchar(25) NOT NULL,
  `Apellidos` varchar(25) NOT NULL,
  `Carrera` varchar(13) DEFAULT NULL COMMENT 'Primeras 3 letras de cada palabra en mayusculas seguido de un numero secuencial entero de 3 en este formato FFF000 o tambien FFF-FFF000',
  `Estado_Pensum` varchar(17) DEFAULT 'pendiente' COMMENT 'Pensum Asignado, Pensum Pendiente',
  `Estado` varchar(15) DEFAULT 'nuevo-ingreso' COMMENT 'Regular, Nuevo Ingreso',
  `Codigo_Carnet` varchar(25) NOT NULL,
  `Fecha_Registro` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`Cedula`),
  KEY `FK_estudiantes_carreras` (`Carrera`),
  KEY `FK_estudiantes_usuarios` (`Usuario`),
  CONSTRAINT `FK_estudiantes_carreras` FOREIGN KEY (`Carrera`) REFERENCES `carreras` (`Codigo_Carrera`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `FK_estudiantes_usuarios` FOREIGN KEY (`Usuario`) REFERENCES `usuarios` (`ID_Usuario`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_spanish_ci;

-- Volcando datos para la tabla reu_db.estudiantes: ~0 rows (aproximadamente)

-- Volcando estructura para tabla reu_db.estudiantes_asignatura
CREATE TABLE IF NOT EXISTS `estudiantes_asignatura` (
  `ID` int(5) unsigned zerofill NOT NULL AUTO_INCREMENT,
  `Estudiante_Cedula` varchar(8) NOT NULL,
  `Estudiante_Nombre` varchar(50) NOT NULL,
  `Asignatura` varchar(13) NOT NULL,
  `Seccion` int(5) unsigned NOT NULL,
  `Estado` varchar(25) NOT NULL COMMENT 'asistente, cargando notas, inasistente',
  `Periodo_Academico` char(6) NOT NULL,
  `Nota` int(5) DEFAULT NULL,
  `Nota_Definitiva` int(5) DEFAULT NULL,
  PRIMARY KEY (`ID`),
  KEY `FK_estudiantes_asignatura_estudiantes` (`Estudiante_Cedula`),
  KEY `FK_estudiantes_asignatura_asignaturas` (`Asignatura`),
  KEY `FK_estudiantes_asignatura_secciones` (`Seccion`),
  KEY `FK_estudiantes_asignatura_periodo_academico` (`Periodo_Academico`),
  CONSTRAINT `FK_estudiantes_asignatura_asignaturas` FOREIGN KEY (`Asignatura`) REFERENCES `asignaturas` (`Codigo_Asignatura`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `FK_estudiantes_asignatura_estudiantes` FOREIGN KEY (`Estudiante_Cedula`) REFERENCES `estudiantes` (`Cedula`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `FK_estudiantes_asignatura_periodo_academico` FOREIGN KEY (`Periodo_Academico`) REFERENCES `periodo_academico` (`Periodo_Academico`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `FK_estudiantes_asignatura_secciones` FOREIGN KEY (`Seccion`) REFERENCES `secciones` (`Codigo_Seccion`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_spanish_ci;

-- Volcando datos para la tabla reu_db.estudiantes_asignatura: ~1 rows (aproximadamente)

-- Volcando estructura para tabla reu_db.estudiante_periodo_academico
CREATE TABLE IF NOT EXISTS `estudiante_periodo_academico` (
  `ID` int(5) unsigned zerofill NOT NULL AUTO_INCREMENT,
  `Cedula_Estudiante` varchar(8) NOT NULL,
  `Estado` varchar(25) NOT NULL COMMENT 'Activo, Inactivo (Se añade automaticamente dependiendo del pago)',
  `Periodo_Academico` char(6) NOT NULL,
  `Carrera` varchar(13) NOT NULL,
  `Pago` varchar(16) NOT NULL COMMENT 'Pago Realizado, Pago Pendiente',
  `Monto_Pago` decimal(10,2) NOT NULL,
  `Moneda` varchar(4) NOT NULL DEFAULT 'Bs.' COMMENT 'Bs. o USD.',
  `Modalidad_Pago` varchar(50) NOT NULL COMMENT 'PagoMovil o Transferencia',
  `Entidad_Bancaria` varchar(50) NOT NULL,
  `Numero_Transferencia` int(11) NOT NULL DEFAULT 0,
  `Fecha_Pago` date NOT NULL,
  `Fecha_Registro` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`ID`),
  KEY `FK_estudiante_periodo_academico_estudiantes` (`Cedula_Estudiante`),
  KEY `FK_estudiante_periodo_academico_periodo_academico` (`Periodo_Academico`),
  KEY `FK_estudiante_periodo_academico_carreras` (`Carrera`),
  CONSTRAINT `FK_estudiante_periodo_academico_carreras` FOREIGN KEY (`Carrera`) REFERENCES `carreras` (`Codigo_Carrera`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `FK_estudiante_periodo_academico_estudiantes` FOREIGN KEY (`Cedula_Estudiante`) REFERENCES `estudiantes` (`Cedula`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `FK_estudiante_periodo_academico_periodo_academico` FOREIGN KEY (`Periodo_Academico`) REFERENCES `periodo_academico` (`Periodo_Academico`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_spanish_ci;

-- Volcando datos para la tabla reu_db.estudiante_periodo_academico: ~1 rows (aproximadamente)

-- Volcando estructura para tabla reu_db.horas
CREATE TABLE IF NOT EXISTS `horas` (
  `Desde` time NOT NULL,
  `Hasta` time NOT NULL,
  PRIMARY KEY (`Desde`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_spanish_ci COMMENT='Turnos';

-- Volcando datos para la tabla reu_db.horas: ~4 rows (aproximadamente)
INSERT INTO `horas` (`Desde`, `Hasta`) VALUES
	('11:00:00', '16:00:00'),
	('14:00:00', '15:00:00'),
	('16:00:00', '21:00:00'),
	('17:00:00', '20:00:00');

-- Volcando estructura para tabla reu_db.nivel_pensum
CREATE TABLE IF NOT EXISTS `nivel_pensum` (
  `Nombre_Nivel` varchar(50) NOT NULL DEFAULT '',
  `Orden_Nivel` int(11) NOT NULL DEFAULT 0,
  PRIMARY KEY (`Nombre_Nivel`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_spanish_ci;

-- Volcando datos para la tabla reu_db.nivel_pensum: ~5 rows (aproximadamente)
INSERT INTO `nivel_pensum` (`Nombre_Nivel`, `Orden_Nivel`) VALUES
	('Cuarto Trimestre', 4),
	('Primer Trimestre', 1),
	('Quinto Trimestre', 5),
	('Segundo Trimestre', 2),
	('Tercer Trimestre', 3);

-- Volcando estructura para tabla reu_db.pensum
CREATE TABLE IF NOT EXISTS `pensum` (
  `Nombre_Pensum` varchar(50) NOT NULL,
  `Num_Asignatura` varchar(11) NOT NULL,
  `Estado_Pensum` varchar(8) NOT NULL COMMENT 'Activo o Inactivo',
  `Codigo_Pensum` varchar(25) NOT NULL DEFAULT '' COMMENT 'Primeras 3 letras de cada palabra en mayusculas seguido de un numero secuencial entero de 3 en este formato FFF000 o tambien FFF-FFF000',
  PRIMARY KEY (`Codigo_Pensum`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_spanish_ci;

-- Volcando datos para la tabla reu_db.pensum: ~0 rows (aproximadamente)
INSERT INTO `pensum` (`Nombre_Pensum`, `Num_Asignatura`, `Estado_Pensum`, `Codigo_Pensum`) VALUES
	('Pensum en Administracion', '12', 'activo', 'P-ADM-2025');

-- Volcando estructura para tabla reu_db.periodo_academico
CREATE TABLE IF NOT EXISTS `periodo_academico` (
  `Periodo_Academico` char(6) NOT NULL COMMENT 'Año actual seguido de un guion y el semestre 1, o el 2 de esta forma: 0000-1',
  `Estado` varchar(8) NOT NULL DEFAULT 'Cursando' COMMENT 'Cursando o Cerrado. El valor se agrea automaticamente.',
  `Inicio` date NOT NULL,
  `Final` date NOT NULL,
  `Limite_UC` int(2) NOT NULL COMMENT 'Limite de creditos que los estudiantes pueden inscribir.',
  PRIMARY KEY (`Periodo_Academico`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_spanish_ci;

-- Volcando datos para la tabla reu_db.periodo_academico: ~6 rows (aproximadamente)
INSERT INTO `periodo_academico` (`Periodo_Academico`, `Estado`, `Inicio`, `Final`, `Limite_UC`) VALUES
	('2026-1', 'cursando', '2026-04-01', '2026-05-01', 25),
	('2027-1', 'cerrado', '2027-04-12', '2027-09-12', 25),
	('2028-1', 'cerrado', '2025-04-16', '2025-08-20', 25),
	('2029-2', 'cerrado', '2029-02-12', '2030-02-12', 25),
	('2030-1', 'cerrado', '2030-03-22', '2030-03-30', 25),
	('2040-1', 'cerrado', '2061-02-12', '2040-02-12', 30);

-- Volcando estructura para tabla reu_db.secciones
CREATE TABLE IF NOT EXISTS `secciones` (
  `Codigo_Seccion` int(5) unsigned NOT NULL COMMENT 'Formato: 00000. Seccion (000) trayecto (0) y semestre (0)',
  PRIMARY KEY (`Codigo_Seccion`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_spanish_ci;

-- Volcando datos para la tabla reu_db.secciones: ~2 rows (aproximadamente)
INSERT INTO `secciones` (`Codigo_Seccion`) VALUES
	(30231),
	(30232);

-- Volcando estructura para tabla reu_db.solicitudes_tutor_externo
CREATE TABLE IF NOT EXISTS `solicitudes_tutor_externo` (
  `ID` int(5) unsigned zerofill NOT NULL AUTO_INCREMENT,
  `Cedula_Tutor` varchar(8) NOT NULL,
  `Nombre_Tutor` varchar(50) NOT NULL COMMENT 'Nombre Completo del Tutor',
  `Cedula_Solicitante` varchar(8) NOT NULL,
  `Nombre_Estudiante` varchar(50) NOT NULL,
  `Estado` varchar(25) NOT NULL DEFAULT 'Por Aprobar' COMMENT 'Por Aprobar, Aprobado, Rechazado',
  `Fecha_Solicitud` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`ID`),
  KEY `FK_solicitudes_tutor_externo_estudiantes` (`Cedula_Solicitante`),
  CONSTRAINT `FK_solicitudes_tutor_externo_estudiantes` FOREIGN KEY (`Cedula_Solicitante`) REFERENCES `estudiantes` (`Cedula`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_spanish_ci;

-- Volcando datos para la tabla reu_db.solicitudes_tutor_externo: ~1 rows (aproximadamente)

-- Volcando estructura para tabla reu_db.solicitudes_tutor_interno
CREATE TABLE IF NOT EXISTS `solicitudes_tutor_interno` (
  `ID` int(5) unsigned zerofill NOT NULL AUTO_INCREMENT,
  `Cedula_Docente` varchar(8) NOT NULL,
  `Nombre_Docente` varchar(50) NOT NULL,
  `Cedula_Solicitante` varchar(8) NOT NULL,
  `Nombre_Estudiante` varchar(50) NOT NULL,
  `Estado` varchar(25) NOT NULL DEFAULT 'Por Aprobar' COMMENT 'Por Aprobar, Aprobado, Rechazado',
  `Fecha_Solicitud` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`ID`),
  KEY `FK_solicitudes_tutor_interno_estudiantes` (`Cedula_Solicitante`),
  KEY `Docentee` (`Cedula_Docente`),
  CONSTRAINT `Docentee` FOREIGN KEY (`Cedula_Docente`) REFERENCES `docentes` (`Cedula`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `FK_solicitudes_tutor_interno_estudiantes` FOREIGN KEY (`Cedula_Solicitante`) REFERENCES `estudiantes` (`Cedula`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_spanish_ci;

-- Volcando datos para la tabla reu_db.solicitudes_tutor_interno: ~1 rows (aproximadamente)

-- Volcando estructura para tabla reu_db.trabajo_investigacion
CREATE TABLE IF NOT EXISTS `trabajo_investigacion` (
  `ID` int(5) unsigned zerofill NOT NULL AUTO_INCREMENT,
  `Nombre_Investigacion` varchar(50) NOT NULL,
  `Carrera` varchar(13) NOT NULL,
  `Cedula_Estudiante` varchar(8) NOT NULL,
  `Nombre_Estudiante` varchar(50) NOT NULL,
  `Tutor_Cedula` varchar(8) NOT NULL,
  `Tutor_Nombre` varchar(50) NOT NULL,
  `Area_Interes` varchar(25) NOT NULL,
  `Periodo_Academico` char(6) NOT NULL,
  `Estado` varchar(15) DEFAULT NULL,
  PRIMARY KEY (`ID`),
  KEY `Periodo Academico` (`Periodo_Academico`),
  KEY `Estudiante` (`Cedula_Estudiante`),
  KEY `Relacion carreras` (`Carrera`),
  CONSTRAINT `Estudiante` FOREIGN KEY (`Cedula_Estudiante`) REFERENCES `estudiantes` (`Cedula`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `Periodo Academico` FOREIGN KEY (`Periodo_Academico`) REFERENCES `periodo_academico` (`Periodo_Academico`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `Relacion carreras` FOREIGN KEY (`Carrera`) REFERENCES `carreras` (`Codigo_Carrera`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_spanish_ci;

-- Volcando datos para la tabla reu_db.trabajo_investigacion: ~0 rows (aproximadamente)

-- Volcando estructura para tabla reu_db.usuarios
CREATE TABLE IF NOT EXISTS `usuarios` (
  `ID_Usuario` varchar(20) NOT NULL COMMENT 'Nombre de Usuario',
  `Password` varchar(300) NOT NULL,
  `Rol` varchar(20) NOT NULL COMMENT 'Administrador, Docente, Estudiante, Control_Estudios, Tutor_Externo, Administrativo',
  `Estado` varchar(13) NOT NULL COMMENT 'Habilitado o Deshabilitado',
  `Nombres` varchar(25) NOT NULL,
  `Apellidos` varchar(25) NOT NULL,
  `Genero` varchar(9) NOT NULL COMMENT 'Masculino o Femenino',
  `Residente` varchar(10) NOT NULL COMMENT 'Venezolano o Extranjero',
  `Cedula` varchar(8) NOT NULL COMMENT 'Numero de cedula sin signos',
  `Telefono_1` char(11) NOT NULL COMMENT 'Numero de contacto obliatorio',
  `Telefono_2` char(11) DEFAULT NULL COMMENT 'Opcional',
  `Correo` varchar(50) NOT NULL COMMENT 'Email obligatorio',
  `Direccion_Residencial` varchar(100) NOT NULL,
  `Codigo_Carnet` char(25) DEFAULT NULL COMMENT 'Se crea automaticamente',
  `Fecha_Registro` timestamp NOT NULL DEFAULT current_timestamp() COMMENT 'Se inserta automaticamente',
  PRIMARY KEY (`ID_Usuario`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_spanish_ci;

-- Volcando datos para la tabla reu_db.usuarios: ~6 rows (aproximadamente)
INSERT INTO `usuarios` (`ID_Usuario`, `Password`, `Rol`, `Estado`, `Nombres`, `Apellidos`, `Genero`, `Residente`, `Cedula`, `Telefono_1`, `Telefono_2`, `Correo`, `Direccion_Residencial`, `Codigo_Carnet`, `Fecha_Registro`) VALUES
	('DIRIARTE', 'ingdangelo2025', 'Administrador', 'Habilitado', 'Dangelo', 'Iriarte', '', '', '00000000', '00000000000', NULL, 'dangelo.iriarte@gmail.com', 'Caracas', NULL, '2025-02-28 06:28:38'),
	('DNLB1072', 'ingdaniel2025', 'Administrador', 'Habilitado', 'Jose', 'Betancourt', '', '', '30031724', '04125767988', NULL, 'josedanielbetancourt65@gmail.com', 'Caracas', NULL, '2025-02-28 06:13:25'),
	('GENESYSP718', 'inggenesis2025', 'Administrador', 'Habilitado', 'Genesis', 'Barrios', '', '', '00000000', '00000000000', NULL, 'genesysp718@gmail.com', 'Caracas', NULL, '2025-02-28 06:37:58'),
	('JONATHAV', 'ingjonathan2025', 'Administrador', 'Habilitado', 'Jonathan', 'Vargas', 'Masculino', 'Alien', '00000000', '04268216907', NULL, 'jonathanalexvargas@gmail.com', 'Caracas', NULL, '2025-02-28 06:19:09'),
	('JUNIOR09', 'ingjunior2025', 'Administrador', 'Habilitado', 'Junior', 'Araque', 'Masculono', 'Vene', '00000000', '00000000000', NULL, 'junioraraque09@gmail.com', 'Caracas', NULL, '2025-02-28 06:28:38'),
	('PROFE', '50cuWjwL', 'Docente', 'H', 'PROFE', 'PROFE', 'JJ', 'HHH', '0000000', '04120000000', NULL, 'JKJKJKJ', 'hjjhhj', 'PROF-64787971', '2025-05-04 15:48:12');

-- Volcando estructura para disparador reu_db.codigo_carnet
SET @OLDTMP_SQL_MODE=@@SQL_MODE, SQL_MODE='STRICT_TRANS_TABLES,ERROR_FOR_DIVISION_BY_ZERO,NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION';
DELIMITER //
CREATE TRIGGER `codigo_carnet` BEFORE INSERT ON `usuarios` FOR EACH ROW BEGIN
  DECLARE nuevo_codigo VARCHAR(25);
  DECLARE nueva_password VARCHAR(8);
  DECLARE caracteres VARCHAR(62);
  DECLARE i INT;
  DECLARE numero_aleatorio INT;
  
  -- Generar contraseña aleatoria alfanumérica de 8 caracteres (código existente)
  SET caracteres = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  SET nueva_password = '';
  SET i = 0;
  
  -- Generar 8 caracteres aleatorios (código existente)
  WHILE i < 8 DO
    SET nueva_password = CONCAT(nueva_password, SUBSTRING(caracteres, FLOOR(1 + RAND() * 62), 1));
    SET i = i + 1;
  END WHILE;
  
  -- Verificar que la contraseña no exista (muy improbable pero por seguridad) (código existente)
  WHILE EXISTS (SELECT 1 FROM usuarios WHERE Password = nueva_password) DO
    SET nueva_password = '';
    SET i = 0;
    WHILE i < 8 DO
      SET nueva_password = CONCAT(nueva_password, SUBSTRING(caracteres, FLOOR(1 + RAND() * 62), 1));
      SET i = i + 1;
    END WHILE;
  END WHILE;
  
  -- Asignar la nueva contraseña (código existente)
  SET NEW.Password = nueva_password;
  
  -- Código modificado para generar códigos de carnet de 8 dígitos
  IF NEW.Rol = 'Estudiante' THEN
    -- Generar número de 8 dígitos aleatorio
    SET numero_aleatorio = FLOOR(10000000 + RAND() * 90000000);
    SET nuevo_codigo = CONCAT('EST-', numero_aleatorio);
    
    -- Verificar que el código no exista
    WHILE EXISTS (SELECT 1 FROM usuarios WHERE Codigo_Carnet = nuevo_codigo) DO
      SET numero_aleatorio = FLOOR(10000000 + RAND() * 90000000);
      SET nuevo_codigo = CONCAT('EST-', numero_aleatorio);
    END WHILE;
    
    SET NEW.Codigo_Carnet = nuevo_codigo;
    
  ELSEIF NEW.Rol = 'Docente' THEN
    -- Generar número de 8 dígitos aleatorio
    SET numero_aleatorio = FLOOR(10000000 + RAND() * 90000000);
    SET nuevo_codigo = CONCAT('DTE-', numero_aleatorio);
    
    -- Verificar que el código no exista
    WHILE EXISTS (SELECT 1 FROM usuarios WHERE Codigo_Carnet = nuevo_codigo) DO
      SET numero_aleatorio = FLOOR(10000000 + RAND() * 90000000);
      SET nuevo_codigo = CONCAT('DTE-', numero_aleatorio);
    END WHILE;
    
    SET NEW.Codigo_Carnet = nuevo_codigo;
    
  ELSE
    SET NEW.Codigo_Carnet = NULL; -- Dejar vacío si no es Estudiante ni Docente
  END IF;
  
END//
DELIMITER ;
SET SQL_MODE=@OLDTMP_SQL_MODE;

-- Volcando estructura para disparador reu_db.registro_estudiante_profesor
SET @OLDTMP_SQL_MODE=@@SQL_MODE, SQL_MODE='STRICT_TRANS_TABLES,ERROR_FOR_DIVISION_BY_ZERO,NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION';
DELIMITER //
CREATE TRIGGER `registro_estudiante_profesor` AFTER INSERT ON `usuarios` FOR EACH ROW BEGIN
IF NEW.Rol = 'Estudiante' THEN
INSERT INTO estudiantes (Usuario, Cedula, Nombres, Apellidos, Codigo_Carnet)
VALUES (NEW.ID_Usuario, NEW.Cedula, NEW.Nombres, NEW.Apellidos, NEW.Codigo_Carnet);
ELSEIF NEW.Rol = 'Docente' THEN
INSERT INTO docentes (Usuario, Cedula, Nombres, Apellidos, Telefono_1, Telefono_2, Correo, Codigo_Carnet)
VALUES (NEW.ID_Usuario, NEW.Cedula, NEW.Nombres, NEW.Apellidos,  NEW.Telefono_1,  NEW.Telefono_2,  NEW.Correo, NEW.Codigo_Carnet);
END IF;
END//
DELIMITER ;
SET SQL_MODE=@OLDTMP_SQL_MODE;

/*!40103 SET TIME_ZONE=IFNULL(@OLD_TIME_ZONE, 'system') */;
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IFNULL(@OLD_FOREIGN_KEY_CHECKS, 1) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40111 SET SQL_NOTES=IFNULL(@OLD_SQL_NOTES, 1) */;
