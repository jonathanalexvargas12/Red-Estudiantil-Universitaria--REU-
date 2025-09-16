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
REPLACE INTO `asignaturas` (`Codigo_Asignatura`, `Nombre_Asignatura`, `Carrera`, `Trayecto`, `Sem/Trim`, `Valor_UC`) VALUES
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
REPLACE INTO `aulas` (`Nombre_Aula`, `Capacidad`) VALUES
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
) ENGINE=InnoDB AUTO_INCREMENT=143 DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_spanish_ci;

-- Volcando datos para la tabla reu_db.bitacora: ~138 rows (aproximadamente)
REPLACE INTO `bitacora` (`ID`, `Fecha`, `Hora`, `IP`, `Usuario_ID`, `Accion`, `Fecha_Registro`) VALUES
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
	(29, '2025-05-05', '0:33:37', '38.196.193.218', 'JONATHAV', 'Cierre de Sesión', '2025-05-05 04:33:37'),
	(30, '2025-05-21', '16:34:51', '87.249.132.145', 'JONATHAV', 'Inicio de Sesión', '2025-05-21 20:34:51'),
	(31, '2025-05-21', '16:45:56', '87.249.132.145', 'JONATHAV', 'Inicio de Sesión', '2025-05-21 20:45:56'),
	(32, '2025-05-21', '16:47:24', '87.249.132.145', 'JONATHAV', 'Cierre de Sesión', '2025-05-21 20:47:24'),
	(33, '2025-05-21', '16:47:34', '87.249.132.145', 'JONATHAV', 'Inicio de Sesión', '2025-05-21 20:47:34'),
	(34, '2025-05-21', '16:48:18', '87.249.132.145', 'JONATHAV', 'Cierre de Sesión', '2025-05-21 20:48:18'),
	(35, '2025-05-21', '16:48:28', '87.249.132.145', 'JONATHAV', 'Inicio de Sesión', '2025-05-21 20:48:28'),
	(36, '2025-05-21', '16:51:04', '38.196.193.217', 'JONATHAV', 'Inicio de Sesión', '2025-05-21 20:51:04'),
	(37, '2025-05-21', '17:13:25', '87.249.132.145', 'JONATHAV', 'Inicio de Sesión', '2025-05-21 21:13:25'),
	(38, '2025-05-21', '18:39:59', '87.249.132.145', 'JONATHAV', 'Inicio de Sesión', '2025-05-21 22:39:59'),
	(39, '2025-05-21', '19:46:29', '87.249.132.145', 'JONATHAV', 'Inicio de Sesión', '2025-05-21 23:46:29'),
	(40, '2025-05-21', '20:55:31', '87.249.132.145', 'JONATHAV', 'Inicio de Sesión', '2025-05-22 00:55:31'),
	(41, '2025-05-21', '20:55:32', '87.249.132.145', 'JONATHAV', 'Inicio de Sesión', '2025-05-22 00:55:32'),
	(42, '2025-05-21', '20:55:32', '87.249.132.145', 'JONATHAV', 'Inicio de Sesión', '2025-05-22 00:55:32'),
	(43, '2025-05-21', '21:02:59', '87.249.132.145', 'JONATHAV', 'Cierre de Sesión', '2025-05-22 01:02:59'),
	(44, '2025-05-21', '21:23:40', '87.249.132.145', 'JONATHAV', 'Inicio de Sesión', '2025-05-22 01:23:40'),
	(45, '2025-05-21', '21:26:39', '87.249.132.145', 'JONATHAV', 'Cierre de Sesión', '2025-05-22 01:26:40'),
	(46, '2025-05-23', '18:23:46', '38.196.193.218', 'JONATHAV', 'Inicio de Sesión', '2025-05-23 22:23:46'),
	(47, '2025-05-23', '19:06:09', '38.196.193.217', 'JONATHAV', 'Inicio de Sesión', '2025-05-23 23:06:09'),
	(48, '2025-05-24', '15:19:27', '38.196.193.218', 'JONATHAV', 'Inicio de Sesión', '2025-05-24 19:19:27'),
	(49, '2025-05-24', '15:19:27', '38.196.193.218', 'JONATHAV', 'Inicio de Sesión', '2025-05-24 19:19:27'),
	(50, '2025-05-24', '15:36:50', '38.196.193.220', 'JONATHAV', 'Inicio de Sesión', '2025-05-24 19:36:50'),
	(51, '2025-05-24', '15:43:11', '38.196.193.220', 'JONATHAV', 'Cierre de Sesión', '2025-05-24 19:43:11'),
	(52, '2025-05-24', '15:43:23', '38.196.193.220', 'JONATHAV', 'Inicio de Sesión', '2025-05-24 19:43:23'),
	(53, '2025-05-24', '16:43:47', '38.196.193.218', 'JONATHAV', 'Inicio de Sesión', '2025-05-24 20:43:47'),
	(54, '2025-05-24', '16:56:50', '38.196.193.218', 'JONATHAV', 'Cierre de Sesión', '2025-05-24 20:56:50'),
	(55, '2025-05-24', '16:56:57', '38.196.193.220', 'JONATHAV', 'Inicio de Sesión', '2025-05-24 20:56:57'),
	(56, '2025-05-24', '17:28:59', '38.196.193.220', 'JONATHAV', 'Cierre de Sesión', '2025-05-24 21:28:59'),
	(57, '2025-05-24', '17:29:13', '38.196.193.220', 'JONATHAV', 'Inicio de Sesión', '2025-05-24 21:29:13'),
	(58, '2025-05-24', '18:00:31', '38.196.193.220', 'JONATHAV', 'Cierre de Sesión', '2025-05-24 22:00:31'),
	(59, '2025-05-24', '18:01:19', '38.196.193.220', 'JONATHAV', 'Inicio de Sesión', '2025-05-24 22:01:19'),
	(60, '2025-05-24', '18:01:19', '38.196.193.220', 'JONATHAV', 'Inicio de Sesión', '2025-05-24 22:01:20'),
	(61, '2025-05-24', '18:09:56', '38.196.193.218', 'JONATHAV', 'Inicio de Sesión', '2025-05-24 22:09:56'),
	(62, '2025-05-24', '18:32:09', '38.196.193.220', 'JONATHAV', 'Inicio de Sesión', '2025-05-24 22:32:09'),
	(63, '2025-05-24', '18:40:58', '38.196.193.217', 'JONATHAV', 'Inicio de Sesión', '2025-05-24 22:40:58'),
	(64, '2025-05-24', '18:40:59', '38.196.193.217', 'JONATHAV', 'Inicio de Sesión', '2025-05-24 22:40:59'),
	(65, '2025-05-24', '19:00:48', '38.196.193.220', 'JONATHAV', 'Inicio de Sesión', '2025-05-24 23:00:48'),
	(66, '2025-05-24', '19:11:55', '38.196.193.220', 'JONATHAV', 'Cierre de Sesión', '2025-05-24 23:11:55'),
	(67, '2025-05-24', '19:12:28', '38.196.193.220', 'JONATHAV', 'Inicio de Sesión', '2025-05-24 23:12:28'),
	(68, '2025-05-24', '19:25:49', '38.196.193.220', 'JONATHAV', 'Inicio de Sesión', '2025-05-24 23:25:49'),
	(69, '2025-05-24', '19:46:33', '38.196.193.220', 'JONATHAV', 'Cierre de Sesión', '2025-05-24 23:46:33'),
	(70, '2025-05-24', '19:46:41', '38.196.193.218', 'JONATHAV', 'Inicio de Sesión', '2025-05-24 23:46:41'),
	(71, '2025-05-24', '20:05:31', '38.196.193.220', 'JONATHAV', 'Inicio de Sesión', '2025-05-25 00:05:31'),
	(72, '2025-05-24', '21:13:34', '38.196.193.218', 'JONATHAV', 'Inicio de Sesión', '2025-05-25 01:13:34'),
	(73, '2025-05-24', '21:32:22', '38.196.193.217', 'JONATHAV', 'Inicio de Sesión', '2025-05-25 01:32:22'),
	(74, '2025-05-24', '21:46:26', '38.196.193.220', 'JONATHAV', 'Inicio de Sesión', '2025-05-25 01:46:26'),
	(75, '2025-05-24', '22:07:39', '38.196.193.217', 'JONATHAV', 'Inicio de Sesión', '2025-05-25 02:07:39'),
	(76, '2025-05-24', '22:17:04', '38.196.193.220', 'JONATHAV', 'Inicio de Sesión', '2025-05-25 02:17:04'),
	(77, '2025-05-24', '22:25:24', '38.196.193.220', 'JONATHAV', 'Cierre de Sesión', '2025-05-25 02:25:24'),
	(78, '2025-05-24', '22:25:32', '38.196.193.217', 'JONATHAV', 'Inicio de Sesión', '2025-05-25 02:25:32'),
	(79, '2025-05-25', '0:16:22', '87.249.132.152', 'JONATHAV', 'Inicio de Sesión', '2025-05-25 04:16:22'),
	(80, '2025-05-25', '0:16:24', '87.249.132.152', 'JONATHAV', 'Inicio de Sesión', '2025-05-25 04:16:24'),
	(81, '2025-05-25', '0:17:14', '87.249.132.152', 'JONATHAV', 'Cierre de Sesión', '2025-05-25 04:17:15'),
	(82, '2025-05-25', '0:17:48', '87.249.132.152', 'JONATHAV', 'Inicio de Sesión', '2025-05-25 04:17:48'),
	(83, '2025-05-25', '0:19:16', '87.249.132.152', 'JONATHAV', 'Cierre de Sesión', '2025-05-25 04:19:16'),
	(84, '2025-05-25', '0:20:05', '38.196.193.217', 'JONATHAV', 'Inicio de Sesión', '2025-05-25 04:20:06'),
	(85, '2025-05-25', '0:22:02', '38.196.193.217', 'JONATHAV', 'Cierre de Sesión', '2025-05-25 04:22:02'),
	(86, '2025-05-25', '0:22:41', '38.196.193.217', 'JONATHAV', 'Inicio de Sesión', '2025-05-25 04:22:41'),
	(87, '2025-05-25', '0:50:23', '87.249.132.152', 'JONATHAV', 'Inicio de Sesión', '2025-05-25 04:50:23'),
	(88, '2025-05-25', '0:57:16', '87.249.132.152', 'JONATHAV', 'Cierre de Sesión', '2025-05-25 04:57:16'),
	(89, '2025-05-25', '0:57:26', '87.249.132.152', 'JONATHAV', 'Inicio de Sesión', '2025-05-25 04:57:26'),
	(90, '2025-05-25', '12:53:12', '87.249.132.153', 'JONATHAV', 'Inicio de Sesión', '2025-05-25 16:53:12'),
	(91, '2025-05-25', '12:55:56', '87.249.132.153', 'JONATHAV', 'Cierre de Sesión', '2025-05-25 16:55:56'),
	(92, '2025-05-25', '12:56:05', '87.249.132.153', 'JONATHAV', 'Inicio de Sesión', '2025-05-25 16:56:05'),
	(93, '2025-05-25', '12:57:10', '87.249.132.153', 'JONATHAV', 'Cierre de Sesión', '2025-05-25 16:57:10'),
	(94, '2025-05-25', '12:57:19', '87.249.132.153', 'JONATHAV', 'Inicio de Sesión', '2025-05-25 16:57:19'),
	(95, '2025-05-25', '13:06:10', '87.249.132.153', 'JONATHAV', 'Cierre de Sesión', '2025-05-25 17:06:10'),
	(96, '2025-05-25', '13:06:18', '87.249.132.153', 'JONATHAV', 'Inicio de Sesión', '2025-05-25 17:06:18'),
	(97, '2025-05-25', '13:17:33', '87.249.132.153', 'JONATHAV', 'Cierre de Sesión', '2025-05-25 17:17:33'),
	(98, '2025-05-25', '13:17:41', '87.249.132.153', 'JONATHAV', 'Inicio de Sesión', '2025-05-25 17:17:41'),
	(99, '2025-05-25', '13:25:47', '87.249.132.153', 'JONATHAV', 'Cierre de Sesión', '2025-05-25 17:25:47'),
	(100, '2025-05-25', '13:25:56', '87.249.132.153', 'JONATHAV', 'Inicio de Sesión', '2025-05-25 17:25:56'),
	(101, '2025-05-25', '13:56:25', '87.249.132.153', 'JONATHAV', 'Inicio de Sesión', '2025-05-25 17:56:25'),
	(102, '2025-05-25', '13:59:29', '87.249.132.153', 'JONATHAV', 'Cierre de Sesión', '2025-05-25 17:59:29'),
	(103, '2025-05-25', '13:59:40', '87.249.132.153', 'JONATHAV', 'Inicio de Sesión', '2025-05-25 17:59:40'),
	(104, '2025-05-25', '14:02:19', '87.249.132.153', 'JONATHAV', 'Cierre de Sesión', '2025-05-25 18:02:19'),
	(105, '2025-05-25', '14:02:44', '87.249.132.153', 'JONATHAV', 'Inicio de Sesión', '2025-05-25 18:02:44'),
	(106, '2025-05-25', '14:16:28', '87.249.132.153', 'JONATHAV', 'Inicio de Sesión', '2025-05-25 18:16:28'),
	(107, '2025-05-25', '14:33:37', '87.249.132.153', 'JONATHAV', 'Inicio de Sesión', '2025-05-25 18:33:37'),
	(108, '2025-05-25', '14:44:10', '87.249.132.153', 'JONATHAV', 'Inicio de Sesión', '2025-05-25 18:44:10'),
	(109, '2025-05-25', '14:44:10', '87.249.132.153', 'JONATHAV', 'Inicio de Sesión', '2025-05-25 18:44:11'),
	(110, '2025-05-25', '14:44:10', '87.249.132.153', 'JONATHAV', 'Inicio de Sesión', '2025-05-25 18:44:11'),
	(111, '2025-05-25', '15:05:57', '87.249.132.153', 'JONATHAV', 'Inicio de Sesión', '2025-05-25 19:05:57'),
	(112, '2025-05-25', '16:03:02', '87.249.132.153', 'JONATHAV', 'Inicio de Sesión', '2025-05-25 20:03:02'),
	(113, '2025-05-25', '16:23:02', '87.249.132.153', 'JONATHAV', 'Inicio de Sesión', '2025-05-25 20:23:02'),
	(114, '2025-05-27', '17:21:02', '38.196.193.220', 'JONATHAV', 'Inicio de Sesión', '2025-05-27 21:21:02'),
	(115, '2025-05-27', '17:31:26', '38.196.193.218', 'JONATHAV', 'Inicio de Sesión', '2025-05-27 21:31:26'),
	(116, '2025-05-27', '17:49:04', '38.196.193.218', 'JONATHAV', 'Inicio de Sesión', '2025-05-27 21:49:04'),
	(117, '2025-05-27', '18:36:46', '38.196.193.217', 'JONATHAV', 'Inicio de Sesión', '2025-05-27 22:36:46'),
	(118, '2025-05-27', '18:36:46', '38.196.193.217', 'JONATHAV', 'Inicio de Sesión', '2025-05-27 22:36:46'),
	(119, '2025-05-27', '18:53:25', '38.196.193.217', 'JONATHAV', 'Inicio de Sesión', '2025-05-27 22:53:25'),
	(120, '2025-05-27', '19:05:54', '38.196.193.218', 'JONATHAV', 'Inicio de Sesión', '2025-05-27 23:05:54'),
	(121, '2025-05-27', '19:06:06', '38.196.193.218', 'JONATHAV', 'Inicio de Sesión', '2025-05-27 23:06:06'),
	(122, '2025-05-27', '19:26:44', '38.196.193.218', 'JONATHAV', 'Inicio de Sesión', '2025-05-27 23:26:44'),
	(123, '2025-05-27', '19:38:34', '38.196.193.220', 'JONATHAV', 'Inicio de Sesión', '2025-05-27 23:38:34'),
	(124, '2025-05-27', '19:49:56', '38.196.193.217', 'JONATHAV', 'Inicio de Sesión', '2025-05-27 23:49:56'),
	(125, '2025-05-27', '20:04:34', '38.196.193.218', 'JONATHAV', 'Inicio de Sesión', '2025-05-28 00:04:34'),
	(126, '2025-05-27', '20:28:59', '38.196.193.218', 'JONATHAV', 'Inicio de Sesión', '2025-05-28 00:28:59'),
	(127, '2025-05-27', '21:02:06', '38.196.193.217', 'JONATHAV', 'Inicio de Sesión', '2025-05-28 01:02:06'),
	(128, '2025-05-27', '21:11:29', '38.196.193.217', 'JONATHAV', 'Inicio de Sesión', '2025-05-28 01:11:29'),
	(129, '2025-05-27', '21:23:18', '38.196.193.218', 'JONATHAV', 'Inicio de Sesión', '2025-05-28 01:23:18'),
	(130, '2025-05-27', '22:05:36', '38.196.193.217', 'JONATHAV', 'Inicio de Sesión', '2025-05-28 02:05:36'),
	(131, '2025-05-27', '22:07:11', '38.196.193.217', 'JONATHAV', 'Cierre de Sesión', '2025-05-28 02:07:11'),
	(132, '2025-05-27', '22:07:14', '38.196.193.217', 'JONATHAV', 'Inicio de Sesión', '2025-05-28 02:07:14'),
	(133, '2025-05-27', '22:09:11', '38.196.193.217', 'JONATHAV', 'Cierre de Sesión', '2025-05-28 02:09:11'),
	(134, '2025-05-27', '22:09:13', '38.196.193.217', 'JONATHAV', 'Inicio de Sesión', '2025-05-28 02:09:13'),
	(135, '2025-05-27', '22:16:05', '38.196.193.217', 'JONATHAV', 'Cierre de Sesión', '2025-05-28 02:16:05'),
	(136, '2025-05-27', '22:16:07', '38.196.193.217', 'JONATHAV', 'Inicio de Sesión', '2025-05-28 02:16:07'),
	(137, '2025-05-27', '22:22:38', '38.196.193.217', 'JONATHAV', 'Cierre de Sesión', '2025-05-28 02:22:38'),
	(138, '2025-05-27', '22:22:40', '38.196.193.217', 'JONATHAV', 'Inicio de Sesión', '2025-05-28 02:22:40'),
	(139, '2025-05-27', '22:35:14', '38.196.193.217', 'JONATHAV', 'Inicio de Sesión', '2025-05-28 02:35:14'),
	(140, '2025-05-27', '22:51:35', '38.196.193.217', 'JONATHAV', 'Cierre de Sesión', '2025-05-28 02:51:35'),
	(141, '2025-05-27', '22:51:38', '38.196.193.218', 'JONATHAV', 'Inicio de Sesión', '2025-05-28 02:51:38'),
	(142, '2025-05-27', '23:42:35', '38.196.193.217', 'JONATHAV', 'Inicio de Sesión', '2025-05-28 03:42:35');

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
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_spanish_ci;

-- Volcando datos para la tabla reu_db.calificaciones: ~0 rows (aproximadamente)
REPLACE INTO `calificaciones` (`ID`, `Cedula_Estudiante`, `Nombre_Estudiante`, `Carrera`, `Trayecto`, `Sem/Trim`, `Seccion`, `Unidad_Curricular`, `Cedula_Docente`, `Nombre_Docente`, `Estado`, `Calificacion_Numerica`, `Calificacion_Cualitativa`, `Periodo_Academico`) VALUES
	(00013, '77777777', 'Bartolomeo Simpson', 'P-INF-2025', 1, 2, 30232, 'MAT-001', '0000000', 'PROFE PROFE', 'activo', 15, 'aprobado', '2026-1');

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
REPLACE INTO `carreras` (`Codigo_Carrera`, `Nombre_Carrera`, `Tipo`, `Estado`, `Total_UC`) VALUES
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
REPLACE INTO `docentes` (`Cedula`, `Usuario`, `Nombres`, `Apellidos`, `Estado_Docente`, `Tipo`, `Telefono_1`, `Telefono_2`, `Correo`, `Codigo_Carnet`, `Fecha_Registro`) VALUES
	('0000000', 'PROFE', 'PROFE', 'PROFE', 'activo', 'virtual', '04120000000', NULL, 'JKJKJKJ', 'PROF-64787971', '2025-05-04 15:48:12');

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
  `Telefono_1` varchar(11) NOT NULL,
  `Telefono_2` varchar(11) DEFAULT NULL,
  `Correo` varchar(50) NOT NULL,
  `Codigo_Carnet` varchar(25) NOT NULL,
  `Fecha_Registro` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`Cedula`),
  KEY `FK_estudiantes_carreras` (`Carrera`),
  KEY `FK_estudiantes_usuarios` (`Usuario`),
  CONSTRAINT `FK_estudiantes_carreras` FOREIGN KEY (`Carrera`) REFERENCES `carreras` (`Codigo_Carrera`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `FK_estudiantes_usuarios` FOREIGN KEY (`Usuario`) REFERENCES `usuarios` (`ID_Usuario`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_spanish_ci;

-- Volcando datos para la tabla reu_db.estudiantes: ~2 rows (aproximadamente)
REPLACE INTO `estudiantes` (`Cedula`, `Usuario`, `Nombres`, `Apellidos`, `Carrera`, `Estado_Pensum`, `Estado`, `Telefono_1`, `Telefono_2`, `Correo`, `Codigo_Carnet`, `Fecha_Registro`) VALUES
	('12345678', 'ESTUDIANTE ', 'Sara', 'Busgernsk', 'P-ADM-2025', 'pendiente', 'nuevo-ingreso', '', NULL, '', 'EST-58052306', '2025-05-23 22:51:00'),
	('77777777', 'ELBARTO', 'Bartolomeo', 'Simpson', 'P-INF-2025', 'pendiente', 'nuevo-ingreso', '04220000102', '21212121', 'HFJFFGHFFGHJF', 'EST-37464387', '2025-05-23 22:58:13');

-- Volcando estructura para tabla reu_db.estudiantes_asignatura
CREATE TABLE IF NOT EXISTS `estudiantes_asignatura` (
  `ID` int(5) unsigned zerofill NOT NULL AUTO_INCREMENT,
  `Estudiante_Cedula` varchar(8) NOT NULL,
  `Estudiante_Nombre` varchar(50) NOT NULL,
  `Asignatura` varchar(13) NOT NULL DEFAULT 'Por cargar',
  `Seccion` int(5) unsigned NOT NULL,
  `Estado` varchar(25) NOT NULL DEFAULT 'cargando notas' COMMENT 'asistente, cargando notas, inasistente',
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
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_spanish_ci;

-- Volcando datos para la tabla reu_db.estudiantes_asignatura: ~1 rows (aproximadamente)
REPLACE INTO `estudiantes_asignatura` (`ID`, `Estudiante_Cedula`, `Estudiante_Nombre`, `Asignatura`, `Seccion`, `Estado`, `Periodo_Academico`, `Nota`, `Nota_Definitiva`) VALUES
	(00011, '77777777', 'Bartolomeo Simpson', 'MAT-001', 30232, 'asistente', '2026-1', 15, 20);

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
  `Nivel_Pensum` varchar(50) NOT NULL DEFAULT '',
  `Turno` varchar(50) NOT NULL DEFAULT '',
  PRIMARY KEY (`ID`),
  KEY `FK_estudiante_periodo_academico_estudiantes` (`Cedula_Estudiante`),
  KEY `FK_estudiante_periodo_academico_periodo_academico` (`Periodo_Academico`),
  KEY `FK_estudiante_periodo_academico_carreras` (`Carrera`),
  CONSTRAINT `FK_estudiante_periodo_academico_carreras` FOREIGN KEY (`Carrera`) REFERENCES `carreras` (`Codigo_Carrera`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `FK_estudiante_periodo_academico_estudiantes` FOREIGN KEY (`Cedula_Estudiante`) REFERENCES `estudiantes` (`Cedula`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `FK_estudiante_periodo_academico_periodo_academico` FOREIGN KEY (`Periodo_Academico`) REFERENCES `periodo_academico` (`Periodo_Academico`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_spanish_ci;

-- Volcando datos para la tabla reu_db.estudiante_periodo_academico: ~1 rows (aproximadamente)
REPLACE INTO `estudiante_periodo_academico` (`ID`, `Cedula_Estudiante`, `Estado`, `Periodo_Academico`, `Carrera`, `Pago`, `Monto_Pago`, `Moneda`, `Modalidad_Pago`, `Entidad_Bancaria`, `Numero_Transferencia`, `Fecha_Pago`, `Fecha_Registro`, `Nivel_Pensum`, `Turno`) VALUES
	(00004, '12345678', 'activo', '2026-1', 'P-ADM-2025', 'realizado', 205.00, 'Bs', 'Transferencia', 'Banco de Venezuela', 548478849, '2025-05-27', '2025-07-20 04:00:00', 'Primer Año', 'Mañana');

-- Volcando estructura para tabla reu_db.expiracion_carnet
CREATE TABLE IF NOT EXISTS `expiracion_carnet` (
  `ID` int(11) NOT NULL AUTO_INCREMENT,
  `Fecha_Vecimiento` datetime NOT NULL,
  `Usuario_Reponsable` varchar(50) NOT NULL,
  `IP` varchar(45) NOT NULL,
  `Fecha_Registro` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`ID`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_spanish_ci;

-- Volcando datos para la tabla reu_db.expiracion_carnet: ~0 rows (aproximadamente)
REPLACE INTO `expiracion_carnet` (`ID`, `Fecha_Vecimiento`, `Usuario_Reponsable`, `IP`, `Fecha_Registro`) VALUES
	(1, '2025-05-24 23:35:39', 'JONATHANV', '192.168.1.1', '2025-05-25 03:36:02');

-- Volcando estructura para tabla reu_db.horas
CREATE TABLE IF NOT EXISTS `horas` (
  `Desde` time NOT NULL,
  `Hasta` time NOT NULL,
  `Turno` varchar(50) DEFAULT NULL,
  `Carrera` varchar(13) DEFAULT NULL COMMENT 'Primeras 3 letras de cada palabra en mayusculas seguido de un numero secuencial entero de 3 en este formato FFF000 o tambien FFF-FFF000',
  `Pensum` varchar(50) NOT NULL,
  `Periodo_Academico` char(6) DEFAULT NULL,
  `Seccion` int(5) unsigned NOT NULL COMMENT 'Formato: 00000. Seccion (000) trayecto (0) y semestre (0)',
  `Nivel` varchar(50) NOT NULL DEFAULT '',
  `Asignatura` varchar(13) NOT NULL COMMENT 'Formato: FFF000 o FFFIII000 o FFF-FFFIII000',
  `Docente` varchar(50) NOT NULL,
  PRIMARY KEY (`Desde`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_spanish_ci;

-- Volcando datos para la tabla reu_db.horas: ~2 rows (aproximadamente)
REPLACE INTO `horas` (`Desde`, `Hasta`, `Turno`, `Carrera`, `Pensum`, `Periodo_Academico`, `Seccion`, `Nivel`, `Asignatura`, `Docente`) VALUES
	('12:00:00', '17:00:00', 'Tarde', 'P-ADM-2025', 'P-ADM-2025', '2027-1', 30231, 'Primer Trimestre', 'ING-001', '¿0lo\'ko'),
	('17:00:00', '21:00:00', 'Noche', 'P-ADM-2025', 'P-ADM-2025', '2028-1', 30232, 'Cuarto Trimestre', 'MAT-001', 'PROFE PROFE');

-- Volcando estructura para tabla reu_db.nivel_pensum
CREATE TABLE IF NOT EXISTS `nivel_pensum` (
  `Nombre_Nivel` varchar(50) NOT NULL DEFAULT '',
  `Orden_Nivel` int(11) NOT NULL DEFAULT 0,
  PRIMARY KEY (`Nombre_Nivel`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_spanish_ci;

-- Volcando datos para la tabla reu_db.nivel_pensum: ~5 rows (aproximadamente)
REPLACE INTO `nivel_pensum` (`Nombre_Nivel`, `Orden_Nivel`) VALUES
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
REPLACE INTO `pensum` (`Nombre_Pensum`, `Num_Asignatura`, `Estado_Pensum`, `Codigo_Pensum`) VALUES
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
REPLACE INTO `periodo_academico` (`Periodo_Academico`, `Estado`, `Inicio`, `Final`, `Limite_UC`) VALUES
	('2026-1', 'cursando', '2026-04-01', '2026-05-01', 25),
	('2027-1', 'cerrado', '2027-04-12', '2027-09-12', 25),
	('2028-1', 'cerrado', '2025-04-16', '2025-08-20', 25),
	('2029-2', 'cerrado', '2029-02-12', '2030-02-12', 25),
	('2030-1', 'cerrado', '2030-03-22', '2030-03-30', 25),
	('2040-1', 'cerrado', '2061-02-12', '2040-02-12', 30);

-- Volcando estructura para tabla reu_db.reinscripciones
CREATE TABLE IF NOT EXISTS `reinscripciones` (
  `ID` int(10) unsigned zerofill NOT NULL AUTO_INCREMENT,
  `Cedula_Estudiante` varchar(50) NOT NULL DEFAULT '',
  `Carrera` varchar(50) NOT NULL DEFAULT '0',
  `Nivel_Pensum` varchar(50) NOT NULL DEFAULT '',
  `Turno` varchar(50) NOT NULL DEFAULT '',
  `Periodo_Academico` varchar(50) NOT NULL DEFAULT '',
  PRIMARY KEY (`ID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_spanish_ci;

-- Volcando datos para la tabla reu_db.reinscripciones: ~0 rows (aproximadamente)

-- Volcando estructura para tabla reu_db.secciones
CREATE TABLE IF NOT EXISTS `secciones` (
  `Codigo_Seccion` int(5) unsigned NOT NULL COMMENT 'Formato: 00000. Seccion (000) trayecto (0) y semestre (0)',
  PRIMARY KEY (`Codigo_Seccion`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_spanish_ci;

-- Volcando datos para la tabla reu_db.secciones: ~2 rows (aproximadamente)
REPLACE INTO `secciones` (`Codigo_Seccion`) VALUES
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

-- Volcando datos para la tabla reu_db.solicitudes_tutor_externo: ~0 rows (aproximadamente)

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

-- Volcando datos para la tabla reu_db.solicitudes_tutor_interno: ~0 rows (aproximadamente)

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
REPLACE INTO `usuarios` (`ID_Usuario`, `Password`, `Rol`, `Estado`, `Nombres`, `Apellidos`, `Genero`, `Residente`, `Cedula`, `Telefono_1`, `Telefono_2`, `Correo`, `Direccion_Residencial`, `Codigo_Carnet`, `Fecha_Registro`) VALUES
	('DIRIARTE', 'ingdangelo2025', 'Administrador', 'Habilitado', 'Dangelo', 'Iriarte', '', '', '00000000', '00000000000', NULL, 'dangelo.iriarte@gmail.com', 'Caracas', NULL, '2025-02-28 06:28:38'),
	('DNLB1072', 'ingdaniel2025', 'Administrador', 'Habilitado', 'Jose', 'Betancourt', '', '', '30031724', '04125767988', NULL, 'josedanielbetancourt65@gmail.com', 'Caracas', NULL, '2025-02-28 06:13:25'),
	('ELBARTO', 'sjt6gwWd', 'Estudiante', 'Habilitado', 'Bartolomeo', 'Simpson', 'Masculino', 'ELBARTO', '77777777', '04220000102', '21212121', 'HFJFFGHFFGHJF', 'Springfield', 'EST-37464387', '2025-05-23 22:58:13'),
	('ESTUDIANTE ', 'WhlaRJ3C', 'Estudiante ', 'Habilitado', 'Sara', 'Busgernsk', 'Femenino', 'Venezuela', '12345678', '04120029876', NULL, 'sarabconnor@gmail.com', 'Caracas', 'EST-58052306', '2025-05-23 22:50:43'),
	('GENESYSP718', 'inggenesis2025', 'Administrador', 'Habilitado', 'Genesis', 'Barrios', '', '', '00000000', '00000000000', NULL, 'genesysp718@gmail.com', 'Caracas', NULL, '2025-02-28 06:37:58'),
	('JONATHAV', 'ingjonathan2025', 'Administrador', 'Habilitado', 'Jonathan', 'Vargas', 'Masculino', 'Alien', '00000000', '04268216907', NULL, 'jonathanalexvargas@gmail.com', 'Caracas', NULL, '2025-02-28 06:19:09'),
	('JUNIOR09', 'ingjunior2025', 'Administrador', 'Habilitado', 'Junior', 'Araque', 'Masculono', 'Vene', '00000000', '00000000000', NULL, 'junioraraque09@gmail.com', 'Caracas', NULL, '2025-02-28 06:28:38'),
	('PROFE', '50cuWjwL', 'Docente', 'H', 'PROFE', 'PROFE', 'JJ', 'HHH', '0000000', '04120000000', NULL, 'JKJKJKJ', 'hjjhhj', 'PROF-64787971', '2025-05-04 15:48:12');

-- Volcando estructura para disparador reu_db.after_reinscripciones_insert
SET @OLDTMP_SQL_MODE=@@SQL_MODE, SQL_MODE='STRICT_TRANS_TABLES,ERROR_FOR_DIVISION_BY_ZERO,NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION';
DELIMITER //
CREATE TRIGGER after_reinscripciones_insert 
AFTER INSERT ON reinscripciones
FOR EACH ROW
BEGIN
    -- Actualizar los datos en estudiantes_periodo_academico cuando coincidan cédula y período académico
    UPDATE estudiantes_periodo_academico
    SET 
        Carrera = NEW.Carrera,
        Nivel_Pensum = NEW.Nivel_Pensum,
        Turno = NEW.Turno
    WHERE 
        Cedula_Estudiante = NEW.Cedula_Estudiante 
        AND Periodo_Academico = NEW.Periodo_Academico;
END//
DELIMITER ;
SET SQL_MODE=@OLDTMP_SQL_MODE;

-- Volcando estructura para disparador reu_db.calificaciones_after_insert
SET @OLDTMP_SQL_MODE=@@SQL_MODE, SQL_MODE='STRICT_TRANS_TABLES,ERROR_FOR_DIVISION_BY_ZERO,NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION';
DELIMITER //
CREATE TRIGGER `calificaciones_after_insert` AFTER INSERT ON `calificaciones` FOR EACH ROW BEGIN
    INSERT INTO estudiantes_asignatura (Estudiante_Cedula, Estudiante_Nombre, Seccion, Periodo_Academico, Nota, Asignatura)
    VALUES (NEW.Cedula_Estudiante, NEW.Nombre_Estudiante, NEW.Seccion, NEW.Periodo_Academico, NEW.Calificacion_Numerica, NEW.Unidad_Curricular);
END//
DELIMITER ;
SET SQL_MODE=@OLDTMP_SQL_MODE;

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
INSERT INTO estudiantes (Usuario, Cedula, Nombres, Apellidos, Codigo_Carnet, Telefono_1, Telefono_2, Correo)
VALUES (NEW.ID_Usuario, NEW.Cedula, NEW.Nombres, NEW.Apellidos, NEW.Codigo_Carnet, NEW.Telefono_1, NEW.Telefono_2,  NEW.Correo);
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
