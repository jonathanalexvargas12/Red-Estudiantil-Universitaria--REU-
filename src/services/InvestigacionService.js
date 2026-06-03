const db = require('../config/db');
const { registrarBitacora } = require('../utils/bitacora');

async function getPeriodoActual() {
    const rows = await db.query("SELECT Periodo_Academico FROM periodo_academico WHERE Estado IN ('Activo', 'activo') AND activo = 1 LIMIT 1");
    if (rows.length > 0) return rows[0].Periodo_Academico;
    const allRows = await db.query("SELECT Periodo_Academico FROM periodo_academico WHERE activo = 1 ORDER BY Periodo_Academico DESC LIMIT 1");
    return allRows[0]?.Periodo_Academico || null;
}

async function aceptarSolicitudInterna(id, userId, clientIP) {
    const solicitudes = await db.query('SELECT * FROM solicitudes_tutor_interno WHERE ID = ? AND activo = 1', [id]);
    if (solicitudes.length === 0) throw new Error('Solicitud no encontrada');
    const s = solicitudes[0];
    if (s.Estado === 'solicitud-aceptada') throw new Error('La solicitud ya fue aceptada');

    await db.query("UPDATE solicitudes_tutor_interno SET Estado = 'solicitud-aceptada' WHERE ID = ?", [id]);

    const periodo = await getPeriodoActual();

    let nombreEstudiante = null;
    if (s.Cedula_Solicitante) {
        const est = await db.query("SELECT CONCAT(Nombres, ' ', Apellidos) AS Nombre FROM estudiantes WHERE Cedula = ? AND activo = 1", [s.Cedula_Solicitante]);
        if (est.length > 0) nombreEstudiante = est[0].Nombre;
    }

    let nombreDocente = null;
    if (s.Cedula_Docente) {
        const doc = await db.query("SELECT CONCAT(Nombres, ' ', Apellidos) AS Nombre FROM docentes WHERE Cedula = ? AND activo = 1", [s.Cedula_Docente]);
        if (doc.length > 0) nombreDocente = doc[0].Nombre;
    }

    let carrera = null;
    if (s.Cedula_Solicitante) {
        const est = await db.query('SELECT Carrera FROM estudiantes WHERE Cedula = ? AND activo = 1', [s.Cedula_Solicitante]);
        if (est.length > 0) carrera = est[0].Carrera;
    }

    const result = await db.query(
        `INSERT INTO trabajo_investigacion
         (Nombre_Investigacion, Carrera, Cedula_Estudiante,
          Tutor_Cedula, Periodo_Academico, Estado, ID_Solicitud)
         VALUES (?, ?, ?, ?, ?, 'en progreso', ?)`,
        [`Tutoría - ${nombreDocente || 'Docente'}`, carrera, s.Cedula_Solicitante,
         s.Cedula_Docente, periodo, id]
    );

    const now = new Date();
    await registrarBitacora(
        now.toLocaleTimeString('es-ES'),
        `${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, '0')}/${String(now.getDate()).padStart(2, '0')}`,
        clientIP, userId, 'Aceptar Solicitud', 'Solicitudes Tutor Interno', String(id),
        `Solicitud #${id} aceptada. Trabajo de investigación #${result.insertId} creado.`
    );

    return { solicitudId: id, investigacionId: Number(result.insertId) };
}

async function aceptarSolicitudExterna(id, userId, clientIP) {
    const solicitudes = await db.query('SELECT * FROM solicitudes_tutor_externo WHERE ID = ? AND activo = 1', [id]);
    if (solicitudes.length === 0) throw new Error('Solicitud no encontrada');
    const s = solicitudes[0];
    if (s.Estado === 'tutor-aprobado') throw new Error('La solicitud ya fue aprobada');

    await db.query("UPDATE solicitudes_tutor_externo SET Estado = 'tutor-aprobado' WHERE ID = ?", [id]);

    const periodo = await getPeriodoActual();

    let nombreEstudiante = null;
    if (s.Cedula_Solicitante) {
        const est = await db.query("SELECT CONCAT(Nombres, ' ', Apellidos) AS Nombre FROM estudiantes WHERE Cedula = ? AND activo = 1", [s.Cedula_Solicitante]);
        if (est.length > 0) nombreEstudiante = est[0].Nombre;
    }

    let nombreTutor = null;
    if (s.Cedula_Tutor) {
        const tutor = await db.query("SELECT CONCAT(Nombres, ' ', Apellidos) AS Nombre FROM tutores_externos WHERE Cedula = ? AND activo = 1", [s.Cedula_Tutor]);
        if (tutor.length > 0) nombreTutor = tutor[0].Nombre;
    }

    let carrera = null;
    if (s.Cedula_Solicitante) {
        const est = await db.query('SELECT Carrera FROM estudiantes WHERE Cedula = ? AND activo = 1', [s.Cedula_Solicitante]);
        if (est.length > 0) carrera = est[0].Carrera;
    }

    const result = await db.query(
        `INSERT INTO trabajo_investigacion
         (Nombre_Investigacion, Carrera, Cedula_Estudiante,
          Area_Interes, Periodo_Academico, Estado, ID_Solicitud)
         VALUES (?, ?, ?, ?, ?, 'en progreso', ?)`,
        [`Tutoría Externa - ${nombreTutor || 'Tutor Externo'}`, carrera,
         s.Cedula_Solicitante,
         nombreTutor ? `Tutor externo: ${nombreTutor} (${s.Cedula_Tutor || ''})` : null,
         periodo, id]
    );

    const now = new Date();
    await registrarBitacora(
        now.toLocaleTimeString('es-ES'),
        `${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, '0')}/${String(now.getDate()).padStart(2, '0')}`,
        clientIP, userId, 'Aprobar Solicitud', 'Solicitudes Tutor Externo', String(id),
        `Solicitud #${id} aprobada. Trabajo de investigación #${result.insertId} creado.`
    );

    return { solicitudId: id, investigacionId: Number(result.insertId) };
}

module.exports = { aceptarSolicitudInterna, aceptarSolicitudExterna, getPeriodoActual };
