import { Router } from "express";
import availabilityController from "../controllers/availabilityController.js";

const availabilityRouter = Router();

// Crear disponibilidad
availabilityRouter.post("/", availabilityController.create);

// Crear múltiples horarios de disponibilidad
availabilityRouter.post("/multiple", availabilityController.createMultiple);

// Obtener todas las disponibilidades
availabilityRouter.get("/", availabilityController.getAll);

// Obtener disponibilidad por ID
availabilityRouter.get("/:id", availabilityController.getById);

// Obtener disponibilidad por médico
availabilityRouter.get("/medico/:medico_id", availabilityController.getByMedico);

// Obtener disponibilidad disponible por médico
availabilityRouter.get("/medico/:medico_id/available", availabilityController.getAvailableByMedico);

// Obtener disponibilidad por fecha
availabilityRouter.get("/fecha/:fecha", availabilityController.getByDate);

// Actualizar disponibilidad
availabilityRouter.put("/:id", availabilityController.update);

// Cambiar estado de disponibilidad
availabilityRouter.patch("/:id/status", availabilityController.updateStatus);

// Eliminar disponibilidad
availabilityRouter.delete("/:id", availabilityController.delete);

// Verificar disponibilidad específica
availabilityRouter.get("/check", availabilityController.checkSpecificAvailability);

// Obtener horarios ocupados por médico y fecha
availabilityRouter.get("/occupied", availabilityController.getOccupiedSlots);

// Generar disponibilidad para múltiples días
availabilityRouter.post("/generate", availabilityController.generateAvailability);

// Obtener estadísticas de disponibilidad
availabilityRouter.get("/stats", availabilityController.getStats);

export default availabilityRouter;