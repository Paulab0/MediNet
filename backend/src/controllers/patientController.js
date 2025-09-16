import Patient from "../models/patientModel.js";

const patientController = {
  // Crear paciente
  async create(req, res) {
    try {
      const pacienteData = req.body;
      const result = await Patient.create(pacienteData);
      res.status(201).json(result);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  // Obtener todos los pacientes
  async getAll(req, res) {
    try {
      const result = await Patient.getAll();
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Obtener paciente por ID
  async getById(req, res) {
    try {
      const { id } = req.params;
      const result = await Patient.getById(id);
      if (!result) {
        return res.status(404).json({ error: "Paciente no encontrado" });
      }
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Obtener paciente por usuario ID
  async getByUserId(req, res) {
    try {
      const { usuario_id } = req.params;
      const result = await Patient.getByUserId(usuario_id);
      if (!result) {
        return res.status(404).json({ error: "Paciente no encontrado" });
      }
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Obtener pacientes por médico
  async getByDoctor(req, res) {
    try {
      const { doctorId } = req.params;
      const result = await Patient.getByDoctor(doctorId);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Actualizar paciente
  async update(req, res) {
    try {
      const { id } = req.params;
      const pacienteData = req.body;
      const result = await Patient.update(id, pacienteData);
      res.json(result);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  // Eliminar paciente (soft delete)
  async delete(req, res) {
    try {
      const { id } = req.params;
      const result = await Patient.delete(id);
      res.json(result);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  // Obtener citas del paciente
  async getAppointments(req, res) {
    try {
      const { paciente_id } = req.params;
      const { fecha } = req.query;
      const result = await Patient.getAppointments(paciente_id, fecha);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Obtener próximas citas del paciente
  async getUpcomingAppointments(req, res) {
    try {
      const { paciente_id } = req.params;
      const result = await Patient.getUpcomingAppointments(paciente_id);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Obtener historial médico del paciente
  async getMedicalHistory(req, res) {
    try {
      const { paciente_id } = req.params;
      const result = await Patient.getMedicalHistory(paciente_id);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Buscar pacientes por nombre o identificación
  async search(req, res) {
    try {
      const { term } = req.query;
      const result = await Patient.search(term);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Obtener estadísticas del paciente
  async getStats(req, res) {
    try {
      const { paciente_id } = req.params;
      const result = await Patient.getStats(paciente_id);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
};

export default patientController;
