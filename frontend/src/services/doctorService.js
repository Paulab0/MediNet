import api from "../api/api";

const doctorService = {
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
};

export default doctorService;
