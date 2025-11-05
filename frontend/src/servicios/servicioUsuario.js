import api from "../api/api";

const userService = {
  getUsers: async () => {
    const response = await api.get("/usuarios");
    return response.data;
  },
  getUserById: async (id) => {
    const response = await api.get(`/usuarios/${id}`);
    return response.data;
  },
  createUser: async (payload) => {
    const response = await api.post("/usuarios", payload);
    return response.data;
  },
  updateUser: async (id, payload) => {
    const response = await api.put(`/usuarios/${id}`, payload);
    return response.data;
  },
  deleteUser: async (id) => {
    const response = await api.delete(`/usuarios/${id}`);
    return response.data;
  },
  updateProfile: async (id, formData) => {
    const response = await api.put(`/usuarios/profile/${id}`, formData, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  },
  changeRole: async (id, rol_id) => {
    const response = await api.put(`/usuarios/${id}/role`, { rol_id });
    return response.data;
  },
  toggleStatus: async (id, estado) => {
    const response = await api.put(`/usuarios/${id}/status`, { estado });
    return response.data;
  },
};

export default userService;


