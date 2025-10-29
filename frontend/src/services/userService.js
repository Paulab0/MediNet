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
};

export default userService;


