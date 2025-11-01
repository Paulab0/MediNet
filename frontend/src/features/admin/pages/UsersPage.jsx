import { useEffect, useState } from "react";
import userService from "../../../services/userService";
import UserFormModal from "../components/UserFormModal";

const UsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  useEffect(() => {
    refresh();
  }, []);

  const refresh = async () => {
    setLoading(true);
    try {
      const data = await userService.getUsers();
      setUsers(Array.isArray(data) ? data : data?.data || []);
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => {
    setEditingUser(null);
    setModalOpen(true);
  };

  const openEdit = (user) => {
    setEditingUser(user);
    setModalOpen(true);
  };

  const handleSubmit = async (values) => {
    if (editingUser) {
      await userService.updateUser(editingUser.usuario_id, values);
    } else {
      await userService.createUser(values);
    }
    setModalOpen(false);
    await refresh();
  };

  const handleDelete = async (user) => {
    if (!confirm(`¿Eliminar usuario ${user.usuario_nombre} ${user.usuario_apellido}?`)) return;
    await userService.deleteUser(user.usuario_id);
    await refresh();
  };

  return (
    <>
    <div className="bg-white rounded-lg border border-gray-200">
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        <h2 className="text-base font-semibold text-gray-800">Usuarios</h2>
        <button onClick={openCreate} className="px-3 py-2 bg-blue-600 text-white rounded-md text-sm">Nuevo usuario</button>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="text-left px-4 py-2">ID</th>
              <th className="text-left px-4 py-2">Nombre</th>
              <th className="text-left px-4 py-2">Correo</th>
              <th className="text-left px-4 py-2">Rol</th>
              <th className="text-left px-4 py-2">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td className="px-4 py-4" colSpan={5}>Cargando...</td>
              </tr>
            ) : (
              users.map((u) => (
                <tr key={u.usuario_id} className="border-t border-gray-100">
                  <td className="px-4 py-2">{u.usuario_id}</td>
                  <td className="px-4 py-2">{u.usuario_nombre} {u.usuario_apellido}</td>
                  <td className="px-4 py-2">{u.usuario_correo}</td>
                  <td className="px-4 py-2">{u.rol_nombre || 'Sin rol'}</td>
                  <td className="px-4 py-2 flex items-center gap-2">
                    <button onClick={() => openEdit(u)} className="px-2 py-1 border rounded-md text-gray-700 text-xs">Editar</button>
                    <button onClick={() => handleDelete(u)} className="px-2 py-1 border border-red-300 bg-red-50 text-red-700 rounded-md text-xs">Eliminar</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
    <UserFormModal open={modalOpen} onClose={() => setModalOpen(false)} onSubmit={handleSubmit} initialValues={editingUser} />
    </>
  );
};

export default UsersPage;


