import { Router } from "express";
import roleController from "../controllers/roleController.js";

const roleRouter = Router();

// Crear rol
roleRouter.post("/", roleController.create);

// Obtener todos los roles
roleRouter.get("/", roleController.getAll);

// Obtener rol por ID
roleRouter.get("/:id", roleController.getById);

// Actualizar rol
roleRouter.put("/:id", roleController.update);

// Eliminar rol
roleRouter.delete("/:id", roleController.delete);

// Obtener usuarios por rol
roleRouter.get("/:id/usuarios", roleController.getUsersByRol);

// Verificar si un rol existe por nombre
roleRouter.get("/exists", roleController.existsByName);

// Obtener estadísticas por rol
roleRouter.get("/stats", roleController.getStats);

export default roleRouter;