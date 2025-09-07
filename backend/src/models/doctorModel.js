import db from "../../database/connectiondb.js";

class Doctor {
  // Crear médico
  static async create(medicoData) {
    try {
      const query = `
                INSERT INTO medicos (usuario_id, especialidad_id, medico_estado) 
                VALUES (?, ?, ?)
            `;
      const [result] = await db.executeQuery(query, [
        medicoData.usuario_id,
        medicoData.especialidad_id,
        medicoData.medico_estado || 1,
      ]);
      return { success: true, insertId: result.insertId };
    } catch (error) {
      throw new Error(`Error al crear médico: ${error.message}`);
    }
  }

  // Obtener todos los médicos
  static async getAll() {
    try {
      const query = `
                SELECT 
                    m.medico_id, m.medico_estado,
                    u.usuario_nombre, u.usuario_apellido, u.usuario_correo, 
                    u.usuario_telefono, u.usuario_identificacion,
                    e.especialidad_nombre
                FROM medicos m
                INNER JOIN usuarios u ON m.usuario_id = u.usuario_id
                LEFT JOIN especialidades e ON m.especialidad_id = e.especialidad_id
                WHERE m.medico_estado = 1 AND u.usuario_estado = 1
            `;
      const [result] = await db.executeQuery(query);
      return result;
    } catch (error) {
      throw new Error(`Error al obtener médicos: ${error.message}`);
    }
  }

  // Obtener médico por ID
  static async getById(medico_id) {
    try {
      const query = `
                SELECT 
                    m.medico_id, m.usuario_id, m.especialidad_id, m.medico_estado,
                    u.usuario_nombre, u.usuario_apellido, u.usuario_correo, 
                    u.usuario_telefono, u.usuario_identificacion, u.usuario_direccion,
                    u.usuario_ciudad, u.usuario_edad, u.usuario_genero,
                    e.especialidad_nombre
                FROM medicos m
                INNER JOIN usuarios u ON m.usuario_id = u.usuario_id
                LEFT JOIN especialidades e ON m.especialidad_id = e.especialidad_id
                WHERE m.medico_id = ? AND m.medico_estado = 1
            `;
      const [result] = await db.executeQuery(query, [medico_id]);
      return result[0] || null;
    } catch (error) {
      throw new Error(`Error al obtener médico: ${error.message}`);
    }
  }

  // Obtener médico por usuario ID
  static async getByUserId(usuario_id) {
    try {
      const query = `
                SELECT 
                    m.medico_id, m.usuario_id, m.especialidad_id, m.medico_estado,
                    u.usuario_nombre, u.usuario_apellido, u.usuario_correo, 
                    u.usuario_telefono, u.usuario_identificacion,
                    e.especialidad_nombre
                FROM medicos m
                INNER JOIN usuarios u ON m.usuario_id = u.usuario_id
                LEFT JOIN especialidades e ON m.especialidad_id = e.especialidad_id
                WHERE m.usuario_id = ? AND m.medico_estado = 1
            `;
      const [result] = await db.executeQuery(query, [usuario_id]);
      return result[0] || null;
    } catch (error) {
      throw new Error(`Error al obtener médico por usuario: ${error.message}`);
    }
  }

  // Actualizar médico
  static async update(medico_id, medicoData) {
    try {
      const query = `
                UPDATE medicos SET 
                    especialidad_id = ?, medico_estado = ?
                WHERE medico_id = ?
            `;
      const [result] = await db.executeQuery(query, [
        medicoData.especialidad_id,
        medicoData.medico_estado,
        medico_id,
      ]);
      return { success: result.affectedRows > 0 };
    } catch (error) {
      throw new Error(`Error al actualizar médico: ${error.message}`);
    }
  }

  // Eliminar médico (soft delete)
  static async delete(medico_id) {
    try {
      const query = `UPDATE medicos SET medico_estado = 0 WHERE medico_id = ?`;
      const [result] = await db.executeQuery(query, [medico_id]);
      return { success: result.affectedRows > 0 };
    } catch (error) {
      throw new Error(`Error al eliminar médico: ${error.message}`);
    }
  }

  // Obtener médicos por especialidad
  static async getBySpecialty(especialidad_id) {
    try {
      const query = `
                SELECT 
                    m.medico_id, m.medico_estado,
                    u.usuario_nombre, u.usuario_apellido, u.usuario_correo, 
                    u.usuario_telefono, u.usuario_identificacion,
                    e.especialidad_nombre
                FROM medicos m
                INNER JOIN usuarios u ON m.usuario_id = u.usuario_id
                LEFT JOIN especialidades e ON m.especialidad_id = e.especialidad_id
                WHERE m.especialidad_id = ? AND m.medico_estado = 1 AND u.usuario_estado = 1
            `;
      const [result] = await db.executeQuery(query, [especialidad_id]);
      return result;
    } catch (error) {
      throw new Error(
        `Error al obtener médicos por especialidad: ${error.message}`
      );
    }
  }

  // Obtener disponibilidad del médico
  static async getAvailability(medico_id, fecha = null) {
    try {
      let query = `
                SELECT * FROM disponibilidad 
                WHERE medico_id = ? AND disponibilidad_estado = 1
            `;
      let params = [medico_id];

      if (fecha) {
        query += ` AND disponibilidad_fecha = ?`;
        params.push(fecha);
      }

      query += ` ORDER BY disponibilidad_fecha, disponibilidad_hora`;

      const [result] = await db.executeQuery(query, params);
      return result;
    } catch (error) {
      throw new Error(
        `Error al obtener disponibilidad del médico: ${error.message}`
      );
    }
  }

  // Obtener citas del médico
  static async getAppointments(medico_id, fecha = null, periodo = null) {
    try {
      console.log(
        `🔍 [DoctorModel] Obteniendo citas para médico ${medico_id}, fecha: ${fecha}, período: ${periodo}`
      );

      let query = `
                SELECT 
                    c.cita_id, c.cita_fecha, c.cita_hora, c.cita_estado, c.cita_tipo, c.cita_observaciones,
                    p.paciente_id,
                    u.usuario_nombre as paciente_nombre, u.usuario_apellido as paciente_apellido, u.usuario_telefono, u.usuario_correo,
                    CASE 
                        WHEN c.cita_estado IN ('Completada', 'Cancelada') THEN c.cita_estado
                        WHEN c.cita_fecha < CURDATE() OR (c.cita_fecha = CURDATE() AND c.cita_hora < CURTIME()) THEN 'Completada'
                        ELSE 'Pendiente'
                    END as estado_calculado
                FROM citas c
                INNER JOIN pacientes p ON c.paciente_id = p.paciente_id
                INNER JOIN usuarios u ON p.usuario_id = u.usuario_id
                WHERE c.medico_id = ?
            `;
      let params = [medico_id];

      // Si se especifica un período, calcular las fechas
      if (periodo && !fecha) {
        let fechaInicio, fechaFin;
        const hoy = new Date();

        switch (periodo) {
          case "Esta semana":
            const lunes = new Date(hoy);
            lunes.setDate(hoy.getDate() - hoy.getDay() + 1);
            fechaInicio = lunes.toISOString().split("T")[0];
            const domingo = new Date(lunes);
            domingo.setDate(lunes.getDate() + 6);
            fechaFin = domingo.toISOString().split("T")[0];
            break;
          case "Semana pasada":
            const lunesPasado = new Date(hoy);
            lunesPasado.setDate(hoy.getDate() - hoy.getDay() - 6);
            fechaInicio = lunesPasado.toISOString().split("T")[0];
            const domingoPasado = new Date(lunesPasado);
            domingoPasado.setDate(lunesPasado.getDate() + 6);
            fechaFin = domingoPasado.toISOString().split("T")[0];
            break;
          case "Este mes":
            fechaInicio = new Date(hoy.getFullYear(), hoy.getMonth(), 1)
              .toISOString()
              .split("T")[0];
            fechaFin = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0)
              .toISOString()
              .split("T")[0];
            break;
        }

        if (fechaInicio && fechaFin) {
          query += ` AND c.cita_fecha BETWEEN ? AND ?`;
          params.push(fechaInicio, fechaFin);
          console.log(
            `📅 [DoctorModel] Filtrando por período ${periodo}: ${fechaInicio} a ${fechaFin}`
          );
        }
      } else if (fecha) {
        query += ` AND c.cita_fecha = ?`;
        params.push(fecha);
      }

      query += ` ORDER BY c.cita_fecha DESC, c.cita_hora DESC`;

      const result = await db.executeQuery(query, params);
      if (!result.success) {
        throw new Error(result.error);
      }

      console.log(`📊 [DoctorModel] Citas encontradas:`, result.data.length);
      if (result.data.length > 0) {
        console.log(`🔍 [DoctorModel] Primera cita:`, {
          cita_id: result.data[0].cita_id,
          paciente_nombre: result.data[0].paciente_nombre,
          paciente_apellido: result.data[0].paciente_apellido,
          estado_calculado: result.data[0].estado_calculado,
          cita_fecha: result.data[0].cita_fecha,
          cita_hora: result.data[0].cita_hora,
        });
      }
      return result.data;
    } catch (error) {
      throw new Error(`Error al obtener citas del médico: ${error.message}`);
    }
  }

  // Obtener estadísticas del médico
  static async getStats(medico_id) {
    try {
      const queries = [
        `SELECT COUNT(*) as total_citas FROM citas WHERE medico_id = ?`,
        `SELECT COUNT(*) as total_pacientes FROM (SELECT DISTINCT paciente_id FROM citas WHERE medico_id = ?) as unique_patients`,
        `SELECT COUNT(*) as citas_hoy FROM citas WHERE medico_id = ? AND cita_fecha = CURDATE()`,
        `SELECT COUNT(*) as disponibilidad_hoy FROM disponibilidad WHERE medico_id = ? AND disponibilidad_fecha = CURDATE() AND disponibilidad_estado = 1`,
      ];

      const results = await Promise.all(
        queries.map((query) => db.executeQuery(query, [medico_id]))
      );

      return {
        total_citas: results[0][0][0].total_citas,
        total_pacientes: results[1][0][0].total_pacientes,
        citas_hoy: results[2][0][0].citas_hoy,
        disponibilidad_hoy: results[3][0][0].disponibilidad_hoy,
      };
    } catch (error) {
      throw new Error(
        `Error al obtener estadísticas del médico: ${error.message}`
      );
    }
  }

  // Obtener estadísticas semanales del médico
  static async getWeeklyStats(medico_id, periodo = "Esta semana") {
    try {
      let fechaInicio, fechaFin;
      const hoy = new Date();

      // Calcular fechas según el período
      switch (periodo) {
        case "Esta semana":
          // Lunes de esta semana
          const lunes = new Date(hoy);
          lunes.setDate(hoy.getDate() - hoy.getDay() + 1);
          fechaInicio = lunes.toISOString().split("T")[0];
          // Domingo de esta semana
          const domingo = new Date(lunes);
          domingo.setDate(lunes.getDate() + 6);
          fechaFin = domingo.toISOString().split("T")[0];
          break;
        case "Semana pasada":
          // Lunes de la semana pasada
          const lunesPasado = new Date(hoy);
          lunesPasado.setDate(hoy.getDate() - hoy.getDay() - 6);
          fechaInicio = lunesPasado.toISOString().split("T")[0];
          // Domingo de la semana pasada
          const domingoPasado = new Date(lunesPasado);
          domingoPasado.setDate(lunesPasado.getDate() + 6);
          fechaFin = domingoPasado.toISOString().split("T")[0];
          break;
        case "Este mes":
          // Primer día del mes
          fechaInicio = new Date(hoy.getFullYear(), hoy.getMonth(), 1)
            .toISOString()
            .split("T")[0];
          // Último día del mes
          fechaFin = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0)
            .toISOString()
            .split("T")[0];
          break;
        default:
          // Por defecto, esta semana
          const lunesDefault = new Date(hoy);
          lunesDefault.setDate(hoy.getDate() - hoy.getDay() + 1);
          fechaInicio = lunesDefault.toISOString().split("T")[0];
          const domingoDefault = new Date(lunesDefault);
          domingoDefault.setDate(lunesDefault.getDate() + 6);
          fechaFin = domingoDefault.toISOString().split("T")[0];
      }

      console.log(
        `📅 [DoctorModel] Fecha inicio: ${fechaInicio}, Fecha fin: ${fechaFin}`
      );

      const queries = [
        // Total de pacientes únicos en el período
        `SELECT COUNT(DISTINCT c.paciente_id) as total_pacientes 
                 FROM citas c 
                 WHERE c.medico_id = ? 
                 AND c.cita_fecha BETWEEN ? AND ?`,

        // Total de citas en el período
        `SELECT COUNT(*) as total_citas 
                 FROM citas c 
                 WHERE c.medico_id = ? 
                 AND c.cita_fecha BETWEEN ? AND ?`,

        // Citas completadas en el período (estado = 'Completada')
        `SELECT COUNT(*) as citas_completadas 
         FROM citas c 
         WHERE c.medico_id = ? 
         AND c.cita_fecha BETWEEN ? AND ?
         AND c.cita_estado = 'Completada'`,

        // Citas pendientes en el período (estado = 'Pendiente')
        `SELECT COUNT(*) as citas_pendientes 
         FROM citas c 
         WHERE c.medico_id = ? 
         AND c.cita_fecha BETWEEN ? AND ?
         AND c.cita_estado = 'Pendiente'`,
      ];

      const results = await Promise.all(
        queries.map((query) =>
          db.executeQuery(query, [medico_id, fechaInicio, fechaFin])
        )
      );

      console.log(`📊 [DoctorModel] Resultados de consultas:`, results);

      // Verificar que todas las consultas fueron exitosas
      for (let i = 0; i < results.length; i++) {
        if (!results[i].success) {
          throw new Error(`Error en consulta ${i + 1}: ${results[i].error}`);
        }
      }

      const finalResult = {
        total_pacientes: results[0].data[0].total_pacientes,
        total_citas: results[1].data[0].total_citas,
        citas_completadas: results[2].data[0].citas_completadas,
        citas_pendientes: results[3].data[0].citas_pendientes,
        periodo: periodo,
        fecha_inicio: fechaInicio,
        fecha_fin: fechaFin,
      };

      console.log(`📊 [DoctorModel] Resultado final:`, finalResult);

      return finalResult;
    } catch (error) {
      throw new Error(
        `Error al obtener estadísticas semanales del médico: ${error.message}`
      );
    }
  }

  // Obtener estadísticas generales del médico (incluyendo pacientes sin citas)
  static async getGeneralStats(medico_id) {
    try {
      console.log(
        `🔍 [DoctorModel] Obteniendo estadísticas generales para médico ${medico_id}`
      );

      const queries = [
        // Total de pacientes del médico (incluyendo sin citas)
        `SELECT COUNT(*) as total_pacientes 
         FROM pacientes p 
         WHERE p.medico_id = ? AND p.paciente_estado = 1`,

        // Total de citas del médico
        `SELECT COUNT(*) as total_citas 
         FROM citas c 
         WHERE c.medico_id = ?`,

        // Citas completadas (estado = 'Completada')
        `SELECT COUNT(*) as citas_completadas 
         FROM citas c 
         WHERE c.medico_id = ? 
         AND c.cita_estado = 'Completada'`,

        // Citas pendientes (estado = 'Pendiente')
        `SELECT COUNT(*) as citas_pendientes 
         FROM citas c 
         WHERE c.medico_id = ? 
         AND c.cita_estado = 'Pendiente'`,
      ];

      const results = await Promise.all(
        queries.map((query) => db.executeQuery(query, [medico_id]))
      );

      console.log(
        `📊 [DoctorModel] Resultados de consultas generales:`,
        results
      );

      // Verificar que todas las consultas fueron exitosas
      for (let i = 0; i < results.length; i++) {
        if (!results[i].success) {
          throw new Error(`Error en consulta ${i + 1}: ${results[i].error}`);
        }
      }

      const finalResult = {
        total_pacientes: results[0].data[0].total_pacientes,
        total_citas: results[1].data[0].total_citas,
        citas_completadas: results[2].data[0].citas_completadas,
        citas_pendientes: results[3].data[0].citas_pendientes,
      };

      console.log(`📊 [DoctorModel] Resultado final general:`, finalResult);

      return finalResult;
    } catch (error) {
      throw new Error(
        `Error al obtener estadísticas generales del médico: ${error.message}`
      );
    }
  }

  // Actualizar perfil del médico
  static async updateProfile(medico_id, profileData) {
    try {
      console.log(
        `🔍 [DoctorModel] Actualizando perfil del médico ${medico_id}`
      );
      console.log(`📊 [DoctorModel] Datos recibidos:`, profileData);

      // Obtener el usuario_id del médico
      const medicoQuery = `SELECT usuario_id FROM medicos WHERE medico_id = ? AND medico_estado = 1`;
      const medicoResult = await db.executeQuery(medicoQuery, [medico_id]);

      if (!medicoResult.success || medicoResult.data.length === 0) {
        throw new Error("Médico no encontrado");
      }

      const usuario_id = medicoResult.data[0].usuario_id;

      // Actualizar datos del usuario
      const updateUserQuery = `
        UPDATE usuarios 
        SET usuario_nombre = ?, usuario_apellido = ?, usuario_correo = ?, 
            usuario_telefono = ?, usuario_identificacion = ?
        WHERE usuario_id = ? AND usuario_estado = 1
      `;

      const userResult = await db.executeQuery(updateUserQuery, [
        profileData.usuario_nombre,
        profileData.usuario_apellido,
        profileData.usuario_correo,
        profileData.usuario_telefono,
        profileData.usuario_cedula,
        usuario_id,
      ]);

      if (!userResult.success) {
        throw new Error("Error al actualizar datos del usuario");
      }

      // Actualizar especialidad del médico si se proporciona
      if (profileData.especialidad_id) {
        const updateMedicoQuery = `
          UPDATE medicos 
          SET especialidad_id = ?
          WHERE medico_id = ? AND medico_estado = 1
        `;

        const medicoUpdateResult = await db.executeQuery(updateMedicoQuery, [
          profileData.especialidad_id,
          medico_id,
        ]);

        if (!medicoUpdateResult.success) {
          throw new Error("Error al actualizar especialidad del médico");
        }
      }

      console.log(`✅ [DoctorModel] Perfil actualizado exitosamente`);
      return {
        success: true,
        message: "Perfil actualizado exitosamente",
      };
    } catch (error) {
      console.error(`❌ [DoctorModel] Error:`, error);
      throw new Error(`Error al actualizar perfil: ${error.message}`);
    }
  }
}

export default Doctor;
