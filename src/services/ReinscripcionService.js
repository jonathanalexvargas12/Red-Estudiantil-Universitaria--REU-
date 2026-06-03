const db = require('../config/db');
const { registrarBitacora } = require('../utils/bitacora');

async function getDatosPrevios(cedula) {
    const estRows = await db.query('SELECT Carrera, Nivel_Pensum FROM estudiantes WHERE Cedula = ? AND activo = 1', [cedula]);
    if (estRows.length === 0) throw new Error('Estudiante no encontrado');
    const est = estRows[0];

    const niveles = await db.query('SELECT Nombre_Nivel FROM nivel_pensum WHERE activo = 1 ORDER BY Orden_Nivel');
    let siguienteNivel = null;
    if (est.Nivel_Pensum) {
        const idx = niveles.findIndex(n => n.Nombre_Nivel === est.Nivel_Pensum);
        if (idx >= 0 && idx < niveles.length - 1) {
            siguienteNivel = niveles[idx + 1].Nombre_Nivel;
        }
    }
    if (!siguienteNivel) {
        siguienteNivel = est.Nivel_Pensum || (niveles.length > 0 ? niveles[0].Nombre_Nivel : null);
    }

    return {
        Carrera: est.Carrera,
        Nivel_Pensum_Actual: est.Nivel_Pensum,
        Nivel_Pensum_Sugerido: siguienteNivel
    };
}

async function reinscripcionCompleta(data, userId, clientIP) {
    const { Cedula_Estudiante, Carrera, Periodo_Academico, Nivel_Pensum, Turno, Materias } = data;

    if (!Cedula_Estudiante || !Carrera || !Periodo_Academico || !Nivel_Pensum || !Turno) {
        throw new Error('Todos los campos son requeridos');
    }

    const valEst = await db.query('SELECT 1 FROM estudiantes WHERE Cedula = ? AND activo = 1', [Cedula_Estudiante]);
    if (valEst.length === 0) throw new Error('El estudiante no existe');

    const valCarr = await db.query('SELECT 1 FROM carreras WHERE Codigo_Carrera = ? AND activo = 1', [Carrera]);
    if (valCarr.length === 0) throw new Error('La carrera no existe');

    const valPer = await db.query('SELECT 1 FROM periodo_academico WHERE Periodo_Academico = ? AND activo = 1', [Periodo_Academico]);
    if (valPer.length === 0) throw new Error('El período académico no existe');

    const valNiv = await db.query('SELECT 1 FROM nivel_pensum WHERE Nombre_Nivel = ? AND activo = 1', [Nivel_Pensum]);
    if (valNiv.length === 0) throw new Error('El nivel de pensum no existe');

    // 1. Create reinscripcion record
    const reinsResult = await db.query(
        'INSERT INTO reinscripciones (Cedula_Estudiante, Carrera, Periodo_Academico, Nivel_Pensum, Turno) VALUES (?, ?, ?, ?, ?)',
        [Cedula_Estudiante, Carrera, Periodo_Academico, Nivel_Pensum, Turno]
    );

    // 2. Update student's nivel
    await db.query('UPDATE estudiantes SET Nivel_Pensum = ? WHERE Cedula = ?', [Nivel_Pensum, Cedula_Estudiante]);

    // 3. Create estudiante_periodo_academico
    await db.query(
        `INSERT INTO estudiante_periodo_academico
         (Cedula_Estudiante, Carrera, Periodo_Academico, Nivel_Pensum, Turno,
          Estado, Pago, Monto_Pago, Moneda, Modalidad_Pago,
          Entidad_Bancaria, Numero_Transferencia, Fecha_Pago)
         VALUES (?, ?, ?, ?, ?,
                'activo', 'pendiente', 0, 'Bs.', NULL,
                NULL, 0, NULL)`,
        [Cedula_Estudiante, Carrera, Periodo_Academico, Nivel_Pensum, Turno]
    );

    // 4. Create estudiantes_asignatura for selected materias
    let materiasAsignadas = 0;
    if (Materias && Materias.length > 0) {
        for (const materiaId of Materias) {
            const oferta = await db.query('SELECT * FROM docente_asignatura WHERE ID = ? AND activo = 1', [materiaId]);
            if (oferta.length === 0) continue;
            const o = oferta[0];
            await db.query(
                `INSERT INTO estudiantes_asignatura
                 (Estudiante_Cedula, Asignatura, Seccion,
                  Periodo_Academico, Estado)
                 VALUES (?, ?, ?, ?, 'Cargando Notas')`,
                [Cedula_Estudiante, o.Asignatura, o.Seccion, Periodo_Academico]
            );
            materiasAsignadas++;
        }
    }

    const now = new Date();
    await registrarBitacora(
        now.toLocaleTimeString('es-ES'),
        `${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, '0')}/${String(now.getDate()).padStart(2, '0')}`,
        clientIP, userId, 'Reinscripción Completa', 'Reinscripciones',
        String(reinsResult.insertId),
        `Reinscripción para ${Cedula_Estudiante} en ${Periodo_Academico}. Nivel: ${Nivel_Pensum}. ${materiasAsignadas} materia(s) asignada(s).`
    );

    return { reinscripcionId: Number(reinsResult.insertId), materiasAsignadas };
}

module.exports = { getDatosPrevios, reinscripcionCompleta };
