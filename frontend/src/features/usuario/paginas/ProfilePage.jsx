import { useState, useEffect } from "react";
import { useAuth } from "../../../contextos/AuthContext";
import userService from "../../../servicios/servicioUsuario";
import { CameraIcon, UserIcon, PencilIcon, CheckIcon, XMarkIcon } from "@heroicons/react/24/outline";

const ProfilePage = () => {
  const { user, updateUser } = useAuth();
  const [formData, setFormData] = useState({
    usuario_nombre: "",
    usuario_apellido: "",
    usuario_telefono: "",
    usuario_correo: "",
    usuario_direccion: "",
    usuario_ciudad: "",
    usuario_foto_perfil: null,
  });
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);

  useEffect(() => {
    if (user) {
      setFormData({
        usuario_nombre: user.usuario_nombre || "",
        usuario_apellido: user.usuario_apellido || "",
        usuario_telefono: user.usuario_telefono || "",
        usuario_correo: user.usuario_correo || "",
        usuario_direccion: user.usuario_direccion || "",
        usuario_ciudad: user.usuario_ciudad || "",
        usuario_foto_perfil: user.usuario_foto_perfil || null,
      });
      if (user.usuario_foto_perfil) {
        setPreviewImage(user.usuario_foto_perfil);
      }
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError(null);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError("La imagen no debe superar los 5MB");
        return;
      }

      if (!file.type.startsWith("image/")) {
        setError("El archivo debe ser una imagen");
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
        setFormData((prev) => ({ ...prev, usuario_foto_perfil: file }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      // Preparar datos para enviar (convertir File a base64 si existe)
      const dataToSend = { ...formData };
      
      // Si hay un archivo de imagen, convertirlo a base64
      if (formData.usuario_foto_perfil instanceof File) {
        const reader = new FileReader();
        await new Promise((resolve, reject) => {
          reader.onload = () => {
            dataToSend.usuario_foto_perfil = reader.result;
            resolve();
          };
          reader.onerror = reject;
          reader.readAsDataURL(formData.usuario_foto_perfil);
        });
      }

      const response = await userService.updateProfile(user.usuario_id, dataToSend);
      
      if (response.success) {
        setSuccess(true);
        setIsEditing(false);
        updateUser(response.user);
        if (response.user?.usuario_foto_perfil) {
          setPreviewImage(response.user.usuario_foto_perfil);
        }
        setTimeout(() => setSuccess(false), 3000);
      }
    } catch (err) {
      setError(err.response?.data?.error || "Error al actualizar perfil");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    if (user) {
      setFormData({
        usuario_nombre: user.usuario_nombre || "",
        usuario_apellido: user.usuario_apellido || "",
        usuario_telefono: user.usuario_telefono || "",
        usuario_correo: user.usuario_correo || "",
        usuario_direccion: user.usuario_direccion || "",
        usuario_ciudad: user.usuario_ciudad || "",
        usuario_foto_perfil: user.usuario_foto_perfil || null,
      });
      setPreviewImage(user.usuario_foto_perfil || null);
    }
    setError(null);
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-2xl shadow-lg p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Mi Perfil</h1>
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <PencilIcon className="w-5 h-5" />
              Editar Perfil
            </button>
          )}
        </div>

        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl">
            <p className="text-green-700 font-medium">¡Perfil actualizado exitosamente!</p>
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Foto de Perfil */}
            <div className="md:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-4">
                Foto de Perfil
              </label>
              <div className="relative">
                <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden border-4 border-gray-300 mx-auto">
                  {previewImage ? (
                    <img
                      src={previewImage}
                      alt="Foto de perfil"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <UserIcon className="w-16 h-16 text-gray-400" />
                  )}
                </div>
                {isEditing && (
                  <label className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full cursor-pointer hover:bg-blue-700 transition-colors">
                    <CameraIcon className="w-5 h-5" />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
              {isEditing && (
                <p className="text-xs text-gray-500 text-center mt-2">
                  Máximo 5MB. Formatos: JPG, PNG
                </p>
              )}
            </div>

            {/* Información Personal */}
            <div className="md:col-span-2 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre *
                  </label>
                  <input
                    type="text"
                    name="usuario_nombre"
                    value={formData.usuario_nombre}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Apellido *
                  </label>
                  <input
                    type="text"
                    name="usuario_apellido"
                    value={formData.usuario_apellido}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Correo Electrónico *
                  </label>
                  <input
                    type="email"
                    name="usuario_correo"
                    value={formData.usuario_correo}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Teléfono *
                  </label>
                  <input
                    type="tel"
                    name="usuario_telefono"
                    value={formData.usuario_telefono}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ciudad *
                  </label>
                  <input
                    type="text"
                    name="usuario_ciudad"
                    value={formData.usuario_ciudad}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Dirección *
                  </label>
                  <input
                    type="text"
                    name="usuario_direccion"
                    value={formData.usuario_direccion}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                    required
                  />
                </div>
              </div>

              {isEditing && (
                <div className="flex items-center gap-4 pt-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-colors"
                  >
                    <CheckIcon className="w-5 h-5" />
                    {loading ? "Guardando..." : "Guardar Cambios"}
                  </button>
                  <button
                    type="button"
                    onClick={handleCancel}
                    disabled={loading}
                    className="flex items-center gap-2 px-6 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 disabled:opacity-50 transition-colors"
                  >
                    <XMarkIcon className="w-5 h-5" />
                    Cancelar
                  </button>
                </div>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfilePage;

