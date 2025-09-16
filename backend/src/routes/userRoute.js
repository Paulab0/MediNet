import { Router } from "express";
import userController from "../controllers/userController.js";

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

export default userRouter;