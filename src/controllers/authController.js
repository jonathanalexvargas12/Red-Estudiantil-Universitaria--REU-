//Este módulo maneja la lógica del login.

const pool = require('../config/db');
const generateJWT = require('../utils/generateJWT');

const login = async (req, res) => {
    const { email, password } = req.body;

    let conn;
    try {
        conn = await pool.getConnection();
        
        // Consulta específica
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

        if (user.Password !== password) {
            return res.status(401).json({ 
                success: false,
                message: 'Contraseña incorrecta' 
            });
        }


        // Respuesta MÍNIMA: solo token, rol e ID
        res.json({ 
            success: true,
            token: generateJWT(user),
            role: user.Rol,
            userId: user.ID_Usuario, 
            userData:{
                Cedula: user.Cedula,
                Nombres: user.Nombres,
                Apellidos: user.Apellidos,
                Direccion: user.Direccion_Residencial,
                Telefono_1: user.Telefono_1,
                Telefono_2: user.Telefono_2,
                Correo: user.Correo}
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