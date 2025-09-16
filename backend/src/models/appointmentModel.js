import db from "../../database/connectiondb.js";

class Appointment {
  // Crear cita
  static async create(citaData) {
    try {
      // Por ahora, no verificamos disponibilidad para simplificar el proceso
      // TODO: Implementar verificación de disponibilidad más adelante

      const query = `
                INSERT INTO citas (medico_id, paciente_id, cita_fecha, cita_hora, cita_tipo, cita_observaciones, cita_estado) 
                VALUES (?, ?, ?, ?, ?, ?, ?)
            `;
      const result = await db.executeQuery(query, [
        citaData.medico_id,
        citaData.paciente_id,
        citaData.cita_fecha,
        citaData.cita_hora,
        citaData.cita_tipo || null,
        citaData.cita_observaciones || null,
        citaData.cita_estado || 1,
      ]);
      if (!result.success) {
        throw new Error(result.error);
      }

      return { success: true, insertId: result.data.insertId };
    } catch (error) {
      throw new Error(`Error al crear cita: ${error.message}`);
    }
  }

  // Obtener todas las citas
  static async getAll() {
    try {
      console.log("🔍 [AppointmentModel] Obteniendo todas las citas...");

      // Consulta simplificada primero
      const query = `
                SELECT 
                    c.cita_id, c.cita_fecha, c.cita_hora, c.cita_estado,
                    c.medico_id, c.paciente_id,
                    c.cita_tipo, c.cita_observaciones,
                    CASE 
                        WHEN c.cita_estado IN ('Completada', 'Cancelada') THEN c.cita_estado
                        WHEN c.cita_fecha < CURDATE() OR (c.cita_fecha = CURDATE() AND c.cita_hora < CURTIME()) THEN 'Completada'
                        ELSE 'Pendiente'
                    END as estado_calculado
                FROM citas c
                ORDER BY c.cita_fecha DESC, c.cita_hora DESC
            `;

      const result = await db.executeQuery(query);
      console.log("📊 [AppointmentModel] Resultado de getAll:", result);

      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    } catch (error) {
      console.error("❌ [AppointmentModel] Error en getAll:", error);
      throw new Error(`Error al obtener citas: ${error.message}`);
    }
  }

  // Obtener cita por ID
  static async getById(cita_id) {
    try {
      const query = `
                SELECT 
                    c.cita_id, c.medico_id, c.paciente_id, c.cita_fecha, c.cita_hora, c.cita_estado,
                    um.usuario_nombre as medico_nombre, um.usuario_apellido as medico_apellido,
                    e.especialidad_nombre,
                    up.usuario_nombre as paciente_nombre, up.usuario_apellido as paciente_apellido,
                    up.usuario_telefono, up.usuario_correo, up.usuario_identificacion
                FROM citas c
                INNER JOIN medicos m ON c.medico_id = m.medico_id
                INNER JOIN usuarios um ON m.usuario_id = um.usuario_id
                LEFT JOIN especialidades e ON m.especialidad_id = e.especialidad_id
                INNER JOIN pacientes p ON c.paciente_id = p.paciente_id
                INNER JOIN usuarios up ON p.usuario_id = up.usuario_id
                WHERE c.cita_id = ?
            `;
      const result = await db.executeQuery(query, [cita_id]);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data[0] || null;
    } catch (error) {
      throw new Error(`Error al obtener cita: ${error.message}`);
    }
  }

  // Actualizar cita
  static async update(cita_id, citaData) {
    try {
      // Obtener datos actuales de la cita
      const citaActual = await this.getById(cita_id);
      if (!citaActual) {
        throw new Error("Cita no encontrada");
      }

      // Si se cambia la fecha/hora, verificar disponibilidad
      if (
        citaData.cita_fecha !== citaActual.cita_fecha ||
        citaData.cita_hora !== citaActual.cita_hora
      ) {
        const disponibilidad = await this.checkAvailability(
          citaActual.medico_id,
          citaData.cita_fecha,
          citaData.cita_hora
        );
        if (!disponibilidad) {
          throw new Error(
            "El médico no está disponible en esa nueva fecha y hora"
          );
        }

        // Liberar el horario anterior
        await this.updateAvailability(
          citaActual.medico_id,
          citaActual.cita_fecha,
          citaActual.cita_hora,
          1
        );

        // Ocupar el nuevo horario
        await this.updateAvailability(
          citaActual.medico_id,
          citaData.cita_fecha,
          citaData.cita_hora,
          0
        );
      }

      const query = `
                UPDATE citas SET 
                    cita_fecha = ?, cita_hora = ?, cita_estado = ?
                WHERE cita_id = ?
            `;
      const result = await db.executeQuery(query, [
        citaData.cita_fecha,
        citaData.cita_hora,
        citaData.cita_estado,
        cita_id,
      ]);
      if (!result.success) {
        throw new Error(result.error);
      }
      return { success: result.data.affectedRows > 0 };
    } catch (error) {
      throw new Error(`Error al actualizar cita: ${error.message}`);
    }
  }

  // Eliminar cita (soft delete)
  static async delete(cita_id) {
    try {
      // Obtener datos de la cita para liberar disponibilidad
      const cita = await this.getById(cita_id);
      if (cita) {
        await this.updateAvailability(
          cita.medico_id,
          cita.cita_fecha,
          cita.cita_hora,
          1
        );
      }

      const query = `UPDATE citas SET cita_estado = 0 WHERE cita_id = ?`;
      const result = await db.executeQuery(query, [cita_id]);
      if (!result.success) {
        throw new Error(result.error);
      }
      return { success: result.data.affectedRows > 0 };
    } catch (error) {
      throw new Error(`Error al eliminar cita: ${error.message}`);
    }
  }

  // Verificar disponibilidad del médico
  static async checkAvailability(medico_id, fecha, hora) {
    try {
      const query = `
                SELECT disponibilidad_id FROM disponibilidad 
                WHERE medico_id = ? AND disponibilidad_fecha = ? AND disponibilidad_hora = ? 
                AND disponibilidad_estado = 1
            `;
      const result = await db.executeQuery(query, [medico_id, fecha, hora]);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data.length > 0;
    } catch (error) {
      throw new Error(`Error al verificar disponibilidad: ${error.message}`);
    }
  }

  // Actualizar disponibilidad del médico
  static async updateAvailability(medico_id, fecha, hora, estado) {
    try {
      const query = `
                UPDATE disponibilidad SET disponibilidad_estado = ?
                WHERE medico_id = ? AND disponibilidad_fecha = ? AND disponibilidad_hora = ?
            `;
      const result = await db.executeQuery(query, [
        estado,
        medico_id,
        fecha,
        hora,
      ]);
      if (!result.success) {
        throw new Error(result.error);
      }
    } catch (error) {
      throw new Error(`Error al actualizar disponibilidad: ${error.message}`);
    }
  }

  // Obtener citas por fecha
  static async getByDate(fecha) {
    try {
      const query = `
                SELECT 
                    c.cita_id, c.cita_fecha, c.cita_hora, c.cita_estado,
                    m.medico_id,
                    um.usuario_nombre as medico_nombre, um.usuario_apellido as medico_apellido,
                    e.especialidad_nombre,
                    p.paciente_id,
                    up.usuario_nombre as paciente_nombre, up.usuario_apellido as paciente_apellido,
                    up.usuario_telefono
                FROM citas c
                INNER JOIN medicos m ON c.medico_id = m.medico_id
                INNER JOIN usuarios um ON m.usuario_id = um.usuario_id
                LEFT JOIN especialidades e ON m.especialidad_id = e.especialidad_id
                INNER JOIN pacientes p ON c.paciente_id = p.paciente_id
                INNER JOIN usuarios up ON p.usuario_id = up.usuario_id
                WHERE c.cita_fecha = ? AND c.cita_estado = 1
                ORDER BY c.cita_hora
            `;
      const result = await db.executeQuery(query, [fecha]);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    } catch (error) {
      throw new Error(`Error al obtener citas por fecha: ${error.message}`);
    }
  }

  // Obtener citas de hoy
  static async getToday() {
    try {
      const query = `
                SELECT 
                    c.cita_id, c.cita_fecha, c.cita_hora, c.cita_estado,
                    m.medico_id,
                    um.usuario_nombre as medico_nombre, um.usuario_apellido as medico_apellido,
                    e.especialidad_nombre,
                    p.paciente_id,
                    up.usuario_nombre as paciente_nombre, up.usuario_apellido as paciente_apellido,
                    up.usuario_telefono
                FROM citas c
                INNER JOIN medicos m ON c.medico_id = m.medico_id
                INNER JOIN usuarios um ON m.usuario_id = um.usuario_id
                LEFT JOIN especialidades e ON m.especialidad_id = e.especialidad_id
                INNER JOIN pacientes p ON c.paciente_id = p.paciente_id
                INNER JOIN usuarios up ON p.usuario_id = up.usuario_id
                WHERE c.cita_fecha = CURDATE() AND c.cita_estado = 1
                ORDER BY c.cita_hora
            `;
      const result = await db.executeQuery(query);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    } catch (error) {
      throw new Error(`Error al obtener citas de hoy: ${error.message}`);
    }
  }

  // Obtener próximas citas
  static async getUpcoming(limit = 10) {
    try {
      const query = `
                SELECT 
                    c.cita_id, c.cita_fecha, c.cita_hora, c.cita_estado,
                    m.medico_id,
                    um.usuario_nombre as medico_nombre, um.usuario_apellido as medico_apellido,
                    e.especialidad_nombre,
                    p.paciente_id,
                    up.usuario_nombre as paciente_nombre, up.usuario_apellido as paciente_apellido,
                    up.usuario_telefono
                FROM citas c
                INNER JOIN medicos m ON c.medico_id = m.medico_id
                INNER JOIN usuarios um ON m.usuario_id = um.usuario_id
                LEFT JOIN especialidades e ON m.especialidad_id = e.especialidad_id
                INNER JOIN pacientes p ON c.paciente_id = p.paciente_id
                INNER JOIN usuarios up ON p.usuario_id = up.usuario_id
                WHERE c.cita_estado = 1 
                AND (c.cita_fecha > CURDATE() OR (c.cita_fecha = CURDATE() AND c.cita_hora >= CURTIME()))
                ORDER BY c.cita_fecha ASC, c.cita_hora ASC
                LIMIT ?
            `;
      const result = await db.executeQuery(query, [limit]);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    } catch (error) {
      throw new Error(`Error al obtener próximas citas: ${error.message}`);
    }
  }

  // Obtener estadísticas de citas
  static async getStats(medico_id = null) {
    try {
      let whereClause = "WHERE cita_estado = 1";
      let params = [];

      if (medico_id) {
        whereClause += " AND medico_id = ?";
        params.push(medico_id);
      }

      const queries = [
        `SELECT COUNT(*) as total_citas FROM citas ${whereClause}`,
        `SELECT COUNT(DISTINCT paciente_id) as total_pacientes FROM citas ${whereClause}`,
        `SELECT COUNT(*) as citas_hoy FROM citas ${whereClause} AND cita_fecha = CURDATE()`,
        `SELECT COUNT(*) as proximas_citas FROM citas ${whereClause} AND (cita_fecha > CURDATE() OR (cita_fecha = CURDATE() AND cita_hora >= CURTIME()))`,
        `SELECT COUNT(*) as citas_completadas FROM citas ${whereClause} AND (cita_fecha < CURDATE() OR (cita_fecha = CURDATE() AND cita_hora < CURTIME()))`,
      ];

      const results = await Promise.all(
        queries.map((query) => db.executeQuery(query, params))
      );

      // Verificar que todas las consultas fueron exitosas
      for (const result of results) {
        if (!result.success) {
          throw new Error(result.error);
        }
      }

      return {
        total_citas: results[0].data[0].total_citas,
        total_pacientes: results[1].data[0].total_pacientes,
        citas_hoy: results[2].data[0].citas_hoy,
        proximas_citas: results[3].data[0].proximas_citas,
        citas_completadas: results[4].data[0].citas_completadas,
      };
    } catch (error) {
      throw new Error(
        `Error al obtener estadísticas de citas: ${error.message}`
      );
    }
  }

  // Actualizar estado de cita
  static async updateStatus(cita_id, estado) {
    try {
      console.log(
        `🔍 [AppointmentModel] Actualizando estado de cita ${cita_id} a: ${estado}`
      );

      // Verificar que la cita existe
      const citaExists = await this.getById(cita_id);
      if (!citaExists) {
        throw new Error("Cita no encontrada");
      }

      // Actualizar el estado en la base de datos
      const query = `UPDATE citas SET cita_estado = ? WHERE cita_id = ?`;
      const result = await db.executeQuery(query, [estado, cita_id]);

      if (!result.success) {
        throw new Error(result.error);
      }

      console.log(`✅ [AppointmentModel] Estado actualizado exitosamente`);
      return {
        success: true,
        message: `Estado de la cita actualizado a: ${estado}`,
        affectedRows: result.data.affectedRows,
      };
    } catch (error) {
      console.error(`❌ [AppointmentModel] Error actualizando estado:`, error);
      throw new Error(
        `Error al actualizar estado de la cita: ${error.message}`
      );
    }
  }
}

export default Appointment;
