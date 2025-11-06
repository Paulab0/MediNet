import LoginVerification from "../modelos/loginVerificationModel.js";

const loginVerificationController = {
  // Obtener todos los tokens pendientes de verificación
  async getPendingTokens(req, res) {
    try {
      const tokens = await LoginVerification.getPendingTokens();
      res.json({ success: true, data: tokens });
    } catch (error) {
      console.error("Error obteniendo tokens pendientes:", error);
      res.status(500).json({ error: error.message });
    }
  },

  // Invalidar un token
  async invalidateToken(req, res) {
    try {
      const { token_id } = req.params;
      const result = await LoginVerification.invalidateToken(token_id);
      
      if (result.success) {
        res.json({ success: true, message: "Token invalidado exitosamente" });
      } else {
        res.status(404).json({ error: "Token no encontrado" });
      }
    } catch (error) {
      console.error("Error invalidando token:", error);
      res.status(500).json({ error: error.message });
    }
  },

  // Limpiar tokens expirados
  async cleanExpiredTokens(req, res) {
    try {
      const result = await LoginVerification.cleanExpiredTokens();
      res.json({ 
        success: true, 
        message: `Se limpiaron ${result.cleaned} tokens expirados`,
        cleaned: result.cleaned
      });
    } catch (error) {
      console.error("Error limpiando tokens expirados:", error);
      res.status(500).json({ error: error.message });
    }
  },
};

export default loginVerificationController;

