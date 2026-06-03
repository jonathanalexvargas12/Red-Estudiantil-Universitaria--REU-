const pool = require('../config/db');
const { registrarBitacora, getClientIP } = require('../utils/bitacora');

function capitalizeModule(name) {
    return name.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
}

const DENORMALIZED_COLUMNS = {
    horas: ['Docente'],
    calificaciones: ['Nombre_Estudiante', 'Nombre_Docente'],
    docente_asignatura: ['Docente_Nombre'],
    estudiantes_asignatura: ['Estudiante_Nombre'],
    trabajo_investigacion: ['Nombre_Estudiante', 'Tutor_Nombre'],
    solicitudes_tutor_interno: ['Nombre_Docente', 'Nombre_Estudiante'],
    solicitudes_tutor_externo: ['Nombre_Tutor', 'Nombre_Estudiante']
};

class GenericController {
    constructor(tableName, primaryKey) {
        this.tableName = tableName;
        this.primaryKey = primaryKey;
        this.moduleName = capitalizeModule(tableName);
        this.denormalizedCols = DENORMALIZED_COLUMNS[tableName] || [];
    }

    stripDenormalized(obj) {
        for (const col of this.denormalizedCols) {
            delete obj[col];
        }
        return obj;
    }

    async getAll(req, res) {
        try {
            const connection = await pool.getConnection();
            let query;
            if (this.tableName === 'docentes') {
                query = `SELECT d.*, u.Telefono_1, u.Telefono_2, u.Correo, u.Codigo_Carnet
                FROM docentes d
                LEFT JOIN usuarios u ON d.Cedula = u.Cedula
                WHERE d.activo = 1`;
            } else if (this.tableName === 'estudiantes') {
                query = `SELECT e.Cedula, e.Usuario, e.Nombres, e.Apellidos, e.Carrera, e.Estado_Pensum, e.Estado, e.Fecha_Registro, u.Telefono_1, u.Telefono_2, u.Correo, u.Codigo_Carnet
                FROM estudiantes e
                LEFT JOIN usuarios u ON e.Usuario = u.ID_Usuario
                WHERE e.activo = 1`;
            } else if (this.tableName === 'horas') {
                query = `SELECT h.ID, h.Desde, h.Hasta, h.Dias, h.Turno, h.Carrera, h.Pensum, h.Periodo_Academico, h.Seccion, h.Nivel, h.Asignatura, h.Docente_Cedula,
                    CONCAT(d.Nombres, ' ', d.Apellidos) AS Docente,
                    CONCAT(d.Nombres, ' ', d.Apellidos) AS Docente_Nombre_Completo
                FROM horas h
                LEFT JOIN docentes d ON h.Docente_Cedula = d.Cedula
                WHERE h.activo = 1`;
            } else if (this.tableName === 'trabajo_investigacion') {
                query = `SELECT t.ID, t.Nombre_Investigacion, t.Carrera, t.Cedula_Estudiante, t.Tutor_Cedula, t.Area_Interes, t.Periodo_Academico, t.ID_Solicitud,
                    CONCAT(e.Nombres, ' ', e.Apellidos) AS Nombre_Estudiante,
                    CONCAT(d.Nombres, ' ', d.Apellidos) AS Tutor_Nombre
                FROM trabajo_investigacion t
                LEFT JOIN estudiantes e ON t.Cedula_Estudiante = e.Cedula
                LEFT JOIN docentes d ON t.Tutor_Cedula = d.Cedula
                WHERE t.activo = 1`;
            } else if (this.tableName === 'calificaciones') {
                query = `SELECT c.ID, c.Cedula_Estudiante, c.Carrera, c.Trayecto, c.\`Sem/Trim\`, c.Seccion, c.Unidad_Curricular, c.Cedula_Docente, c.Estado, c.Calificacion_Numerica, c.Calificacion_Cualitativa, c.Periodo_Academico,
                    CONCAT(e.Nombres, ' ', e.Apellidos) AS Nombre_Estudiante,
                    CONCAT(d.Nombres, ' ', d.Apellidos) AS Nombre_Docente
                FROM calificaciones c
                LEFT JOIN estudiantes e ON c.Cedula_Estudiante = e.Cedula
                LEFT JOIN docentes d ON c.Cedula_Docente = d.Cedula
                WHERE c.activo = 1`;
            } else if (this.tableName === 'docente_asignatura') {
                query = `SELECT da.ID, da.Docente_Cedula, da.Asignatura, da.Carrera, da.Trayecto, da.\`Sem/Trim\`, da.Seccion, da.Clases_Semana, da.Estado, da.Periodo_Academico,
                    a.Nombre_Asignatura,
                    CONCAT(d.Nombres, ' ', d.Apellidos) AS Docente_Nombre
                FROM docente_asignatura da
                LEFT JOIN docentes d ON da.Docente_Cedula = d.Cedula
                LEFT JOIN asignaturas a ON da.Asignatura = a.Codigo_Asignatura
                WHERE da.activo = 1`;
            } else if (this.tableName === 'estudiantes_asignatura') {
                query = `SELECT ea.ID, ea.Estudiante_Cedula, ea.Asignatura, ea.Seccion,
                    ea.Periodo_Academico, ea.Estado, ea.Nota, ea.Nota_Definitiva,
                    CONCAT(e.Nombres, ' ', e.Apellidos) AS Estudiante_Nombre,
                    a.Nombre_Asignatura
                FROM estudiantes_asignatura ea
                LEFT JOIN estudiantes e ON ea.Estudiante_Cedula = e.Cedula
                LEFT JOIN asignaturas a ON ea.Asignatura = a.Codigo_Asignatura
                WHERE ea.activo = 1`;
            } else if (this.tableName === 'estudiante_periodo_academico') {
                query = `SELECT epa.*,
                    CONCAT(e.Nombres, ' ', e.Apellidos) AS Estudiante_Nombre_Completo
                FROM estudiante_periodo_academico epa
                LEFT JOIN estudiantes e ON epa.Cedula_Estudiante = e.Cedula
                WHERE epa.activo = 1`;
            } else if (this.tableName === 'solicitudes_tutor_interno') {
                query = `SELECT s.ID, s.Cedula_Docente, s.Cedula_Solicitante, s.Estado, s.Fecha_Solicitud,
                    CONCAT(d.Nombres, ' ', d.Apellidos) AS Nombre_Docente,
                    CONCAT(e.Nombres, ' ', e.Apellidos) AS Nombre_Estudiante
                FROM solicitudes_tutor_interno s
                LEFT JOIN docentes d ON s.Cedula_Docente = d.Cedula
                LEFT JOIN estudiantes e ON s.Cedula_Solicitante = e.Cedula
                WHERE s.activo = 1`;
            } else if (this.tableName === 'solicitudes_tutor_externo') {
                query = `SELECT s.ID, s.Cedula_Tutor, s.Cedula_Solicitante, s.Estado, s.Fecha_Solicitud,
                    CONCAT(t.Nombres, ' ', t.Apellidos) AS Nombre_Tutor,
                    CONCAT(e.Nombres, ' ', e.Apellidos) AS Nombre_Estudiante
                FROM solicitudes_tutor_externo s
                LEFT JOIN tutores_externos t ON s.Cedula_Tutor = t.Cedula
                LEFT JOIN estudiantes e ON s.Cedula_Solicitante = e.Cedula
                WHERE s.activo = 1`;
            } else if (this.tableName === 'reinscripciones') {
                query = `SELECT r.*,
                    CONCAT(e.Nombres, ' ', e.Apellidos) AS Estudiante_Nombre
                FROM reinscripciones r
                LEFT JOIN estudiantes e ON r.Cedula_Estudiante = e.Cedula
                WHERE r.activo = 1`;
            } else {
                query = `SELECT * FROM ${this.tableName} WHERE activo = 1`;
            }
            const rows = await connection.query(query);
            connection.release();
            res.status(200).json(rows);
        } catch (error) {
            console.error(`Error al obtener registros de ${this.tableName}:`, error);
            res.status(500).json({ message: `Error al obtener registros de ${this.tableName}` });
        }
    }

    async create(req, res) {
        const { body } = req;
        const sanitized = {};
        for (const [key, value] of Object.entries(body)) {
            sanitized[key] = value === '' ? null : value;
        }
        try {
            const connection = await pool.getConnection();

            this.stripDenormalized(sanitized);
            if (this.tableName !== 'bitacora') {
                sanitized.activo = 1;
            }

            const columns = Object.keys(sanitized).map(col => `\`${col}\``).join(', ');
            const placeholders = Object.keys(sanitized).map(() => '?').join(', ');
            const values = Object.values(sanitized);

            const query = `INSERT INTO ${this.tableName} (${columns}) VALUES (${placeholders})`;
            const result = await connection.query(query, values);
            connection.release();

            const now = new Date();
            const pkValue = sanitized[this.primaryKey] || result.insertId;
            const detalles = `Se creó un registro en ${this.moduleName} con ${this.primaryKey}=${pkValue}`;

            if (this.tableName !== 'bitacora') {
                await registrarBitacora(
                    now.toLocaleTimeString('es-ES'),
                    `${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, '0')}/${String(now.getDate()).padStart(2, '0')}`,
                    getClientIP(req),
                    req.user?.id || 'Sistema',
                    'Creación',
                    this.moduleName,
                    String(pkValue),
                    detalles
                );
            }

            res.status(201).json({ message: 'Registro creado exitosamente' });
        } catch (error) {
            console.error(`Error al crear registro en ${this.tableName}:`, error);
            res.status(500).json({ message: `Error al crear registro en ${this.tableName}` });
        }
    }

    async update(req, res) {
        const { id } = req.params;
        const { body } = req;
        const sanitized = {};
        for (const [key, value] of Object.entries(body)) {
            sanitized[key] = value === '' ? null : value;
        }
        try {
            const connection = await pool.getConnection();

            this.stripDenormalized(sanitized);

            let oldData = null;
            const oldQuery = `SELECT * FROM ${this.tableName} WHERE \`${this.primaryKey}\` = ?`;
            const oldRows = await connection.query(oldQuery, [id]);
            oldData = oldRows[0] || null;

            const updates = Object.keys(sanitized).map(key => `\`${key}\` = ?`).join(', ');
            const values = Object.values(sanitized);

            const query = `UPDATE ${this.tableName} SET ${updates} WHERE \`${this.primaryKey}\` = ?`;
            await connection.query(query, [...values, id]);
            connection.release();

            const now = new Date();
            let detalles = `Se actualizó el registro ${this.primaryKey}=${id} en ${this.moduleName}`;

            if (oldData) {
                const cambios = [];
                for (const key of Object.keys(sanitized)) {
                    const oldVal = oldData[key] !== undefined && oldData[key] !== null ? String(oldData[key]) : '(vacío)';
                    const newVal = sanitized[key] !== null ? String(sanitized[key]) : '(vacío)';
                    if (oldVal !== newVal) {
                        cambios.push(`${key}: "${oldVal}" → "${newVal}"`);
                    }
                }
                if (cambios.length > 0) {
                    detalles += '. Cambios: ' + cambios.join('; ');
                }
            }

            if (this.tableName !== 'bitacora') {
                await registrarBitacora(
                    now.toLocaleTimeString('es-ES'),
                    `${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, '0')}/${String(now.getDate()).padStart(2, '0')}`,
                    getClientIP(req),
                    req.user?.id || 'Sistema',
                    'Modificación',
                    this.moduleName,
                    String(id),
                    detalles
                );
            }

            res.status(200).json({ message: 'Registro actualizado exitosamente' });
        } catch (error) {
            console.error(`Error al actualizar registro en ${this.tableName}:`, error);
            res.status(500).json({ message: `Error al actualizar registro en ${this.tableName}` });
        }
    }

    async delete(req, res) {
        const { id } = req.params;
        try {
            const connection = await pool.getConnection();

            const oldQuery = `SELECT * FROM ${this.tableName} WHERE \`${this.primaryKey}\` = ?`;
            const oldRows = await connection.query(oldQuery, [id]);
            const oldData = oldRows[0] || null;

            if (this.tableName !== 'bitacora') {
                const query = `UPDATE ${this.tableName} SET activo = 0 WHERE \`${this.primaryKey}\` = ?`;
                await connection.query(query, [id]);
            } else {
                const query = `DELETE FROM ${this.tableName} WHERE \`${this.primaryKey}\` = ?`;
                await connection.query(query, [id]);
            }
            connection.release();

            const now = new Date();
            let detalles = `Se eliminó el registro ${this.primaryKey}=${id} de ${this.moduleName}`;
            if (oldData) {
                const valores = Object.entries(oldData)
                    .filter(([k]) => k !== this.primaryKey)
                    .map(([k, v]) => `${k}=${v !== null && v !== undefined ? v : '(vacío)'}`)
                    .slice(0, 5)
                    .join('; ');
                if (valores) detalles += `. Datos: ${valores}`;
            }

            if (this.tableName !== 'bitacora') {
                await registrarBitacora(
                    now.toLocaleTimeString('es-ES'),
                    `${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, '0')}/${String(now.getDate()).padStart(2, '0')}`,
                    getClientIP(req),
                    req.user?.id || 'Sistema',
                    'Eliminación',
                    this.moduleName,
                    String(id),
                    detalles
                );
            }

            res.status(200).json({ message: 'Registro eliminado exitosamente' });
        } catch (error) {
            console.error(`Error al eliminar registro de ${this.tableName}:`, error);
            res.status(500).json({ message: `Error al eliminar registro de ${this.tableName}` });
        }
    }
}

module.exports = GenericController;
