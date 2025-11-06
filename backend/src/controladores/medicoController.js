import Doctor from "../modelos/medicoModel.js";
import User from "../modelos/usuarioModel.js";
import LogActividad from "../modelos/logActividadModel.js";

const doctorController = {
  // Crear médico
  async create(req, res) {
    try {
      const medicoData = req.body;
      const result = await Doctor.create(medicoData);
      res.status(201).json(result);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  // Registrar médico completo (crear usuario + médico)
  async registerDoctor(req, res) {
    try {
      const {
        // Datos del usuario
        usuario_nombre,
        usuario_apellido,
        usuario_edad,
        usuario_genero,
        usuario_identificacion,
        identificacion_id,
        usuario_direccion,
        usuario_ciudad,
        usuario_correo,
        usuario_telefono,
        usuario_contrasena,
        // Datos del médico
        especialidad_id,
        medico_consultorio,
      } = req.body;

      // Validaciones básicas
      if (!usuario_nombre || !usuario_apellido || !usuario_correo || !usuario_contrasena) {
        return res.status(400).json({ error: "Faltan campos obligatorios del usuario" });
      }

      if (!especialidad_id) {
        return res.status(400).json({ error: "La especialidad es obligatoria" });
      }

      // Verificar si el email ya existe
      const existingUser = await User.findByEmail(usuario_correo);
      if (existingUser) {
        return res.status(400).json({ error: "El correo electrónico ya está registrado" });
      }

      // Crear usuario con rol de médico (rol_id = 2)
      const userData = {
        usuario_nombre,
        usuario_apellido,
        usuario_edad: usuario_edad || null,
        usuario_genero: usuario_genero || null,
        usuario_identificacion,
        identificacion_id: identificacion_id || 1, // CC por defecto
        usuario_direccion: usuario_direccion || null,
        usuario_ciudad: usuario_ciudad || null,
        usuario_correo,
        usuario_telefono: usuario_telefono || null,
        usuario_contrasena,
        rol_id: 2, // Rol de médico
      };

      const userResult = await User.create(userData);
      if (!userResult.success) {
        throw new Error("Error al crear el usuario");
      }

      // Crear médico asociado al usuario
      const medicoData = {
        usuario_id: userResult.insertId,
        especialidad_id,
        medico_consultorio: medico_consultorio || null,
        medico_estado: 1,
      };

      const medicoResult = await Doctor.create(medicoData);
      if (!medicoResult.success) {
        // Si falla la creación del médico, eliminar el usuario creado
        await User.delete(userResult.insertId);
        throw new Error("Error al crear el médico");
      }

      // Registrar log de actividad
      try {
        const clientIp = req.ip || req.connection.remoteAddress;
        const userAgent = req.get('user-agent');
        await LogActividad.create({
          usuario_id: req.user?.usuario_id || null,
          log_tipo: "Crear",
          log_entidad: "Médico",
          log_descripcion: `Médico registrado: ${usuario_nombre} ${usuario_apellido} (ID: ${medicoResult.insertId})`,
          log_ip: clientIp,
          log_user_agent: userAgent,
        });
      } catch (logError) {
        console.error("Error registrando log:", logError);
      }

      res.status(201).json({
        success: true,
        message: "Médico registrado exitosamente",
        usuario_id: userResult.insertId,
        medico_id: medicoResult.insertId,
      });
    } catch (error) {
      console.error("Error registrando médico:", error);
      res.status(400).json({ error: error.message });
    }
  },

  // Obtener todos los médicos
  async getAll(req, res) {
    try {
      const result = await Doctor.getAll();
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Obtener médico por ID
  async getById(req, res) {
    try {
      const { id } = req.params;
      const result = await Doctor.getById(id);
      if (!result) {
        return res.status(404).json({ error: "Médico no encontrado" });
      }
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Obtener médico por usuario ID
  async getByUserId(req, res) {
    try {
      const { usuario_id } = req.params;
      const result = await Doctor.getByUserId(usuario_id);
      if (!result) {
        return res.status(404).json({ error: "Médico no encontrado" });
      }
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Actualizar médico
  async update(req, res) {
    try {
      const { id } = req.params;
      const medicoData = req.body;
      const result = await Doctor.update(id, medicoData);
      res.json(result);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  // Eliminar médico (soft delete)
  async delete(req, res) {
    try {
      const { id } = req.params;
      const result = await Doctor.delete(id);
      res.json(result);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  // Obtener médicos por especialidad
  async getBySpecialty(req, res) {
    try {
      const { especialidad_id } = req.params;
      const result = await Doctor.getBySpecialty(especialidad_id);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Obtener disponibilidad del médico
  async getAvailability(req, res) {
    try {
      const { medico_id } = req.params;
      const { fecha } = req.query;
      const result = await Doctor.getAvailability(medico_id, fecha);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Actualizar información médica (para médicos)
  async updateMedicalInfo(req, res) {
    try {
      const { id } = req.params;
      const medicoData = req.body;

      // Verificar que el médico actualice su propia información o sea admin
      const currentDoctor = await Doctor.getById(id);
      if (!currentDoctor) {
        return res.status(404).json({ error: "Médico no encontrado" });
      }

      // Solo el médico puede actualizar su propia información o un admin
      if (req.user?.rol_id !== 1 && req.user?.usuario_id !== currentDoctor.usuario_id) {
        return res.status(403).json({ error: "No tienes permiso para actualizar esta información" });
      }

      const result = await Doctor.updateMedicalInfo(id, medicoData);
      res.json(result);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  // Buscar médicos con filtros
  async search(req, res) {
    try {
      const filters = {
        especialidad_id: req.query.especialidad_id,
        nombre: req.query.nombre,
        fecha: req.query.fecha,
        hora: req.query.hora,
      };

      // Eliminar filtros undefined
      Object.keys(filters).forEach(key => filters[key] === undefined && delete filters[key]);

      const result = await Doctor.search(filters);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Obtener citas del médico
  async getAppointments(req, res) {
    try {
      const { medico_id } = req.params;
      const { fecha, periodo } = req.query;

      console.log(
        `🔍 [DoctorController] Obteniendo citas para médico ${medico_id}, fecha: ${fecha}, período: ${periodo}`
      );

      const result = await Doctor.getAppointments(medico_id, fecha, periodo);
      console.log(`📊 [DoctorController] Citas obtenidas:`, result);

      res.json(result);
    } catch (error) {
      console.error(`❌ [DoctorController] Error:`, error);
      res.status(500).json({ error: error.message });
    }
  },

  // Obtener estadísticas del médico
  async getStats(req, res) {
    try {
      const { medico_id } = req.params;
      const result = await Doctor.getStats(medico_id);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Obtener estadísticas semanales del médico
  async getWeeklyStats(req, res) {
    try {
      const { medico_id } = req.params;
      const { periodo } = req.query; // 'Esta semana', 'Semana pasada', 'Este mes'

      console.log(
        `🔍 [DoctorController] Obteniendo estadísticas semanales para médico ${medico_id}, período: ${periodo}`
      );

      const result = await Doctor.getWeeklyStats(medico_id, periodo);
      console.log(`📊 [DoctorController] Resultado:`, result);

      res.json(result);
    } catch (error) {
      console.error(`❌ [DoctorController] Error:`, error);
      res.status(500).json({ error: error.message });
    }
  },

  // Obtener estadísticas generales del médico (incluyendo pacientes sin citas)
  async getGeneralStats(req, res) {
    try {
      const { medico_id } = req.params;

      console.log(
        `🔍 [DoctorController] Obteniendo estadísticas generales para médico ${medico_id}`
      );

      const result = await Doctor.getGeneralStats(medico_id);
      console.log(`📊 [DoctorController] Resultado general:`, result);

      res.json(result);
    } catch (error) {
      console.error(`❌ [DoctorController] Error:`, error);
      res.status(500).json({ error: error.message });
    }
  },

  // Actualizar perfil del médico
  async updateProfile(req, res) {
    try {
      const { medico_id } = req.params;
      const {
        usuario_nombre,
        usuario_apellido,
        usuario_correo,
        usuario_telefono,
        especialidad_id,
      } = req.body;

      console.log(
        `🔍 [DoctorController] Actualizando perfil del médico ${medico_id}`
      );
      console.log(`📊 [DoctorController] Datos recibidos:`, req.body);

      const result = await Doctor.updateProfile(medico_id, {
        usuario_nombre,
        usuario_apellido,
        usuario_correo,
        usuario_telefono,
        especialidad_id,
      });

      console.log(`✅ [DoctorController] Perfil actualizado:`, result);
      res.json(result);
    } catch (error) {
      console.error(`❌ [DoctorController] Error:`, error);
      res.status(500).json({ error: error.message });
    }
  },

  // Actualizar información médica (especialidad, consultorio)
  async updateMedicalInfo(req, res) {
    try {
      const { id } = req.params;
      const { especialidad_id, medico_consultorio } = req.body;

      console.log(`🔍 [DoctorController] Actualizando información médica del médico ${id}`);
      console.log(`📊 [DoctorController] Datos recibidos:`, req.body);

      const result = await Doctor.updateMedicalInfo(id, {
        especialidad_id,
        medico_consultorio,
      });

      // Registrar log de actividad
      try {
        const clientIp = req.ip || req.connection.remoteAddress;
        const userAgent = req.get('user-agent');
        await LogActividad.create({
          usuario_id: req.user?.usuario_id || null,
          log_tipo: "Actualizar",
          log_entidad: "Médico",
          log_descripcion: `Información médica actualizada para médico ID: ${id}`,
          log_ip: clientIp,
          log_user_agent: userAgent,
        });
      } catch (logError) {
        console.warn('⚠️ No se pudo registrar el log de actividad:', logError.message);
      }

      console.log(`✅ [DoctorController] Información médica actualizada:`, result);
      res.json(result);
    } catch (error) {
      console.error(`❌ [DoctorController] Error:`, error);
      res.status(500).json({ error: error.message });
    }
  },
};

export default doctorController;
