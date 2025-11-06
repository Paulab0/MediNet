import db from "../../database/connectiondb.js";

class Notificacion {
  // Crear notificación
  static async create(notificacionData) {
    try {
      const {
        usuario_id = null,
        rol_id = null,
        notificacion_titulo,
        notificacion_mensaje,
        notificacion_tipo = "Info",
      } = notificacionData;

      const query = `
        INSERT INTO notificaciones 
        (usuario_id, rol_id, notificacion_titulo, notificacion_mensaje, notificacion_tipo)
        VALUES (?, ?, ?, ?, ?)
      `;

      const result = await db.executeQuery(query, [
        usuario_id,
        rol_id,
        notificacion_titulo,
        notificacion_mensaje,
        notificacion_tipo,
      ]);

      if (!result.success) {
        throw new Error(`Error al crear notificación: ${result.error}`);
      }

      return {
        success: true,
        notificacion_id: result.results?.insertId || result.data?.insertId,
      };
    } catch (error) {
      throw new Error(`Error al crear notificación: ${error.message}`);
    }
  }

  // Obtener notificaciones de un usuario
  static async getByUsuario(usuario_id) {
    try {
      const query = `
        SELECT * FROM notificaciones 
        WHERE (usuario_id = ? OR (usuario_id IS NULL AND (rol_id = (SELECT rol_id FROM usuarios WHERE usuario_id = ?) OR rol_id IS NULL)))
        AND notificacion_estado = 1
        ORDER BY notificacion_fecha DESC
      `;

      const result = await db.executeQuery(query, [usuario_id, usuario_id]);

      if (!result.success) {
        throw new Error(`Error al obtener notificaciones: ${result.error}`);
      }

      return result.data || [];
    } catch (error) {
      throw new Error(`Error al obtener notificaciones: ${error.message}`);
    }
  }

  // Marcar como leída
  static async markAsRead(notificacion_id, usuario_id) {
    try {
      const query = `
        UPDATE notificaciones 
        SET notificacion_leida = TRUE 
        WHERE notificacion_id = ? 
        AND (usuario_id = ? OR usuario_id IS NULL)
      `;

      const result = await db.executeQuery(query, [notificacion_id, usuario_id]);

      if (!result.success) {
        throw new Error(`Error al marcar notificación: ${result.error}`);
      }

      return { success: true };
    } catch (error) {
      throw new Error(`Error al marcar notificación: ${error.message}`);
    }
  }

  // Obtener contador de no leídas
  static async getUnreadCount(usuario_id) {
    try {
      const query = `
        SELECT COUNT(*) as count FROM notificaciones 
        WHERE (usuario_id = ? OR (usuario_id IS NULL AND (rol_id = (SELECT rol_id FROM usuarios WHERE usuario_id = ?) OR rol_id IS NULL)))
        AND notificacion_estado = 1
        AND notificacion_leida = FALSE
      `;

      const result = await db.executeQuery(query, [usuario_id, usuario_id]);

      if (!result.success) {
        throw new Error(`Error al contar notificaciones: ${result.error}`);
      }

      return result.data[0]?.count || 0;
    } catch (error) {
      throw new Error(`Error al contar notificaciones: ${error.message}`);
    }
  }

  // Eliminar notificación
  static async delete(notificacion_id, usuario_id) {
    try {
      const query = `
        UPDATE notificaciones 
        SET notificacion_estado = 0 
        WHERE notificacion_id = ? 
        AND (usuario_id = ? OR usuario_id IS NULL)
      `;

      const result = await db.executeQuery(query, [notificacion_id, usuario_id]);

      if (!result.success) {
        throw new Error(`Error al eliminar notificación: ${result.error}`);
      }

      return { success: true };
    } catch (error) {
      throw new Error(`Error al eliminar notificación: ${error.message}`);
    }
  }
}

export default Notificacion;


