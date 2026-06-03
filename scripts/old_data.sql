INSERT INTO `asignaturas` (`Codigo_Asignatura`, `Nombre_Asignatura`, `Carrera`, `Trayecto`, `Sem/Trim`, `Valor_UC`) VALUES
	('ING-001', 'Ingles I', 'P-INF-2025', 1, 2, 25),
	('MAT-001', 'Matematica I', 'P-INF-2025', 1, 2, 20);

INSERT INTO `aulas` (`Nombre_Aula`, `Capacidad`) VALUES
	('Aula 04', 30),
	('Aula 05', 21),
	('Aula 08', 30),
	('Aula 11', 30),
	('Aula 111', 30),
	('Aula 12', 35);

INSERT INTO `bitacora` (`ID`, `Hora`, `Fecha`, `IP`, `Usuario_ID`, `Accion`, `Modulo`, `Registro_ID`, `Detalles`) VALUES
	(9, '11:54:05', '2026/05/22', '149.100.145.218', 'JONATHAV', 'Inicio de Sesión', NULL, NULL, NULL),
	(10, '12:46:24', '2026/05/22', '149.100.145.218', 'JONATHAV', 'Inicio de Sesión', NULL, NULL, NULL),
	(11, '13:15:24', '2026/05/22', '149.100.145.218', 'JONATHAV', 'Inicio de Sesión', NULL, NULL, NULL),
	(12, '13:16:09', '2026/05/22', '149.100.145.218', 'JONATHAV', 'Modificación', 'Estudiantes', '00123741', 'Se actualizó el registro Cedula=00123741 en Estudiantes. Cambios: Carrera: "(vacío)" → "P-ADM-2025"; Estado_Pensum: "pendiente" → "asignado"'),
	(13, '14:03:12', '2026/05/22', '149.100.145.218', 'JONATHAV', 'Inicio de Sesión', NULL, NULL, NULL),
	(14, '15:46:09', '2026/05/24', '149.100.145.218', 'JONATHAV', 'Inicio de Sesión', NULL, NULL, NULL),
	(15, '15:46:10', '2026/05/24', '149.100.145.218', 'JONATHAV', 'Inicio de Sesión', NULL, NULL, NULL),
	(16, '15:46:10', '2026/05/24', '149.100.145.218', 'JONATHAV', 'Inicio de Sesión', NULL, NULL, NULL),
	(17, '15:46:10', '2026/05/24', '149.100.145.218', 'JONATHAV', 'Inicio de Sesión', NULL, NULL, NULL),
	(18, '15:46:10', '2026/05/24', '149.100.145.218', 'JONATHAV', 'Inicio de Sesión', NULL, NULL, NULL),
	(19, '15:51:46', '2026/05/24', '149.100.145.218', 'JONATHAV', 'Inicio de Sesión', NULL, NULL, NULL);

INSERT INTO `carreras` (`Codigo_Carrera`, `Nombre_Carrera`, `Tipo`, `Estado`, `Total_UC`) VALUES
	('P-ADM-2025', 'Administracion', 'Trimestral', 'Inactiva', 40),
	('P-INF-2025', 'Informatica', 'Semestral', 'Activa', 30);

INSERT INTO `docentes` (`Cedula`, `Usuario`, `Nombres`, `Apellidos`, `Estado_Docente`, `Tipo`, `Fecha_Registro`, `Estado`) VALUES
	('00221221', 'PROFESOR', 'Nombreprofe', 'Apellidoprofe', 'activo', 'normal', '2025-04-11 22:42:15', 'Habilitado'),
	('12000114', 'DOCENTE123', 'Docente', 'Gutierrez', NULL, NULL, '2026-05-22 14:49:31', 'Habilitado');

INSERT INTO `estudiantes` (`Cedula`, `Usuario`, `Nombres`, `Apellidos`, `Carrera`, `Estado_Pensum`, `Estado`, `Fecha_Registro`) VALUES
	('00123741', 'ESTUDIANTTE', 'Nombreest', 'Apellidoest', 'P-ADM-2025', 'asignado', 'regular', '2025-04-11 22:46:23'),
	('28000123', 'ESTUDIANTEPRUEBA', 'Hola', 'gy9o', NULL, NULL, NULL, '2026-05-22 14:33:34');

INSERT INTO `horas` (`Desde`, `Hasta`, `Docente_Cedula`) VALUES
	('11:00:00', '16:00:00', NULL),
	('14:00:00', '15:00:00', NULL),
	('16:00:00', '21:00:00', NULL),
	('17:00:00', '20:00:00', NULL);

INSERT INTO `nivel_pensum` (`Nombre_Nivel`, `Orden_Nivel`) VALUES
	('Cuarto Trimestre', 4),
	('Primer Trimestre', 1),
	('Quinto Trimestre', 5),
	('Segundo Trimestre', 2),
	('Tercer Trimestre', 3);

INSERT INTO `pensum` (`Nombre_Pensum`, `Num_Asignatura`, `Estado_Pensum`, `Codigo_Pensum`) VALUES
	('Pensum en Administracion', '12', 'activo', 'P-ADM-2025');

INSERT INTO `periodo_academico` (`Periodo_Academico`, `Estado`, `Inicio`, `Final`, `Limite_UC`) VALUES
	('2026-1', 'cursando', '2026-04-01', '2026-05-01', 25),
	('2027-1', 'cursando', '2027-04-12', '2027-09-12', 25),
	('2028-1', 'cerrado', '2025-04-16', '2025-08-20', 25),
	('2029-2', 'cursando', '2029-02-12', '2030-02-12', 25),
	('2030-1', 'cursando', '2030-03-22', '2030-03-30', 25),
	('2040-1', 'cursando', '2061-02-12', '2040-02-12', 30);

INSERT INTO `secciones` (`Codigo_Seccion`) VALUES
	(30231),
	(30232);

INSERT INTO `solicitudes_tutor_externo` (`ID`, `Cedula_Tutor`, `Nombre_Tutor`, `Cedula_Solicitante`, `Nombre_Estudiante`, `Estado`, `Fecha_Solicitud`) VALUES
	(00001, '00221221', 'Nombreprofe Apellidoprofe', '00123741', 'Nombreest Apellidoest', 'tutor-rechazado', '2025-04-14 04:00:00');

INSERT INTO `tutores_externos` (`Cedula`, `Nombres`, `Apellidos`, `Correo`, `Telefono`, `Institucion`, `Especialidad`, `Estado`, `Fecha_Registro`) VALUES
	('00221221', 'Nombreprofe', 'Apellidoprofe', NULL, NULL, NULL, NULL, 'Habilitado', '2026-05-22 15:51:39');

INSERT INTO `usuarios` (`ID_Usuario`, `Password`, `Rol`, `Estado`, `Nombres`, `Apellidos`, `Genero`, `Residente`, `Cedula`, `Telefono_1`, `Telefono_2`, `Correo`, `Direccion_Residencial`, `Codigo_Carnet`, `Fecha_Registro`) VALUES
	('CONTROL', '$2b$10$MM8ZVkXotach2gzx.0gxdu4uEAMO65VwXvP8nAATebTLyGrk7s.uq', 'Control_Estudio', 'Habilitado', 'Nombrecontrol', 'Apellidocontrol', 'Masculino', 'Venezolano', '01203285', '04140023121', NULL, 'controlestudio@email.com', 'Caracas', NULL, '2025-04-11 22:49:57'),
	('DIRIARTE', '$2b$10$TTuQpXEeaOmopwnqwc3Je..MbOGrdF59SLE65YJI9E2LTYeE1SldG', 'Administrador', 'Habilitado', 'Dangelo', 'Iriarte', '', '', '00000000', '00000000000', NULL, 'dangelo.iriarte@gmail.com', 'Caracas', NULL, '2025-02-28 06:28:38'),
	('DNLB1072', '$2b$10$TDAOcBk5y0iE.SR8TjSvUexqlfLVVLXlGH1QoNXZNnY85FTJBbDsa', 'Administrador', 'Habilitado', 'Jose', 'Betancourt', '', '', '30031724', '04125767988', NULL, 'josedanielbetancourt65@gmail.com', 'Caracas', NULL, '2025-02-28 06:13:25'),
	('DOCENTE123', '$2b$10$Gas14cTBKSvXO6OyjbPM5eblt5gaHve25UUM8qmFtIvPL0e9EKMNm', 'Docente', 'Habilitado', 'Docente', 'Gutierrez', 'Masculino', 'Venezolano', '12000114', '04245556532', '', 'correodocente@gmail.com', 'Caracas', 'PROF-869', '2026-05-22 14:49:31'),
	('ESTUDIA', '$2b$10$EFnD7n21kpCZIuWVXJU1SuBgVDBww.BVyAy0PjwbituuIBO1zMdXe', 'Administrador', 'Habilitado', 'Estudiante', 'Arnes', 'Femenino', 'Venezolano', '32000123', '04110001122', '', 'arnes@gmail.com', 'Caracas', NULL, '2026-05-22 04:30:51'),
	('ESTUDIANTEPRUEBA', '$2b$10$gu87I4fHt8Wa3W3haoK4me6rsSfxIR9ont1Im5zQOta2wbLxntycu', 'Estudiante', 'Habilitado', 'Hola', 'gy9o', 'Masculino', 'Venezolano', '28000123', '0422465415', '', 'emailprueba@gmail.com', 'Caracas', 'EST-490', '2026-05-22 14:33:34'),
	('ESTUDIANTTE', '$2b$10$R8OwWel37RjGFP.F5rY0mupOKjb7C67EtVBJdHGO01PV53GZAYMJy', 'Estudiante', 'Habilitado', 'Nombreest', 'Apellidoest', 'Femenino', 'Extranjero', '00123741', '0412000123', NULL, 'est@email.com', 'Caracas', 'EST-181', '2025-04-11 22:46:19'),
	('estusi123', '$2b$10$A5W9AZ2D5HcLKs6H367X2eVuKn6HcyF3aZL0IVZ0kq42e07mmjvzO', 'Administrador', 'Habilitado', 'estudiante', 'Barreto', 'Masculino', 'Venezolano', '30000111', '04243216547', '', 'estudiante@gmail.com', 'Caracas', NULL, '2026-05-22 04:22:42'),
	('GENESYSP718', '$2b$10$1rj9CysAbTCc8Wz4iynEa.zNNQeaS24FYsRoRt5Ed7epqYSQSNyKG', 'Administrador', 'Habilitado', 'Genesis', 'Barrios', '', '', '00000000', '00000000000', NULL, 'genesysp718@gmail.com', 'Caracas', NULL, '2025-02-28 06:37:58'),
	('JONATHAV', '$2b$10$E7EiwPGsCUzjI3xU3Ebtne0ZTFSqMzVkS4U.U9G05bXEU4ZP8OSba', 'Administrador', 'Habilitado', 'Jonathan', 'Vargas', '', '', '00000000', '04268216907', NULL, 'jonathanalexvargas@gmail.com', 'Caracas', NULL, '2025-02-28 06:19:09'),
	('JUNIOR09', '$2b$10$tmLIcGz8RWyUIiyKODKqBeMk8sLXbEA1v/UC4vsSvRC75A2C3nrii', 'Administrador', 'Habilitado', 'Junior', 'Araque', '', '', '00000000', '00000000000', NULL, 'junioraraque09@gmail.com', 'Caracas', NULL, '2025-02-28 06:28:38'),
	('PROFESOR', '$2b$10$jyNKBoR2Q6rqr84vVf7M0..I6/IlYrIQWosyli2Pdu0Qi9L1xPc8C', 'Docente', 'Habilitado', 'Nombreprofe', 'Apellidoprofe', 'Masculino', 'Venezolano', '00221221', '0414025369', NULL, 'prof@email.com', 'Caracas', 'PROF-548', '2025-04-11 22:41:47');
