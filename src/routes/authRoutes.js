const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const checkJWT = require('../middlewares/checkJWT');
const jwt = require('jsonwebtoken');
const GenericController = require('../controllers/genericController');
const db = require('../config/db'); 

// Configuración de mapeo de tablas a columnas PK
const tablePrimaryKeyMap = {
    asignaturas: 'Codigo_Asignatura',
    aulas: 'Nombre_Aula',
    horas: 'Desde',
    secciones: 'Codigo_Seccion',
    periodo_academico: 'Periodo_Academico',
    carreras: 'Codigo_Carrera',
    nivel_pensum: 'Nombre_Nivel',
    trabajo_investigacion: 'ID',
    estudiantes: 'Cedula',
    docentes: 'Cedula',
    pensum: 'Codigo_Pensum',
    calificaciones: 'ID',
    solicitudes_tutor_interno: 'ID',
    solicitudes_tutor_externo: 'ID',
    estudiante_periodo_academico: 'ID',
    estudiantes_asignatura: 'ID',
    docente_asignatura: 'ID',
    usuarios: 'ID_Usuario',
    bitacora: 'ID',
    reinscripciones: 'ID' 
};

// Función para manejar BigInt en respuestas JSON
const safeJSONResponse = (res, data) => {
    const replacer = (key, value) => 
        typeof value === 'bigint' ? value.toString() : value;
    res.json(JSON.parse(JSON.stringify(data, replacer)));
};

// Ruta para el login
router.post('/login', authController.login);

// Ruta para manejar reinscripciones
router.post('/reinscripciones', checkJWT, async (req, res) => {
    try {
        const { Cedula_Estudiante, Carrera, Periodo_Academico, Nivel_Pensum, Turno } = req.body;
        
        // Validar datos requeridos
        if (!Cedula_Estudiante || !Carrera || !Periodo_Academico || !Nivel_Pensum || !Turno) {
            return res.status(400).json({ message: 'Todos los campos son requeridos' });
        }

        // Insertar en la base de datos
        const result = await db.query(
            'INSERT INTO reinscripciones (Cedula_Estudiante, Carrera, Periodo_Academico, Nivel_Pensum, Turno) VALUES (?, ?, ?, ?, ?)',
            [Cedula_Estudiante, Carrera, Periodo_Academico, Nivel_Pensum, Turno]
        );

        // Usar safeJSONResponse para manejar posibles BigInt
        safeJSONResponse(res, { 
            success: true,
            message: 'Reinscripción registrada exitosamente',
            id: result.insertId 
        });

    } catch (error) {
        console.error('Error al registrar reinscripción:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
});

// Ruta para cambiar contraseña SIN encriptación (NO RECOMENDADO)
router.put('/usuarios/cambiar-contrasena-plana/:id', checkJWT, async (req, res) => {
    try {
        const { id } = req.params;
        const { nuevaContrasenaPlana } = req.body;
        
        if (!nuevaContrasenaPlana) {
            return res.status(400).json({ message: 'La nueva contraseña es requerida' });
        }
        
        if (nuevaContrasenaPlana.length < 8) {
            return res.status(400).json({ message: 'La contraseña debe tener al menos 8 caracteres' });
        }
        
        const result = await db.query(
            'UPDATE usuarios SET Password = ? WHERE ID_Usuario = ?',
            [nuevaContrasenaPlana, id]
        );
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }
        
        // Registrar en bitácora
        const ip = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress;
        const now = new Date();
        
        await registrarBitacora(
            now.toLocaleTimeString('es-ES'),
            `${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, '0')}/${String(now.getDate()).padStart(2, '0')}`,
            ip,
            req.user.id,
            'Cambio de contraseña (sin encriptación)'
        );
        
        res.json({ 
            success: true,
            message: 'Contraseña actualizada exitosamente (sin encriptación)'
        });
        
    } catch (error) {
        console.error('Error al cambiar contraseña:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
});

// Función auxiliar para registrar en bitácora
async function registrarBitacora(hora, fecha, ip, usuario, accion) {
    try {
        const bitacoraController = new GenericController('bitacora', 'ID');
        const registro = {
            Hora: hora,
            Fecha: fecha,
            IP: ip,
            Usuario_ID: usuario,
            Accion: accion
        };
        await bitacoraController.create({ body: registro }, { json: (data) => data });
    } catch (error) {
        console.error('Error al registrar en bitácora:', error);
    }
}

// Nueva ruta para registrar acciones en bitácora
router.post('/registrar-bitacora', checkJWT, async (req, res) => {
    try {
        const { hora, fecha, ip, usuario, accion } = req.body;
        
        if (!hora || !fecha || !ip || !usuario || !accion) {
            return res.status(400).json({ message: 'Faltan datos requeridos' });
        }

        const bitacoraController = new GenericController('bitacora', 'ID');
        
        const registro = {
            Hora: hora,
            Fecha: fecha,
            IP: ip,
            Usuario_ID: usuario,
            Accion: accion
        };

        bitacoraController.create({ body: registro }, res);
    } catch (error) {
        console.error('Error al registrar en bitácora:', error);
        res.status(500).json({ message: 'Error al registrar en bitácora' });
    }
});

// Ruta para obtener las rutas permitidas según el rol
router.get('/allowed-routes', checkJWT, (req, res) => {
    const role = req.user.rol;
    const allowedRoutes = {
        Estudiante: ['inicio.html', 'mis-datos.html', 'cambiar-contrasena.html', 'principal-carga-notas.html', 'notas-historicas.html', 'detalle-notas.html', 'record-academico.html', 'detalle-record.html', 'est-por-asignatura.html', 'estudiantes.html', 'principal-estudiantes.html', 'reinscripcion.html'],
        Docente: ['inicio.html', 'mis-datos.html', 'cambiar-contrasena.html', 'notas-iniciales.html', 'principal-conf-general.html', 'linea-investigacion.html', 'principal-carga-notas.html', 'notas-historicas.html', 'detalle-notas.html', 'record-academico.html', 'detalle-record.html', 'calificar-asignaturas.html', 'notas-certificadas.html', 'detalle-certificado.html', 'orden-merito.html', 'est-por-asignatura.html', 'notas-por-calificar.html', 'principal-profesores.html', 'profesores.html', 'calif-docente.html', 'horas-impartidas.html', 'estudiantes.html', 'principal-estudiantes.html', 'reinscripcion.html'],
        Administrador: ['inicio.html', 'mis-datos.html', 'cambiar-contrasena.html', 'notas-iniciales.html', 'detalle-retiro.html', 'principal-pensum.html', 'pensum.html', 'nivel-pensum.html', 'asignaturas.html', 'carreras.html', 'bitacora.html', 'principal-conf-general.html', 'linea-investigacion.html', 'carnetizacion.html', 'principal-ofer-academica.html', 'periodos.html', 'detalle-retiro.html', 'aulas.html', 'horas.html', 'secciones.html', 'ofertas.html', 'consultar-ofertas.html', 'imprimir-horario.html', 'inscripciones.html', 'principal-retiro-materias.html', 'retiro-materias.html', 'principal-carga-notas.html', 'notas-historicas.html', 'detalle-notas.html', 'record-academico.html', 'detalle-record.html', 'calificar-asignaturas.html', 'notas-certificadas.html', 'detalle-certificado.html', 'orden-merito.html', 'est-por-asignatura.html', 'notas-por-calificar.html', 'principal-trabajos-investigacion.html', 'solicitar-tutoria.html', 'trabajos-investigacion.html', 'tutor-externo.html', 'principal-profesores.html', 'profesores.html', 'calif-docente.html', 'horas-impartidas.html', 'estudiantes.html', 'usuarios.html', 'principal-estudiantes.html', 'reinscripcion.html'],
        Administrativo: ['inicio.html', 'mis-datos.html', 'cambiar-contrasena.html', 'notas-iniciales.html', 'detalle-retiro.html', 'principal-pensum.html', 'pensum.html', 'nivel-pensum.html', 'asignaturas.html', 'carreras.html', 'bitacora.html', 'principal-conf-general.html', 'linea-investigacion.html', 'carnetizacion.html', 'principal-ofer-academica.html', 'periodos.html', 'detalle-retiro.html', 'aulas.html', 'horas.html', 'secciones.html', 'ofertas.html', 'consultar-ofertas.html', 'imprimir-horario.html', 'inscripciones.html', 'principal-retiro-materias.html', 'retiro-materias.html', 'principal-carga-notas.html', 'notas-historicas.html', 'detalle-notas.html', 'record-academico.html', 'detalle-record.html', 'calificar-asignaturas.html', 'notas-certificadas.html', 'detalle-certificado.html', 'orden-merito.html', 'est-por-asignatura.html', 'notas-por-calificar.html', 'principal-trabajos-investigacion.html', 'solicitar-tutoria.html', 'trabajos-investigacion.html', 'tutor-externo.html', 'principal-profesores.html', 'profesores.html', 'calif-docente.html', 'horas-impartidas.html', 'estudiantes.html', 'principal-estudiantes.html', 'reinscripcion.html'],
        Control_de_Estudios: ['inicio.html', 'mis-datos.html', 'cambiar-contrasena.html', 'notas-iniciales.html', 'detalle-retiro.html', 'principal-ofer-academica.html', 'aulas.html', 'horas.html', 'secciones.html', 'ofertas.html', 'consultar-ofertas.html', 'imprimir-horario.html', 'inscripciones.html', 'principal-retiro-materias.html', 'retiro-materias.html', 'periodos.html', 'detalle-retiro.html', 'principal-carga-notas.html', 'notas-historicas.html', 'detalle-notas.html', 'record-academico.html', 'detalle-record.html', 'calificar-asignaturas.html', 'notas-certificadas.html', 'detalle-certificado.html', 'orden-merito.html', 'est-por-asignatura.html', 'notas-por-calificar.html', 'principal-trabajos-investigacion.html', 'solicitar-tutoria.html', 'trabajos-investigacion.html', 'tutor-externo.html', 'principal-profesores.html', 'profesores.html', 'calif-docente.html', 'horas-impartidas.html', 'estudiantes.html', 'principal-estudiantes.html', 'reinscripcion.html'],
        Tutor_Externo: ['inicio.html', 'mis-datos.html', 'cambiar-contrasena.html', 'notas-iniciales.html', 'principal-conf-general.html', 'linea-investigacion.html', 'principal-carga-notas.html', 'notas-historicas.html', 'detalle-notas.html', 'record-academico.html', 'detalle-record.html', 'calificar-asignaturas.html', 'notas-certificadas.html', 'detalle-certificado.html', 'orden-merito.html', 'est-por-asignatura.html', 'notas-por-calificar.html', 'principal-profesores.html', 'profesores.html', 'calif-docente.html', 'horas-impartidas.html', 'estudiantes.html', 'principal-estudiantes.html', 'reinscripcion.html']
    };
    const routes = allowedRoutes[role] || [];
    res.json({ allowedRoutes: routes });
});

// Ruta para extender la sesión
router.post('/refresh-token', checkJWT, (req, res) => {
    const user = req.user;
    try {
        const newToken = jwt.sign(
            { id: user.id, rol: user.rol },
            'reu_system',
            { expiresIn: '10m' }
        );
        res.json({ token: newToken });
    } catch (error) {
        console.error('Error al generar el nuevo token:', error);
        res.status(500).json({ message: 'Error en el servidor' });
    }
});

// Middleware para instanciar el GenericController
router.use('/:table', (req, res, next) => {
    const { table } = req.params;
    const primaryKey = tablePrimaryKeyMap[table];
    if (!primaryKey) {
        return res.status(400).json({ message: 'Tabla desconocida o sin configuración de llave primaria.' });
    }
    req.controller = new GenericController(table, primaryKey);
    next();
});

// Rutas CRUD genéricas
router.get('/:table', (req, res) => req.controller.getAll(req, res));
router.post('/:table', checkJWT, (req, res) => req.controller.create(req, res));
router.put('/:table/:id', checkJWT, (req, res) => req.controller.update(req, res));
router.delete('/:table/:id', checkJWT, (req, res) => req.controller.delete(req, res));

module.exports = router; 