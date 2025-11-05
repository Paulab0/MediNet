import Doctor from "../modelos/medicoModel.js";

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
};

export default doctorController;
