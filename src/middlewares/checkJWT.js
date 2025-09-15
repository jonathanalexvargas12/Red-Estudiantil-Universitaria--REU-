//Este middleware verifica si el token JWT es válido.
const jwt = require('jsonwebtoken');
const checkJWT = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) {
        return res.status(401).json({ message: 'No autorizado' });
    }
    jwt.verify(token, 'reu_system', (err, decoded) => {
        if (err) {
            return res.status(401).json({ message: 'Token inválido o expirado', redirect: '/index.html' });
        }
        req.user = decoded; // Añadir la información del usuario a req.user
        next();
    });
};
module.exports = checkJWT;