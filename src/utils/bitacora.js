const pool = require('../config/db');

function getClientIP(req) {
    if (req.clientIP) return req.clientIP;
    const forwarded = req.headers['x-forwarded-for'];
    if (forwarded) {
        const ip = forwarded.split(',')[0].trim();
        if (ip) return ip;
    }
    const ip = req.ip || req.connection?.remoteAddress || '';
    if (ip === '::1' || ip === '::ffff:127.0.0.1') return '127.0.0.1';
    return ip;
}

async function registrarBitacora(hora, fecha, ip, usuario, accion, modulo = null, registroId = null, detalles = null) {
    try {
        await pool.query(
            'INSERT INTO bitacora (Hora, Fecha, IP, Usuario_ID, Accion, Modulo, Registro_ID, Detalles) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [hora, fecha, ip, usuario, accion, modulo, registroId, detalles]
        );
    } catch (error) {
        console.error('Error al registrar en bitácora:', error);
    }
}

module.exports = { registrarBitacora, getClientIP };
