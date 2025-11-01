import api from "../api/api";

const emailVerificationService = {
  // Confirmar email con token
  async confirmEmail(token) {
    const response = await api.get(`/email-verification/confirm?token=${token}`);
    return response.data;
  },

  // Reenviar token de verificación
  async resendVerificationToken(email) {
    const response = await api.post("/email-verification/resend", {
      usuario_correo: email,
    });
    return response.data;
  },
};

export default emailVerificationService;

