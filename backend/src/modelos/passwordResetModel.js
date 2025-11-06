import db from "../../database/connectiondb.js";
import crypto from "crypto";

class PasswordReset {
  // Crear token de recuperación
  static async createToken(usuario_id) {
    try {
      // Generar token único
      const token = crypto.randomBytes(32).toString("hex");
      
      // Expira en 24 horas
      const expira_en = new Date();
      expira_en.setHours(expira_en.getHours() + 24);

      // Eliminar tokens anteriores no usados del mismo usuario
      await db.executeQuery(
        "DELETE FROM password_reset_tokens WHERE usuario_id = ? AND usado = FALSE",
        [usuario_id]
      );

      // Insertar nuevo token
      const query = `
        INSERT INTO password_reset_tokens (usuario_id, token, expira_en)
        VALUES (?, ?, ?)
      `;
      
      const result = await db.executeQuery(query, [
        usuario_id,
        token,
        expira_en,
      ]);

      if (!result.success) {
        throw new Error(`Error al crear token: ${result.error}`);
      }

      return {
        success: true,
        token,
        expira_en,
      };
    } catch (error) {
      throw new Error(`Error al crear token de recuperación: ${error.message}`);
    }
  }

  // Verificar token
  static async verifyToken(token) {
    try {
      const query = `
        SELECT prt.*, u.usuario_id, u.usuario_correo, u.usuario_nombre
        FROM password_reset_tokens prt
        JOIN usuarios u ON prt.usuario_id = u.usuario_id
        WHERE prt.token = ? AND prt.usado = FALSE AND prt.expira_en > NOW()
      `;

      const result = await db.executeQuery(query, [token]);

      if (!result.success || result.data.length === 0) {
        return {
          success: false,
          message: "Token inválido o expirado",
        };
      }

      return {
        success: true,
        data: result.data[0],
      };
    } catch (error) {
      throw new Error(`Error al verificar token: ${error.message}`);
    }
  }

  // Marcar token como usado
  static async markTokenAsUsed(token) {
    try {
      const query = `
        UPDATE password_reset_tokens
        SET usado = TRUE
        WHERE token = ?
      `;

      const result = await db.executeQuery(query, [token]);

      if (!result.success) {
        throw new Error(`Error al marcar token como usado: ${result.error}`);
      }

      return { success: true };
    } catch (error) {
      throw new Error(`Error al marcar token: ${error.message}`);
    }
  }

  // Limpiar tokens expirados
  static async cleanExpiredTokens() {
    try {
      const query = `
        DELETE FROM password_reset_tokens
        WHERE expira_en < NOW() OR usado = TRUE
      `;

      const result = await db.executeQuery(query);

      return {
        success: true,
        deleted: result.results?.affectedRows || 0,
      };
    } catch (error) {
      throw new Error(`Error al limpiar tokens: ${error.message}`);
    }
  }
}

export default PasswordReset;


