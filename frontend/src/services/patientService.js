import api from "../api/api";

const patientService = {
  // Obtener todos los pacientes
  getPatients: async () => {
    try {
      const response = await api.get("/pacientes");
      return response.data;
    } catch (error) {
      console.error("Error obteniendo pacientes:", error);
      throw error.response?.data || { error: "Error al obtener los pacientes" };
    }
  },

  // Crear un nuevo paciente
  createPatient: async (patientData) => {
    try {
      const response = await api.post("/pacientes", patientData);
      return response.data;
    } catch (error) {
      console.error("Error creando paciente:", error);
      throw error.response?.data || { error: "Error al crear el paciente" };
    }
  },

  // Obtener paciente por ID
  getPatientById: async (patientId) => {
    try {
      const response = await api.get(`/pacientes/${patientId}`);
      return response.data;
    } catch (error) {
      console.error("Error obteniendo paciente:", error);
      throw error.response?.data || { error: "Error al obtener el paciente" };
    }
  },

  // Actualizar paciente
  updatePatient: async (patientId, patientData) => {
    try {
      const response = await api.put(`/pacientes/${patientId}`, patientData);
      return response.data;
    } catch (error) {
      console.error("Error actualizando paciente:", error);
      throw (
        error.response?.data || { error: "Error al actualizar el paciente" }
      );
    }
  },

  // Eliminar paciente (soft delete)
  deletePatient: async (patientId) => {
    try {
      const response = await api.delete(`/pacientes/${patientId}`);
      return response.data;
    } catch (error) {
      console.error("Error eliminando paciente:", error);
      throw error.response?.data || { error: "Error al eliminar el paciente" };
    }
  },

  // Obtener pacientes por médico
  getPatientsByDoctor: async (doctorId) => {
    try {
      const response = await api.get(`/pacientes/medico/${doctorId}`);
      return response.data;
    } catch (error) {
      console.error("Error obteniendo pacientes del médico:", error);
      throw (
        error.response?.data || {
          error: "Error al obtener los pacientes del médico",
        }
      );
    }
  },
};

export default patientService;
