import Auth from "../modelos/autenticacionModel.js";
import PasswordReset from "../modelos/passwordResetModel.js";
import emailService from "../servicios/emailService.js";
import bcrypt from "bcrypt";
import db from "../../database/connectiondb.js";

const passwordResetController = {
  // Solicitar recuperación de contraseña
  async requestReset(req, res) {
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
        // Por seguridad, no revelar si el email existe o no
        return res.json({
          success: true,
          message:
            "Si el correo existe en nuestro sistema, recibirás un enlace de recuperación.",
        });
      }

      // Crear token
      const tokenResult = await PasswordReset.createToken(user.usuario_id);

      // Enviar email
      try {
        await emailService.sendPasswordResetEmail(
          user.usuario_correo,
          user.usuario_nombre,
          tokenResult.token
        );
      } catch (emailError) {
        console.error("Error enviando email:", emailError);
        // No fallar si el email no se puede enviar, pero registrar el error
      }

      return res.json({
        success: true,
        message:
          "Si el correo existe en nuestro sistema, recibirás un enlace de recuperación.",
      });
    } catch (error) {
      console.error("Error en requestReset:", error);
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  },

  // Verificar token
  async verifyToken(req, res) {
    try {
      const { token } = req.query;

      if (!token) {
        return res.status(400).json({
          success: false,
          message: "Token requerido",
        });
      }

      const verification = await PasswordReset.verifyToken(token);

      if (!verification.success) {
        return res.status(400).json(verification);
      }

      return res.json({
        success: true,
        message: "Token válido",
      });
    } catch (error) {
      console.error("Error en verifyToken:", error);
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  },

  // Resetear contraseña
  async resetPassword(req, res) {
    try {
      const { token, nueva_contrasena } = req.body;

      if (!token || !nueva_contrasena) {
        return res.status(400).json({
          success: false,
          message: "Token y nueva contraseña requeridos",
        });
      }

      if (nueva_contrasena.length < 6) {
        return res.status(400).json({
          success: false,
          message: "La contraseña debe tener al menos 6 caracteres",
        });
      }

      // Verificar token
      const verification = await PasswordReset.verifyToken(token);

      if (!verification.success) {
        return res.status(400).json(verification);
      }

      const { usuario_id } = verification.data;

      // Hashear nueva contraseña
      const hashedPassword = await bcrypt.hash(nueva_contrasena, 10);

      // Actualizar contraseña
      const updateQuery =
        "UPDATE usuarios SET usuario_contrasena = ? WHERE usuario_id = ?";
      const updateResult = await db.executeQuery(updateQuery, [
        hashedPassword,
        usuario_id,
      ]);

      if (!updateResult.success) {
        throw new Error("Error al actualizar contraseña");
      }

      // Marcar token como usado
      await PasswordReset.markTokenAsUsed(token);

      return res.json({
        success: true,
        message: "Contraseña actualizada exitosamente",
      });
    } catch (error) {
      console.error("Error en resetPassword:", error);
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  },

  // Limpiar tokens expirados
  async cleanExpiredTokens(req, res) {
    try {
      const result = await PasswordReset.cleanExpiredTokens();
      return res.json(result);
    } catch (error) {
      console.error("Error en cleanExpiredTokens:", error);
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  },
};

export default passwordResetController;

