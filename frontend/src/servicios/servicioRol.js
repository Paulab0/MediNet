import api from "../api/api";

const roleService = {
  getRoles: async () => {
    const response = await api.get("/roles");
    return response.data;
  },
  getRoleById: async (id) => {
    const response = await api.get(`/roles/${id}`);
    return response.data;
  },
  createRole: async (payload) => {
    const response = await api.post("/roles", payload);
    return response.data;
  },
  updateRole: async (id, payload) => {
    const response = await api.put(`/roles/${id}`, payload);
    return response.data;
  },
  deleteRole: async (id) => {
    const response = await api.delete(`/roles/${id}`);
    return response.data;
  },
};

export default roleService;

