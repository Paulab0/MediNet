import db from "../../database/connectiondb.js";

class Historial {
  // Obtener historial de un paciente específico (por médico)
  static async getByPatient(medico_id, paciente_id) {
    try {
      const query = `
        SELECT 
          h.historial_id, h.historial_fecha, h.historial_tipo, 
          h.historial_diagnostico, h.historial_tratamiento, 
          h.historial_observaciones, h.historial_medicamentos,
          h.historial_proxima_cita, h.historial_estado_paciente,
          h.historial_creado_en, h.historial_actualizado_en,
          u.usuario_nombre as paciente_nombre, 
          u.usuario_apellido as paciente_apellido,
          u.usuario_edad, u.usuario_genero
        FROM historiales h
        INNER JOIN pacientes p ON h.paciente_id = p.paciente_id
        INNER JOIN usuarios u ON p.usuario_id = u.usuario_id
        WHERE h.medico_id = ? AND h.paciente_id = ? AND h.historial_estado = 1
        ORDER BY h.historial_fecha DESC, h.historial_creado_en DESC
      `;

      const result = await db.executeQuery(query, [medico_id, paciente_id]);

      if (!result.success) {
        throw new Error(result.error);
      }

      return result.data || [];
    } catch (error) {
      throw new Error(
        `Error al obtener historial del paciente: ${error.message}`
      );
    }
  }

  // Obtener historial completo de un paciente (para el paciente mismo - sin filtrar por médico)
  static async getByPacienteId(paciente_id) {
    try {
      const query = `
        SELECT 
          h.historial_id, h.historial_fecha, h.historial_tipo, 
          h.historial_diagnostico, h.historial_tratamiento, 
          h.historial_observaciones, h.historial_medicamentos,
          h.historial_proxima_cita, h.historial_estado_paciente,
          h.historial_creado_en, h.historial_actualizado_en,
          um.usuario_nombre as medico_nombre, 
          um.usuario_apellido as medico_apellido,
          e.especialidad_nombre,
          m.medico_consultorio
        FROM historiales h
        INNER JOIN medicos m ON h.medico_id = m.medico_id
        INNER JOIN usuarios um ON m.usuario_id = um.usuario_id
        LEFT JOIN especialidades e ON m.especialidad_id = e.especialidad_id
        WHERE h.paciente_id = ? AND h.historial_estado = 1
        ORDER BY h.historial_fecha DESC, h.historial_creado_en DESC
      `;

      const result = await db.executeQuery(query, [paciente_id]);

      if (!result.success) {
        throw new Error(result.error);
      }

      return result.data || [];
    } catch (error) {
      throw new Error(
        `Error al obtener historial del paciente: ${error.message}`
      );
    }
  }

  // Obtener todos los pacientes de un médico con información básica
  static async getPatientsByDoctor(medico_id) {
    try {
      const query = `
        SELECT DISTINCT
          p.paciente_id,
          u.usuario_nombre as paciente_nombre,
          u.usuario_apellido as paciente_apellido,
          u.usuario_edad,
          u.usuario_genero,
          u.usuario_telefono,
          u.usuario_correo,
          u.usuario_identificacion,
          COUNT(h.historial_id) as total_consultas,
          MAX(h.historial_fecha) as ultima_consulta,
          MAX(c.cita_fecha) as proxima_cita
        FROM pacientes p
        INNER JOIN usuarios u ON p.usuario_id = u.usuario_id
        LEFT JOIN historiales h ON p.paciente_id = h.paciente_id AND h.historial_estado = 1
        LEFT JOIN citas c ON p.paciente_id = c.paciente_id AND c.cita_estado = 'Pendiente'
        WHERE p.medico_id = ? AND p.paciente_estado = 1
        GROUP BY p.paciente_id, u.usuario_nombre, u.usuario_apellido, u.usuario_edad, 
                 u.usuario_genero, u.usuario_telefono, u.usuario_correo, u.usuario_identificacion
        ORDER BY u.usuario_nombre, u.usuario_apellido
      `;

      const result = await db.executeQuery(query, [medico_id]);

      if (!result.success) {
        throw new Error(result.error);
      }

      return result.data || [];
    } catch (error) {
      throw new Error(
        `Error al obtener pacientes del médico: ${error.message}`
      );
    }
  }

  // Crear nuevo registro de historial
  static async create(historialData) {
    try {
      const {
        medico_id,
        paciente_id,
        historial_tipo = "Consulta",
        historial_diagnostico,
        historial_tratamiento,
        historial_observaciones,
        historial_medicamentos,
        historial_proxima_cita,
        historial_estado_paciente = "Estable",
      } = historialData;

      const query = `
        INSERT INTO historiales (
          medico_id, paciente_id, historial_fecha, historial_tipo,
          historial_diagnostico, historial_tratamiento, historial_observaciones,
          historial_medicamentos, historial_proxima_cita, historial_estado_paciente
        ) VALUES (?, ?, CURDATE(), ?, ?, ?, ?, ?, ?, ?)
      `;

      const result = await db.executeQuery(query, [
        medico_id,
        paciente_id,
        historial_tipo,
        historial_diagnostico,
        historial_tratamiento,
        historial_observaciones,
        historial_medicamentos,
        historial_proxima_cita,
        historial_estado_paciente,
      ]);

      if (!result.success) {
        throw new Error(result.error);
      }

      return {
        success: true,
        historial_id: result.data.insertId,
        message: "Registro de historial creado exitosamente",
      };
    } catch (error) {
      throw new Error(`Error al crear registro de historial: ${error.message}`);
    }
  }

  // Actualizar registro de historial
  static async update(historial_id, historialData) {
    try {
      const {
        historial_tipo,
        historial_diagnostico,
        historial_tratamiento,
        historial_observaciones,
        historial_medicamentos,
        historial_proxima_cita,
        historial_estado_paciente,
      } = historialData;

      const query = `
        UPDATE historiales SET
          historial_tipo = COALESCE(?, historial_tipo),
          historial_diagnostico = COALESCE(?, historial_diagnostico),
          historial_tratamiento = COALESCE(?, historial_tratamiento),
          historial_observaciones = COALESCE(?, historial_observaciones),
          historial_medicamentos = COALESCE(?, historial_medicamentos),
          historial_proxima_cita = COALESCE(?, historial_proxima_cita),
          historial_estado_paciente = COALESCE(?, historial_estado_paciente)
        WHERE historial_id = ? AND historial_estado = 1
      `;

      const result = await db.executeQuery(query, [
        historial_tipo,
        historial_diagnostico,
        historial_tratamiento,
        historial_observaciones,
        historial_medicamentos,
        historial_proxima_cita,
        historial_estado_paciente,
        historial_id,
      ]);

      if (!result.success) {
        throw new Error(result.error);
      }

      return {
        success: true,
        message: "Registro de historial actualizado exitosamente",
      };
    } catch (error) {
      throw new Error(
        `Error al actualizar registro de historial: ${error.message}`
      );
    }
  }

  // Eliminar registro de historial (soft delete)
  static async delete(historial_id) {
    try {
      const query = `UPDATE historiales SET historial_estado = 0 WHERE historial_id = ?`;

      const result = await db.executeQuery(query, [historial_id]);

      if (!result.success) {
        throw new Error(result.error);
      }

      return {
        success: true,
        message: "Registro de historial eliminado exitosamente",
      };
    } catch (error) {
      throw new Error(
        `Error al eliminar registro de historial: ${error.message}`
      );
    }
  }
}

export default Historial;
