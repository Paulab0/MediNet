import { Router } from "express";
import emailVerificationController from "../controllers/emailVerificationController.js";

const emailVerificationRouter = Router();

// Confirmar email con token
emailVerificationRouter.get(
  "/confirm",
  emailVerificationController.confirmEmail
);

// Reenviar token de verificación
emailVerificationRouter.post(
  "/resend",
  emailVerificationController.resendVerificationToken
);

// Limpiar tokens expirados (administrativo)
emailVerificationRouter.post(
  "/clean-expired",
  emailVerificationController.cleanExpiredTokens
);

export default emailVerificationRouter;

