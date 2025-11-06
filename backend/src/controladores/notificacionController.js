import Notificacion from "../modelos/notificacionModel.js";

const notificacionController = {
  // Crear notificación
  async create(req, res) {
    try {
      const notificacionData = req.body;
      const result = await Notificacion.create(notificacionData);
      res.status(201).json(result);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  // Obtener notificaciones del usuario actual
  async getByUsuario(req, res) {
    try {
      const usuario_id = req.user?.usuario_id || req.query.usuario_id;
      if (!usuario_id) {
        return res.status(400).json({ error: "Usuario ID requerido" });
      }
      const notificaciones = await Notificacion.getByUsuario(usuario_id);
      res.json(notificaciones);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Marcar como leída
  async markAsRead(req, res) {
    try {
      const { id } = req.params;
      const usuario_id = req.user?.usuario_id || req.body.usuario_id;
      if (!usuario_id) {
        return res.status(400).json({ error: "Usuario ID requerido" });
      }
      const result = await Notificacion.markAsRead(id, usuario_id);
      res.json(result);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  // Obtener contador de no leídas
  async getUnreadCount(req, res) {
    try {
      const usuario_id = req.user?.usuario_id || req.query.usuario_id;
      if (!usuario_id) {
        return res.status(400).json({ error: "Usuario ID requerido" });
      }
      const count = await Notificacion.getUnreadCount(usuario_id);
      res.json({ count });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Eliminar notificación
  async delete(req, res) {
    try {
      const { id } = req.params;
      const usuario_id = req.user?.usuario_id || req.body.usuario_id;
      if (!usuario_id) {
        return res.status(400).json({ error: "Usuario ID requerido" });
      }
      const result = await Notificacion.delete(id, usuario_id);
      res.json(result);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },
};

export default notificacionController;


