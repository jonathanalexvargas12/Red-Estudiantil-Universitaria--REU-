const db = require('../config/db');
const { registrarBitacora } = require('../utils/bitacora');

async function getMateriasDisponibles(carrera, periodo) {
    const rows = await db.query(
        `SELECT da.ID, da.Asignatura, a.Nombre_Asignatura, da.Docente_Cedula,
                CONCAT(d.Nombres, ' ', d.Apellidos) AS Docente_Nombre,
                da.Seccion, da.Num_Alumnos, da.Clases_Semana,
                da.Trayecto, da.Pensum, da.Nivel_Pensum
         FROM docente_asignatura da
         LEFT JOIN asignaturas a ON da.Asignatura = a.Codigo_Asignatura
         LEFT JOIN docentes d ON da.Docente_Cedula = d.Cedula
         WHERE da.Carrera = ?
           AND (da.Periodo_Academico = ? OR ? IS NULL)
           AND (da.Estado = 'correcta' OR da.Estado IS NULL OR da.Estado = '')`,
        [carrera, periodo, periodo]
    );
    return rows;
}

async function getNombreEstudiante(cedula) {
    const rows = await db.query(
        "SELECT CONCAT(Nombres, ' ', Apellidos) AS Nombre FROM estudiantes WHERE Cedula = ?",
        [cedula]
    );
    return rows.length > 0 ? rows[0].Nombre : null;
}

async function inscripcionCompleta(data, userId, clientIP) {
    const { Cedula_Estudiante, Carrera, Periodo_Academico, Nivel_Pensum, Turno,
            Estado, Pago, Monto_Pago, Moneda, Modalidad_Pago,
            Entidad_Bancaria, Numero_Transferencia, Fecha_Pago, Materias } = data;

    if (!Cedula_Estudiante || !Carrera || !Periodo_Academico) {
        throw new Error('Cédula, Carrera y Período son requeridos');
    }

    const est = await db.query('SELECT 1 FROM estudiantes WHERE Cedula = ? AND activo = 1', [Cedula_Estudiante]);
    if (est.length === 0) throw new Error('El estudiante no existe');

    const per = await db.query('SELECT 1 FROM periodo_academico WHERE Periodo_Academico = ? AND activo = 1', [Periodo_Academico]);
    if (per.length === 0) throw new Error('El período académico no existe');

    const inscResult = await db.query(
        `INSERT INTO estudiante_periodo_academico
         (Cedula_Estudiante, Carrera, Periodo_Academico, Nivel_Pensum, Turno,
          Estado, Pago, Monto_Pago, Moneda, Modalidad_Pago,
          Entidad_Bancaria, Numero_Transferencia, Fecha_Pago)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [Cedula_Estudiante, Carrera, Periodo_Academico, Nivel_Pensum || null, Turno || null,
         Estado || 'activo', Pago || 'pendiente', Monto_Pago || 0, Moneda || 'Bs',
         Modalidad_Pago || null, Entidad_Bancaria || null, Numero_Transferencia || null,
         Fecha_Pago || null]
    );
    const inscId = Number(inscResult.insertId);

    const materiasCreadas = [];
    if (Materias && Materias.length > 0) {
        for (const materiaId of Materias) {
            const oferta = await db.query('SELECT * FROM docente_asignatura WHERE ID = ? AND activo = 1', [materiaId]);
            if (oferta.length === 0) {
                throw new Error(`La oferta con ID ${materiaId} no existe`);
            }
            const o = oferta[0];
            await db.query(
                `INSERT INTO estudiantes_asignatura
                 (Estudiante_Cedula, Asignatura, Seccion,
                  Periodo_Academico, Estado)
                 VALUES (?, ?, ?, ?, 'Cargando Notas')`,
                [Cedula_Estudiante, o.Asignatura, o.Seccion, Periodo_Academico]
            );
            materiasCreadas.push(o.Asignatura);
        }
    }

    const now = new Date();
    await registrarBitacora(
        now.toLocaleTimeString('es-ES'),
        `${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, '0')}/${String(now.getDate()).padStart(2, '0')}`,
        clientIP, userId, 'Inscripción Completa', 'Inscripciones',
        String(inscId),
        `Inscripción para ${Cedula_Estudiante} en ${Periodo_Academico}. ${materiasCreadas.length} materia(s) asignada(s).`
    );

    return { inscripcionId: inscId, materiasAsignadas: materiasCreadas.length };
}

module.exports = { getMateriasDisponibles, inscripcionCompleta };
