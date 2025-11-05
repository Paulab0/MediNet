import api from "../api/api.js";

const historialService = {
  // Obtener todos los pacientes de un médico
  getPatientsByDoctor: async (medico_id) => {
    try {
      console.log(
        `🔍 [HistorialService] Obteniendo pacientes del médico ${medico_id}`
      );

      const response = await api.get(
        `/historial/medico/${medico_id}/pacientes`
      );

      console.log(`📊 [HistorialService] Pacientes recibidos:`, response.data);

      return response.data;
    } catch (error) {
      console.error(`❌ [HistorialService] Error obteniendo pacientes:`, error);
      throw (
        error.response?.data || {
          error: "Error al obtener los pacientes del médico",
        }
      );
    }
  },

  // Obtener historial de un paciente específico
  getPatientHistory: async (medico_id, paciente_id) => {
    try {
      console.log(
        `🔍 [HistorialService] Obteniendo historial del paciente ${paciente_id}`
      );

      const response = await api.get(
        `/historial/medico/${medico_id}/paciente/${paciente_id}`
      );

      console.log(`📊 [HistorialService] Historial recibido:`, response.data);

      return response.data;
    } catch (error) {
      console.error(`❌ [HistorialService] Error obteniendo historial:`, error);
      throw (
        error.response?.data || {
          error: "Error al obtener el historial del paciente",
        }
      );
    }
  },

  // Crear nuevo registro de historial
  createHistoryRecord: async (medico_id, paciente_id, recordData) => {
    try {
      console.log(
        `🔍 [HistorialService] Creando registro de historial:`,
        recordData
      );

      const response = await api.post(
        `/historial/medico/${medico_id}/paciente/${paciente_id}`,
        recordData
      );

      console.log(
        `✅ [HistorialService] Registro creado exitosamente:`,
        response.data
      );

      return response.data;
    } catch (error) {
      console.error(`❌ [HistorialService] Error creando registro:`, error);
      throw (
        error.response?.data || {
          error: "Error al crear el registro de historial",
        }
      );
    }
  },

  // Actualizar registro de historial
  updateHistoryRecord: async (historial_id, recordData) => {
    try {
      console.log(
        `🔍 [HistorialService] Actualizando registro ${historial_id}:`,
        recordData
      );

      const response = await api.put(
        `/historial/registro/${historial_id}`,
        recordData
      );

      console.log(
        `✅ [HistorialService] Registro actualizado exitosamente:`,
        response.data
      );

      return response.data;
    } catch (error) {
      console.error(
        `❌ [HistorialService] Error actualizando registro:`,
        error
      );
      throw (
        error.response?.data || {
          error: "Error al actualizar el registro de historial",
        }
      );
    }
  },

  // Eliminar registro de historial
  deleteHistoryRecord: async (historial_id) => {
    try {
      console.log(`🔍 [HistorialService] Eliminando registro ${historial_id}`);

      const response = await api.delete(`/historial/registro/${historial_id}`);

      console.log(
        `✅ [HistorialService] Registro eliminado exitosamente:`,
        response.data
      );

      return response.data;
    } catch (error) {
      console.error(`❌ [HistorialService] Error eliminando registro:`, error);
      throw (
        error.response?.data || {
          error: "Error al eliminar el registro de historial",
        }
      );
    }
  },

  // Exportar historial médico a PDF
  exportMedicalHistory: async (paciente_id, fecha_desde = null, fecha_hasta = null) => {
    try {
      const params = new URLSearchParams();
      if (fecha_desde) params.append('fecha_desde', fecha_desde);
      if (fecha_hasta) params.append('fecha_hasta', fecha_hasta);

      const url = `/export/historial/${paciente_id}${params.toString() ? '?' + params.toString() : ''}`;
      window.open(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}${url}`, '_blank');
    } catch (error) {
      console.error("Error exportando historial:", error);
      throw error.response?.data || { error: "Error al exportar el historial" };
    }
  },
};

export default historialService;
