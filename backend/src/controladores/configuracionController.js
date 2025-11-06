import Configuracion from "../modelos/configuracionModel.js";
import LogActividad from "../modelos/logActividadModel.js";

const configuracionController = {
  // Obtener todas las configuraciones
  async getAll(req, res) {
    try {
      const configs = await Configuracion.getAll();
      res.json(configs);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Obtener configuración por clave
  async getByKey(req, res) {
    try {
      const { clave } = req.params;
      const config = await Configuracion.getByKey(clave);
      if (!config) {
        return res.status(404).json({ error: "Configuración no encontrada" });
      }
      res.json(config);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Obtener valor de configuración
  async getValue(req, res) {
    try {
      const { clave } = req.params;
      const { default: defaultValue } = req.query;
      const value = await Configuracion.getValue(clave, defaultValue);
      res.json({ clave, valor: value });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Crear o actualizar configuración
  async set(req, res) {
    try {
      const { clave, valor, descripcion, tipo } = req.body;

      if (!clave || valor === undefined) {
        return res.status(400).json({ error: "clave y valor son requeridos" });
      }

      const result = await Configuracion.set(clave, valor, descripcion, tipo);

      // Registrar log
      try {
        const clientIp = req.ip || req.connection.remoteAddress;
        const userAgent = req.get('user-agent');
        await LogActividad.create({
          usuario_id: req.user?.usuario_id || null,
          log_tipo: "Actualizar",
          log_entidad: "Configuración",
          log_descripcion: `Configuración ${clave} actualizada`,
          log_ip: clientIp,
          log_user_agent: userAgent,
        });
      } catch (logError) {
        console.error("Error registrando log:", logError);
      }

      res.json(result);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  // Eliminar configuración
  async delete(req, res) {
    try {
      const { clave } = req.params;
      const result = await Configuracion.delete(clave);

      // Registrar log
      try {
        const clientIp = req.ip || req.connection.remoteAddress;
        const userAgent = req.get('user-agent');
        await LogActividad.create({
          usuario_id: req.user?.usuario_id || null,
          log_tipo: "Eliminar",
          log_entidad: "Configuración",
          log_descripcion: `Configuración ${clave} eliminada`,
          log_ip: clientIp,
          log_user_agent: userAgent,
        });
      } catch (logError) {
        console.error("Error registrando log:", logError);
      }

      res.json(result);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  // Obtener configuración de horarios
  async getHorarios(req, res) {
    try {
      const horarios = await Configuracion.getHorarios();
      res.json(horarios);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Guardar configuración de horarios
  async setHorarios(req, res) {
    try {
      const horariosData = req.body;
      const result = await Configuracion.setHorarios(horariosData);

      // Registrar log
      try {
        const clientIp = req.ip || req.connection.remoteAddress;
        const userAgent = req.get('user-agent');
        await LogActividad.create({
          usuario_id: req.user?.usuario_id || null,
          log_tipo: "Actualizar",
          log_entidad: "Configuración",
          log_descripcion: "Horarios del sistema actualizados",
          log_ip: clientIp,
          log_user_agent: userAgent,
        });
      } catch (logError) {
        console.error("Error registrando log:", logError);
      }

      res.json(result);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },
};

export default configuracionController;


