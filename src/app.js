
const cors = require('cors');
const express = require('express');
const { connectDB } = require('./config/database');
const appRoutes = require('./appRoute');
const PORT = process.env.PORT || 8000;
const app = express();

// Conectar a la base de datos

// Configuración específica de CORS
app.use(cors({
    origin: 'http://localhost:3000', // Permitir solo solicitudes desde tu frontend
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Métodos permitidos
    allowedHeaders: ['Content-Type', 'Authorization', 'Cache-Control'], // Encabezados permitidos
    credentials: true // Permitir el envío de cookies o autenticación HTTP
}));

app.use(express.json());

// Middleware para manejar errores
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({ error: 'Internal Server Error', details: err.message });
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'healthy' });
});

// Rutas
app.use('/api', appRoutes);

app.get('/', (req, res) => {
    res.json({ message: 'Backend funcionando correctamente' });
});


// Función para iniciar el servidor
const startServer = async () => {
    try {
        // Intentar conectar a la base de datos
        await connectDB();
        
        // Iniciar el servidor
        const server = app.listen(PORT, '0.0.0.0', () => {
            console.log(`Servidor corriendo en http://0.0.0.0:${PORT}`);
        });

        // Manejar señales de terminación
        const signals = ['SIGTERM', 'SIGINT'];
        signals.forEach(signal => {
            process.on(signal, async () => {
                console.log(`${signal} recibido. Cerrando servidor...`);
                server.close(() => {
                    console.log('Servidor HTTP cerrado.');
                    process.exit(0);
                });
            });
        });

    } catch (error) {
        console.error('Error al iniciar el servidor:', error);
        process.exit(1);
    }
};

// Iniciar el servidor
startServer();