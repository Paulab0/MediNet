import { Router } from "express";
import recordController from "../controllers/recordController.js";

const recordRouter = Router();

// Crear historial
recordRouter.post("/", recordController.create);

// Obtener todos los historiales
recordRouter.get("/", recordController.getAll);

// Obtener historial por ID
recordRouter.get("/:id", recordController.getById);

// Obtener historial por paciente
recordRouter.get("/paciente/:paciente_id", recordController.getByPaciente);

// Obtener historial por médico
recordRouter.get("/medico/:medico_id", recordController.getByMedico);

// Obtener historial por fecha
recordRouter.get("/fecha/:fecha", recordController.getByDate);

// Obtener historiales de hoy
recordRouter.get("/hoy", recordController.getToday);

// Actualizar historial
recordRouter.put("/:id", recordController.update);

// Eliminar historial (soft delete)
recordRouter.delete("/:id", recordController.delete);

// Buscar en historiales por paciente (nombre o identificación)
recordRouter.get("/search", recordController.searchByPaciente);

// Obtener historial completo de un paciente con un médico específico
recordRouter.get("/paciente/:paciente_id/medico/:medico_id", recordController.getByPacienteAndMedico);

// Crear historial automático después de una cita
recordRouter.post("/from-appointment", recordController.createFromAppointment);

// Obtener estadísticas de historiales
recordRouter.get("/stats", recordController.getStats);

// Obtener resumen de atenciones por especialidad
recordRouter.get("/especialidad/resumen", recordController.getBySpecialty);

export default recordRouter;