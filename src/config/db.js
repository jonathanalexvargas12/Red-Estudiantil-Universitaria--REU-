//Este módulo se encarga de la conexión a la base de datos.

const mariadb = require('mariadb');

// Configuración de la conexión a MariaDB
const pool = mariadb.createPool({
    host: 'localhost', // Cambia si tu base de datos está en otro servidor
    user: 'root', // Cambia por tu usuario de MariaDB
    password: '', // Cambia por tu contraseña de MariaDB
    database: 'reu_db', // Cambia por el nombre de tu base de datos
    connectionLimit: 5
});

module.exports = pool;