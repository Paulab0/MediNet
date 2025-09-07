import Availability from "../models/availabilityModel.js";

const availabilityController = {
    // Crear disponibilidad
    async create(req, res) {
        try {
            const disponibilidadData = req.body;
            const result = await Availability.create(disponibilidadData);
            res.status(201).json(result);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    },

    // Crear múltiples horarios de disponibilidad
    async createMultiple(req, res) {
        try {
            const { medico_id, fecha, horas } = req.body;
            const result = await Availability.createMultiple(medico_id, fecha, horas);
            res.status(201).json(result);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    },

    // Obtener todas las disponibilidades
    async getAll(req, res) {
        try {
            const result = await Availability.getAll();
            res.json(result);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // Obtener disponibilidad por ID
    async getById(req, res) {
        try {
            const { id } = req.params;
            const result = await Availability.getById(id);
            if (!result) {
                return res.status(404).json({ error: "Disponibilidad no encontrada" });
            }
            res.json(result);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // Obtener disponibilidad por médico
    async getByMedico(req, res) {
        try {
            const { medico_id } = req.params;
            const { fecha } = req.query;
            const result = await Availability.getByMedico(medico_id, fecha);
            res.json(result);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // Obtener disponibilidad disponible por médico
    async getAvailableByMedico(req, res) {
        try {
            const { medico_id } = req.params;
            const { fecha } = req.query;
            const result = await Availability.getAvailableByMedico(medico_id, fecha);
            res.json(result);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // Obtener disponibilidad por fecha
    async getByDate(req, res) {
        try {
            const { fecha } = req.params;
            const result = await Availability.getByDate(fecha);
            res.json(result);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // Actualizar disponibilidad
    async update(req, res) {
        try {
            const { id } = req.params;
            const disponibilidadData = req.body;
            const result = await Availability.update(id, disponibilidadData);
            res.json(result);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    },

    // Cambiar estado de disponibilidad
    async updateStatus(req, res) {
        try {
            const { id } = req.params;
            const { estado } = req.body;
            const result = await Availability.updateStatus(id, estado);
            res.json(result);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    },

    // Eliminar disponibilidad
    async delete(req, res) {
        try {
            const { id } = req.params;
            const result = await Availability.delete(id);
            res.json(result);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    },

    // Verificar disponibilidad específica
    async checkSpecificAvailability(req, res) {
        try {
            const { medico_id, fecha, hora } = req.query;
            const result = await Availability.checkSpecificAvailability(medico_id, fecha, hora);
            res.json(result);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // Obtener horarios ocupados por médico y fecha
    async getOccupiedSlots(req, res) {
        try {
            const { medico_id, fecha } = req.query;
            const result = await Availability.getOccupiedSlots(medico_id, fecha);
            res.json(result);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // Generar disponibilidad para múltiples días
    async generateAvailability(req, res) {
        try {
            const { medico_id, fechaInicio, fechaFin, horas } = req.body;
            const result = await Availability.generateAvailability(medico_id, fechaInicio, fechaFin, horas);
            res.status(201).json(result);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    },

    // Obtener estadísticas de disponibilidad
    async getStats(req, res) {
        try {
            const { medico_id } = req.query;
            const result = await Availability.getStats(medico_id);
            res.json(result);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },
};

export default availabilityController;