import db from "../../database/connectiondb.js";
import crypto from "crypto";

class LoginVerification {
  // Crear token de verificación de inicio de sesión
  static async createToken(usuario_id, login_ip, login_user_agent) {
    try {
      // Generar token único
      const token = crypto.randomBytes(32).toString("hex");
      
      // Fecha de expiración (15 minutos desde ahora)
      const expiracion = new Date();
      expiracion.setMinutes(expiracion.getMinutes() + 15);

      const query = `
        INSERT INTO login_verification_tokens 
        (usuario_id, token, login_ip, login_user_agent, token_expiracion) 
        VALUES (?, ?, ?, ?, ?)
      `;

      const result = await db.executeQuery(query, [
        usuario_id,
        token,
        login_ip || null,
        login_user_agent || null,
        expiracion,
      ]);

      if (!result.success) {
        throw new Error(result.error);
      }

      return {
        success: true,
        token,
        token_id: result.data.insertId,
        expiracion: expiracion.toISOString(),
      };
    } catch (error) {
      throw new Error(`Error al crear token de verificación: ${error.message}`);
    }
  }

  // Verificar token de inicio de sesión
  static async verifyToken(token) {
    try {
      const query = `
        SELECT 
          lvt.*,
          u.usuario_id, u.usuario_nombre, u.usuario_apellido, 
          u.usuario_correo, u.rol_id, u.usuario_estado
        FROM login_verification_tokens lvt
        INNER JOIN usuarios u ON lvt.usuario_id = u.usuario_id
        WHERE lvt.token = ? 
          AND lvt.token_estado = 1 
          AND lvt.token_verificado = 0
          AND lvt.token_expiracion > NOW()
      `;

      const result = await db.executeQuery(query, [token]);

      if (!result.success) {
        throw new Error(result.error);
      }

      if (result.data.length === 0) {
        return null;
      }

      return result.data[0];
    } catch (error) {
      throw new Error(`Error al verificar token: ${error.message}`);
    }
  }

  // Marcar token como verificado
  static async markAsVerified(token_id) {
    try {
      const query = `
        UPDATE login_verification_tokens 
        SET token_verificado = 1, 
            token_fecha_verificacion = NOW() 
        WHERE token_id = ? AND token_estado = 1
      `;

      const result = await db.executeQuery(query, [token_id]);

      if (!result.success) {
        throw new Error(result.error);
      }

      return { success: result.data.affectedRows > 0 };
    } catch (error) {
      throw new Error(`Error al marcar token como verificado: ${error.message}`);
    }
  }

  // Obtener tokens pendientes de verificación
  static async getPendingTokens(usuario_id = null) {
    try {
      let query = `
        SELECT 
          lvt.*,
          u.usuario_nombre, u.usuario_apellido, u.usuario_correo, u.rol_id
        FROM login_verification_tokens lvt
        INNER JOIN usuarios u ON lvt.usuario_id = u.usuario_id
        WHERE lvt.token_verificado = 0 
          AND lvt.token_estado = 1
          AND lvt.token_expiracion > NOW()
      `;
      const params = [];

      if (usuario_id) {
        query += " AND lvt.usuario_id = ?";
        params.push(usuario_id);
      }

      query += " ORDER BY lvt.login_fecha DESC";

      const result = await db.executeQuery(query, params);

      if (!result.success) {
        throw new Error(result.error);
      }

      return result.data;
    } catch (error) {
      throw new Error(`Error al obtener tokens pendientes: ${error.message}`);
    }
  }

  // Invalidar token (marcar como usado/expirado)
  static async invalidateToken(token_id) {
    try {
      const query = `
        UPDATE login_verification_tokens 
        SET token_estado = 0 
        WHERE token_id = ?
      `;

      const result = await db.executeQuery(query, [token_id]);

      if (!result.success) {
        throw new Error(result.error);
      }

      return { success: result.data.affectedRows > 0 };
    } catch (error) {
      throw new Error(`Error al invalidar token: ${error.message}`);
    }
  }

  // Limpiar tokens expirados
  static async cleanExpiredTokens() {
    try {
      const query = `
        UPDATE login_verification_tokens 
        SET token_estado = 0 
        WHERE token_expiracion <= NOW() AND token_estado = 1
      `;

      const result = await db.executeQuery(query);

      if (!result.success) {
        throw new Error(result.error);
      }

      return { success: true, cleaned: result.data.affectedRows };
    } catch (error) {
      throw new Error(`Error al limpiar tokens expirados: ${error.message}`);
    }
  }

  // Verificar si el usuario tiene un login pendiente de verificación
  static async hasPendingLogin(usuario_id) {
    try {
      const query = `
        SELECT COUNT(*) as count
        FROM login_verification_tokens
        WHERE usuario_id = ? 
          AND token_verificado = 0 
          AND token_estado = 1
          AND token_expiracion > NOW()
      `;

      const result = await db.executeQuery(query, [usuario_id]);

      if (!result.success) {
        throw new Error(result.error);
      }

      return result.data[0].count > 0;
    } catch (error) {
      throw new Error(`Error al verificar login pendiente: ${error.message}`);
    }
  }
}

export default LoginVerification;

