import db from "../../database/connectiondb.js";

class Configuracion {
  // Obtener todas las configuraciones
  static async getAll() {
    try {
      const query = `SELECT * FROM configuracion_sistema ORDER BY config_clave`;
      const result = await db.executeQuery(query);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data || [];
    } catch (error) {
      throw new Error(`Error al obtener configuraciones: ${error.message}`);
    }
  }

  // Obtener configuración por clave
  static async getByKey(clave) {
    try {
      const query = `SELECT * FROM configuracion_sistema WHERE config_clave = ?`;
      const result = await db.executeQuery(query, [clave]);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data[0] || null;
    } catch (error) {
      throw new Error(`Error al obtener configuración: ${error.message}`);
    }
  }

  // Obtener valor de configuración (parseado según tipo)
  static async getValue(clave, defaultValue = null) {
    try {
      const config = await this.getByKey(clave);
      if (!config) {
        return defaultValue;
      }

      // Parsear según el tipo
      switch (config.config_tipo) {
        case "Number":
          return parseFloat(config.config_valor);
        case "Boolean":
          return config.config_valor === "true" || config.config_valor === "1";
        case "JSON":
          try {
            return JSON.parse(config.config_valor);
          } catch {
            return defaultValue;
          }
        case "Time":
          return config.config_valor;
        default:
          return config.config_valor;
      }
    } catch (error) {
      throw new Error(`Error al obtener valor de configuración: ${error.message}`);
    }
  }

  // Crear o actualizar configuración
  static async set(clave, valor, descripcion = null, tipo = "String") {
    try {
      // Verificar si existe
      const existing = await this.getByKey(clave);

      let query;
      let params;

      if (existing) {
        // Actualizar
        query = `
          UPDATE configuracion_sistema 
          SET config_valor = ?, config_descripcion = ?, config_tipo = ?
          WHERE config_clave = ?
        `;
        params = [valor, descripcion || existing.config_descripcion, tipo, clave];
      } else {
        // Crear
        query = `
          INSERT INTO configuracion_sistema (config_clave, config_valor, config_descripcion, config_tipo)
          VALUES (?, ?, ?, ?)
        `;
        params = [clave, valor, descripcion, tipo];
      }

      const result = await db.executeQuery(query, params);
      if (!result.success) {
        throw new Error(result.error);
      }

      return { success: true, config: await this.getByKey(clave) };
    } catch (error) {
      throw new Error(`Error al guardar configuración: ${error.message}`);
    }
  }

  // Eliminar configuración
  static async delete(clave) {
    try {
      const query = `DELETE FROM configuracion_sistema WHERE config_clave = ?`;
      const result = await db.executeQuery(query, [clave]);
      if (!result.success) {
        throw new Error(result.error);
      }
      return { success: result.data.affectedRows > 0 };
    } catch (error) {
      throw new Error(`Error al eliminar configuración: ${error.message}`);
    }
  }

  // Obtener configuración de horarios
  static async getHorarios() {
    try {
      const horarioInicio = await this.getValue("horario_atencion_inicio", "08:00");
      const horarioFin = await this.getValue("horario_atencion_fin", "17:00");
      const diasLaborales = await this.getValue("dias_laborales", ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes"]);
      const zonaHoraria = await this.getValue("zona_horaria", "America/Bogota");
      const recordatorio24h = await this.getValue("recordatorio_24h_antes", true);
      const recordatorio1h = await this.getValue("recordatorio_1h_antes", true);

      return {
        horario_inicio: horarioInicio,
        horario_fin: horarioFin,
        dias_laborales: diasLaborales,
        zona_horaria: zonaHoraria,
        recordatorio_24h_antes: recordatorio24h,
        recordatorio_1h_antes: recordatorio1h,
      };
    } catch (error) {
      throw new Error(`Error al obtener horarios: ${error.message}`);
    }
  }

  // Guardar configuración de horarios
  static async setHorarios(horariosData) {
    try {
      const {
        horario_inicio,
        horario_fin,
        dias_laborales,
        zona_horaria,
        recordatorio_24h_antes,
        recordatorio_1h_antes,
      } = horariosData;

      await Promise.all([
        this.set("horario_atencion_inicio", horario_inicio, "Hora de inicio de atención", "Time"),
        this.set("horario_atencion_fin", horario_fin, "Hora de fin de atención", "Time"),
        this.set("dias_laborales", JSON.stringify(dias_laborales), "Días laborales de la semana", "JSON"),
        this.set("zona_horaria", zona_horaria, "Zona horaria del sistema", "String"),
        this.set("recordatorio_24h_antes", recordatorio_24h_antes.toString(), "Enviar recordatorio 24 horas antes de la cita", "Boolean"),
        this.set("recordatorio_1h_antes", recordatorio_1h_antes.toString(), "Enviar recordatorio 1 hora antes de la cita", "Boolean"),
      ]);

      return { success: true, horarios: await this.getHorarios() };
    } catch (error) {
      throw new Error(`Error al guardar horarios: ${error.message}`);
    }
  }
}

export default Configuracion;

