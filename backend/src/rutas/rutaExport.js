import { Router } from "express";
import exportController from "../controladores/exportController.js";
import verifyToken from "../intermediarios/verifyToken.js";

const exportRouter = Router();

// Todas las rutas requieren autenticación
exportRouter.use(verifyToken);

// Exportar historial médico a PDF
exportRouter.get("/historial/:paciente_id", exportController.exportMedicalHistory);

// Exportar reporte de citas
exportRouter.get("/citas", exportController.exportAppointmentsReport);

export default exportRouter;


