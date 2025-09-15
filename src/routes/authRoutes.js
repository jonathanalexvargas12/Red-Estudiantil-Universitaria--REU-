const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const checkJWT = require('../middlewares/checkJWT');
const jwt = require('jsonwebtoken');
const GenericController = require('../controllers/genericController');

// Ruta para el login
router.post('/login', authController.login);

// Ruta para obtener las rutas permitidas según el rol
router.get('/allowed-routes', checkJWT, (req, res) => {
    const role = req.user.rol;
    const allowedRoutes = { // Definir las rutas permitidas para cada rol:
        Estudiante: ['inicio.html', 'mis-datos.html', 'cambiar-contrasena.html', 'principal-carga-notas.html', 'notas-historicas.html', 'detalle-notas.html', 'record-academico.html', 'detalle-record.html', 'est-por-asignatura.html', 'estudiantes.html'],
        Docente: ['inicio.html', 'mis-datos.html', 'cambiar-contrasena.html', 'notas-iniciales.html', 'principal-conf-general.html', 'linea-investigacion.html', 'principal-carga-notas.html', 'notas-historicas.html', 'detalle-notas.html', 'record-academico.html', 'detalle-record.html', 'calificar-asignaturas.html', 'notas-certificadas.html', 'detalle-certificado.html', 'orden-merito.html', 'est-por-asignatura.html', 'notas-por-calificar.html', 'principal-profesores.html', 'profesores.html', 'calif-docente.html', 'horas-impartidas.html', 'estudiantes.html'],
        Administrador: ['inicio.html', 'mis-datos.html', 'cambiar-contrasena.html', 'notas-iniciales.html', 'detalle-retiro.html', 'principal-pensum.html', 'pensum.html', 'nivel-pensum.html', 'asignaturas.html', 'carreras.html', 'bitacora.html', 'principal-conf-general.html', 'linea-investigacion.html', 'carnetizacion.html',  'principal-ofer-academica.html', 'periodos.html', 'detalle-retiro.html', 'aulas.html', 'horas.html', 'secciones.html', 'ofertas.html', 'consultar-ofertas.html', 'imprimir-horario.html', 'inscripciones.html', 'principal-retiro-materias.html', 'retiro-materias.html', 'principal-carga-notas.html', 'notas-historicas.html', 'detalle-notas.html', 'record-academico.html', 'detalle-record.html', 'calificar-asignaturas.html', 'notas-certificadas.html', 'detalle-certificado.html', 'orden-merito.html', 'est-por-asignatura.html', 'notas-por-calificar.html', 'principal-trabajos-investigacion.html', 'solicitar-tutoria.html', 'trabajos-investigacion.html', 'tutor-externo.html', 'principal-profesores.html', 'profesores.html', 'calif-docente.html', 'horas-impartidas.html', 'estudiantes.html', 'usuarios.html'],
        Administrativo: ['inicio.html', 'mis-datos.html', 'cambiar-contrasena.html', 'notas-iniciales.html', 'detalle-retiro.html', 'principal-pensum.html', 'pensum.html', 'nivel-pensum.html', 'asignaturas.html', 'carreras.html', 'bitacora.html', 'principal-conf-general.html', 'linea-investigacion.html', 'carnetizacion.html',  'principal-ofer-academica.html', 'periodos.html', 'detalle-retiro.html', 'aulas.html', 'horas.html', 'secciones.html', 'ofertas.html', 'consultar-ofertas.html', 'imprimir-horario.html', 'inscripciones.html', 'principal-retiro-materias.html', 'retiro-materias.html', 'principal-carga-notas.html', 'notas-historicas.html', 'detalle-notas.html', 'record-academico.html', 'detalle-record.html', 'calificar-asignaturas.html', 'notas-certificadas.html', 'detalle-certificado.html', 'orden-merito.html', 'est-por-asignatura.html', 'notas-por-calificar.html', 'principal-trabajos-investigacion.html', 'solicitar-tutoria.html', 'trabajos-investigacion.html', 'tutor-externo.html', 'principal-profesores.html', 'profesores.html', 'calif-docente.html', 'horas-impartidas.html', 'estudiantes.html'],
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
        // Generar un nuevo token con 10 minutos de expiración (actualiza esto despues)
        const newToken = jwt.sign(
            { id: user.id, rol: user.rol },
            'reu_system',
            { expiresIn: '10m' }
        );
        res.json({ token: newToken }); // Devolver el nuevo token
    } catch (error) {
        console.error('Error al generar el nuevo token:', error);
        res.status(500).json({ message: 'Error en el servidor' });
    }
});

// Rutas dinámicas para cualquier tabla
router.use('/:table', (req, res, next) => {
    const { table } = req.params; // Nombre de la tabla
    req.controller = new GenericController(table); // Crear una instancia del controlador genérico
    next();
});

// Rutas CRUD genéricas
router.get('/:table', (req, res) => req.controller.getAll(req, res));
router.post('/:table', checkJWT, (req, res) => req.controller.create(req, res));
router.put('/:table/:id', checkJWT, (req, res) => req.controller.update(req, res));
router.delete('/:table/:id', checkJWT, (req, res) => req.controller.delete(req, res));

// Ruta genérica para obtener datos de cualquier tabla
router.get('/:table', async (req, res) => {
    const { table } = req.params;
    try {
        const connection = await pool.getConnection();
        const query = `SELECT * FROM ${table}`;
        const rows = await connection.query(query);
        connection.release();
        res.status(200).json(rows);
    } catch (error) {
        console.error(`Error al obtener registros de ${table}:`, error);
        res.status(500).json({ message: `Error al obtener registros de ${table}` });
    }
});

// Ruta genérica para agregar un nuevo registro a cualquier tabla
router.post('/:table', checkJWT, async (req, res) => {
    const { table } = req.params;
    const { body } = req;
    try {
        const connection = await pool.getConnection();
        const columns = Object.keys(body).map(col => `\`${col}\``).join(', ');
        const values = Object.values(body).map(value => `'${value}'`).join(', ');
        const query = `INSERT INTO ${table} (${columns}) VALUES (${values})`;
        await connection.query(query);
        connection.release();
        res.status(201).json({ message: 'Registro creado exitosamente' });
    } catch (error) {
        console.error(`Error al crear registro en ${table}:`, error);
        res.status(500).json({ message: `Error al crear registro en ${table}` });
    }
});

// Ruta genérica para actualizar un registro en cualquier tabla
router.put('/:table/:primaryKey/:value', checkJWT, async (req, res) => {
    const { table, primaryKey, value } = req.params;
    const { body } = req;
    try {
        const connection = await pool.getConnection();
        const updates = Object.keys(body).map(key => `\`${key}\` = '${body[key]}'`).join(', ');
        const query = `UPDATE ${table} SET ${updates} WHERE \`${primaryKey}\` = '${value}'`;
        console.log('Query ejecutado:', query); // Depuración
        await connection.query(query);
        connection.release();
        res.status(200).json({ message: 'Registro actualizado exitosamente' });
    } catch (error) {
        console.error(`Error al actualizar registro en ${table}:`, error);
        res.status(500).json({ message: `Error al actualizar registro en ${table}` });
    }
});

// Ruta genérica para eliminar un registro de cualquier tabla
router.delete('/:table/:primaryKey/:value', checkJWT, async (req, res) => {
    const { table, primaryKey, value } = req.params;
    try {
        const connection = await pool.getConnection();
        const query = `DELETE FROM ${table} WHERE \`${primaryKey}\` = '${value}'`;
        console.log('Query ejecutado:', query); // Depuración
        await connection.query(query);
        connection.release();
        res.status(200).json({ message: 'Registro eliminado exitosamente' });
    } catch (error) {
        console.error(`Error al eliminar registro de ${table}:`, error);
        res.status(500).json({ message: `Error al eliminar registro de ${table}` });
    }
});

module.exports = router;