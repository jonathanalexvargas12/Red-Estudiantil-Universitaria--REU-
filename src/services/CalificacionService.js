const db = require('../config/db');

function calcularEstado(nota) {
    if (nota === null || nota === undefined || nota === '' || nota === '0') return null;
    const n = parseFloat(nota);
    if (isNaN(n)) return null;
    return n >= 10 ? 'Aprobado' : 'Reprobado';
}

async function sincronizarCalificacion(id) {
    const rows = await db.query('SELECT * FROM estudiantes_asignatura WHERE ID = ? AND activo = 1', [id]);
    if (rows.length === 0) throw new Error('Registro no encontrado en estudiantes_asignatura');
    const ea = rows[0];

    let carrera = null;
    let nombreEstudiante = null;
    if (ea.Estudiante_Cedula) {
        const est = await db.query(
            "SELECT Carrera, CONCAT(Nombres, ' ', Apellidos) AS Nombre FROM estudiantes WHERE Cedula = ? AND activo = 1",
            [ea.Estudiante_Cedula]
        );
        if (est.length > 0) {
            carrera = est[0].Carrera;
            nombreEstudiante = est[0].Nombre;
        }
    }

    const estadoCalculado = calcularEstado(ea.Nota);
    let nuevoEstado = ea.Estado || 'Cargando Notas';
    if (estadoCalculado) nuevoEstado = estadoCalculado;
    else if (!ea.Nota || ea.Nota === '' || ea.Nota === '0') nuevoEstado = 'Cargando Notas';

    if (nuevoEstado !== ea.Estado) {
        await db.query('UPDATE estudiantes_asignatura SET Estado = ? WHERE ID = ?', [nuevoEstado, id]);
    }

    const calRows = await db.query(
        `SELECT ID FROM calificaciones
         WHERE Cedula_Estudiante = ? AND Unidad_Curricular = ?
           AND Periodo_Academico = ? AND Seccion = ?`,
        [ea.Estudiante_Cedula, ea.Asignatura, ea.Periodo_Academico, ea.Seccion]
    );

    if (calRows.length > 0) {
        await db.query(
            `UPDATE calificaciones SET Calificacion_Numerica = ?, Estado = ?, Calificacion_Cualitativa = ? WHERE ID = ?`,
            [ea.Nota, nuevoEstado, estadoCalculado, calRows[0].ID]
        );
    } else {
        await db.query(
            `INSERT INTO calificaciones
             (Cedula_Estudiante, Carrera, Seccion,
              Unidad_Curricular, Periodo_Academico, Calificacion_Numerica,
              Calificacion_Cualitativa, Estado)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [ea.Estudiante_Cedula, carrera, ea.Seccion,
             ea.Asignatura, ea.Periodo_Academico, ea.Nota,
             estadoCalculado, nuevoEstado]
        );
    }

    return { estado: nuevoEstado, nota: ea.Nota };
}

module.exports = { sincronizarCalificacion, calcularEstado };
