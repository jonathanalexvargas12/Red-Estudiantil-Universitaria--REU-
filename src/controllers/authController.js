//Este módulo maneja la lógica del login.

const pool = require('../config/db');
const generateJWT = require('../utils/generateJWT');

const login = async (req, res) => {
    const { email, password } = req.body;

    let conn;
    try {
        conn = await pool.getConnection();
        const rows = await conn.query('SELECT * FROM usuarios WHERE Correo = ?', [email]);

        if (rows.length === 0) {
            return res.status(401).json({ message: 'Usuario no encontrado' });
        }

        const user = rows[0];

        // Comparar contraseña texto plano (corregir esto en próximas actualizaciones)
        if (user.Password !== password) {
            return res.status(401).json({ message: 'Contraseña incorrecta' });
        }

        // Si el usuario y la contraseña son correctos, generamos un JWT
        const token = generateJWT(user);
        res.json({ token, role: user.Rol }); // Devolver el token y el rol del usuario

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error en el servidor' });
    } finally {
        if (conn) conn.end();
    }
};

const refreshToken = async (req, res) => {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) {
        return res.status(401).json({ message: 'Token no proporcionado' });
    }

    try {
        const decoded = jwt.verify(token, 'reu_system');
        const newToken = jwt.sign(
            { id: decoded.id, rol: decoded.rol },
            'reu_system',
            { expiresIn: '10m' } // Nuevo token con 10 minutos de expiración
        );
        res.json({ token: newToken });
    } catch (error) {
        res.status(401).json({ message: 'Token inválido o expirado' });
    }
};

// Exportar las funciones
module.exports = {
    login,
    refreshToken
};