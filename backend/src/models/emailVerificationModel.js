import db from "../../database/connectiondb.js";
import crypto from "crypto";

class EmailVerification {
  // Generar token único de verificación
  static generateToken() {
    return crypto.randomBytes(32).toString("hex");
  }

  // Crear token de verificación
  static async createToken(usuario_id, tipo = "verificacion") {
    try {
      const token = this.generateToken();
      const expiraEn = new Date();
      expiraEn.setHours(expiraEn.getHours() + 24); // Token expira en 24 horas

      const query = `
        INSERT INTO email_verification_tokens (usuario_id, token, tipo, expira_en)
        VALUES (?, ?, ?, ?)
      `;
      const result = await db.executeQuery(query, [
        usuario_id,
        token,
        tipo,
        expiraEn,
      ]);

      if (!result.success) {
        throw new Error(result.error);
      }

      return { success: true, token };
    } catch (error) {
      throw new Error(`Error al crear token de verificación: ${error.message}`);
    }
  }

  // Verificar y usar un token
  static async verifyToken(token) {
    try {
      const query = `
        SELECT token_id, usuario_id, tipo, expira_en, usado
        FROM email_verification_tokens
        WHERE token = ? AND usado = FALSE
      `;
      const result = await db.executeQuery(query, [token]);

      if (!result.success) {
        throw new Error(result.error);
      }

      if (!result.data || result.data.length === 0) {
        return { valid: false, message: "Token no encontrado o ya usado" };
      }

      const tokenRecord = result.data[0];
      const now = new Date();
      const expiraEn = new Date(tokenRecord.expira_en);

      if (now > expiraEn) {
        return { valid: false, message: "Token expirado" };
      }

      // Marcar token como usado
      const updateQuery = `
        UPDATE email_verification_tokens 
        SET usado = TRUE 
        WHERE token_id = ?
      `;
      await db.executeQuery(updateQuery, [tokenRecord.token_id]);

      return {
        valid: true,
        usuario_id: tokenRecord.usuario_id,
        tipo: tokenRecord.tipo,
      };
    } catch (error) {
      throw new Error(
        `Error al verificar token: ${error.message}`
      );
    }
  }

  // Marcar email como verificado
  static async markEmailAsVerified(usuario_id) {
    try {
      const query = `
        UPDATE usuarios 
        SET usuario_email_verificado = TRUE 
        WHERE usuario_id = ?
      `;
      const result = await db.executeQuery(query, [usuario_id]);

      if (!result.success) {
        throw new Error(result.error);
      }

      return { success: true };
    } catch (error) {
      throw new Error(
        `Error al marcar email como verificado: ${error.message}`
      );
    }
  }

  // Obtener tokens activos de un usuario
  static async getActiveTokens(usuario_id) {
    try {
      const query = `
        SELECT token_id, token, tipo, expira_en, usado
        FROM email_verification_tokens
        WHERE usuario_id = ? AND usado = FALSE AND expira_en > NOW()
      `;
      const result = await db.executeQuery(query, [usuario_id]);

      if (!result.success) {
        throw new Error(result.error);
      }

      return result.data;
    } catch (error) {
      throw new Error(`Error al obtener tokens activos: ${error.message}`);
    }
  }

  // Limpiar tokens expirados (ejecutar periódicamente)
  static async cleanExpiredTokens() {
    try {
      const query = `
        DELETE FROM email_verification_tokens
        WHERE expira_en < NOW() AND usado = FALSE
      `;
      const result = await db.executeQuery(query);

      if (!result.success) {
        throw new Error(result.error);
      }

      console.log(
        `✅ Tokens expirados limpiados: ${result.data.affectedRows} tokens`
      );
      return { success: true, deleted: result.data.affectedRows };
    } catch (error) {
      throw new Error(
        `Error al limpiar tokens expirados: ${error.message}`
      );
    }
  }

  // Re-enviar token de verificación (si ya existe uno)
  static async resendVerificationToken(usuario_id, userEmail, userName) {
    try {
      // Verificar si el email ya está verificado
      const checkQuery = `
        SELECT usuario_email_verificado FROM usuarios WHERE usuario_id = ?
      `;
      const checkResult = await db.executeQuery(checkQuery, [usuario_id]);

      if (
        checkResult.success &&
        checkResult.data.length > 0 &&
        checkResult.data[0].usuario_email_verificado
      ) {
        return {
          success: false,
          message: "El email ya está verificado",
        };
      }

      // Eliminar tokens antiguos no usados
      const deleteQuery = `
        DELETE FROM email_verification_tokens
        WHERE usuario_id = ? AND tipo = 'verificacion' AND usado = FALSE
      `;
      await db.executeQuery(deleteQuery, [usuario_id]);

      // Crear nuevo token
      const tokenResult = await this.createToken(usuario_id, "verificacion");

      if (!tokenResult.success) {
        throw new Error("Error al crear nuevo token");
      }

      // Importar dinámicamente para evitar dependencia circular
      const emailService = await import("../services/emailService.js");
      await emailService.default.sendConfirmationEmail(
        userEmail,
        userName,
        tokenResult.token
      );

      return {
        success: true,
        message: "Token de verificación reenviado exitosamente",
      };
    } catch (error) {
      throw new Error(
        `Error al reenviar token de verificación: ${error.message}`
      );
    }
  }
}

export default EmailVerification;

