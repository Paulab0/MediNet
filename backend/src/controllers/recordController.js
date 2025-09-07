import Record from "../models/recordModel.js";

const recordController = {
    // Crear historial
    async create(req, res) {
        try {
            const historialData = req.body;
            const result = await Record.create(historialData);
            res.status(201).json(result);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    },

    // Obtener todos los historiales
    async getAll(req, res) {
        try {
            const result = await Record.getAll();
            res.json(result);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // Obtener historial por ID
    async getById(req, res) {
        try {
            const { id } = req.params;
            const result = await Record.getById(id);
            if (!result) {
                return res.status(404).json({ error: "Historial no encontrado" });
            }
            res.json(result);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // Obtener historial por paciente
    async getByPaciente(req, res) {
        try {
            const { paciente_id } = req.params;
            const result = await Record.getByPaciente(paciente_id);
            res.json(result);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // Obtener historial por médico
    async getByMedico(req, res) {
        try {
            const { medico_id } = req.params;
            const result = await Record.getByMedico(medico_id);
            res.json(result);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // Obtener historial por fecha
    async getByDate(req, res) {
        try {
            const { fecha } = req.params;
            const result = await Record.getByDate(fecha);
            res.json(result);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // Obtener historiales de hoy
    async getToday(req, res) {
        try {
            const result = await Record.getToday();
            res.json(result);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // Actualizar historial
    async update(req, res) {
        try {
            const { id } = req.params;
            const historialData = req.body;
            const result = await Record.update(id, historialData);
            res.json(result);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    },

    // Eliminar historial (soft delete)
    async delete(req, res) {
        try {
            const { id } = req.params;
            const result = await Record.delete(id);
            res.json(result);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    },

    // Buscar en historiales por paciente (nombre o identificación)
    async searchByPaciente(req, res) {
        try {
            const { term } = req.query;
            const result = await Record.searchByPaciente(term);
            res.json(result);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // Obtener historial completo de un paciente con un médico específico
    async getByPacienteAndMedico(req, res) {
        try {
            const { paciente_id, medico_id } = req.params;
            const result = await Record.getByPacienteAndMedico(paciente_id, medico_id);
            res.json(result);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // Crear historial automático después de una cita
    async createFromAppointment(req, res) {
        try {
            const { medico_id, paciente_id } = req.body;
            const result = await Record.createFromAppointment(medico_id, paciente_id);
            res.status(201).json(result);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    },

    // Obtener estadísticas de historiales
    async getStats(req, res) {
        try {
            const { medico_id, paciente_id } = req.query;
            const result = await Record.getStats(medico_id, paciente_id);
            res.json(result);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // Obtener resumen de atenciones por especialidad
    async getBySpecialty(req, res) {
        try {
            const result = await Record.getBySpecialty();
            res.json(result);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
};

export default recordController;