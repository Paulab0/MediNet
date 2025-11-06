import { Router } from "express";
import roleController from "../controladores/rolController.js";

const roleRouter = Router();

// Crear rol
roleRouter.post("/", roleController.create);

// Obtener todos los roles
roleRouter.get("/", roleController.getAll);

// Verificar si un rol existe por nombre (debe ir ANTES de /:id)
roleRouter.get("/exists", roleController.existsByName);

// Obtener estadísticas por rol (debe ir ANTES de /:id)
roleRouter.get("/stats", roleController.getStats);

// Obtener rol por ID
roleRouter.get("/:id", roleController.getById);

// Actualizar rol
roleRouter.put("/:id", roleController.update);

// Eliminar rol
roleRouter.delete("/:id", roleController.delete);

// Obtener usuarios por rol
roleRouter.get("/:id/usuarios", roleController.getUsersByRol);

export default roleRouter;