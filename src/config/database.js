const sql = require('mssql');
require('dotenv').config();

const config = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER,
  database: process.env.DB_NAME,
  options: {
    encrypt: true,
    trustServerCertificate: false
  }
};

async function connectDB() {
  try {
    await sql.connect(config);
    console.log('Conectado a la base de datos');
  } catch (err) {
    console.error('Error al conectar a la base de datos:', err);
    process.exit(1);
  }
}

async function executeStoredProcedure(procedureName) {
    try {
      const pool = await sql.connect(config);
      const result = await pool.request().execute(procedureName);
      return result.recordset;
    } catch (err) {
      console.error('Error al ejecutar el procedimiento almacenado:', err);
      throw err;
    }
  }
  

module.exports = { sql, connectDB, executeStoredProcedure };