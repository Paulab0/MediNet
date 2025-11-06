import ReminderService from "../servicios/reminderService.js";

const reminderServiceController = {
  // Ejecutar procesamiento de recordatorios
  async processReminders(req, res) {
    try {
      console.log("🔔 [ReminderServiceController] Iniciando procesamiento de recordatorios...");

      const result = await ReminderService.run();

      res.json({
        success: true,
        message: "Procesamiento de recordatorios completado",
        ...result,
      });
    } catch (error) {
      console.error("❌ [ReminderServiceController] Error:", error);
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  },
};

export default reminderServiceController;

