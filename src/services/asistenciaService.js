const db = require('../config/db');

class AsistenciaService {

    async getHorarioDocente(docenteCedula) {
        const rows = await db.query(`
            SELECT h.*,
                CONCAT(d.Nombres, ' ', d.Apellidos) AS Docente_Nombre,
                a.Nombre_Asignatura
            FROM horas h
            LEFT JOIN docentes d ON h.Docente_Cedula = d.Cedula
            LEFT JOIN asignaturas a ON h.Asignatura = a.Codigo_Asignatura
            WHERE h.Docente_Cedula = ?
            AND h.activo = 1
            ORDER BY h.Desde
        `, [docenteCedula]);
        return rows;
    }

    async getHorarioDelDia(docenteCedula, fecha) {
        const diasSemana = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
        const diaNombre = diasSemana[fecha.getDay()];

        const rows = await db.query(`
            SELECT h.*,
                CONCAT(d.Nombres, ' ', d.Apellidos) AS Docente_Nombre,
                a.Nombre_Asignatura
            FROM horas h
            LEFT JOIN docentes d ON h.Docente_Cedula = d.Cedula
            LEFT JOIN asignaturas a ON h.Asignatura = a.Codigo_Asignatura
            WHERE h.Docente_Cedula = ?
            AND h.activo = 1
            AND (FIND_IN_SET(?, h.Dias) > 0 OR h.Dias IS NULL)
            ORDER BY h.Desde
        `, [docenteCedula, diaNombre]);
        return rows;
    }

    async marcarAsistencia(data) {
        const { Docente_Cedula, Periodo_Academico, Asignatura, Seccion, Fecha, Hora_Inicio, Hora_Fin, Estado, Observacion } = data;

        if (!Docente_Cedula || !Periodo_Academico || !Asignatura || !Seccion || !Fecha || !Hora_Inicio || !Hora_Fin) {
            throw new Error('Campos requeridos faltantes');
        }

        const result = await db.query(
            `INSERT INTO asistencia_docente 
            (Docente_Cedula, Periodo_Academico, Asignatura, Seccion, Fecha, Hora_Inicio, Hora_Fin, Estado, Observacion)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [Docente_Cedula, Periodo_Academico, Asignatura, Seccion, Fecha, Hora_Inicio, Hora_Fin, Estado || 'impartida', Observacion || null]
        );

        return { id: result.insertId };
    }

    async marcarAsistenciaPorHorario(docenteCedula, horarioDesde, fecha) {
        const horarios = await db.query(
            'SELECT * FROM horas WHERE Docente_Cedula = ? AND Desde = ? AND activo = 1 LIMIT 1',
            [docenteCedula, horarioDesde]
        );

        if (horarios.length === 0) {
            throw new Error('Horario no encontrado');
        }

        const h = horarios[0];

        const existente = await db.query(
            'SELECT ID FROM asistencia_docente WHERE Docente_Cedula = ? AND Fecha = ? AND Hora_Inicio = ? AND activo = 1',
            [docenteCedula, fecha, h.Desde]
        );

        if (existente.length > 0) {
            throw new Error('Ya existe una asistencia registrada para esta clase');
        }

        return this.marcarAsistencia({
            Docente_Cedula: h.Docente_Cedula || docenteCedula,
            Periodo_Academico: h.Periodo_Academico,
            Asignatura: h.Asignatura,
            Seccion: h.Seccion,
            Fecha: fecha,
            Hora_Inicio: h.Desde,
            Hora_Fin: h.Hasta,
            Estado: 'impartida'
        });
    }

    async getReporteHorasImpartidas(filtros = {}) {
        let query = `
            SELECT 
                a.Docente_Cedula,
                CONCAT(d.Nombres, ' ', d.Apellidos) AS Docente_Nombre,
                a.Periodo_Academico,
                a.Asignatura,
                a.Seccion,
                COUNT(*) AS Num_Clases,
                SEC_TO_TIME(SUM(TIME_TO_SEC(TIMEDIFF(a.Hora_Fin, a.Hora_Inicio)))) AS Horas_Totales,
                ROUND(SUM(TIME_TO_SEC(TIMEDIFF(a.Hora_Fin, a.Hora_Inicio))) / 3600, 2) AS Horas_Decimal
            FROM asistencia_docente a
            LEFT JOIN docentes d ON a.Docente_Cedula = d.Cedula
            WHERE a.activo = 1
        `;
        const params = [];

        if (filtros.docente_cedula) {
            query += ' AND a.Docente_Cedula = ?';
            params.push(filtros.docente_cedula);
        }
        if (filtros.periodo) {
            query += ' AND a.Periodo_Academico = ?';
            params.push(filtros.periodo);
        }
        if (filtros.asignatura) {
            query += ' AND a.Asignatura = ?';
            params.push(filtros.asignatura);
        }
        if (filtros.seccion) {
            query += ' AND a.Seccion = ?';
            params.push(filtros.seccion);
        }
        if (filtros.desde) {
            query += ' AND a.Fecha >= ?';
            params.push(filtros.desde);
        }
        if (filtros.hasta) {
            query += ' AND a.Fecha <= ?';
            params.push(filtros.hasta);
        }

        query += ' GROUP BY a.Docente_Cedula, a.Periodo_Academico, a.Asignatura, a.Seccion';
        query += ' ORDER BY Docente_Nombre, a.Periodo_Academico';

        const rows = await db.query(query, params);
        return rows;
    }

    async verificarAsistencia(docenteCedula, fecha, horaInicio) {
        const rows = await db.query(
            'SELECT * FROM asistencia_docente WHERE Docente_Cedula = ? AND Fecha = ? AND Hora_Inicio = ? AND activo = 1',
            [docenteCedula, fecha, horaInicio]
        );
        return rows.length > 0;
    }

    async eliminarAsistencia(id) {
        await db.query('UPDATE asistencia_docente SET activo = 0 WHERE ID = ?', [id]);
    }
}

module.exports = new AsistenciaService();
