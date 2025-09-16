import Role from "../models/roleModel.js";

const roleController = {
    // Crear rol
    async create(req, res) {
        try {
            const rolData = req.body;
            const result = await Role.create(rolData);
            res.status(201).json(result);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    },

    // Obtener todos los roles
    async getAll(req, res) {
        try {
            const result = await Role.getAll();
            res.json(result);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // Obtener rol por ID
    async getById(req, res) {
        try {
            const { id } = req.params;
            const result = await Role.getById(id);
            if (!result) {
                return res.status(404).json({ error: "Rol no encontrado" });
            }
            res.json(result);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // Actualizar rol
    async update(req, res) {
        try {
            const { id } = req.params;
            const rolData = req.body;
            const result = await Role.update(id, rolData);
            res.json(result);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    },

    // Eliminar rol
    async delete(req, res) {
        try {
            const { id } = req.params;
            const result = await Role.delete(id);
            res.json(result);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    },

    // Obtener usuarios por rol
    async getUsersByRol(req, res) {
        try {
            const { id } = req.params;
            const result = await Role.getUsersByRol(id);
            res.json(result);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // Verificar si un rol existe por nombre
    async existsByName(req, res) {
        try {
            const { nombre, id } = req.query;
            const exists = await Role.existsByName(nombre, id);
            res.json({ exists });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // Obtener estadísticas por rol
    async getStats(req, res) {
        try {
            const result = await Role.getStats();
            res.json(result);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
};

export default roleController;