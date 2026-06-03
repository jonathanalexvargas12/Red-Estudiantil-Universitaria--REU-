const { body, param, validationResult } = require('express-validator');

const handleErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            message: 'Datos inválidos',
            errors: errors.array().map(e => ({ field: e.path, msg: e.msg }))
        });
    }
    next();
};

const loginRules = [
    body('email')
        .notEmpty().withMessage('El correo es requerido')
        .isEmail().withMessage('Formato de correo inválido'),
    body('password')
        .notEmpty().withMessage('La contraseña es requerida'),
    handleErrors
];

const createUserRules = [
    body('ID_Usuario').notEmpty().withMessage('ID_Usuario es requerido'),
    body('Nombres').notEmpty().withMessage('Nombres son requeridos'),
    body('Apellidos').notEmpty().withMessage('Apellidos son requeridos'),
    body('Rol').isIn(['Administrador', 'Administrativo', 'Docente', 'Estudiante', 'Control_de_Estudios', 'Tutor_Externo'])
        .withMessage('Rol inválido'),
    handleErrors
];

const changePasswordRules = [
    param('id').notEmpty().withMessage('ID de usuario requerido'),
    body('nuevaContrasena')
        .notEmpty().withMessage('La nueva contraseña es requerida')
        .isLength({ min: 8 }).withMessage('La contraseña debe tener al menos 8 caracteres'),
    handleErrors
];

const asistenciaMarcarRules = [
    body('Docente_Cedula').notEmpty().withMessage('Docente_Cedula es requerido'),
    body('Periodo_Academico').notEmpty().withMessage('Periodo_Academico es requerido'),
    body('Asignatura').notEmpty().withMessage('Asignatura es requerida'),
    body('Seccion').notEmpty().withMessage('Seccion es requerida'),
    body('Fecha').notEmpty().withMessage('Fecha es requerida'),
    handleErrors
];

const inscripcionCompletaRules = [
    body('Cedula_Estudiante').notEmpty().withMessage('Cédula del estudiante es requerida'),
    body('Carrera').notEmpty().withMessage('Carrera es requerida'),
    body('Periodo_Academico').notEmpty().withMessage('Período académico es requerido'),
    handleErrors
];

const reinscripcionCompletaRules = [
    body('Cedula_Estudiante').notEmpty().withMessage('Cédula del estudiante es requerida'),
    body('Carrera').notEmpty().withMessage('Carrera es requerida'),
    body('Periodo_Academico').notEmpty().withMessage('Período académico es requerido'),
    body('Nivel_Pensum').notEmpty().withMessage('Nivel de pensum es requerido'),
    body('Turno').notEmpty().withMessage('Turno es requerido'),
    handleErrors
];

const idParamRule = [
    param('id').notEmpty().withMessage('ID es requerido'),
    handleErrors
];

const solicitarRecuperacionRules = [
    body('correo')
        .notEmpty().withMessage('El correo es requerido')
        .isEmail().withMessage('Formato de correo inválido'),
    handleErrors
];

const verificarCodigoRules = [
    body('correo')
        .notEmpty().withMessage('El correo es requerido')
        .isEmail().withMessage('Formato de correo inválido'),
    body('codigo')
        .notEmpty().withMessage('El código es requerido')
        .isLength({ min: 6, max: 6 }).withMessage('El código debe tener 6 caracteres'),
    handleErrors
];

const cambiarContrasenaRecuperacionRules = [
    body('correo')
        .notEmpty().withMessage('El correo es requerido')
        .isEmail().withMessage('Formato de correo inválido'),
    body('codigo')
        .notEmpty().withMessage('El código es requerido'),
    body('nuevaContrasena')
        .notEmpty().withMessage('La nueva contraseña es requerida')
        .isLength({ min: 6, max: 8 }).withMessage('La contraseña debe tener entre 6 y 8 caracteres'),
    handleErrors
];

module.exports = {
    loginRules,
    createUserRules,
    changePasswordRules,
    asistenciaMarcarRules,
    inscripcionCompletaRules,
    reinscripcionCompletaRules,
    idParamRule,
    solicitarRecuperacionRules,
    verificarCodigoRules,
    cambiarContrasenaRecuperacionRules,
    handleErrors
};
