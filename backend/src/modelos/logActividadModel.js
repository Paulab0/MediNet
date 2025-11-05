import db from "../../database/connectiondb.js";

class LogActividad {
  // Crear log
  static async create(logData) {
    try {
      const {
        usuario_id = null,
        log_tipo,
        log_entidad,
        log_descripcion,
        log_ip = null,
        log_user_agent = null,
      } = logData;

      const query = `
        INSERT INTO logs_actividad 
        (usuario_id, log_tipo, log_entidad, log_descripcion, log_ip, log_user_agent)
        VALUES (?, ?, ?, ?, ?, ?)
      `;

      const result = await db.executeQuery(query, [
        usuario_id,
        log_tipo,
        log_entidad,
        log_descripcion,
        log_ip,
        log_user_agent,
      ]);

      if (!result.success) {
        throw new Error(`Error al crear log: ${result.error}`);
      }

      return {
        success: true,
        log_id: result.results?.insertId || result.data?.insertId,
      };
    } catch (error) {
      throw new Error(`Error al crear log: ${error.message}`);
    }
  }

  // Obtener logs por usuario
  static async getByUsuario(usuario_id, limit = 100) {
    try {
      const query = `
        SELECT * FROM logs_actividad 
        WHERE usuario_id = ?
        ORDER BY log_fecha DESC
        LIMIT ?
      `;

      const result = await db.executeQuery(query, [usuario_id, limit]);

      if (!result.success) {
        throw new Error(`Error al obtener logs: ${result.error}`);
      }

      return result.data || [];
    } catch (error) {
      throw new Error(`Error al obtener logs: ${error.message}`);
    }
  }

  // Obtener todos los logs (admin)
  static async getAll(filters = {}, limit = 500) {
    try {
      let query = "SELECT l.*, u.usuario_nombre, u.usuario_apellido, u.usuario_correo FROM logs_actividad l LEFT JOIN usuarios u ON l.usuario_id = u.usuario_id WHERE 1=1";
      const params = [];

      if (filters.log_tipo) {
        query += " AND l.log_tipo = ?";
        params.push(filters.log_tipo);
      }

      if (filters.log_entidad) {
        query += " AND l.log_entidad = ?";
        params.push(filters.log_entidad);
      }

      if (filters.usuario_id) {
        query += " AND l.usuario_id = ?";
        params.push(filters.usuario_id);
      }

      if (filters.fecha_desde) {
        query += " AND l.log_fecha >= ?";
        params.push(filters.fecha_desde);
      }

      if (filters.fecha_hasta) {
        query += " AND l.log_fecha <= ?";
        params.push(filters.fecha_hasta);
      }

      query += " ORDER BY l.log_fecha DESC LIMIT ?";
      params.push(limit);

      const result = await db.executeQuery(query, params);

      if (!result.success) {
        throw new Error(`Error al obtener logs: ${result.error}`);
      }

      return result.data || [];
    } catch (error) {
      throw new Error(`Error al obtener logs: ${error.message}`);
    }
  }
}

export default LogActividad;

