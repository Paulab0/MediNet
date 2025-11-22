import Reminder from "../modelos/recordatorioModel.js";
import emailService from "./emailService.js";
import LogActividad from "../modelos/logActividadModel.js";

class ReminderService {
  // Procesar y enviar recordatorios pendientes
  static async processPendingReminders() {
    try {
      console.log("🔔 [ReminderService] Iniciando procesamiento de recordatorios pendientes...");

      // Obtener recordatorios pendientes
      let pendingReminders;
      try {
        pendingReminders = await Reminder.getPendingReminders();
      } catch (error) {
        console.error('❌ [ReminderService] Error al obtener recordatorios pendientes:', error);
        throw new Error(`Error al obtener recordatorios pendientes: ${error.message}`);
      }

      if (pendingReminders.length === 0) {
        console.log("✅ [ReminderService] No hay recordatorios pendientes");
        return {
          success: true,
          processed: 0,
          sent: 0,
          failed: 0,
        };
      }

      console.log(`📋 [ReminderService] Encontrados ${pendingReminders.length} recordatorios pendientes`);

      let sent = 0;
      let failed = 0;

      // Procesar cada recordatorio
      for (const reminder of pendingReminders) {
        try {
          // Preparar datos para el email
          const appointmentData = {
            fecha: reminder.cita_fecha,
            hora: reminder.cita_hora?.substring(0, 5) || reminder.cita_hora,
            medico: `Dr. ${reminder.medico_nombre} ${reminder.medico_apellido}`,
            especialidad: reminder.especialidad_nombre,
            consultorio: reminder.medico_consultorio,
            tipo: reminder.cita_tipo,
          };

          // Enviar email de recordatorio
          const emailResult = await emailService.sendAppointmentReminderEmail(
            reminder.paciente_email,
            `${reminder.paciente_nombre} ${reminder.paciente_apellido}`,
            appointmentData,
            reminder.recordatorio_tipo
          );

          if (emailResult.success) {
            // Marcar recordatorio como enviado
            await Reminder.markAsSent(reminder.recordatorio_id);
            sent++;

            // Registrar log de actividad
            try {
              const db = (await import("../database/connectiondb.js")).default;
              const pacienteQuery = `SELECT usuario_id FROM pacientes WHERE paciente_id = ?`;
              const pacienteResult = await db.executeQuery(pacienteQuery, [reminder.paciente_id]);
              
              if (pacienteResult.success && pacienteResult.data && pacienteResult.data[0]) {
                const pacienteUserId = pacienteResult.data[0].usuario_id;
                
                await LogActividad.create({
                  usuario_id: pacienteUserId,
                  log_tipo: "Crear",
                  log_entidad: "Recordatorio",
                  log_descripcion: `Recordatorio de cita enviado (${reminder.recordatorio_tipo})`,
                  log_ip: "Sistema",
                  log_user_agent: "ReminderService",
                });
              }
            } catch (logError) {
              console.warn("⚠️ [ReminderService] Error registrando log:", logError.message);
            }

            console.log(`✅ [ReminderService] Recordatorio ${reminder.recordatorio_id} enviado exitosamente`);
          } else {
            failed++;
            console.error(`❌ [ReminderService] Error enviando recordatorio ${reminder.recordatorio_id}:`, emailResult.message);
          }
        } catch (error) {
          failed++;
          console.error(`❌ [ReminderService] Error procesando recordatorio ${reminder.recordatorio_id}:`, error.message);
        }
      }

      console.log(`✅ [ReminderService] Procesamiento completado: ${sent} enviados, ${failed} fallidos`);

      return {
        success: true,
        processed: pendingReminders.length,
        sent,
        failed,
      };
    } catch (error) {
      console.error("❌ [ReminderService] Error en procesamiento de recordatorios:", error);
      console.error("❌ [ReminderService] Stack trace:", error.stack);
      throw new Error(`Error procesando recordatorios: ${error.message}`);
    }
  }

  // Ejecutar procesamiento de recordatorios (para llamar desde cron job o endpoint)
  static async run() {
    try {
      const result = await this.processPendingReminders();
      return result;
    } catch (error) {
      console.error("❌ [ReminderService] Error ejecutando servicio:", error);
      throw error;
    }
  }
}

export default ReminderService;

