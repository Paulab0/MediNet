import db from "../../database/connectiondb.js";

class Patient {
  // Crear paciente
  static async create(pacienteData) {
    try {
      const query = `
                INSERT INTO pacientes (usuario_id, medico_id, paciente_estado) 
                VALUES (?, ?, ?)
            `;
      const result = await db.executeQuery(query, [
        pacienteData.usuario_id,
        pacienteData.medico_id,
        pacienteData.paciente_estado || 1,
      ]);
      if (!result.success) {
        throw new Error(result.error);
      }
      return { success: true, insertId: result.data.insertId };
    } catch (error) {
      throw new Error(`Error al crear paciente: ${error.message}`);
    }
  }

  // Obtener todos los pacientes
  static async getAll() {
    try {
      const query = `
                SELECT 
                    p.paciente_id, p.paciente_estado,
                    u.usuario_nombre, u.usuario_apellido, u.usuario_correo, 
                    u.usuario_telefono, u.usuario_identificacion, u.usuario_edad,
                    u.usuario_genero, u.usuario_direccion, u.usuario_ciudad
                FROM pacientes p
                INNER JOIN usuarios u ON p.usuario_id = u.usuario_id
                WHERE p.paciente_estado = 1 AND u.usuario_estado = 1
                ORDER BY u.usuario_apellido, u.usuario_nombre
            `;
      const result = await db.executeQuery(query);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    } catch (error) {
      throw new Error(`Error al obtener pacientes: ${error.message}`);
    }
  }

  // Obtener paciente por ID
  static async getById(paciente_id) {
    try {
      const query = `
                SELECT 
                    p.paciente_id, p.usuario_id, p.paciente_estado,
                    u.usuario_nombre, u.usuario_apellido, u.usuario_correo, 
                    u.usuario_telefono, u.usuario_identificacion, u.usuario_edad,
                    u.usuario_genero, u.usuario_direccion, u.usuario_ciudad,
                    ti.identificacion_tipo
                FROM pacientes p
                INNER JOIN usuarios u ON p.usuario_id = u.usuario_id
                LEFT JOIN tipos_identificaciones ti ON u.identificacion_id = ti.identificacion_id
                WHERE p.paciente_id = ? AND p.paciente_estado = 1
            `;
      const result = await db.executeQuery(query, [paciente_id]);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data[0] || null;
    } catch (error) {
      throw new Error(`Error al obtener paciente: ${error.message}`);
    }
  }

  // Obtener paciente por usuario ID
  static async getByUserId(usuario_id) {
    try {
      const query = `
                SELECT 
                    p.paciente_id, p.usuario_id, p.paciente_estado,
                    u.usuario_nombre, u.usuario_apellido, u.usuario_correo, 
                    u.usuario_telefono, u.usuario_identificacion, u.usuario_edad,
                    u.usuario_genero, u.usuario_direccion, u.usuario_ciudad
                FROM pacientes p
                INNER JOIN usuarios u ON p.usuario_id = u.usuario_id
                WHERE p.usuario_id = ? AND p.paciente_estado = 1
            `;
      const result = await db.executeQuery(query, [usuario_id]);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data[0] || null;
    } catch (error) {
      throw new Error(
        `Error al obtener paciente por usuario: ${error.message}`
      );
    }
  }

  // Obtener pacientes por médico
  static async getByDoctor(medico_id) {
    try {
      const query = `
                SELECT 
                    p.paciente_id, p.usuario_id, p.paciente_estado,
                    u.usuario_nombre, u.usuario_apellido, u.usuario_correo, 
                    u.usuario_telefono, u.usuario_identificacion, u.usuario_edad,
                    u.usuario_genero, u.usuario_direccion, u.usuario_ciudad
                FROM pacientes p
                INNER JOIN usuarios u ON p.usuario_id = u.usuario_id
                WHERE p.medico_id = ? AND p.paciente_estado = 1 AND u.usuario_estado = 1
                ORDER BY u.usuario_apellido, u.usuario_nombre
            `;
      const result = await db.executeQuery(query, [medico_id]);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    } catch (error) {
      throw new Error(
        `Error al obtener pacientes del médico: ${error.message}`
      );
    }
  }

  // Actualizar paciente
  static async update(paciente_id, pacienteData) {
    try {
      const query = `
                UPDATE pacientes SET 
                    paciente_estado = ?
                WHERE paciente_id = ?
            `;
      const result = await db.executeQuery(query, [
        pacienteData.paciente_estado,
        paciente_id,
      ]);
      if (!result.success) {
        throw new Error(result.error);
      }
      return { success: result.data.affectedRows > 0 };
    } catch (error) {
      throw new Error(`Error al actualizar paciente: ${error.message}`);
    }
  }

  // Eliminar paciente (soft delete)
  static async delete(paciente_id) {
    try {
      const query = `UPDATE pacientes SET paciente_estado = 0 WHERE paciente_id = ?`;
      const result = await db.executeQuery(query, [paciente_id]);
      if (!result.success) {
        throw new Error(result.error);
      }
      return { success: result.data.affectedRows > 0 };
    } catch (error) {
      throw new Error(`Error al eliminar paciente: ${error.message}`);
    }
  }

  // Obtener citas del paciente
  static async getAppointments(paciente_id, fecha = null) {
    try {
      let query = `
                SELECT 
                    c.cita_id, c.cita_fecha, c.cita_hora, c.cita_estado,
                    m.medico_id,
                    u.usuario_nombre as medico_nombre, u.usuario_apellido as medico_apellido,
                    e.especialidad_nombre
                FROM citas c
                INNER JOIN medicos m ON c.medico_id = m.medico_id
                INNER JOIN usuarios u ON m.usuario_id = u.usuario_id
                LEFT JOIN especialidades e ON m.especialidad_id = e.especialidad_id
                WHERE c.paciente_id = ? AND c.cita_estado = 1
            `;
      let params = [paciente_id];

      if (fecha) {
        query += ` AND c.cita_fecha = ?`;
        params.push(fecha);
      }

      query += ` ORDER BY c.cita_fecha DESC, c.cita_hora DESC`;

      const result = await db.executeQuery(query, params);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    } catch (error) {
      throw new Error(`Error al obtener citas del paciente: ${error.message}`);
    }
  }

  // Obtener próximas citas del paciente
  static async getUpcomingAppointments(paciente_id) {
    try {
      const query = `
                SELECT 
                    c.cita_id, c.cita_fecha, c.cita_hora, c.cita_estado,
                    m.medico_id,
                    u.usuario_nombre as medico_nombre, u.usuario_apellido as medico_apellido,
                    e.especialidad_nombre
                FROM citas c
                INNER JOIN medicos m ON c.medico_id = m.medico_id
                INNER JOIN usuarios u ON m.usuario_id = u.usuario_id
                LEFT JOIN especialidades e ON m.especialidad_id = e.especialidad_id
                WHERE c.paciente_id = ? AND c.cita_estado = 1 
                AND (c.cita_fecha > CURDATE() OR (c.cita_fecha = CURDATE() AND c.cita_hora >= CURTIME()))
                ORDER BY c.cita_fecha ASC, c.cita_hora ASC
            `;
      const result = await db.executeQuery(query, [paciente_id]);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    } catch (error) {
      throw new Error(
        `Error al obtener próximas citas del paciente: ${error.message}`
      );
    }
  }

  // Obtener historial médico del paciente
  static async getMedicalHistory(paciente_id) {
    try {
      const query = `
                SELECT 
                    h.historial_id, h.historial_fecha, h.historial_estado,
                    m.medico_id,
                    u.usuario_nombre as medico_nombre, u.usuario_apellido as medico_apellido,
                    e.especialidad_nombre
                FROM historiales h
                INNER JOIN medicos m ON h.medico_id = m.medico_id
                INNER JOIN usuarios u ON m.usuario_id = u.usuario_id
                LEFT JOIN especialidades e ON m.especialidad_id = e.especialidad_id
                WHERE h.paciente_id = ? AND h.historial_estado = 1
                ORDER BY h.historial_fecha DESC
            `;
      const result = await db.executeQuery(query, [paciente_id]);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    } catch (error) {
      throw new Error(
        `Error al obtener historial médico del paciente: ${error.message}`
      );
    }
  }

  // Buscar pacientes por nombre o identificación
  static async search(searchTerm) {
    try {
      const query = `
                SELECT 
                    p.paciente_id, p.paciente_estado,
                    u.usuario_nombre, u.usuario_apellido, u.usuario_correo, 
                    u.usuario_telefono, u.usuario_identificacion, u.usuario_edad,
                    u.usuario_genero
                FROM pacientes p
                INNER JOIN usuarios u ON p.usuario_id = u.usuario_id
                WHERE p.paciente_estado = 1 AND u.usuario_estado = 1
                AND (u.usuario_nombre LIKE ? OR u.usuario_apellido LIKE ? OR u.usuario_identificacion LIKE ?)
                ORDER BY u.usuario_apellido, u.usuario_nombre
            `;
      const searchPattern = `%${searchTerm}%`;
      const result = await db.executeQuery(query, [
        searchPattern,
        searchPattern,
        searchPattern,
      ]);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    } catch (error) {
      throw new Error(`Error al buscar pacientes: ${error.message}`);
    }
  }

  // Obtener estadísticas del paciente
  static async getStats(paciente_id) {
    try {
      const queries = [
        `SELECT COUNT(*) as total_citas FROM citas WHERE paciente_id = ? AND cita_estado = 1`,
        `SELECT COUNT(*) as total_historiales FROM historiales WHERE paciente_id = ? AND historial_estado = 1`,
        `SELECT COUNT(*) as proximas_citas FROM citas WHERE paciente_id = ? AND cita_estado = 1 AND (cita_fecha > CURDATE() OR (cita_fecha = CURDATE() AND cita_hora >= CURTIME()))`,
        `SELECT COUNT(*) as citas_completadas FROM citas WHERE paciente_id = ? AND cita_estado = 1 AND (cita_fecha < CURDATE() OR (cita_fecha = CURDATE() AND cita_hora < CURTIME()))`,
      ];

      const results = await Promise.all(
        queries.map((query) => db.executeQuery(query, [paciente_id]))
      );

      // Verificar que todas las consultas fueron exitosas
      for (const result of results) {
        if (!result.success) {
          throw new Error(result.error);
        }
      }

      return {
        total_citas: results[0].data[0].total_citas,
        total_historiales: results[1].data[0].total_historiales,
        proximas_citas: results[2].data[0].proximas_citas,
        citas_completadas: results[3].data[0].citas_completadas,
      };
    } catch (error) {
      throw new Error(
        `Error al obtener estadísticas del paciente: ${error.message}`
      );
    }
  }
}

export default Patient;
