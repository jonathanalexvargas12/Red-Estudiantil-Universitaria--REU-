const db = require('../config/db');

async function getHorarioByOferta(ofertaId) {
    const oferta = await db.query('SELECT * FROM docente_asignatura WHERE ID = ? AND activo = 1', [ofertaId]);
    if (oferta.length === 0) throw new Error('Oferta no encontrada');
    const o = oferta[0];

    return await db.query(
        `SELECT h.*,
                CONCAT(d.Nombres, ' ', d.Apellidos) AS Docente_Nombre
         FROM horas h
         LEFT JOIN docentes d ON h.Docente_Cedula = d.Cedula
         WHERE h.Docente_Cedula = ?
           AND h.Asignatura = ?
           AND h.Seccion = ?
           AND h.Periodo_Academico = ?
           AND h.activo = 1
         ORDER BY h.Desde`,
        [o.Docente_Cedula, o.Asignatura, o.Seccion, o.Periodo_Academico]
    );
}

async function getHorarioByDocente(docenteCedula, periodo) {
    let query = `SELECT h.*,
                        CONCAT(d.Nombres, ' ', d.Apellidos) AS Docente_Nombre,
                        CONCAT(d.Nombres, ' ', d.Apellidos) AS Docente_Nombre_Completo
                 FROM horas h
                 LEFT JOIN docentes d ON h.Docente_Cedula = d.Cedula
                 WHERE h.Docente_Cedula = ?
                   AND h.activo = 1`;
    const params = [docenteCedula];

    if (periodo) {
        query += ' AND h.Periodo_Academico = ?';
        params.push(periodo);
    }

    query += ' ORDER BY h.Dias, h.Desde';
    return await db.query(query, params);
}

module.exports = { getHorarioByOferta, getHorarioByDocente };
