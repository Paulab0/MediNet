import { useEffect, useState } from "react";
import userService from "../../../servicios/servicioUsuario";
import roleService from "../../../servicios/servicioRol";
import UserFormModal from "../componentes/UserFormModal";
import { 
  UserCircleIcon, 
  CheckCircleIcon, 
  XCircleIcon,
  ArrowPathIcon,
  ShieldCheckIcon
} from "@heroicons/react/24/outline";

const UsersPage = () => {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [changingRole, setChangingRole] = useState(null);

  useEffect(() => {
    refresh();
    loadRoles();
  }, []);

  const loadRoles = async () => {
    try {
      const data = await roleService.getRoles();
      setRoles(Array.isArray(data) ? data : data?.data || []);
    } catch (error) {
      console.error("Error cargando roles:", error);
    }
  };

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
    if (!confirm(`¿Desactivar usuario ${user.usuario_nombre} ${user.usuario_apellido}?`)) return;
    await userService.toggleStatus(user.usuario_id, false);
    await refresh();
  };

  const handleToggleStatus = async (user) => {
    const newStatus = !user.usuario_estado;
    const action = newStatus ? "activar" : "desactivar";
    if (!confirm(`¿${action.charAt(0).toUpperCase() + action.slice(1)} usuario ${user.usuario_nombre} ${user.usuario_apellido}?`)) return;
    await userService.toggleStatus(user.usuario_id, newStatus);
    await refresh();
  };

  const handleChangeRole = async (user, newRolId) => {
    setChangingRole(user.usuario_id);
    try {
      await userService.changeRole(user.usuario_id, newRolId);
      await refresh();
    } catch (error) {
      alert("Error al cambiar rol: " + (error.response?.data?.error || error.message));
    } finally {
      setChangingRole(null);
    }
  };

  const getRoleBadgeColor = (rolId) => {
    switch(rolId) {
      case 1: return "bg-purple-100 text-purple-700";
      case 2: return "bg-blue-100 text-blue-700";
      case 3: return "bg-green-100 text-green-700";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <>
    <div className="bg-white rounded-2xl shadow-lg border border-gray-200">
      <div className="p-6 border-b border-gray-200 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Gestión de Usuarios</h2>
          <p className="text-sm text-gray-600 mt-1">Administra usuarios, roles y permisos</p>
        </div>
        <button 
          onClick={openCreate} 
          className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg text-sm font-medium hover:from-blue-700 hover:to-blue-800 transition-all shadow-md hover:shadow-lg"
        >
          + Nuevo Usuario
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
            <tr>
              <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">ID</th>
              <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Nombre</th>
              <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Correo</th>
              <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Rol</th>
              <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Estado</th>
              <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td className="px-6 py-8 text-center text-gray-500" colSpan={6}>
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <span className="ml-3">Cargando usuarios...</span>
                  </div>
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td className="px-6 py-8 text-center text-gray-500" colSpan={6}>
                  No hay usuarios registrados
                </td>
              </tr>
            ) : (
              users.map((u) => (
                <tr key={u.usuario_id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-sm text-gray-900">{u.usuario_id}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {u.usuario_foto_perfil ? (
                        <img 
                          src={u.usuario_foto_perfil} 
                          alt={u.usuario_nombre}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                          <UserCircleIcon className="w-6 h-6 text-gray-400" />
                        </div>
                      )}
                      <div>
                        <div className="font-medium text-gray-900">{u.usuario_nombre} {u.usuario_apellido}</div>
                        <div className="text-xs text-gray-500">{u.usuario_telefono || 'Sin teléfono'}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{u.usuario_correo}</td>
                  <td className="px-6 py-4">
                    <select
                      value={u.rol_id || ''}
                      onChange={(e) => handleChangeRole(u, parseInt(e.target.value))}
                      disabled={changingRole === u.usuario_id}
                      className={`px-3 py-1 rounded-lg text-xs font-medium border-0 ${getRoleBadgeColor(u.rol_id)} focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer`}
                    >
                      {roles.map((role) => (
                        <option key={role.rol_id} value={role.rol_id}>
                          {role.rol_nombre}
                        </option>
                      ))}
                    </select>
                    {changingRole === u.usuario_id && (
                      <ArrowPathIcon className="w-4 h-4 inline ml-2 animate-spin text-blue-600" />
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleToggleStatus(u)}
                      className={`flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                        u.usuario_estado 
                          ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                          : 'bg-red-100 text-red-700 hover:bg-red-200'
                      }`}
                    >
                      {u.usuario_estado ? (
                        <>
                          <CheckCircleIcon className="w-4 h-4" />
                          Activo
                        </>
                      ) : (
                        <>
                          <XCircleIcon className="w-4 h-4" />
                          Inactivo
                        </>
                      )}
                    </button>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => openEdit(u)} 
                        className="px-3 py-1 border border-gray-300 rounded-lg text-gray-700 text-xs hover:bg-gray-50 transition-colors"
                      >
                        Editar
                      </button>
                      <button 
                        onClick={() => handleDelete(u)} 
                        className="px-3 py-1 border border-red-300 bg-red-50 text-red-700 rounded-lg text-xs hover:bg-red-100 transition-colors"
                      >
                        Desactivar
                      </button>
                    </div>
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


