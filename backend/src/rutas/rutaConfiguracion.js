import { Router } from "express";
import configuracionController from "../controladores/configuracionController.js";
import verifyToken from "../intermediarios/verifyToken.js";
import authorizeRoles from "../intermediarios/authorizeRoles.js";

const configuracionRouter = Router();

// Todas las rutas requieren autenticación
configuracionRouter.use(verifyToken);

// Obtener todas las configuraciones
configuracionRouter.get("/", configuracionController.getAll);

// Obtener configuración por clave
configuracionRouter.get("/:clave", configuracionController.getByKey);

// Obtener valor de configuración
configuracionRouter.get("/:clave/valor", configuracionController.getValue);

// Obtener configuración de horarios (público para autenticados)
configuracionRouter.get("/horarios", configuracionController.getHorarios);

// Crear o actualizar configuración (solo admin)
configuracionRouter.put("/", authorizeRoles([1]), configuracionController.set);

// Guardar configuración de horarios (solo admin)
configuracionRouter.put("/horarios", authorizeRoles([1]), configuracionController.setHorarios);

// Eliminar configuración (solo admin)
configuracionRouter.delete("/:clave", authorizeRoles([1]), configuracionController.delete);

export default configuracionRouter;

