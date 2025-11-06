import { Router } from "express";
import loginVerificationController from "../controladores/loginVerificationController.js";
import { verifyToken, authorizeRoles } from "../intermediarios/index.js";

const loginVerificationRouter = Router();

// Obtener tokens pendientes (solo administradores)
loginVerificationRouter.get(
  "/pending",
  verifyToken,
  authorizeRoles([1]),
  loginVerificationController.getPendingTokens
);

// Invalidar token (solo administradores)
loginVerificationRouter.delete(
  "/:token_id",
  verifyToken,
  authorizeRoles([1]),
  loginVerificationController.invalidateToken
);

// Limpiar tokens expirados (solo administradores)
loginVerificationRouter.post(
  "/clean-expired",
  verifyToken,
  authorizeRoles([1]),
  loginVerificationController.cleanExpiredTokens
);

export default loginVerificationRouter;

