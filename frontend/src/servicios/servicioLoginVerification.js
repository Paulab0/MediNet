import api from "../api/api";

const loginVerificationService = {
  // Obtener tokens pendientes
  getPendingTokens: async () => {
    try {
      const response = await api.get("/login-verification/pending");
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: "Error de conexión" };
    }
  },

  // Invalidar token
  invalidateToken: async (token_id) => {
    try {
      const response = await api.delete(`/login-verification/${token_id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: "Error de conexión" };
    }
  },

  // Limpiar tokens expirados
  cleanExpiredTokens: async () => {
    try {
      const response = await api.post("/login-verification/clean-expired");
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: "Error de conexión" };
    }
  },
};

export default loginVerificationService;







