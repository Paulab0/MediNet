import { Router } from "express";
import userController from "../controladores/usuarioController.js";
import verifyToken from "../intermediarios/verifyToken.js";
import authorizeRoles from "../intermediarios/authorizeRoles.js";

const userRouter = Router();

// Crear usuario
userRouter.post("/", userController.create);

// Obtener todos los usuarios
userRouter.get("/", userController.getAll);

// Obtener usuario por ID
userRouter.get("/:id", userController.getById);

// Obtener usuario por email (para login)
userRouter.get("/find", userController.findByEmail);

// Actualizar usuario
userRouter.put("/:id", userController.update);

// Eliminar usuario (soft delete)
userRouter.delete("/:id", userController.delete);

// Obtener usuarios por rol
userRouter.get("/rol/:rol_id", userController.getByRole);

// Actualizar perfil (requiere autenticación)
userRouter.put("/profile/:id", verifyToken, userController.updateProfile);
userRouter.put("/profile", verifyToken, userController.updateProfile);

// Cambiar rol de usuario (solo admin)
userRouter.put("/:id/role", verifyToken, authorizeRoles([1]), userController.changeRole);

// Activar/Desactivar usuario (solo admin)
userRouter.put("/:id/status", verifyToken, authorizeRoles([1]), userController.toggleStatus);

export default userRouter;