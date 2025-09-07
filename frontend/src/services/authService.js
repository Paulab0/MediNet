import api from "../api/api";

const authService = {
  // Login de usuario
  login: async (usuario_correo, usuario_contrasena) => {
    try {
      const response = await api.post(`/auth/login`, {
        usuario_correo,
        usuario_contrasena,
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: "Error de conexión" };
    }
  },

  // Registro de usuario
  register: async (userData) => {
    try {
      const response = await api.post(`/auth/register`, userData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: "Error de conexión" };
    }
  },

  // Obtener token del localStorage
  getToken: () => {
    return localStorage.getItem("token");
  },

  // Verificar si el usuario está autenticado
  isAuthenticated: () => {
    const token = localStorage.getItem("token");
    return !!token;
  },

  // Obtener datos del usuario del localStorage
  getUser: () => {
    const userData = localStorage.getItem("user");
    return userData ? JSON.parse(userData) : null;
  },

  // Cerrar sesión
  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  },
};

export default authService;
