const jwt = require('jsonwebtoken');

const SECRET = process.env.JWT_SECRET || 'reu_system';
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'reu_system_refresh';
const EXPIRES_IN = process.env.JWT_EXPIRES_IN || '5m';
const REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '7d';

const generateAccessToken = (user) => {
    return jwt.sign(
        { id: user.ID_Usuario, rol: user.Rol },
        SECRET,
        { expiresIn: EXPIRES_IN }
    );
};

const generateRefreshToken = (user) => {
    return jwt.sign(
        { id: user.ID_Usuario, rol: user.Rol },
        REFRESH_SECRET,
        { expiresIn: REFRESH_EXPIRES_IN }
    );
};

module.exports = { generateAccessToken, generateRefreshToken };