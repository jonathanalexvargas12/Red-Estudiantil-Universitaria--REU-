const jwt = require('jsonwebtoken');
const pool = require('../config/db');

const SECRET = process.env.JWT_SECRET || 'reu_system';

const checkJWT = async (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) {
        return res.status(401).json({ message: 'No autorizado' });
    }

    try {
        const decoded = jwt.verify(token, SECRET);

        const conn = await pool.getConnection();
        const rows = await conn.query(
            'SELECT Rol, activo FROM usuarios WHERE ID_Usuario = ?',
            [decoded.id]
        );
        conn.release();

        if (rows.length === 0 || rows[0].activo === 0) {
            return res.status(401).json({ message: 'Usuario no encontrado o inactivo', redirect: '/index.html' });
        }

        if (rows[0].Rol !== decoded.rol) {
            return res.status(401).json({ message: 'Rol modificado, inicie sesión nuevamente', redirect: '/index.html' });
        }

        req.user = decoded;
        next();
    } catch (err) {
        if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
            return res.status(401).json({ message: 'Token inválido o expirado', redirect: '/index.html' });
        }
        console.error('Error en checkJWT:', err);
        return res.status(500).json({ message: 'Error interno del servidor' });
    }
};

module.exports = checkJWT;