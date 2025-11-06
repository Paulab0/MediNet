import { Router } from "express";
import estadisticasController from "../controladores/estadisticasController.js";
import verifyToken from "../intermediarios/verifyToken.js";
import authorizeRoles from "../intermediarios/authorizeRoles.js";

const estadisticasRouter = Router();

// Obtener estadísticas básicas (requiere autenticación y rol de administrador)
estadisticasRouter.get(
  "/basicas",
  verifyToken,
  authorizeRoles([1]),
  estadisticasController.getBasicStats
);

export default estadisticasRouter;

