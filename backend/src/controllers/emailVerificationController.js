import EmailVerification from "../models/emailVerificationModel.js";
import emailService from "../services/emailService.js";
import Auth from "../models/authModel.js";

const emailVerificationController = {
  // Confirmar email con token
  async confirmEmail(req, res) {
    try {
      const { token } = req.query;

      if (!token) {
        return res.status(400).json({
          success: false,
          message: "Token de verificación requerido",
        });
      }

      // Verificar el token
      const tokenVerification = await EmailVerification.verifyToken(token);

      if (!tokenVerification.valid) {
        return res.status(400).json({
          success: false,
          message: tokenVerification.message,
        });
      }

      // Marcar email como verificado
      await EmailVerification.markEmailAsVerified(tokenVerification.usuario_id);

      // Obtener información del usuario
      const user = await Auth.getUserWithRole(tokenVerification.usuario_id);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "Usuario no encontrado",
        });
      }

      // Enviar email de bienvenida
      try {
        await emailService.sendWelcomeEmail(
          user.usuario_correo,
          `${user.usuario_nombre} ${user.usuario_apellido}`
        );
      } catch (emailError) {
        console.error("⚠️ Error enviando email de bienvenida:", emailError);
        // No fallar si el email no se puede enviar
      }

      return res.json({
        success: true,
        message: "Email verificado exitosamente",
        user: {
          usuario_id: user.usuario_id,
          usuario_nombre: user.usuario_nombre,
          usuario_apellido: user.usuario_apellido,
          usuario_correo: user.usuario_correo,
        },
      });
    } catch (error) {
      console.error("❌ Error en confirmEmail:", error);
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  },

  // Reenviar token de verificación
  async resendVerificationToken(req, res) {
    try {
      const { usuario_correo } = req.body;

      if (!usuario_correo) {
        return res.status(400).json({
          success: false,
          message: "Correo electrónico requerido",
        });
      }

      // Buscar usuario
      const user = await Auth.findUserByEmail(usuario_correo);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "Usuario no encontrado",
        });
      }

      // Verificar si ya está verificado
      if (user.usuario_email_verificado) {
        return res.json({
          success: false,
          message: "El email ya está verificado",
        });
      }

      // Reenviar token
      const result = await EmailVerification.resendVerificationToken(
        user.usuario_id,
        user.usuario_correo,
        `${user.usuario_nombre} ${user.usuario_apellido}`
      );

      if (!result.success) {
        return res.status(400).json({
          success: false,
          message: result.message,
        });
      }

      return res.json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      console.error("❌ Error en resendVerificationToken:", error);
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  },

  // Limpiar tokens expirados (endpoint administrativo)
  async cleanExpiredTokens(req, res) {
    try {
      const result = await EmailVerification.cleanExpiredTokens();
      return res.json({
        success: true,
        message: "Tokens expirados limpiados exitosamente",
        deleted: result.deleted,
      });
    } catch (error) {
      console.error("❌ Error en cleanExpiredTokens:", error);
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  },
};

export default emailVerificationController;

