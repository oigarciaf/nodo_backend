
const { executeStoredProcedure } = require('../config/database');

exports.getData = async (req, res) => {
  try {
    const result = await executeStoredProcedure('sp_ObtenerTodosLosDatos');
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};