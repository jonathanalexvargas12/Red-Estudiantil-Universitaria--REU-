const express = require('express');
const bodyParser = require('body-parser');
const authRoutes = require('./src/routes/authRoutes');

const app = express();
const port = 3007;

// Middleware para parsear el cuerpo de las solicitudes
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Montar rutas de autenticación
app.use('/auth', authRoutes);

// Montar rutas CRUD bajo /api
app.use('/api', authRoutes);

// Servir archivos estáticos
app.use(express.static('public'));


//Borra esto despues

// Iniciar el servidor
app.listen(port, () => {
    console.log(`Servidor corriendo en http://localhost:${port}`);
});