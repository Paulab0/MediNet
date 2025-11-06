import { Router } from "express";
import doctorController from "../controladores/medicoController.js";
import verifyToken from "../intermediarios/verifyToken.js";
import authorizeRoles from "../intermediarios/authorizeRoles.js";

const doctorRouter = Router();

// Crear médico
doctorRouter.post("/", doctorController.create);

// Registrar médico completo (requiere autenticación y rol de administrador)
doctorRouter.post("/register", verifyToken, authorizeRoles([1]), doctorController.registerDoctor);

// Obtener todos los médicos
doctorRouter.get("/", doctorController.getAll);

// Obtener médico por ID
doctorRouter.get("/:id", doctorController.getById);

// Obtener médico por usuario ID
doctorRouter.get("/usuario/:usuario_id", doctorController.getByUserId);

// Actualizar médico
doctorRouter.put("/:id", doctorController.update);

// Eliminar médico (soft delete)
doctorRouter.delete("/:id", doctorController.delete);

// Obtener médicos por especialidad
doctorRouter.get(
  "/especialidad/:especialidad_id",
  doctorController.getBySpecialty
);

// Obtener disponibilidad del médico
doctorRouter.get(
  "/:medico_id/disponibilidad",
  doctorController.getAvailability
);

// Obtener citas del médico
doctorRouter.get("/:medico_id/citas", doctorController.getAppointments);

// Obtener estadísticas del médico
doctorRouter.get("/:medico_id/stats", doctorController.getStats);

// Obtener estadísticas semanales del médico
doctorRouter.get("/:medico_id/weekly-stats", doctorController.getWeeklyStats);

// Obtener estadísticas generales del médico
doctorRouter.get("/:medico_id/general-stats", doctorController.getGeneralStats);

// Actualizar perfil del médico
doctorRouter.put("/:medico_id/profile", doctorController.updateProfile);

// Actualizar información médica (especialidad, consultorio) - requiere autenticación y rol de administrador
doctorRouter.put("/:id/medical-info", verifyToken, authorizeRoles([1]), doctorController.updateMedicalInfo);

// Buscar médicos con filtros
doctorRouter.get("/search", doctorController.search);

export default doctorRouter;
