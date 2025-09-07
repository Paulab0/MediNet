import { Router } from "express";
import patientController from "../controllers/patientController.js";

const patientRouter = Router();

// Crear paciente
patientRouter.post("/", patientController.create);

// Obtener todos los pacientes
patientRouter.get("/", patientController.getAll);

// Obtener paciente por ID
patientRouter.get("/:id", patientController.getById);

// Obtener paciente por usuario ID
patientRouter.get("/usuario/:usuario_id", patientController.getByUserId);

// Obtener pacientes por médico
patientRouter.get("/medico/:doctorId", patientController.getByDoctor);

// Actualizar paciente
patientRouter.put("/:id", patientController.update);

// Eliminar paciente (soft delete)
patientRouter.delete("/:id", patientController.delete);

// Obtener citas del paciente
patientRouter.get("/:paciente_id/citas", patientController.getAppointments);

// Obtener próximas citas del paciente
patientRouter.get(
  "/:paciente_id/citas/upcoming",
  patientController.getUpcomingAppointments
);

// Obtener historial médico del paciente
patientRouter.get(
  "/:paciente_id/historial",
  patientController.getMedicalHistory
);

// Buscar pacientes por nombre o identificación
patientRouter.get("/search", patientController.search);

// Obtener estadísticas del paciente
patientRouter.get("/:paciente_id/stats", patientController.getStats);

export default patientRouter;
