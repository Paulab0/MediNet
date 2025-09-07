import Reminder from "../models/reminderModel.js";

const reminderController = {
    // Crear recordatorio
    async create(req, res) {
        try {
            const recordatorioData = req.body;
            const result = await Reminder.create(recordatorioData);
            res.status(201).json(result);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    },

    // Obtener todos los recordatorios
    async getAll(req, res) {
        try {
            const result = await Reminder.getAll();
            res.json(result);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // Obtener recordatorio por ID
    async getById(req, res) {
        try {
            const { id } = req.params;
            const result = await Reminder.getById(id);
            if (!result) {
                return res.status(404).json({ error: "Recordatorio no encontrado" });
            }
            res.json(result);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // Obtener recordatorios por médico
    async getByMedico(req, res) {
        try {
            const { medico_id } = req.params;
            const { fecha } = req.query;
            const result = await Reminder.getByMedico(medico_id, fecha);
            res.json(result);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // Obtener recordatorios por fecha
    async getByDate(req, res) {
        try {
            const { fecha } = req.params;
            const result = await Reminder.getByDate(fecha);
            res.json(result);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // Obtener recordatorios de hoy
    async getToday(req, res) {
        try {
            const result = await Reminder.getToday();
            res.json(result);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // Obtener próximos recordatorios
    async getUpcoming(req, res) {
        try {
            const limit = parseInt(req.query.limit) || 10;
            const result = await Reminder.getUpcoming(limit);
            res.json(result);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // Actualizar recordatorio
    async update(req, res) {
        try {
            const { id } = req.params;
            const recordatorioData = req.body;
            const result = await Reminder.update(id, recordatorioData);
            res.json(result);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    },

    // Eliminar recordatorio (soft delete)
    async delete(req, res) {
        try {
            const { id } = req.params;
            const result = await Reminder.delete(id);
            res.json(result);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    },

    // Marcar recordatorio como completado
    async markAsCompleted(req, res) {
        try {
            const { id } = req.params;
            const result = await Reminder.markAsCompleted(id);
            res.json(result);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    },

    // Obtener recordatorios pendientes por médico
    async getPendingByMedico(req, res) {
        try {
            const { medico_id } = req.params;
            const result = await Reminder.getPendingByMedico(medico_id);
            res.json(result);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // Obtener recordatorios vencidos
    async getOverdue(req, res) {
        try {
            const result = await Reminder.getOverdue();
            res.json(result);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // Crear recordatorio automático para cita
    async createForAppointment(req, res) {
        try {
            const { medico_id, cita_fecha, cita_hora, minutes_before } = req.body;
            const result = await Reminder.createForAppointment(medico_id, cita_fecha, cita_hora, minutes_before);
            res.status(201).json(result);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    },

    // Obtener estadísticas de recordatorios
    async getStats(req, res) {
        try {
            const { medico_id } = req.query;
            const result = await Reminder.getStats(medico_id);
            res.json(result);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },
};

export default reminderController;