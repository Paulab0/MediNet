import api from "../api/api";

const reminderService = {
  // Obtener todos los recordatorios
  getReminders: async () => {
    const response = await api.get("/recordatorios");
    return response.data;
  },

  // Obtener recordatorios por médico
  getRemindersByMedico: async (medico_id) => {
    const response = await api.get(`/recordatorios/medico/${medico_id}`);
    return response.data;
  },

  // Obtener recordatorios pendientes por médico
  getPendingReminders: async (medico_id) => {
    const response = await api.get(`/recordatorios/medico/${medico_id}/pending`);
    return response.data;
  },

  // Obtener próximos recordatorios
  getUpcomingReminders: async (limit = 10) => {
    const response = await api.get(`/recordatorios/upcoming?limit=${limit}`);
    return response.data;
  },

  // Obtener recordatorios de hoy
  getTodayReminders: async () => {
    const response = await api.get("/recordatorios/hoy");
    return response.data;
  },

  // Marcar recordatorio como completado
  markAsCompleted: async (recordatorio_id) => {
    const response = await api.patch(`/recordatorios/${recordatorio_id}/completed`);
    return response.data;
  },

  // Crear recordatorio automático para cita
  createForAppointment: async (medico_id, cita_fecha, cita_hora, minutes_before = 30) => {
    const response = await api.post("/recordatorios/for-appointment", {
      medico_id,
      cita_fecha,
      cita_hora,
      minutes_before,
    });
    return response.data;
  },

  // Obtener estadísticas de recordatorios
  getStats: async (medico_id = null) => {
    const url = medico_id 
      ? `/recordatorios/stats?medico_id=${medico_id}`
      : "/recordatorios/stats";
    const response = await api.get(url);
    return response.data;
  },
};

export default reminderService;

