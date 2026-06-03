require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const authRoutes = require('./src/routes/authRoutes');
const crudRoutes = require('./src/routes/crudRoutes');

const app = express();
const port = process.env.PORT || 3007;

app.set('trust proxy', 1);
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());

app.use((req, res, next) => {
    const clientIP = req.headers['x-client-ip'];
    if (clientIP) {
        req.clientIP = clientIP;
    }
    next();
});

app.use('/auth', authRoutes);
app.use('/api', crudRoutes);

app.use(express.static('public'));

app.listen(port, () => {
    console.log(`Servidor corriendo en http://localhost:${port}`);
});