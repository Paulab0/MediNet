import User from "../modelos/usuarioModel.js";

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
    },

    // Actualizar perfil del usuario actual
    async updateProfile(req, res) {
        try {
            const usuario_id = req.user?.usuario_id || req.params.id;
            if (!usuario_id) {
                return res.status(400).json({ error: "Usuario ID requerido" });
            }

            // Solo permitir actualizar su propio perfil (a menos que sea admin)
            if (req.user?.rol_id !== 1 && req.user?.usuario_id !== parseInt(usuario_id)) {
                return res.status(403).json({ error: "No tienes permiso para actualizar este perfil" });
            }

            // Procesar datos del formulario
            let userData = {};
            
            // Si viene como FormData, procesar
            if (req.headers['content-type']?.includes('multipart/form-data')) {
                // Para FormData, los datos vienen en req.body
                userData = req.body;
                
                // Si hay un archivo, convertirlo a base64
                if (req.file) {
                    const fs = require('fs');
                    const imageBuffer = fs.readFileSync(req.file.path);
                    userData.usuario_foto_perfil = `data:${req.file.mimetype};base64,${imageBuffer.toString('base64')}`;
                    fs.unlinkSync(req.file.path); // Eliminar archivo temporal
                }
            } else {
                // Datos JSON normales
                userData = req.body;
                
                // Si viene foto_perfil como base64, mantenerla
                if (userData.usuario_foto_perfil && userData.usuario_foto_perfil.startsWith('data:image')) {
                    // Ya está en base64, mantener
                }
            }

            const result = await User.updateProfile(usuario_id, userData);
            res.json(result);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    },

    // Cambiar rol de usuario (solo admin)
    async changeRole(req, res) {
        try {
            const { id } = req.params;
            const { rol_id } = req.body;

            if (!rol_id) {
                return res.status(400).json({ error: "rol_id es requerido" });
            }

            // Validar que el rol existe
            const rolQuery = "SELECT rol_id FROM roles WHERE rol_id = ?";
            const db = (await import("../../database/connectiondb.js")).default;
            const rolResult = await db.executeQuery(rolQuery, [rol_id]);
            
            if (!rolResult.success || rolResult.data.length === 0) {
                return res.status(400).json({ error: "Rol inválido" });
            }

            const result = await User.update(id, { rol_id });
            
            // Registrar log
            try {
                const LogActividad = (await import("../modelos/logActividadModel.js")).default;
                const clientIp = req.ip || req.connection.remoteAddress;
                const userAgent = req.get('user-agent');
                await LogActividad.create({
                    usuario_id: req.user?.usuario_id || null,
                    log_tipo: "Cambio_Rol",
                    log_entidad: "Usuario",
                    log_descripcion: `Rol de usuario ${id} cambiado a ${rol_id}`,
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

    // Activar/Desactivar usuario (solo admin)
    async toggleStatus(req, res) {
        try {
            const { id } = req.params;
            const { estado } = req.body;

            if (estado === undefined) {
                return res.status(400).json({ error: "estado es requerido (0 o 1)" });
            }

            const query = "UPDATE usuarios SET usuario_estado = ? WHERE usuario_id = ?";
            const db = (await import("../../database/connectiondb.js")).default;
            const result = await db.executeQuery(query, [estado ? 1 : 0, id]);

            if (!result.success) {
                throw new Error(result.error);
            }

            // Registrar log
            try {
                const LogActividad = (await import("../modelos/logActividadModel.js")).default;
                const clientIp = req.ip || req.connection.remoteAddress;
                const userAgent = req.get('user-agent');
                await LogActividad.create({
                    usuario_id: req.user?.usuario_id || null,
                    log_tipo: estado ? "Actualizar" : "Eliminar",
                    log_entidad: "Usuario",
                    log_descripcion: `Usuario ${id} ${estado ? 'activado' : 'desactivado'}`,
                    log_ip: clientIp,
                    log_user_agent: userAgent,
                });
            } catch (logError) {
                console.error("Error registrando log:", logError);
            }

            res.json({ success: result.data.affectedRows > 0 });
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
};

export default userController;
