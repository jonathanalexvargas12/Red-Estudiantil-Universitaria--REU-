const mariadb = require('mariadb');

const pool = mariadb.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'babaire2026*',
    database: process.env.DB_NAME || 'reu_db',
    port: parseInt(process.env.DB_PORT) || 3306,
    connectionLimit: 5
});

module.exports = pool;