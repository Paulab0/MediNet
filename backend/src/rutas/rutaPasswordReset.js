import { Router } from "express";
import passwordResetController from "../controladores/passwordResetController.js";

const passwordResetRouter = Router();

// Solicitar recuperación de contraseña
passwordResetRouter.post(
  "/request",
  passwordResetController.requestReset
);

// Verificar token de recuperación
passwordResetRouter.get(
  "/verify",
  passwordResetController.verifyToken
);

// Resetear contraseña con token
passwordResetRouter.post(
  "/reset",
  passwordResetController.resetPassword
);

// Limpiar tokens expirados (administrativo)
passwordResetRouter.post(
  "/clean-expired",
  passwordResetController.cleanExpiredTokens
);

export default passwordResetRouter;

