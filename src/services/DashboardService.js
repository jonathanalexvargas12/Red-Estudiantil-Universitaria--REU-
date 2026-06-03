const db = require('../config/db');

async function getDashboard() {
    const periodo = await db.query(
        "SELECT Periodo_Academico FROM periodo_academico WHERE Estado = 'cursando' AND activo = 1 ORDER BY Periodo_Academico DESC LIMIT 1"
    );
    const periodoActual = periodo.length > 0 ? periodo[0].Periodo_Academico : null;

    // Total scheduled sessions (horas)
    const horasTotal = await db.query('SELECT COUNT(*) AS cnt FROM horas WHERE activo = 1');
    const totalSesiones = Number(horasTotal[0].cnt);

    // Active docentes from docentes table
    const docAct = await db.query("SELECT COUNT(*) AS cnt FROM docentes WHERE Estado = 'activo' AND activo = 1");
    const docentesActivos = Number(docAct[0].cnt);

    // Active students this period
    let estudiantesPeriodo = 0;
    if (periodoActual) {
        const ep = await db.query(
            "SELECT COUNT(*) AS cnt FROM estudiante_periodo_academico WHERE Periodo_Academico = ? AND Estado = 'activo' AND activo = 1",
            [periodoActual]
        );
        estudiantesPeriodo = Number(ep[0].cnt);
    }

    // All-time active students
    const ea = await db.query("SELECT COUNT(*) AS cnt FROM estudiante_periodo_academico WHERE Estado = 'activo' AND activo = 1");
    const estudiantesActivos = Number(ea[0].cnt);

    // Research projects
    const ti = await db.query('SELECT COUNT(*) AS cnt FROM trabajo_investigacion WHERE activo = 1');
    const trabajosInvestigacion = Number(ti[0].cnt);

    // Pending grades (calificaciones without numeric grade)
    const calif = await db.query(
        'SELECT COUNT(*) AS cnt FROM calificaciones WHERE Calificacion_Numerica IS NULL AND activo = 1'
    );
    const calificacionesPendientes = Number(calif[0].cnt);

    // Total calificaciones
    const califTotal = await db.query('SELECT COUNT(*) AS cnt FROM calificaciones WHERE activo = 1');
    const totalCalificaciones = Number(califTotal[0].cnt);

    // Active course offerings this period
    let ofertasActivas = 0;
    if (periodoActual) {
        const of = await db.query(
            "SELECT COUNT(*) AS cnt FROM docente_asignatura WHERE Periodo_Academico = ? AND Estado = 'activo' AND activo = 1",
            [periodoActual]
        );
        ofertasActivas = Number(of[0].cnt);
    }

    // Students with no career assigned
    const estSinCarrera = await db.query(
        "SELECT COUNT(*) AS cnt FROM estudiantes WHERE (Carrera IS NULL OR Carrera = '') AND activo = 1"
    );
    const estudiantesSinCarrera = Number(estSinCarrera[0].cnt);

    // Students per career (excluding null/empty)
    const estPerCarrera = await db.query(
        "SELECT Carrera, COUNT(*) AS cnt FROM estudiantes WHERE Carrera IS NOT NULL AND Carrera != '' AND activo = 1 GROUP BY Carrera ORDER BY cnt DESC"
    );

    // Total students
    const totalEst = await db.query('SELECT COUNT(*) AS cnt FROM estudiantes WHERE activo = 1');
    const totalEstudiantes = Number(totalEst[0].cnt);

    // Pending payments count (Fase III)
    const pendPago = await db.query(
        "SELECT COUNT(*) AS cnt FROM estudiante_periodo_academico WHERE Pago IN ('Pendiente','Procesando') AND activo = 1"
    );
    const inscripcionesPendientesPago = Number(pendPago[0].cnt);

    return {
        periodoActual,
        totalSesiones,
        docentesActivos,
        estudiantesPeriodo,
        estudiantesActivos,
        trabajosInvestigacion,
        calificacionesPendientes,
        totalCalificaciones,
        ofertasActivas,
        totalEstudiantes,
        estudiantesSinCarrera,
        inscripcionesPendientesPago,
        estudiantesPorCarrera: estPerCarrera.map(r => ({
            carrera: r.Carrera,
            cantidad: Number(r.cnt)
        }))
    };
}

module.exports = { getDashboard };
