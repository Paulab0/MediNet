import { Router } from "express";
import authController from "../controladores/autenticacionController.js";

const authRouter = Router();

// Registrar usuario
authRouter.post("/register", authController.register);

// Login de usuario
authRouter.post("/login", authController.login);

// Confirmar inicio de sesión
authRouter.post("/confirm-login", authController.confirmLogin);

// Cambiar contraseña
authRouter.post("/change-password", authController.changePassword);

// Obtener usuario por correo
authRouter.get("/find", authController.findUserByEmail);

// Obtener información completa del usuario con su rol
authRouter.get("/user/:usuario_id", authController.getUserWithRole);

export default authRouter;