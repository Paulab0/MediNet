import api from "../api/api";

const specialtyService = {
  // Obtener todas las especialidades
  getSpecialties: async () => {
    try {
      const response = await api.get("/especialidades");
      return response.data;
    } catch (error) {
      console.error("Error obteniendo especialidades:", error);
      throw error;
    }
  },

  // Obtener especialidad por ID
  getSpecialtyById: async (id) => {
    try {
      const response = await api.get(`/especialidades/${id}`);
      return response.data;
    } catch (error) {
      console.error("Error obteniendo especialidad:", error);
      throw error;
    }
  },
};

export default specialtyService;
