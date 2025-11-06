import api from "../api/api";

const configuracionService = {
  // Obtener todas las configuraciones
  getAll: async () => {
    try {
      const response = await api.get("/configuracion");
      return response.data;
    } catch (error) {
      console.error("Error obteniendo configuraciones:", error);
      throw error.response?.data || { error: "Error al obtener configuraciones" };
    }
  },

  // Obtener configuración por clave
  getByKey: async (clave) => {
    try {
      const response = await api.get(`/configuracion/${clave}`);
      return response.data;
    } catch (error) {
      console.error("Error obteniendo configuración:", error);
      throw error.response?.data || { error: "Error al obtener configuración" };
    }
  },

  // Obtener valor de configuración
  getValue: async (clave, defaultValue = null) => {
    try {
      const response = await api.get(`/configuracion/${clave}/valor`, {
        params: { default: defaultValue },
      });
      return response.data.valor;
    } catch (error) {
      console.error("Error obteniendo valor de configuración:", error);
      return defaultValue;
    }
  },

  // Crear o actualizar configuración
  set: async (clave, valor, descripcion = null, tipo = "String") => {
    try {
      const response = await api.put("/configuracion", {
        clave,
        valor,
        descripcion,
        tipo,
      });
      return response.data;
    } catch (error) {
      console.error("Error guardando configuración:", error);
      throw error.response?.data || { error: "Error al guardar configuración" };
    }
  },

  // Eliminar configuración
  delete: async (clave) => {
    try {
      const response = await api.delete(`/configuracion/${clave}`);
      return response.data;
    } catch (error) {
      console.error("Error eliminando configuración:", error);
      throw error.response?.data || { error: "Error al eliminar configuración" };
    }
  },

  // Obtener configuración de horarios
  getHorarios: async () => {
    try {
      const response = await api.get("/configuracion/horarios");
      return response.data;
    } catch (error) {
      console.error("Error obteniendo horarios:", error);
      throw error.response?.data || { error: "Error al obtener horarios" };
    }
  },

  // Guardar configuración de horarios
  setHorarios: async (horariosData) => {
    try {
      const response = await api.put("/configuracion/horarios", horariosData);
      return response.data;
    } catch (error) {
      console.error("Error guardando horarios:", error);
      throw error.response?.data || { error: "Error al guardar horarios" };
    }
  },
};

export default configuracionService;


