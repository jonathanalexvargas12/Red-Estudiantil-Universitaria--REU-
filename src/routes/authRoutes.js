const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const checkJWT = require('../middlewares/checkJWT');
const jwt = require('jsonwebtoken');
const GenericController = require('../controllers/genericController');

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
    // Agrega más tablas y sus respectivas PK aquí
};

// Ruta para el login
router.post('/login', authController.login);

// Ruta para obtener las rutas permitidas según el rol
router.get('/allowed-routes', checkJWT, (req, res) => {
    const role = req.user.rol;
    const allowedRoutes = {
        Estudiante: ['inicio.html', 'mis-datos.html', 'cambiar-contrasena.html', 'principal-carga-notas.html', 'notas-historicas.html', 'detalle-notas.html', 'record-academico.html', 'detalle-record.html', 'est-por-asignatura.html', 'estudiantes.html'],
        Docente: ['inicio.html', 'mis-datos.html', 'cambiar-contrasena.html', 'notas-iniciales.html', 'principal-conf-general.html', 'linea-investigacion.html', 'principal-carga-notas.html', 'notas-historicas.html', 'detalle-notas.html', 'record-academico.html', 'detalle-record.html', 'calificar-asignaturas.html', 'notas-certificadas.html', 'detalle-certificado.html', 'orden-merito.html', 'est-por-asignatura.html', 'notas-por-calificar.html', 'principal-profesores.html', 'profesores.html', 'calif-docente.html', 'horas-impartidas.html', 'estudiantes.html'],
        Administrador: ['inicio.html', 'mis-datos.html', 'cambiar-contrasena.html', 'notas-iniciales.html', 'detalle-retiro.html', 'principal-pensum.html', 'pensum.html', 'nivel-pensum.html', 'asignaturas.html', 'carreras.html', 'bitacora.html', 'principal-conf-general.html', 'linea-investigacion.html', 'carnetizacion.html', 'principal-ofer-academica.html', 'periodos.html', 'detalle-retiro.html', 'aulas.html', 'horas.html', 'secciones.html', 'ofertas.html', 'consultar-ofertas.html', 'imprimir-horario.html', 'inscripciones.html', 'principal-retiro-materias.html', 'retiro-materias.html', 'principal-carga-notas.html', 'notas-historicas.html', 'detalle-notas.html', 'record-academico.html', 'detalle-record.html', 'calificar-asignaturas.html', 'notas-certificadas.html', 'detalle-certificado.html', 'orden-merito.html', 'est-por-asignatura.html', 'notas-por-calificar.html', 'principal-trabajos-investigacion.html', 'solicitar-tutoria.html', 'trabajos-investigacion.html', 'tutor-externo.html', 'principal-profesores.html', 'profesores.html', 'calif-docente.html', 'horas-impartidas.html', 'estudiantes.html', 'usuarios.html'],
        Administrativo: ['inicio.html', 'mis-datos.html', 'cambiar-contrasena.html', 'notas-iniciales.html', 'detalle-retiro.html', 'principal-pensum.html', 'pensum.html', 'nivel-pensum.html', 'asignaturas.html', 'carreras.html', 'bitacora.html', 'principal-conf-general.html', 'linea-investigacion.html', 'carnetizacion.html', 'principal-ofer-academica.html', 'periodos.html', 'detalle-retiro.html', 'aulas.html', 'horas.html', 'secciones.html', 'ofertas.html', 'consultar-ofertas.html', 'imprimir-horario.html', 'inscripciones.html', 'principal-retiro-materias.html', 'retiro-materias.html', 'principal-carga-notas.html', 'notas-historicas.html', 'detalle-notas.html', 'record-academico.html', 'detalle-record.html', 'calificar-asignaturas.html', 'notas-certificadas.html', 'detalle-certificado.html', 'orden-merito.html', 'est-por-asignatura.html', 'notas-por-calificar.html', 'principal-trabajos-investigacion.html', 'solicitar-tutoria.html', 'trabajos-investigacion.html', 'tutor-externo.html', 'principal-profesores.html', 'profesores.html', 'calif-docente.html', 'horas-impartidas.html', 'estudiantes.html'],
        Control_de_Estudios: ['inicio.html', 'mis-datos.html', 'cambiar-contrasena.html', 'notas-iniciales.html', 'detalle-retiro.html', 'principal-ofer-academica.html', 'aulas.html', 'horas.html', 'secciones.html', 'ofertas.html', 'consultar-ofertas.html', 'imprimir-horario.html', 'inscripciones.html', 'principal-retiro-materias.html', 'retiro-materias.html', 'periodos.html', 'detalle-retiro.html', 'principal-carga-notas.html', 'notas-historicas.html', 'detalle-notas.html', 'record-academico.html', 'detalle-record.html', 'calificar-asignaturas.html', 'notas-certificadas.html', 'detalle-certificado.html', 'orden-merito.html', 'est-por-asignatura.html', 'notas-por-calificar.html', 'principal-trabajos-investigacion.html', 'solicitar-tutoria.html', 'trabajos-investigacion.html', 'tutor-externo.html', 'principal-profesores.html', 'profesores.html', 'calif-docente.html', 'horas-impartidas.html', 'estudiantes.html'],
        Tutor_Externo: ['inicio.html', 'mis-datos.html', 'cambiar-contrasena.html', 'notas-iniciales.html', 'principal-conf-general.html', 'linea-investigacion.html', 'principal-carga-notas.html', 'notas-historicas.html', 'detalle-notas.html', 'record-academico.html', 'detalle-record.html', 'calificar-asignaturas.html', 'notas-certificadas.html', 'detalle-certificado.html', 'orden-merito.html', 'est-por-asignatura.html', 'notas-por-calificar.html', 'principal-profesores.html', 'profesores.html', 'calif-docente.html', 'horas-impartidas.html', 'estudiantes.html']
    };
    const routes = allowedRoutes[role] || [];
    res.json({ allowedRoutes: routes });
});

// Ruta para extender la sesión
router.post('/refresh-token', checkJWT, (req, res) => {
    const user = req.user; // Datos del usuario obtenidos del token
    try {
        // Generar un nuevo token con 10 minutos de expiración
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

// Middleware para instanciar el GenericController basado en el mapeo de tabla a PK
router.use('/:table', (req, res, next) => {
    const { table } = req.params;
    const primaryKey = tablePrimaryKeyMap[table];
    if (!primaryKey) {
        return res.status(400).json({ message: 'Tabla desconocida o sin configuración de llave primaria.' });
    }
    req.controller = new GenericController(table, primaryKey);
    next();
});

// Rutas CRUD genéricas utilizando el controlador genérico
router.get('/:table', (req, res) => req.controller.getAll(req, res));
router.post('/:table', checkJWT, (req, res) => req.controller.create(req, res));
router.put('/:table/:id', checkJWT, (req, res) => req.controller.update(req, res));
router.delete('/:table/:id', checkJWT, (req, res) => req.controller.delete(req, res));

module.exports = router;
