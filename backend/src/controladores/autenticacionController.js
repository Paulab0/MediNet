import Auth from "../modelos/autenticacionModel.js";
import emailService from "../servicios/emailService.js";
import LogActividad from "../modelos/logActividadModel.js";
import LoginVerification from "../modelos/loginVerificationModel.js";

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

            const clientIp = req.ip || req.connection.remoteAddress || 'Desconocida';
            const userAgent = req.get('user-agent') || 'Desconocido';

            // Crear token de verificación de inicio de sesión
            try {
                const verificationToken = await LoginVerification.createToken(
                    result.user.usuario_id,
                    clientIp,
                    userAgent
                );

                // Enviar correo con enlace de confirmación
                const now = new Date();
                const fecha = now.toISOString().split('T')[0];
                const hora = now.toTimeString().split(' ')[0].substring(0, 5);
                const confirmationUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/confirmar-login?token=${verificationToken.token}`;

                await emailService.sendLoginConfirmationEmail(
                    result.user.usuario_correo,
                    `${result.user.usuario_nombre} ${result.user.usuario_apellido}`,
                    {
                        fecha: fecha,
                        hora: hora,
                        ip: clientIp,
                        dispositivo: userAgent,
                        confirmationUrl: confirmationUrl
                    }
                );

                console.log('✅ Email de confirmación de inicio de sesión enviado');

                // Registrar actividad de intento de inicio de sesión
                try {
                    await LogActividad.create({
                        usuario_id: result.user.usuario_id,
                        log_tipo: "Login",
                        log_entidad: "Autenticación",
                        log_descripcion: `Intento de inicio de sesión desde IP: ${clientIp} (Pendiente de confirmación)`,
                        log_ip: clientIp,
                        log_user_agent: userAgent,
                    });
                } catch (logError) {
                    console.warn('⚠️ No se pudo registrar el log de actividad:', logError.message);
                }

                // Devolver respuesta indicando que se requiere confirmación
                return res.json({
                    success: true,
                    requiresVerification: true,
                    message: "Se ha enviado un correo de confirmación. Por favor, verifica tu correo para completar el inicio de sesión.",
                    token_id: verificationToken.token_id
                });
            } catch (verificationError) {
                console.error('❌ Error creando token de verificación:', verificationError);
                // Si falla la creación del token, permitir login sin confirmación (fallback)
                return res.status(500).json({ 
                    error: "Error al generar token de verificación. Por favor, intenta nuevamente." 
                });
            }
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // Confirmar inicio de sesión
    async confirmLogin(req, res) {
        try {
            const { token } = req.body;

            console.log('🔑 Token recibido para confirmación:', token ? `${token.substring(0, 20)}...` : 'NO HAY TOKEN');

            if (!token) {
                return res.status(400).json({ error: "Token de verificación requerido" });
            }

            // Verificar el token
            console.log('🔍 Verificando token...');
            const tokenData = await LoginVerification.verifyToken(token);

            if (!tokenData) {
                console.log('❌ Token no encontrado o inválido');
                return res.status(400).json({ 
                    error: "Token inválido o expirado. Por favor, inicia sesión nuevamente." 
                });
            }

            console.log('✅ Token válido, usuario:', tokenData.usuario_id);

            // Marcar token como verificado
            await LoginVerification.markAsVerified(tokenData.token_id);

            // Generar JWT para el usuario
            const jwtToken = Auth.generateToken(tokenData);

            // Registrar actividad de inicio de sesión confirmado
            try {
                await LogActividad.create({
                    usuario_id: tokenData.usuario_id,
                    log_tipo: "Login",
                    log_entidad: "Autenticación",
                    log_descripcion: `Inicio de sesión confirmado desde IP: ${tokenData.login_ip}`,
                    log_ip: tokenData.login_ip,
                    log_user_agent: tokenData.login_user_agent,
                });
            } catch (logError) {
                console.warn('⚠️ No se pudo registrar el log de actividad:', logError.message);
            }

            // Obtener información completa del usuario
            const userInfo = await Auth.getUserWithRole(tokenData.usuario_id);

            console.log('✅ Login confirmado exitosamente para usuario:', userInfo.usuario_id);

            res.json({
                success: true,
                message: "Inicio de sesión confirmado exitosamente",
                token: jwtToken,
                user: userInfo
            });
        } catch (error) {
            console.error('❌ Error confirmando inicio de sesión:', error);
            console.error('Stack:', error.stack);
            res.status(500).json({ error: error.message || "Error al confirmar inicio de sesión" });
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
