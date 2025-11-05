import { Router } from "express";
import logActividadController from "../controladores/logActividadController.js";
import verifyToken from "../intermediarios/verifyToken.js";
import authorizeRoles from "../intermediarios/authorizeRoles.js";

const logActividadRouter = Router();

// Todas las rutas requieren autenticación
logActividadRouter.use(verifyToken);

// Obtener logs del usuario actual
logActividadRouter.get("/my-logs", logActividadController.getByUsuario);

// Obtener todos los logs (solo admin)
logActividadRouter.get(
  "/",
  authorizeRoles([1]), // Solo administradores
  logActividadController.getAll
);

export default logActividadRouter;

