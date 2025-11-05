import { Router } from "express";
import appointmentController from "../controladores/citaController.js";

const appointmentRouter = Router();

// Crear cita
appointmentRouter.post("/", appointmentController.create);

// Obtener todas las citas
appointmentRouter.get("/", appointmentController.getAll);

// Obtener citas de hoy
appointmentRouter.get("/hoy", appointmentController.getToday);

// Obtener próximas citas
appointmentRouter.get("/upcoming", appointmentController.getUpcoming);

// Obtener estadísticas de citas
appointmentRouter.get("/stats", appointmentController.getStats);

// Obtener cita por ID (debe ir al final para no interceptar otras rutas)
appointmentRouter.get("/:id", appointmentController.getById);

// Actualizar cita
appointmentRouter.put("/:id", appointmentController.update);

// Actualizar estado de cita
appointmentRouter.put("/:id/status", appointmentController.updateStatus);

// Obtener citas por fecha
appointmentRouter.get("/fecha/:fecha", appointmentController.getByDate);

// Eliminar cita (soft delete)
appointmentRouter.delete("/:id", appointmentController.delete);

export default appointmentRouter;
