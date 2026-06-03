/**
 * Script de migración único: hashea todas las contraseñas en texto plano
 * que existan en la base de datos usando bcrypt.
 *
 * Uso: node scripts/migrar-contrasenas.js
 */
require('dotenv').config();
const bcrypt = require('bcrypt');
const mariadb = require('mariadb');

const pool = mariadb.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'reu_db',
    port: parseInt(process.env.DB_PORT) || 3306,
    connectionLimit: 5
});

async function migrar() {
    let conn;
    try {
        conn = await pool.getConnection();
        const users = await conn.query('SELECT ID_Usuario, Password FROM usuarios');

        let migrados = 0;
        for (const user of users) {
            const pw = user.Password;
            if (pw && !pw.startsWith('$2b$') && !pw.startsWith('$2a$') && !pw.startsWith('$2y$')) {
                const hashed = await bcrypt.hash(pw, 10);
                await conn.query('UPDATE usuarios SET Password = ? WHERE ID_Usuario = ?', [hashed, user.ID_Usuario]);
                migrados++;
                console.log(`  Migrado usuario ID ${user.ID_Usuario}`);
            }
        }

        console.log(`\nMigración completada: ${migrados} contraseñas hasheadas.`);
    } catch (err) {
        console.error('Error durante la migración:', err);
    } finally {
        if (conn) conn.end();
        await pool.end();
    }
}

migrar();
