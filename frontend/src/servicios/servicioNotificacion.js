import api from "../api/api";

const notificacionService = {
  // Obtener notificaciones del usuario
  async getNotificaciones() {
    const response = await api.get("/notificaciones");
    return response.data;
  },

  // Obtener contador de no leídas
  async getUnreadCount() {
    const response = await api.get("/notificaciones/unread-count");
    return response.data;
  },

  // Marcar como leída
  async markAsRead(id) {
    const response = await api.put(`/notificaciones/${id}/read`);
    return response.data;
  },

  // Eliminar notificación
  async delete(id) {
    const response = await api.delete(`/notificaciones/${id}`);
    return response.data;
  },

  // Crear notificación (solo admin)
  async create(notificacionData) {
    const response = await api.post("/notificaciones", notificacionData);
    return response.data;
  },
};

export default notificacionService;

