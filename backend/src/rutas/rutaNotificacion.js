import { Router } from "express";
import notificacionController from "../controladores/notificacionController.js";
import verifyToken from "../intermediarios/verifyToken.js";

const notificacionRouter = Router();

// Todas las rutas requieren autenticación
notificacionRouter.use(verifyToken);

// Crear notificación (solo admin)
notificacionRouter.post("/", notificacionController.create);

// Obtener notificaciones del usuario
notificacionRouter.get("/", notificacionController.getByUsuario);

// Obtener contador de no leídas
notificacionRouter.get("/unread-count", notificacionController.getUnreadCount);

// Marcar como leída
notificacionRouter.put("/:id/read", notificacionController.markAsRead);

// Eliminar notificación
notificacionRouter.delete("/:id", notificacionController.delete);

export default notificacionRouter;


