const pool = require('../config/db'); // Importa la conexión a la base de datos

class GenericController {
    constructor(tableName) {
        this.tableName = tableName; // Nombre de la tabla
    }

    // Obtener todos los registros de la tabla
    async getAll(req, res) {
        try {
            const connection = await pool.getConnection();
            const query = `SELECT * FROM ${this.tableName}`;
            const rows = await connection.query(query);
            connection.release();
            res.status(200).json(rows);
        } catch (error) {
            console.error(`Error al obtener registros de ${this.tableName}:`, error);
            res.status(500).json({ message: `Error al obtener registros de ${this.tableName}` });
        }
    }

    // Agregar un nuevo registro
    async create(req, res) {
        const { body } = req;
        try {
            const connection = await pool.getConnection();

            // Escapar nombres de columnas con caracteres especiales
            const columns = Object.keys(body).map(col => `\`${col}\``).join(', ');
            const values = Object.values(body).map(value => `'${value}'`).join(', ');

            const query = `INSERT INTO ${this.tableName} (${columns}) VALUES (${values})`;
            await connection.query(query);
            connection.release();

            res.status(201).json({ message: 'Registro creado exitosamente' });
        } catch (error) {
            console.error(`Error al crear registro en ${this.tableName}:`, error);
            res.status(500).json({ message: `Error al crear registro en ${this.tableName}` });
        }
    }

    // Actualizar un registro existente
    async update(req, res) {
        const { id } = req.params;
        const { body } = req;
        try {
            const connection = await pool.getConnection();
            const updates = Object.keys(body).map(key => `\`${key}\` = '${body[key]}'`).join(', ');
            const query = `UPDATE ${this.tableName} SET ${updates} WHERE Codigo_Asignatura = '${id}'`;
            await connection.query(query);
            connection.release();
            res.status(200).json({ message: 'Registro actualizado exitosamente' });
        } catch (error) {
            console.error(`Error al actualizar registro en ${this.tableName}:`, error);
            res.status(500).json({ message: `Error al actualizar registro en ${this.tableName}` });
        }
    }

    // Eliminar un registro
    async delete(req, res) {
        const { id } = req.params;
        try {
            const connection = await pool.getConnection();
            const query = `DELETE FROM ${this.tableName} WHERE Codigo_Asignatura = '${id}'`;
            await connection.query(query);
            connection.release();
            res.status(200).json({ message: 'Registro eliminado exitosamente' });
        } catch (error) {
            console.error(`Error al eliminar registro de ${this.tableName}:`, error);
            res.status(500).json({ message: `Error al eliminar registro de ${this.tableName}` });
        }
    }
}

module.exports = GenericController;