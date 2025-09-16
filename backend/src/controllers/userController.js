import User from "../models/userModel.js";

const userController = {
    // Crear usuario
    async create(req, res) {
        try {
            const userData = req.body;
            const result = await User.create(userData);
            res.status(201).json(result);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    },

    // Obtener todos los usuarios
    async getAll(req, res) {
        try {
            const result = await User.getAll();
            res.json(result);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // Obtener usuario por ID
    async getById(req, res) {
        try {
            const { id } = req.params;
            const result = await User.getById(id);
            if (!result) {
                return res.status(404).json({ error: "Usuario no encontrado" });
            }
            res.json(result);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // Obtener usuario por email (para login)
    async findByEmail(req, res) {
        try {
            const { email } = req.query;
            const result = await User.findByEmail(email);
            if (!result) {
                return res.status(404).json({ error: "Usuario no encontrado" });
            }
            res.json(result);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // Actualizar usuario
    async update(req, res) {
        try {
            const { id } = req.params;
            const userData = req.body;
            const result = await User.update(id, userData);
            res.json(result);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    },

    // Eliminar usuario (soft delete)
    async delete(req, res) {
        try {
            const { id } = req.params;
            const result = await User.delete(id);
            res.json(result);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    },

    // Obtener usuarios por rol
    async getByRole(req, res) {
        try {
            const { rol_id } = req.params;
            const result = await User.getByRole(rol_id);
            res.json(result);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
};

export default userController;