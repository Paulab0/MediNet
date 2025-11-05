import express from "express";
import historialController from "../controladores/historialController.js";

const router = express.Router();

// Obtener todos los pacientes de un médico
router.get("/medico/:medico_id/pacientes", historialController.getPatients);

// Obtener historial de un paciente específico
router.get(
  "/medico/:medico_id/paciente/:paciente_id",
  historialController.getPatientHistory
);

// Crear nuevo registro de historial
router.post(
  "/medico/:medico_id/paciente/:paciente_id",
  historialController.createRecord
);

// Actualizar registro de historial
router.put("/registro/:historial_id", historialController.updateRecord);

// Eliminar registro de historial
router.delete("/registro/:historial_id", historialController.deleteRecord);

export default router;
