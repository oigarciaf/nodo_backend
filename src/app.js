const express = require('express');
const { connectDB } = require('./config/database');
const prueba = require('./routes/prueba');

const app = express();

// Conectar a la base de datos
connectDB();

// Middleware
app.use(express.json());

// Rutas
app.use('/api', prueba);

app.get('/', (req, res) => {
    res.json({ message: 'Backend funcionando correctamente' });
  });
  

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor corriendo en http://localhost:${PORT}`));