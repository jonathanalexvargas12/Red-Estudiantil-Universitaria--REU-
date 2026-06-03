const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const checkJWT = require('../middlewares/checkJWT');
const GenericController = require('../controllers/genericController');
const asistenciaService = require('../services/asistenciaService');
const investigacionService = require('../services/InvestigacionService');
const inscripcionService = require('../services/InscripcionService');
const calificacionService = require('../services/CalificacionService');
const horarioService = require('../services/HorarioService');
const reinscripcionService = require('../services/ReinscripcionService');
const dashboardService = require('../services/DashboardService');
const db = require('../config/db');
const { registrarBitacora, getClientIP } = require('../utils/bitacora');
const {
    createUserRules, changePasswordRules,
    asistenciaMarcarRules, inscripcionCompletaRules,
    reinscripcionCompletaRules, idParamRule
} = require('../middlewares/validators');

const tablePrimaryKeyMap = {
    asignaturas: 'Codigo_Asignatura',
    aulas: 'Nombre_Aula',
    horas: 'ID',
    secciones: 'Codigo_Seccion',
    periodo_academico: 'Periodo_Academico',
    carreras: 'Codigo_Carrera',
    nivel_pensum: 'Nombre_Nivel',
    trabajo_investigacion: 'ID',
    estudiantes: 'Cedula',
    docentes: 'Cedula',
    pensum: 'Codigo_Pensum',
    calificaciones: 'ID',
    solicitudes_tutor_interno: 'ID',
    solicitudes_tutor_externo: 'ID',
    estudiante_periodo_academico: 'ID',
    estudiantes_asignatura: 'ID',
    docente_asignatura: 'ID',
    usuarios: 'ID_Usuario',
    bitacora: 'ID',
    reinscripciones: 'ID',
    asistencia_docente: 'ID',
    tutores_externos: 'Cedula',
    linea_investigacion: 'Codigo_Linea',
    configuracion: 'Clave'
};

const safeJSONResponse = (res, data) => {
    const replacer = (key, value) =>
        typeof value === 'bigint' ? value.toString() : value;
    res.json(JSON.parse(JSON.stringify(data, replacer)));
};

router.put('/usuarios/cambiar-contrasena/:id', checkJWT, changePasswordRules, async (req, res) => {
    try {
        const { id } = req.params;
        const { nuevaContrasena } = req.body;

        if (!nuevaContrasena) {
            return res.status(400).json({ message: 'La nueva contraseña es requerida' });
        }

        if (nuevaContrasena.length < 8) {
            return res.status(400).json({ message: 'La contraseña debe tener al menos 8 caracteres' });
        }

        const hashedPassword = await bcrypt.hash(nuevaContrasena, 10);

        const result = await db.query(
            'UPDATE usuarios SET Password = ? WHERE ID_Usuario = ?',
            [hashedPassword, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        const now = new Date();

        await registrarBitacora(
            now.toLocaleTimeString('es-ES'),
            `${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, '0')}/${String(now.getDate()).padStart(2, '0')}`,
            getClientIP(req),
            req.user.id,
            'Cambio de contraseña',
            'Usuarios',
            id,
            `Se cambió la contraseña del usuario ${id}`
        );

        res.json({
            success: true,
            message: 'Contraseña actualizada exitosamente'
        });

    } catch (error) {
        console.error('Error al cambiar contraseña:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
});

const generarPassword = () => {
    const caracteres = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let password = '';
    for (let i = 0; i < 8; i++) {
        password += caracteres[crypto.randomInt(0, caracteres.length)];
    }
    return password;
};

const generarCodigoCarnet = async (rol) => {
    let prefijo;
    if (rol === 'Estudiante') prefijo = 'EST-';
    else if (rol === 'Docente') prefijo = 'PROF-';
    else return null;

    while (true) {
        const numero = crypto.randomInt(100, 999); // 100-999 = 3 dígitos
        const codigo = prefijo + numero;
        const rows = await db.query('SELECT 1 FROM usuarios WHERE Codigo_Carnet = ?', [codigo]);
        if (rows.length === 0) return codigo;
    }
};

router.post('/usuarios', checkJWT, createUserRules, async (req, res) => {
    try {
        const body = {};
        for (const [key, value] of Object.entries(req.body)) {
            body[key] = value === '' ? null : value;
        }

        if (!body.ID_Usuario) {
            return res.status(400).json({ message: 'ID_Usuario es requerido' });
        }

        // Generar contraseña aleatoria
        const passwordPlano = generarPassword();
        const hashedPassword = await bcrypt.hash(passwordPlano, 10);

        // Generar código de carnet según el rol
        const codigoCarnet = await generarCodigoCarnet(body.Rol);

        const columns = Object.keys(body).map(col => `\`${col}\``).join(', ');
        const placeholders = Object.keys(body).map(() => '?').join(', ');
        const values = Object.values(body);

        const query = `INSERT INTO usuarios (${columns}, \`Password\`, \`Codigo_Carnet\`) VALUES (${placeholders}, ?, ?)`;
        await db.query(query, [...values, hashedPassword, codigoCarnet]);

        // Sincronizar con tabla específica según el rol
        if (body.Rol === 'Estudiante') {
            const estudInsert = `INSERT INTO estudiantes (Cedula, Usuario, Nombres, Apellidos, Carrera, Estado)
                VALUES (?, ?, ?, ?, ?, ?)
                ON DUPLICATE KEY UPDATE
                    Usuario = VALUES(Usuario),
                    Nombres = VALUES(Nombres),
                    Apellidos = VALUES(Apellidos),
                    Carrera = VALUES(Carrera)`;
            await db.query(estudInsert, [
                body.Cedula, body.ID_Usuario, body.Nombres, body.Apellidos,
                body.Carrera || null, 'Habilitado'
            ]);
        } else if (body.Rol === 'Docente') {
            const docInsert = `INSERT INTO docentes (Cedula, Usuario, Nombres, Apellidos, Tipo, Estado)
                VALUES (?, ?, ?, ?, ?, ?)
                ON DUPLICATE KEY UPDATE
                    Usuario = VALUES(Usuario),
                    Nombres = VALUES(Nombres),
                    Apellidos = VALUES(Apellidos)`;
            await db.query(docInsert, [
                body.Cedula, body.ID_Usuario, body.Nombres, body.Apellidos,
                body.Tipo || 'Normal', 'Habilitado'
            ]);
        }

        const now = new Date();
        const rolInfo = body.Rol ? ` (Rol: ${body.Rol})` : '';
        await registrarBitacora(
            now.toLocaleTimeString('es-ES'),
            `${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, '0')}/${String(now.getDate()).padStart(2, '0')}`,
            getClientIP(req),
            req.user.id,
            'Creación de usuario',
            'Usuarios',
            body.ID_Usuario,
            `Se creó el usuario ${body.ID_Usuario}${rolInfo}`
        );

        res.status(201).json({
            success: true,
            message: 'Usuario creado exitosamente',
            password: passwordPlano
        });

    } catch (error) {
        console.error('Error al crear usuario:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
});

router.post('/reinscripciones', checkJWT, async (req, res) => {
    try {
        const { Cedula_Estudiante, Carrera, Periodo_Academico, Nivel_Pensum, Turno } = req.body;

        if (!Cedula_Estudiante || !Carrera || !Periodo_Academico || !Nivel_Pensum || !Turno) {
            return res.status(400).json({ message: 'Todos los campos son requeridos' });
        }

        // Validar existencia de referencias FK
        const valEst = await db.query('SELECT 1 FROM estudiantes WHERE Cedula = ?', [Cedula_Estudiante]);
        if (valEst.length === 0) return res.status(400).json({ message: 'El estudiante no existe' });

        const valCarr = await db.query('SELECT 1 FROM carreras WHERE Codigo_Carrera = ?', [Carrera]);
        if (valCarr.length === 0) return res.status(400).json({ message: 'La carrera no existe' });

        const valPer = await db.query('SELECT 1 FROM periodo_academico WHERE Periodo_Academico = ?', [Periodo_Academico]);
        if (valPer.length === 0) return res.status(400).json({ message: 'El período académico no existe' });

        const valNiv = await db.query('SELECT 1 FROM nivel_pensum WHERE Nombre_Nivel = ?', [Nivel_Pensum]);
        if (valNiv.length === 0) return res.status(400).json({ message: 'El nivel de pensum no existe' });

        const result = await db.query(
            'INSERT INTO reinscripciones (Cedula_Estudiante, Carrera, Periodo_Academico, Nivel_Pensum, Turno) VALUES (?, ?, ?, ?, ?)',
            [Cedula_Estudiante, Carrera, Periodo_Academico, Nivel_Pensum, Turno]
        );

        // Actualizar el nivel del estudiante
        await db.query('UPDATE estudiantes SET Nivel_Pensum = ? WHERE Cedula = ?', [Nivel_Pensum, Cedula_Estudiante]);

        const now = new Date();
        await registrarBitacora(
            now.toLocaleTimeString('es-ES'),
            `${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, '0')}/${String(now.getDate()).padStart(2, '0')}`,
            getClientIP(req),
            req.user.id,
            'Creación',
            'Reinscripciones',
            String(result.insertId),
            `Reinscripción registrada para estudiante ${Cedula_Estudiante}, carrera ${Carrera}, período ${Periodo_Academico}`
        );

        safeJSONResponse(res, {
            success: true,
            message: 'Reinscripción registrada exitosamente',
            id: result.insertId
        });

    } catch (error) {
        console.error('Error al registrar reinscripción:', error);
        const msg = error.code === 'ER_NO_REFERENCED_ROW_2' || error.code === 'ER_NO_REFERENCED_ROW'
            ? 'Error de integridad referencial: uno de los valores no existe en la tabla relacionada'
            : 'Error interno del servidor';
        res.status(500).json({ message: msg });
    }
});

// ============================================================
// ENDPOINTS DE ASISTENCIA (Fase 2 - Automatización)
// ============================================================
router.get('/asistencia/horario/:cedula', checkJWT, async (req, res) => {
    try {
        const horario = await asistenciaService.getHorarioDocente(req.params.cedula);
        res.json(horario);
    } catch (error) {
        console.error('Error al obtener horario:', error);
        res.status(500).json({ message: 'Error al obtener horario del docente' });
    }
});

router.get('/asistencia/horario-hoy/:cedula', checkJWT, async (req, res) => {
    try {
        const horario = await asistenciaService.getHorarioDelDia(req.params.cedula, new Date());
        res.json(horario);
    } catch (error) {
        console.error('Error al obtener horario del día:', error);
        res.status(500).json({ message: 'Error al obtener horario del día' });
    }
});

router.post('/asistencia/marcar', checkJWT, asistenciaMarcarRules, async (req, res) => {
    try {
        const { Docente_Cedula, Horario_Desde, Fecha } = req.body;

        if (Horario_Desde) {
            const result = await asistenciaService.marcarAsistenciaPorHorario(
                Docente_Cedula || req.user.id,
                Horario_Desde,
                Fecha
            );
            const now = new Date();
            await registrarBitacora(
                now.toLocaleTimeString('es-ES'),
                `${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, '0')}/${String(now.getDate()).padStart(2, '0')}`,
                getClientIP(req),
                req.user.id,
                'Marcar Asistencia',
                'Asistencia Docente',
                String(result.id),
                `Asistencia marcada para docente ${Docente_Cedula || req.user.id} el ${Fecha}`
            );
            return res.status(201).json({ success: true, id: result.id });
        }

        const result = await asistenciaService.marcarAsistencia(req.body);
        const now = new Date();
        await registrarBitacora(
            now.toLocaleTimeString('es-ES'),
            `${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, '0')}/${String(now.getDate()).padStart(2, '0')}`,
            getClientIP(req),
            req.user.id,
            'Marcar Asistencia',
            'Asistencia Docente',
            String(result.id),
            `Asistencia registrada manualmente`
        );
        res.status(201).json({ success: true, id: result.id });
    } catch (error) {
        console.error('Error al marcar asistencia:', error);
        if (error.message === 'Ya existe una asistencia registrada para esta clase') {
            return res.status(409).json({ message: error.message });
        }
        res.status(500).json({ message: error.message || 'Error al marcar asistencia' });
    }
});

router.get('/asistencia/reporte', checkJWT, async (req, res) => {
    try {
        const filtros = {};
        if (req.query.docente) filtros.docente_cedula = req.query.docente;
        if (req.query.periodo) filtros.periodo = req.query.periodo;
        if (req.query.asignatura) filtros.asignatura = req.query.asignatura;
        if (req.query.seccion) filtros.seccion = req.query.seccion;
        if (req.query.desde) filtros.desde = req.query.desde;
        if (req.query.hasta) filtros.hasta = req.query.hasta;

        const reporte = await asistenciaService.getReporteHorasImpartidas(filtros);
        res.json(reporte);
    } catch (error) {
        console.error('Error al generar reporte:', error);
        res.status(500).json({ message: 'Error al generar reporte de horas' });
    }
});

router.get('/asistencia/verificar', checkJWT, async (req, res) => {
    try {
        const { docente, fecha, hora } = req.query;
        const existe = await asistenciaService.verificarAsistencia(docente, fecha, hora);
        res.json({ existe });
    } catch (error) {
        console.error('Error al verificar asistencia:', error);
        res.status(500).json({ message: 'Error al verificar asistencia' });
    }
});

router.delete('/asistencia/:id', checkJWT, idParamRule, async (req, res) => {
    try {
        await asistenciaService.eliminarAsistencia(req.params.id);
        const now = new Date();
        await registrarBitacora(
            now.toLocaleTimeString('es-ES'),
            `${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, '0')}/${String(now.getDate()).padStart(2, '0')}`,
            getClientIP(req),
            req.user.id,
            'Eliminar Asistencia',
            'Asistencia Docente',
            req.params.id,
            `Registro de asistencia ${req.params.id} eliminado`
        );
        res.json({ success: true });
    } catch (error) {
        console.error('Error al eliminar asistencia:', error);
        res.status(500).json({ message: 'Error al eliminar asistencia' });
    }
});

// ============================================================
// ENDPOINTS DE TUTORÍA -> INVESTIGACIÓN (Fase 2.2)
// ============================================================
router.post('/solicitudes/aceptar-interna/:id', checkJWT, async (req, res) => {
    try {
        const result = await investigacionService.aceptarSolicitudInterna(
            req.params.id, req.user.id, getClientIP(req)
        );
        res.json({
            success: true,
            message: 'Solicitud aceptada y trabajo de investigación creado',
            investigacionId: result.investigacionId
        });
    } catch (error) {
        console.error('Error al aceptar solicitud interna:', error);
        const status = error.message.includes('ya fue') ? 409 : 500;
        res.status(status).json({ message: error.message });
    }
});

router.post('/solicitudes/aceptar-externa/:id', checkJWT, async (req, res) => {
    try {
        const result = await investigacionService.aceptarSolicitudExterna(
            req.params.id, req.user.id, getClientIP(req)
        );
        res.json({
            success: true,
            message: 'Solicitud aprobada y trabajo de investigación creado',
            investigacionId: result.investigacionId
        });
    } catch (error) {
        console.error('Error al aprobar solicitud externa:', error);
        const status = error.message.includes('ya fue') ? 409 : 500;
        res.status(status).json({ message: error.message });
    }
});

// ============================================================
// ENDPOINTS DE INSCRIPCIÓN COMPLETA (Fase 2.3)
// ============================================================
router.get('/inscripcion/materias-disponibles', checkJWT, async (req, res) => {
    try {
        const { carrera, periodo } = req.query;
        if (!carrera) return res.status(400).json({ message: 'Carrera es requerida' });
        const materias = await inscripcionService.getMateriasDisponibles(carrera, periodo || null);
        res.json(materias);
    } catch (error) {
        console.error('Error al obtener materias:', error);
        res.status(500).json({ message: 'Error al obtener materias disponibles' });
    }
});

router.post('/inscripcion-completa', checkJWT, inscripcionCompletaRules, async (req, res) => {
    try {
        const result = await inscripcionService.inscripcionCompleta(
            req.body, req.user.id, getClientIP(req)
        );
        res.status(201).json({
            success: true,
            message: `Inscripción completada. ${result.materiasAsignadas} materia(s) asignada(s).`,
            inscripcionId: result.inscripcionId
        });
    } catch (error) {
        console.error('Error en inscripción completa:', error);
        res.status(500).json({ message: error.message || 'Error al completar inscripción' });
    }
});

// ============================================================
// ENDPOINTS DE CALIFICACIONES (Fase 2.4)
// ============================================================
router.put('/estudiantes_asignatura/:id', checkJWT, async (req, res) => {
    try {
        const { id } = req.params;
        const sanitized = {};
        for (const [key, value] of Object.entries(req.body)) {
            sanitized[key] = value === '' ? null : value;
        }

        const oldRows = await db.query('SELECT * FROM estudiantes_asignatura WHERE ID = ?', [id]);
        if (oldRows.length === 0) return res.status(404).json({ message: 'Registro no encontrado' });
        const oldData = oldRows[0];

        const updates = Object.keys(sanitized).map(key => `\`${key}\` = ?`).join(', ');
        const values = Object.values(sanitized);
        await db.query(`UPDATE estudiantes_asignatura SET ${updates} WHERE ID = ?`, [...values, id]);

        const syncResult = await calificacionService.sincronizarCalificacion(id);

        const now = new Date();
        let detalles = `Se actualizó calificación ID=${id}`;
        if (oldData) {
            const cambios = [];
            for (const key of Object.keys(sanitized)) {
                const oldVal = oldData[key] !== undefined && oldData[key] !== null ? String(oldData[key]) : '(vacío)';
                const newVal = sanitized[key] !== null ? String(sanitized[key]) : '(vacío)';
                if (oldVal !== newVal) cambios.push(`${key}: "${oldVal}" → "${newVal}"`);
            }
            if (cambios.length > 0) detalles += '. Cambios: ' + cambios.join('; ');
        }
        detalles += `. Estado calculado: ${syncResult.estado}`;

        await registrarBitacora(
            now.toLocaleTimeString('es-ES'),
            `${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, '0')}/${String(now.getDate()).padStart(2, '0')}`,
            getClientIP(req), req.user.id, 'Modificación', 'Estudiantes Asignatura',
            String(id), detalles
        );

        res.json({ success: true, message: 'Calificación guardada y sincronizada', estado: syncResult.estado });
    } catch (error) {
        console.error('Error al actualizar calificación:', error);
        res.status(500).json({ message: error.message || 'Error al actualizar calificación' });
    }
});

// ============================================================
// ENDPOINTS DE HORARIOS (Fase 2.5)
// ============================================================
router.get('/ofertas/:id/horario', checkJWT, async (req, res) => {
    try {
        const horario = await horarioService.getHorarioByOferta(req.params.id);
        res.json(horario);
    } catch (error) {
        console.error('Error al obtener horario de oferta:', error);
        res.status(500).json({ message: error.message || 'Error al obtener horario' });
    }
});

router.get('/horario/docente/:cedula', checkJWT, async (req, res) => {
    try {
        const { periodo } = req.query;
        const horario = await horarioService.getHorarioByDocente(req.params.cedula, periodo || null);
        res.json(horario);
    } catch (error) {
        console.error('Error al obtener horario del docente:', error);
        res.status(500).json({ message: error.message || 'Error al obtener horario' });
    }
});

// ============================================================
// ENDPOINTS DE REINSCRIPCIÓN COMPLETA (Fase 2.6)
// ============================================================
router.get('/reinscripcion/datos-previos/:cedula', checkJWT, async (req, res) => {
    try {
        const datos = await reinscripcionService.getDatosPrevios(req.params.cedula);
        res.json(datos);
    } catch (error) {
        console.error('Error al obtener datos previos:', error);
        res.status(500).json({ message: error.message || 'Error al obtener datos del estudiante' });
    }
});

router.post('/reinscripcion-completa', checkJWT, reinscripcionCompletaRules, async (req, res) => {
    try {
        const result = await reinscripcionService.reinscripcionCompleta(
            req.body, req.user.id, getClientIP(req)
        );
        res.status(201).json({
            success: true,
            message: `Reinscripción completada. ${result.materiasAsignadas} materia(s) asignada(s).`,
            reinscripcionId: result.reinscripcionId
        });
    } catch (error) {
        console.error('Error en reinscripción completa:', error);
        res.status(500).json({ message: error.message || 'Error al completar reinscripción' });
    }
});

// ============================================================
// ENDPOINTS FINANCIEROS (Fase III - Módulo Inscripciones por Cobrar)
// ============================================================
router.get('/administrativo/inscripciones-pendientes', checkJWT, async (req, res) => {
    try {
        const rows = await db.query(`
            SELECT epa.ID, epa.Cedula_Estudiante, epa.Carrera, epa.Periodo_Academico,
                   epa.Pago, epa.Monto_Pago, epa.Moneda,
                   epa.Modalidad_Pago, epa.Entidad_Bancaria, epa.Numero_Transferencia,
                   epa.Fecha_Pago, epa.Fecha_Registro,
                   CONCAT(e.Nombres, ' ', e.Apellidos) AS Estudiante_Nombre
            FROM estudiante_periodo_academico epa
            LEFT JOIN estudiantes e ON epa.Cedula_Estudiante = e.Cedula
            WHERE epa.Pago IN ('Pendiente', 'Procesando')
              AND epa.activo = 1
            ORDER BY epa.Fecha_Registro DESC
        `);
        res.json(rows);
    } catch (error) {
        console.error('Error al obtener inscripciones pendientes:', error);
        res.status(500).json({ message: 'Error al obtener inscripciones pendientes' });
    }
});

router.post('/administrativo/registrar-pago/:id', checkJWT, async (req, res) => {
    const { id } = req.params;
    const { referencia, metodo_pago, monto_confirmado } = req.body;
    try {
        const oldRows = await db.query(
            'SELECT * FROM estudiante_periodo_academico WHERE ID = ? AND activo = 1',
            [id]
        );
        if (oldRows.length === 0) {
            return res.status(404).json({ message: 'Inscripción no encontrada' });
        }

        await db.query(
            `UPDATE estudiante_periodo_academico
             SET Pago = 'Aprobado',
                 Modalidad_Pago = ?,
                 Numero_Transferencia = ?,
                 Monto_Pago = ?,
                 Fecha_Pago = CURDATE()
             WHERE ID = ?`,
            [metodo_pago || null, referencia || null, monto_confirmado || 0, id]
        );

        const now = new Date();
        await registrarBitacora(
            now.toLocaleTimeString('es-ES'),
            `${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, '0')}/${String(now.getDate()).padStart(2, '0')}`,
            getClientIP(req), req.user.id, 'Aprobar Pago', 'Inscripciones por Cobrar',
            String(id),
            `Pago aprobado para inscripción #${id}. Método: ${metodo_pago || 'N/A'}, Monto: ${monto_confirmado || 0}`
        );

        res.json({ success: true, message: 'Pago aprobado exitosamente' });
    } catch (error) {
        console.error('Error al registrar pago:', error);
        res.status(500).json({ message: 'Error al registrar pago' });
    }
});

// ============================================================
// RETIRO DE MATERIAS (Fase 4.5)
// ============================================================
router.get('/administrativo/buscar-retiro', checkJWT, async (req, res) => {
    try {
        const { cedula, periodo } = req.query;
        if (!cedula) {
            return res.status(400).json({ message: 'Cédula del estudiante es requerida' });
        }

        const estudianteRows = await db.query(
            'SELECT Cedula, Nombres, Apellidos, Carrera FROM estudiantes WHERE Cedula = ? AND activo = 1',
            [cedula]
        );
        if (estudianteRows.length === 0) {
            return res.status(404).json({ message: 'Estudiante no encontrado' });
        }
        const estudiante = estudianteRows[0];

        let inscripcionRows;
        if (periodo) {
            inscripcionRows = await db.query(
                "SELECT ID, Periodo_Academico, Carrera FROM estudiante_periodo_academico WHERE Cedula_Estudiante = ? AND Periodo_Academico = ? AND activo = 1",
                [cedula, periodo]
            );
        } else {
            inscripcionRows = await db.query(
                "SELECT ID, Periodo_Academico, Carrera FROM estudiante_periodo_academico WHERE Cedula_Estudiante = ? AND activo = 1 ORDER BY Periodo_Academico DESC LIMIT 1",
                [cedula]
            );
        }

        if (inscripcionRows.length === 0) {
            return res.status(404).json({ message: 'No se encontró inscripción activa para este período' });
        }
        const inscripcion = inscripcionRows[0];

        const materias = await db.query(
            "SELECT ea.ID, ea.Codigo_Asignatura AS Asignatura, a.Nombre_Asignatura, ea.Seccion, ea.Estado FROM estudiantes_asignatura ea LEFT JOIN asignaturas a ON ea.Codigo_Asignatura = a.Codigo_Asignatura WHERE ea.Estudiante_Cedula = ? AND ea.Periodo_Academico = ? AND ea.activo = 1",
            [cedula, inscripcion.Periodo_Academico]
        );

        res.json({ estudiante, inscripcion, materias });
    } catch (error) {
        console.error('Error en buscar-retiro:', error);
        res.status(500).json({ message: 'Error al buscar datos del estudiante' });
    }
});

router.post('/administrativo/retirar-materia', checkJWT, async (req, res) => {
    try {
        const { cedula_estudiante, id_materia, periodo_academico } = req.body;
        if (!cedula_estudiante || !id_materia) {
            return res.status(400).json({ message: 'Datos incompletos' });
        }

        const result = await db.query(
            "UPDATE estudiantes_asignatura SET Estado = 'Retirada', activo = 0 WHERE ID = ? AND Estudiante_Cedula = ? AND activo = 1",
            [id_materia, cedula_estudiante]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Materia no encontrada o ya fue retirada' });
        }

        await db.query(
            'INSERT INTO bitacora (Hora, Fecha, IP, Usuario_ID, Accion, Modulo, Registro_ID, Detalles) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [new Date().toLocaleTimeString('es-ES'), new Date().toLocaleDateString('es-ES'),
             getClientIP(req), req.user.id, 'Retirar Materia', 'Retiro de Materias',
             String(id_materia), `Materia #${id_materia} retirada del estudiante ${cedula_estudiante}`]
        );

        res.json({ success: true, message: 'Materia retirada exitosamente' });
    } catch (error) {
        console.error('Error en retirar-materia:', error);
        res.status(500).json({ message: 'Error al retirar materia' });
    }
});

router.post('/administrativo/retirar-todas', checkJWT, async (req, res) => {
    try {
        const { cedula_estudiante, periodo_academico } = req.body;
        if (!cedula_estudiante) {
            return res.status(400).json({ message: 'Cédula del estudiante es requerida' });
        }

        let params = [cedula_estudiante];
        let sql = "UPDATE estudiantes_asignatura SET Estado = 'Retirada', activo = 0 WHERE Estudiante_Cedula = ? AND activo = 1 AND Estado != 'Retirada'";
        if (periodo_academico) {
            sql += ' AND Periodo_Academico = ?';
            params.push(periodo_academico);
        }

        const result = await db.query(sql, params);

        await db.query(
            'INSERT INTO bitacora (Hora, Fecha, IP, Usuario_ID, Accion, Modulo, Registro_ID, Detalles) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [new Date().toLocaleTimeString('es-ES'), new Date().toLocaleDateString('es-ES'),
             getClientIP(req), req.user.id, 'Retiro Masivo', 'Retiro de Materias',
             '0', `Retiro masivo: ${result.affectedRows} materias retiradas del estudiante ${cedula_estudiante}`]
        );

        res.json({ success: true, retiradas: result.affectedRows, message: `${result.affectedRows} materia(s) retirada(s) exitosamente` });
    } catch (error) {
        console.error('Error en retirar-todas:', error);
        res.status(500).json({ message: 'Error al retirar materias' });
    }
});

// ============================================================
// ORDEN DE MÉRITO (Fase 4.4)
// ============================================================
router.post('/administrativo/orden-merito', checkJWT, async (req, res) => {
    try {
        const { carrera, pensum, periodo } = req.body;
        if (!carrera || !periodo) {
            return res.status(400).json({ message: 'Carrera y Período son requeridos' });
        }

        const rows = await db.query(`
            SELECT c.Cedula_Estudiante,
                   CONCAT(e.Nombres, ' ', e.Apellidos) AS Estudiante_Nombre,
                   c.Carrera,
                   c.Periodo_Academico,
                   ROUND(AVG(c.Calificacion_Numerica), 2) AS Promedio,
                   COUNT(c.ID) AS Materias_Cursadas
            FROM calificaciones c
            JOIN estudiantes e ON c.Cedula_Estudiante = e.Cedula
            WHERE c.Carrera = ?
              AND c.Periodo_Academico = ?
              AND c.Calificacion_Numerica IS NOT NULL
              AND c.activo = 1
              AND e.activo = 1
            GROUP BY c.Cedula_Estudiante, e.Nombres, e.Apellidos, c.Carrera, c.Periodo_Academico
            ORDER BY Promedio DESC
        `, [carrera, periodo]);

        const ranking = rows.map((r, i) => ({
            posicion: i + 1,
            cedula: r.Cedula_Estudiante,
            nombre: r.Estudiante_Nombre,
            carrera: r.Carrera,
            periodo: r.Periodo_Academico,
            promedio: r.Promedio,
            materias: r.Materias_Cursadas
        }));

        res.json({ ranking, total: ranking.length });
    } catch (error) {
        console.error('Error al generar orden de mérito:', error);
        res.status(500).json({ message: 'Error al generar orden de mérito' });
    }
});

// ============================================================
// ENDPOINT DE DASHBOARD (Fase 4.4)
// ============================================================
router.get('/dashboard', checkJWT, async (req, res) => {
    try {
        const data = await dashboardService.getDashboard();
        res.json(data);
    } catch (error) {
        console.error('Error al obtener dashboard:', error);
        res.status(500).json({ message: error.message || 'Error al cargar indicadores' });
    }
});

router.use('/:table', (req, res, next) => {
    const { table } = req.params;
    const primaryKey = tablePrimaryKeyMap[table];
    if (!primaryKey) {
        return res.status(400).json({ message: 'Tabla desconocida o sin configuración de llave primaria.' });
    }
    req.controller = new GenericController(table, primaryKey);
    next();
});

router.get('/:table', (req, res) => req.controller.getAll(req, res));
router.post('/:table', checkJWT, (req, res) => req.controller.create(req, res));
router.put('/:table/:id', checkJWT, (req, res) => req.controller.update(req, res));
router.delete('/:table/:id', checkJWT, (req, res) => req.controller.delete(req, res));

module.exports = router;
