import api from "../api/api";

const doctorService = {
  // Listar médicos
  getDoctors: async () => {
    try {
      const response = await api.get("/medicos");
      return response.data;
    } catch (error) {
      console.error("Error obteniendo médicos:", error);
      throw error;
    }
  },
  // Actualizar perfil del médico
  updateProfile: async (medico_id, profileData) => {
    try {
      const response = await api.put(
        `/medicos/${medico_id}/profile`,
        profileData
      );
      return response.data;
    } catch (error) {
      console.error("Error actualizando perfil:", error);
      throw error;
    }
  },

  // Obtener perfil del médico
  getProfile: async (medico_id) => {
    try {
      const response = await api.get(`/medicos/${medico_id}`);
      return response.data;
    } catch (error) {
      console.error("Error obteniendo perfil:", error);
      throw error;
    }
  },

  // Actualizar información médica (especialidad, consultorio)
  updateMedicalInfo: async (medico_id, medicalInfo) => {
    try {
      const response = await api.put(`/medicos/${medico_id}/medical-info`, medicalInfo);
      return response.data;
    } catch (error) {
      console.error("Error actualizando información médica:", error);
      throw error;
    }
  },

  // Buscar médicos con filtros
  search: async (filters = {}) => {
    try {
      const response = await api.get("/medicos/search", { params: filters });
      return response.data;
    } catch (error) {
      console.error("Error buscando médicos:", error);
      throw error;
    }
  },
};

export default doctorService;
