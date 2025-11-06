import api from "../api/api";

const disponibilidadService = {
  // Crear disponibilidad
  create: async (disponibilidadData) => {
    try {
      const response = await api.post("/disponibilidad", disponibilidadData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: "Error al crear disponibilidad" };
    }
  },

  // Crear múltiples horarios de disponibilidad
  createMultiple: async (medico_id, fecha, horas) => {
    try {
      const response = await api.post("/disponibilidad/multiple", {
        medico_id,
        fecha,
        horas,
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: "Error al crear múltiples horarios" };
    }
  },

  // Obtener todas las disponibilidades
  getAll: async () => {
    try {
      const response = await api.get("/disponibilidad");
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: "Error al obtener disponibilidades" };
    }
  },

  // Obtener disponibilidad por ID
  getById: async (id) => {
    try {
      const response = await api.get(`/disponibilidad/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: "Error al obtener disponibilidad" };
    }
  },

  // Obtener disponibilidad por médico
  getByMedico: async (medico_id, fecha = null) => {
    try {
      const url = fecha
        ? `/disponibilidad/medico/${medico_id}?fecha=${fecha}`
        : `/disponibilidad/medico/${medico_id}`;
      const response = await api.get(url);
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: "Error al obtener disponibilidad del médico" };
    }
  },

  // Obtener disponibilidad disponible por médico
  getAvailableByMedico: async (medico_id, fecha = null) => {
    try {
      const url = fecha
        ? `/disponibilidad/medico/${medico_id}/available?fecha=${fecha}`
        : `/disponibilidad/medico/${medico_id}/available`;
      const response = await api.get(url);
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: "Error al obtener disponibilidad disponible" };
    }
  },

  // Obtener disponibilidad por fecha
  getByDate: async (fecha) => {
    try {
      const response = await api.get(`/disponibilidad/fecha/${fecha}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: "Error al obtener disponibilidad por fecha" };
    }
  },

  // Actualizar disponibilidad
  update: async (id, disponibilidadData) => {
    try {
      const response = await api.put(`/disponibilidad/${id}`, disponibilidadData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: "Error al actualizar disponibilidad" };
    }
  },

  // Cambiar estado de disponibilidad
  updateStatus: async (id, estado) => {
    try {
      const response = await api.patch(`/disponibilidad/${id}/status`, { estado });
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: "Error al actualizar estado de disponibilidad" };
    }
  },

  // Eliminar disponibilidad
  delete: async (id) => {
    try {
      const response = await api.delete(`/disponibilidad/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: "Error al eliminar disponibilidad" };
    }
  },

  // Verificar disponibilidad específica
  checkSpecificAvailability: async (medico_id, fecha, hora) => {
    try {
      const response = await api.get(
        `/disponibilidad/check?medico_id=${medico_id}&fecha=${fecha}&hora=${hora}`
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: "Error al verificar disponibilidad" };
    }
  },

  // Obtener horarios ocupados por médico y fecha
  getOccupiedSlots: async (medico_id, fecha) => {
    try {
      const response = await api.get(
        `/disponibilidad/occupied?medico_id=${medico_id}&fecha=${fecha}`
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: "Error al obtener horarios ocupados" };
    }
  },

  // Generar disponibilidad para múltiples días
  generateAvailability: async (medico_id, fechaInicio, fechaFin, horas) => {
    try {
      const response = await api.post("/disponibilidad/generate", {
        medico_id,
        fechaInicio,
        fechaFin,
        horas,
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: "Error al generar disponibilidad" };
    }
  },

  // Obtener estadísticas de disponibilidad
  getStats: async (medico_id = null) => {
    try {
      const url = medico_id
        ? `/disponibilidad/stats?medico_id=${medico_id}`
        : "/disponibilidad/stats";
      const response = await api.get(url);
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: "Error al obtener estadísticas" };
    }
  },
};

export default disponibilidadService;

