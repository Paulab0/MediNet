import Auth from "../models/authModel.js";

const authController = {
    // Registrar usuario
    async register(req, res) {
        try {
            const userData = req.body;
            const result = await Auth.createUser(userData);
            res.status(201).json(result);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    },

    // Login de usuario
    async login(req, res) {
        try {
            const { usuario_correo, usuario_contrasena } = req.body;
            const result = await Auth.verifyCredentials(usuario_correo, usuario_contrasena);
            if (!result.success) {
                return res.status(401).json({ error: result.message });
            }
            res.json(result);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // Cambiar contraseña
    async changePassword(req, res) {
        try {
            const { usuario_id, currentPassword, newPassword } = req.body;
            const result = await Auth.changePassword(usuario_id, currentPassword, newPassword);
            res.json(result);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    },

    // Obtener usuario por correo
    async findUserByEmail(req, res) {
        try {
            const { usuario_correo } = req.query;
            const user = await Auth.findUserByEmail(usuario_correo);
            if (!user) {
                return res.status(404).json({ error: "Usuario no encontrado" });
            }
            res.json(user);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // Obtener información completa del usuario con su rol
    async getUserWithRole(req, res) {
        try {
            const { usuario_id } = req.params;
            const user = await Auth.getUserWithRole(usuario_id);
            if (!user) {
                return res.status(404).json({ error: "Usuario no encontrado" });
            }
            res.json(user);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
};

export default authController;