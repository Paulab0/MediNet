import ReminderService from "../servicios/reminderService.js";

// Job para procesar recordatorios automáticamente
// Este job se ejecuta cada 5 minutos para verificar y enviar recordatorios pendientes
class ReminderJob {
  constructor() {
    this.intervalId = null;
    this.isRunning = false;
  }

  // Iniciar el job
  start(intervalMinutes = 5) {
    if (this.isRunning) {
      console.log("⚠️ [ReminderJob] El job ya está en ejecución");
      return;
    }

    console.log(`🚀 [ReminderJob] Iniciando job de recordatorios (cada ${intervalMinutes} minutos)`);
    this.isRunning = true;

    // Ejecutar inmediatamente
    this.process();

    // Ejecutar periódicamente
    this.intervalId = setInterval(() => {
      this.process();
    }, intervalMinutes * 60 * 1000);
  }

  // Detener el job
  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      this.isRunning = false;
      console.log("🛑 [ReminderJob] Job detenido");
    }
  }

  // Procesar recordatorios
  async process() {
    try {
      console.log("⏰ [ReminderJob] Ejecutando procesamiento de recordatorios...");
      const result = await ReminderService.run();
      console.log(`✅ [ReminderJob] Procesamiento completado: ${result.sent} enviados, ${result.failed} fallidos`);
    } catch (error) {
      console.error("❌ [ReminderJob] Error en procesamiento:", error);
    }
  }
}

// Crear instancia única del job
const reminderJob = new ReminderJob();

export default reminderJob;

