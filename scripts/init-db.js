const mariadb = require('mariadb');
require('dotenv').config();

async function init() {
    const pool = mariadb.createPool({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'reu_db',
        port: parseInt(process.env.DB_PORT) || 3306,
        connectionLimit: 1
    });

    let conn;
    try {
        conn = await pool.getConnection();

        await conn.query(`
            CREATE TABLE IF NOT EXISTS bitacora (
                ID INT AUTO_INCREMENT PRIMARY KEY,
                Hora VARCHAR(10) NOT NULL,
                Fecha VARCHAR(10) NOT NULL,
                IP VARCHAR(45) NOT NULL,
                Usuario_ID VARCHAR(50) NOT NULL,
                Accion VARCHAR(255) NOT NULL,
                Modulo VARCHAR(100) DEFAULT NULL,
                Registro_ID VARCHAR(50) DEFAULT NULL,
                Detalles TEXT DEFAULT NULL
            )
        `);
        console.log('Tabla bitacora creada/verificada exitosamente.');

        const addColumnIfNotExists = async (table, column, definition) => {
            try {
                await conn.query(`ALTER TABLE ${table} ADD COLUMN ${definition}`);
                console.log(`Columna ${column} agregada a ${table}.`);
            } catch (e) {
                if (e.code === 'ER_DUP_FIELDNAME' || e.code === 'ER_DUP_FIELD_NAME') {
                    console.log(`La columna ${column} ya existe en ${table}.`);
                } else {
                    throw e;
                }
            }
        };

        await addColumnIfNotExists('bitacora', 'Modulo', 'Modulo VARCHAR(100) DEFAULT NULL');
        await addColumnIfNotExists('bitacora', 'Registro_ID', 'Registro_ID VARCHAR(50) DEFAULT NULL');
        await addColumnIfNotExists('bitacora', 'Detalles', 'Detalles TEXT DEFAULT NULL');
        console.log('Columnas adicionales de bitacora verificadas.');

        try {
            await conn.query("ALTER TABLE aulas MODIFY COLUMN Nombre_Aula VARCHAR(100) NOT NULL");
            console.log('Columna Nombre_Aula ampliada a VARCHAR(100).');
        } catch (e) {
            console.log('No se pudo ampliar Nombre_Aula:', e.message);
        }

        try {
            await conn.query(`ALTER TABLE docentes ADD COLUMN Estado VARCHAR(20) DEFAULT 'Habilitado'`);
            console.log('Columna Estado agregada a docentes.');
        } catch (e) {
            if (e.code === 'ER_DUP_FIELDNAME' || e.code === 'ER_DUP_FIELD_NAME') {
                console.log('La columna Estado ya existe en docentes.');
            } else {
                throw e;
            }
        }

        console.log('Migración completada exitosamente.');
    } catch (error) {
        console.error('Error durante la migración:', error);
    } finally {
        if (conn) conn.release();
        await pool.end();
    }
}

init();
