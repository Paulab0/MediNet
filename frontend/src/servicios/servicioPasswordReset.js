import api from "../api/api";

const passwordResetService = {
  // Solicitar recuperación de contraseña
  async requestReset(email) {
    const response = await api.post("/password-reset/request", {
      usuario_correo: email,
    });
    return response.data;
  },

  // Verificar token
  async verifyToken(token) {
    const response = await api.get("/password-reset/verify", {
      params: { token },
    });
    return response.data;
  },

  // Resetear contraseña
  async resetPassword(token, nuevaContrasena) {
    const response = await api.post("/password-reset/reset", {
      token,
      nueva_contrasena: nuevaContrasena,
    });
    return response.data;
  },
};

export default passwordResetService;

