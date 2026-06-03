const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');
const { generateAccessToken, generateRefreshToken } = require('../utils/generateJWT');

const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'reu_system_refresh';

const COOKIE_OPTIONS = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: 7 * 24 * 60 * 60 * 1000
};

const login = async (req, res) => {
    const { email, password } = req.body;

    let conn;
    try {
        conn = await pool.getConnection();

        const rows = await conn.query(
            'SELECT * FROM usuarios WHERE Correo = ?',
            [email]
        );

        if (rows.length === 0) {
            return res.status(401).json({
                success: false,
                message: 'Usuario no encontrado'
            });
        }

        const user = rows[0];

        const passwordMatch = await bcrypt.compare(password, user.Password);
        if (!passwordMatch) {
            return res.status(401).json({
                success: false,
                message: 'Contraseña incorrecta'
            });
        }

        const accessToken = generateAccessToken(user);
        const refreshToken = generateRefreshToken(user);

        res.cookie('refreshToken', refreshToken, COOKIE_OPTIONS);

        res.json({
            success: true,
            token: accessToken,
            role: user.Rol,
            userId: user.ID_Usuario,
            userData: {
                Cedula: user.Cedula,
                Nombres: user.Nombres,
                Apellidos: user.Apellidos,
                Direccion: user.Direccion_Residencial,
                Telefono_1: user.Telefono_1,
                Telefono_2: user.Telefono_2,
                Correo: user.Correo
            }
        });

    } catch (err) {
        console.error('Error en login:', err);
        res.status(500).json({
            success: false,
            message: 'Error en el servidor'
        });
    } finally {
        if (conn) conn.end();
    }
};

const refreshTokenHandler = async (req, res) => {
    const token = req.cookies?.refreshToken;
    if (!token) {
        return res.status(401).json({ message: 'No autorizado' });
    }

    let conn;
    try {
        const decoded = jwt.verify(token, JWT_REFRESH_SECRET);

        conn = await pool.getConnection();
        const rows = await conn.query(
            'SELECT * FROM usuarios WHERE ID_Usuario = ? AND activo = 1',
            [decoded.id]
        );

        if (rows.length === 0) {
            res.clearCookie('refreshToken', { path: '/' });
            return res.status(401).json({ message: 'Usuario no encontrado o inactivo' });
        }

        const user = rows[0];
        const newAccessToken = generateAccessToken(user);
        const newRefreshToken = generateRefreshToken(user);

        res.cookie('refreshToken', newRefreshToken, COOKIE_OPTIONS);

        res.json({ token: newAccessToken });
    } catch (error) {
        res.clearCookie('refreshToken', { path: '/' });
        res.status(401).json({ message: 'Token inválido o expirado' });
    } finally {
        if (conn) conn.end();
    }
};

const crypto = require('crypto');
const { sendRecoveryCode } = require('../services/mailService');

const RECOVERY_EXPIRY = 15 * 60 * 1000;

const solicitarRecuperacion = async (req, res) => {
    const { correo } = req.body;
    let conn;
    try {
        conn = await pool.getConnection();
        const rows = await conn.query(
            'SELECT ID_Usuario, Correo FROM usuarios WHERE Correo = ? AND activo = 1',
            [correo]
        );
        if (rows.length === 0) {
            return res.status(200).json({ message: 'Si el correo existe, recibirás un código' });
        }

        const codigo = crypto.randomInt(100000, 999999).toString();
        const expira = new Date(Date.now() + RECOVERY_EXPIRY);

        await conn.query(
            'DELETE FROM recuperacion_contrasena WHERE Correo = ?',
            [correo]
        );
        await conn.query(
            'INSERT INTO recuperacion_contrasena (Correo, Codigo, Expiracion) VALUES (?, ?, ?)',
            [correo, codigo, expira]
        );

        await sendRecoveryCode(correo, codigo);
        res.json({ message: 'Si el correo existe, recibirás un código' });
    } catch (error) {
        console.error('Error en solicitarRecuperacion:', error);
        res.status(500).json({ message: 'Error al procesar la solicitud' });
    } finally {
        if (conn) conn.end();
    }
};

const verificarCodigoRecuperacion = async (req, res) => {
    const { correo, codigo } = req.body;
    let conn;
    try {
        conn = await pool.getConnection();
        const rows = await conn.query(
            'SELECT * FROM recuperacion_contrasena WHERE Correo = ? AND Codigo = ? AND Expiracion > NOW()',
            [correo, codigo]
        );
        if (rows.length === 0) {
            return res.status(400).json({ message: 'Código inválido o expirado' });
        }

        const token = crypto.randomBytes(32).toString('hex');
        await conn.query(
            'UPDATE recuperacion_contrasena SET Token = ? WHERE Correo = ?',
            [token, correo]
        );

        res.json({ token });
    } catch (error) {
        console.error('Error en verificarCodigoRecuperacion:', error);
        res.status(500).json({ message: 'Error al verificar el código' });
    } finally {
        if (conn) conn.end();
    }
};

const cambiarContrasenaRecuperacion = async (req, res) => {
    const { correo, codigo, token, nuevaContrasena } = req.body;
    let conn;
    try {
        conn = await pool.getConnection();
        const rows = await conn.query(
            'SELECT * FROM recuperacion_contrasena WHERE Correo = ? AND Codigo = ? AND Token = ? AND Expiracion > NOW()',
            [correo, codigo, token]
        );
        if (rows.length === 0) {
            return res.status(400).json({ message: 'Solicitud inválida o expirada' });
        }

        const hashed = await bcrypt.hash(nuevaContrasena, 10);
        await conn.query(
            'UPDATE usuarios SET Password = ? WHERE Correo = ? AND activo = 1',
            [hashed, correo]
        );
        await conn.query(
            'DELETE FROM recuperacion_contrasena WHERE Correo = ?',
            [correo]
        );

        res.json({ message: 'Contraseña cambiada exitosamente' });
    } catch (error) {
        console.error('Error en cambiarContrasenaRecuperacion:', error);
        res.status(500).json({ message: 'Error al cambiar la contraseña' });
    } finally {
        if (conn) conn.end();
    }
};

module.exports = {
    login,
    refreshToken: refreshTokenHandler,
    solicitarRecuperacion,
    verificarCodigoRecuperacion,
    cambiarContrasenaRecuperacion
};