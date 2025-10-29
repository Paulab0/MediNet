import { useState, useEffect } from "react";
import {
  XMarkIcon,
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  IdentificationIcon,
  AcademicCapIcon,
  CheckIcon,
  PencilIcon,
} from "@heroicons/react/24/outline";
import { useAuth } from "../../../contexts/AuthContext";
import specialtyService from "../../../services/specialtyService";
import doctorService from "../../../services/doctorService";

const EditProfileForm = ({ isOpen, onClose }) => {
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [specialties, setSpecialties] = useState([]);
  const [formData, setFormData] = useState({
    usuario_nombre: "",
    usuario_apellido: "",
    usuario_correo: "",
    usuario_telefono: "",
    usuario_cedula: "",
    especialidad_id: "",
    especialidad_nombre: "",
  });

  // Cargar especialidades al abrir el modal
  useEffect(() => {
    if (isOpen) {
      loadSpecialties();
    }
  }, [isOpen]);

  // Cargar datos del usuario al abrir el modal
  useEffect(() => {
    if (isOpen && user) {
      setFormData({
        usuario_nombre: user.usuario_nombre || "",
        usuario_apellido: user.usuario_apellido || "",
        usuario_correo: user.usuario_correo || "",
        usuario_telefono: user.usuario_telefono || "",
        usuario_cedula: user.usuario_cedula || "",
        especialidad_id: user.especialidad_id || "",
        especialidad_nombre: user.especialidad_nombre || "",
      });
    }
  }, [isOpen, user]);

  const loadSpecialties = async () => {
    try {
      const data = await specialtyService.getSpecialties();
      setSpecialties(data);
    } catch (error) {
      console.error("Error cargando especialidades:", error);
    }
  };

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    // Recargar datos originales del usuario
    if (user) {
      setFormData({
        usuario_nombre: user.usuario_nombre || "",
        usuario_apellido: user.usuario_apellido || "",
        usuario_correo: user.usuario_correo || "",
        usuario_telefono: user.usuario_telefono || "",
        usuario_cedula: user.usuario_cedula || "",
        especialidad_id: user.especialidad_id || "",
        especialidad_nombre: user.especialidad_nombre || "",
      });
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      console.log("Actualizando perfil con datos:", formData);
      console.log("Médico ID:", user.medico_id);

      // Validar que tenemos el medico_id
      if (!user?.medico_id) {
        throw new Error("No se encontró el ID del médico");
      }

      // Preparar datos para enviar al backend
      const updateData = {
        usuario_nombre: formData.usuario_nombre,
        usuario_apellido: formData.usuario_apellido,
        usuario_correo: formData.usuario_correo,
        usuario_telefono: formData.usuario_telefono,
        usuario_cedula: formData.usuario_cedula,
        especialidad_id: formData.especialidad_id,
      };

      // Llamar al API para actualizar el perfil
      const result = await doctorService.updateProfile(
        user.medico_id,
        updateData
      );
      console.log("Resultado de la actualización:", result);

      // Obtener el nombre de la especialidad seleccionada
      const selectedSpecialty = specialties.find(
        (s) => s.especialidad_id == formData.especialidad_id
      );
      const especialidad_nombre = selectedSpecialty
        ? selectedSpecialty.especialidad_nombre
        : "";

      // Actualizar el contexto de usuario con los datos actualizados
      updateUser({
        ...user,
        ...formData,
        especialidad_nombre,
      });

      // Cambiar a modo de solo lectura
      setIsEditing(false);

      // Mostrar mensaje de éxito
      alert("Perfil actualizado exitosamente");
    } catch (error) {
      console.error("Error actualizando perfil:", error);
      alert(
        `Error al actualizar el perfil: ${
          error.message || error.response?.data?.error || "Error desconocido"
        }`
      );
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <UserIcon className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                {isEditing ? "Editar Perfil" : "Mi Perfil"}
              </h2>
              <p className="text-sm text-gray-500">
                {isEditing
                  ? "Actualiza tu información personal"
                  : "Información de tu perfil médico"}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {!isEditing && (
              <button
                onClick={handleEditClick}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
              >
                <PencilIcon className="w-4 h-4" />
                <span>Editar</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors"
            >
              <XMarkIcon className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Información Personal */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <IdentificationIcon className="w-5 h-5 mr-2 text-blue-600" />
              Información Personal
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre *
                </label>
                <input
                  type="text"
                  name="usuario_nombre"
                  value={formData.usuario_nombre}
                  onChange={handleInputChange}
                  required={isEditing}
                  disabled={!isEditing}
                  className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    isEditing
                      ? "border-gray-300 bg-white"
                      : "border-gray-200 bg-gray-50 text-gray-700"
                  }`}
                  placeholder="Tu nombre"
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
                  onChange={handleInputChange}
                  required={isEditing}
                  disabled={!isEditing}
                  className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    isEditing
                      ? "border-gray-300 bg-white"
                      : "border-gray-200 bg-gray-50 text-gray-700"
                  }`}
                  placeholder="Tu apellido"
                />
              </div>
            </div>
          </div>

          {/* Información de Contacto */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <EnvelopeIcon className="w-5 h-5 mr-2 text-blue-600" />
              Información de Contacto
            </h3>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Correo Electrónico *
              </label>
              <input
                type="email"
                name="usuario_correo"
                value={formData.usuario_correo}
                onChange={handleInputChange}
                required={isEditing}
                disabled={!isEditing}
                className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  isEditing
                    ? "border-gray-300 bg-white"
                    : "border-gray-200 bg-gray-50 text-gray-700"
                }`}
                placeholder="tu@email.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Teléfono
              </label>
              <input
                type="tel"
                name="usuario_telefono"
                value={formData.usuario_telefono}
                onChange={handleInputChange}
                disabled={!isEditing}
                className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  isEditing
                    ? "border-gray-300 bg-white"
                    : "border-gray-200 bg-gray-50 text-gray-700"
                }`}
                placeholder="Tu número de teléfono"
              />
            </div>
          </div>

 {/* Información Profesional */}
<div className="space-y-4">
  <h3 className="text-lg font-semibold text-gray-900 flex items-center">
    <AcademicCapIcon className="w-5 h-5 mr-2 text-blue-600" />
    Información Profesional
  </h3>

  <div>
    <label className="block text-sm font-medium text-gray-700 mb-2">
      Especialidad *
    </label>
    <select
      name="especialidad_id"
      value={formData.especialidad_id}
      onChange={handleInputChange}
      required={isEditing}
      disabled={!isEditing}
      className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
        isEditing
          ? "border-gray-300 bg-white"
          : "border-gray-200 bg-gray-50 text-gray-700"
      }`}
    >
      <option value="">Selecciona una especialidad</option>
      {[
        { id: 1, nombre: "Anestesiología" },
        { id: 2, nombre: "Cardiología" },
        { id: 3, nombre: "Cirugía General" },
        { id: 4, nombre: "Cirugía Plástica" },
        { id: 5, nombre: "Dermatología" },
        { id: 6, nombre: "Endocrinología" },
        { id: 7, nombre: "Geriatría" },
        { id: 8, nombre: "Genética Médica" },
        { id: 9, nombre: "Ginecología y Obstetricia" },
        { id: 10, nombre: "Infectología" },
        { id: 11, nombre: "Medicina del Deporte" },
        { id: 12, nombre: "Medicina Familiar" },
        { id: 13, nombre: "Medicina General" },
        { id: 14, nombre: "Medicina Intensiva" },
        { id: 15, nombre: "Medicina Interna" },
        { id: 16, nombre: "Nefrología" },
        { id: 17, nombre: "Neumología" },
        { id: 18, nombre: "Neurología" },
        { id: 19, nombre: "Oftalmología" },
        { id: 20, nombre: "Oncología" },
        { id: 21, nombre: "Ortopedia y Traumatología" },
        { id: 22, nombre: "Otorrinolaringología" },
        { id: 23, nombre: "Patología" },
        { id: 24, nombre: "Pediatría" },
        { id: 25, nombre: "Psiquiatría" },
        { id: 26, nombre: "Radiología" },
        { id: 27, nombre: "Reumatología" },
        { id: 28, nombre: "Urología" },
      ].map((specialty) => (
        <option key={specialty.id} value={specialty.id}>
          {specialty.nombre}
        </option>
      ))}
    </select>
  </div>
</div>



          {/* Botones */}
          {isEditing && (
            <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={handleCancelEdit}
                className="px-6 py-3 text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors font-medium"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Actualizando...</span>
                  </>
                ) : (
                  <>
                    <CheckIcon className="w-4 h-4" />
                    <span>Guardar Cambios</span>
                  </>
                )}
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default EditProfileForm;
