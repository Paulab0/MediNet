import api from "../api/api";

const estadisticasService = {
  // Obtener estadísticas básicas
  getBasicStats: async (fecha_desde = null, fecha_hasta = null) => {
    try {
      const params = new URLSearchParams();
      if (fecha_desde) params.append("fecha_desde", fecha_desde);
      if (fecha_hasta) params.append("fecha_hasta", fecha_hasta);

      const response = await api.get(`/estadisticas/basicas?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error("Error obteniendo estadísticas:", error);
      throw error.response?.data || { error: "Error al obtener las estadísticas" };
    }
  },
};

export default estadisticasService;

