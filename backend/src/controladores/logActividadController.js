import LogActividad from "../modelos/logActividadModel.js";

const logActividadController = {
  // Obtener logs del usuario actual
  async getByUsuario(req, res) {
    try {
      const usuario_id = req.user?.usuario_id;
      const limit = parseInt(req.query.limit) || 100;
      
      if (!usuario_id) {
        return res.status(400).json({ error: "Usuario no autenticado" });
      }
      
      const logs = await LogActividad.getByUsuario(usuario_id, limit);
      res.json(logs);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Obtener todos los logs (solo admin)
  async getAll(req, res) {
    try {
      const limit = parseInt(req.query.limit) || 500;
      const filters = {
        log_tipo: req.query.log_tipo,
        log_entidad: req.query.log_entidad,
        usuario_id: req.query.usuario_id,
        fecha_desde: req.query.fecha_desde,
        fecha_hasta: req.query.fecha_hasta,
      };

      // Eliminar filtros undefined
      Object.keys(filters).forEach(key => filters[key] === undefined && delete filters[key]);

      const logs = await LogActividad.getAll(filters, limit);
      res.json(logs);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
};

export default logActividadController;

