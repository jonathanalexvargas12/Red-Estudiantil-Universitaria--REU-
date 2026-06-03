const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const checkJWT = require('../middlewares/checkJWT');
const { registrarBitacora, getClientIP } = require('../utils/bitacora');
const { loginRules, createUserRules, solicitarRecuperacionRules, verificarCodigoRules, cambiarContrasenaRecuperacionRules, handleErrors } = require('../middlewares/validators');

router.post('/login', loginRules, authController.login);

router.post('/solicitar-recuperacion', solicitarRecuperacionRules, authController.solicitarRecuperacion);
router.post('/verificar-codigo-recuperacion', verificarCodigoRules, authController.verificarCodigoRecuperacion);
router.post('/cambiar-contrasena-recuperacion', cambiarContrasenaRecuperacionRules, authController.cambiarContrasenaRecuperacion);

router.get('/allowed-routes', checkJWT, (req, res) => {
    const role = req.user.rol;
    // Pages that DON'T exist as HTML files (removed from all roles):
    //   (none — all pages from Phases I-IV are now implemented)
    const allowedRoutes = {
        Estudiante: [
            'inicio.html', 'mis-datos.html', 'cambiar-contrasena.html',
            'notas-historicas.html', 'detalle-notas.html',
            'record-academico.html', 'detalle-record.html',
            'reinscripcion.html',
            'gestion-horarios.html',
            'solicitar-tutoria.html', 'trabajos-investigacion.html',
            'principal-trabajos-investigacion.html',
            'detalle-retiro.html', 'retiro-materias.html',
            'principal-estudiantes.html',
            'principal-carga-notas.html',
            'principal-ofer-academica.html'
        ],
        Docente: [
            'inicio.html', 'mis-datos.html', 'cambiar-contrasena.html',
            'calificar-asignaturas.html', 'notas-por-calificar.html',
            'notas-historicas.html', 'detalle-notas.html',
            'record-academico.html', 'detalle-record.html',
            'notas-certificadas.html', 'detalle-certificado.html',
            'est-por-asignatura.html',
            'gestion-horarios.html',
            'horas-impartidas.html', 'asistencia.html',
            'calif-docente.html',
            'profesores.html', 'principal-profesores.html',
            'estudiantes.html', 'principal-estudiantes.html',
            'reinscripcion.html',
            'solicitar-tutoria.html', 'trabajos-investigacion.html',
            'tutor-externo.html', 'principal-trabajos-investigacion.html',
            'detalle-retiro.html', 'retiro-materias.html',
            'principal-ofer-academica.html', 'principal-carga-notas.html'
        ],
        Administrador: [
            'inicio.html', 'mis-datos.html', 'cambiar-contrasena.html',
            'notas-iniciales.html',
            'detalle-retiro.html', 'retiro-materias.html',
            'principal-pensum.html', 'pensum.html', 'nivel-pensum.html',
            'asignaturas.html', 'carreras.html',
            'bitacora.html',
            'carnetizacion.html',
            'orden-merito.html',
            'principal-conf-general.html',
            'linea-investigacion.html',
            'principal-ofer-academica.html', 'periodos.html',
            'aulas.html', 'gestion-horarios.html', 'secciones.html',
            'ofertas.html', 'consultar-ofertas.html',
            'inscripciones.html', 'inscripciones-cobrar.html',
            'principal-carga-notas.html',
            'notas-historicas.html', 'detalle-notas.html',
            'record-academico.html', 'detalle-record.html',
            'calificar-asignaturas.html', 'notas-por-calificar.html',
            'notas-certificadas.html', 'detalle-certificado.html',
            'est-por-asignatura.html',
            'principal-trabajos-investigacion.html',
            'solicitar-tutoria.html', 'trabajos-investigacion.html',
            'tutor-externo.html',
            'principal-profesores.html', 'profesores.html',
            'calif-docente.html', 'horas-impartidas.html', 'asistencia.html',
            'estudiantes.html', 'principal-estudiantes.html',
            'reinscripcion.html',
            'usuarios.html'
        ],
        Administrativo: [
            'inicio.html', 'mis-datos.html', 'cambiar-contrasena.html',
            'notas-iniciales.html',
            'detalle-retiro.html', 'retiro-materias.html',
            'principal-pensum.html', 'pensum.html', 'nivel-pensum.html',
            'asignaturas.html', 'carreras.html',
            'bitacora.html',
            'carnetizacion.html',
            'orden-merito.html',
            'linea-investigacion.html',
            'aulas.html', 'gestion-horarios.html', 'secciones.html',
            'ofertas.html', 'consultar-ofertas.html',
            'inscripciones.html', 'inscripciones-cobrar.html',
            'principal-carga-notas.html',
            'notas-historicas.html', 'detalle-notas.html',
            'record-academico.html', 'detalle-record.html',
            'calificar-asignaturas.html', 'notas-por-calificar.html',
            'notas-certificadas.html', 'detalle-certificado.html',
            'est-por-asignatura.html',
            'principal-trabajos-investigacion.html',
            'solicitar-tutoria.html', 'trabajos-investigacion.html',
            'tutor-externo.html',
            'principal-profesores.html', 'profesores.html',
            'calif-docente.html', 'horas-impartidas.html', 'asistencia.html',
            'estudiantes.html', 'principal-estudiantes.html',
            'reinscripcion.html'
        ],
        Control_de_Estudios: [
            'inicio.html', 'mis-datos.html', 'cambiar-contrasena.html',
            'notas-iniciales.html',
            'detalle-retiro.html', 'retiro-materias.html',
            'carnetizacion.html',
            'orden-merito.html',
            'linea-investigacion.html',
            'principal-ofer-academica.html', 'periodos.html',
            'aulas.html', 'gestion-horarios.html', 'secciones.html',
            'ofertas.html', 'consultar-ofertas.html',
            'inscripciones.html', 'inscripciones-cobrar.html',
            'principal-carga-notas.html',
            'notas-historicas.html', 'detalle-notas.html',
            'record-academico.html', 'detalle-record.html',
            'calificar-asignaturas.html', 'notas-por-calificar.html',
            'notas-certificadas.html', 'detalle-certificado.html',
            'est-por-asignatura.html',
            'principal-trabajos-investigacion.html',
            'solicitar-tutoria.html', 'trabajos-investigacion.html',
            'tutor-externo.html',
            'principal-profesores.html', 'profesores.html',
            'calif-docente.html', 'horas-impartidas.html', 'asistencia.html',
            'estudiantes.html', 'principal-estudiantes.html',
            'reinscripcion.html'
        ],
        Tutor_Externo: [
            'inicio.html', 'mis-datos.html', 'cambiar-contrasena.html',
            'notas-iniciales.html',
            'detalle-retiro.html', 'retiro-materias.html',
            'principal-carga-notas.html',
            'notas-historicas.html', 'detalle-notas.html',
            'record-academico.html', 'detalle-record.html',
            'calificar-asignaturas.html', 'notas-por-calificar.html',
            'notas-certificadas.html', 'detalle-certificado.html',
            'est-por-asignatura.html',
            'principal-trabajos-investigacion.html',
            'solicitar-tutoria.html', 'trabajos-investigacion.html',
            'tutor-externo.html',
            'principal-profesores.html', 'profesores.html',
            'calif-docente.html', 'horas-impartidas.html',
            'estudiantes.html', 'principal-estudiantes.html',
            'reinscripcion.html'
        ]
    };
    const routes = allowedRoutes[role] || [];
    res.json({ allowedRoutes: routes });
});

router.post('/refresh-token', authController.refreshToken);

router.post('/registrar-bitacora', checkJWT, async (req, res) => {
    try {
        const { hora, fecha, ip, usuario, accion, modulo, registroId, detalles } = req.body;

        if (!hora || !fecha || !ip || !usuario || !accion) {
            return res.status(400).json({ message: 'Faltan datos requeridos' });
        }

        await registrarBitacora(hora, fecha, ip, usuario, accion, modulo, registroId, detalles);
        res.json({ success: true });
    } catch (error) {
        console.error('Error al registrar en bitácora:', error);
        res.status(500).json({ message: 'Error al registrar en bitácora' });
    }
});

module.exports = router;
