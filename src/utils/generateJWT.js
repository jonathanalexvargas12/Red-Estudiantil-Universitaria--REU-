//Este módulo genera un token JWT.

const jwt = require('jsonwebtoken');

const generateJWT = (user) => {
    return jwt.sign(
        { id: user.ID_Usuario, rol: user.Rol }, // Payload (datos del usuario)
        'reu_system', // Clave secreta para firmar el token
        { expiresIn: '10m' } // Tiempo de expiración (10 minutos)
    );
};

module.exports = generateJWT;