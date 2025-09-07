import { Router } from "express";
import reminderController from "../controllers/reminderController.js";

const reminderRouter = Router();

// Crear recordatorio
reminderRouter.post("/", reminderController.create);

// Obtener todos los recordatorios
reminderRouter.get("/", reminderController.getAll);

// Obtener recordatorio por ID
reminderRouter.get("/:id", reminderController.getById);

// Obtener recordatorios por médico
reminderRouter.get("/medico/:medico_id", reminderController.getByMedico);

// Obtener recordatorios por fecha
reminderRouter.get("/fecha/:fecha", reminderController.getByDate);

// Obtener recordatorios de hoy
reminderRouter.get("/hoy", reminderController.getToday);

// Obtener próximos recordatorios
reminderRouter.get("/upcoming", reminderController.getUpcoming);

// Actualizar recordatorio
reminderRouter.put("/:id", reminderController.update);

// Eliminar recordatorio (soft delete)
reminderRouter.delete("/:id", reminderController.delete);

// Marcar recordatorio como completado
reminderRouter.patch("/:id/completed", reminderController.markAsCompleted);

// Obtener recordatorios pendientes por médico
reminderRouter.get("/medico/:medico_id/pending", reminderController.getPendingByMedico);

// Obtener recordatorios vencidos
reminderRouter.get("/overdue", reminderController.getOverdue);

// Crear recordatorio automático para cita
reminderRouter.post("/for-appointment", reminderController.createForAppointment);

// Obtener estadísticas de recordatorios
reminderRouter.get("/stats", reminderController.getStats);

export default reminderRouter;