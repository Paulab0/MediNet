import { useState, useEffect } from "react";
import {
  XMarkIcon,
  UserIcon,
  BuildingOfficeIcon,
  CheckIcon,
  EyeIcon,
  EyeSlashIcon,
} from "@heroicons/react/24/outline";
import doctorService from "../../../servicios/servicioMedico";
import specialtyService from "../../../servicios/servicioEspecialidad";

const RegisterDoctorForm = ({ isOpen, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [specialties, setSpecialties] = useState([]);
  const [formData, setFormData] = useState({
    // Datos del usuario
    usuario_nombre: "",
    usuario_apellido: "",
    usuario_edad: "",
    usuario_genero: "",
    usuario_identificacion: "",
    identificacion_id: 1, // CC por defecto
    usuario_direccion: "",
    usuario_ciudad: "",
    usuario_correo: "",
    usuario_telefono: "",
    usuario_contrasena: "",
    // Datos del médico
    especialidad_id: "",
    medico_consultorio: "",
  });

  useEffect(() => {
    if (isOpen) {
      loadSpecialties();
      // Resetear formulario
      setFormData({
        usuario_nombre: "",
        usuario_apellido: "",
        usuario_edad: "",
        usuario_genero: "",
        usuario_identificacion: "",
        identificacion_id: 1,
        usuario_direccion: "",
        usuario_ciudad: "",
        usuario_correo: "",
        usuario_telefono: "",
        usuario_contrasena: "",
        especialidad_id: "",
        medico_consultorio: "",
      });
      setError(null);
      setSuccess(null);
    }
  }, [isOpen]);

  const loadSpecialties = async () => {
    try {
      const data = await specialtyService.getSpecialties();
      setSpecialties(Array.isArray(data) ? data : data?.data || []);
    } catch (err) {
      console.error("Error cargando especialidades:", err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    // Validaciones
    if (!formData.usuario_nombre.trim()) {
      setError("El nombre es obligatorio");
      return;
    }
    if (!formData.usuario_apellido.trim()) {
      setError("El apellido es obligatorio");
      return;
    }
    if (!formData.usuario_correo.trim()) {
      setError("El correo electrónico es obligatorio");
      return;
    }
    if (!formData.usuario_contrasena || formData.usuario_contrasena.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres");
      return;
    }
    if (!formData.especialidad_id) {
      setError("La especialidad es obligatoria");
      return;
    }
    if (!formData.usuario_identificacion) {
      setError("El número de identificación es obligatorio");
      return;
    }

    try {
      setLoading(true);

      const result = await doctorService.registerDoctor(formData);

      if (result.success) {
        setSuccess("Médico registrado exitosamente");
        setTimeout(() => {
          if (onSuccess) onSuccess();
          onClose();
        }, 1500);
      }
    } catch (err) {
      console.error("Error registrando médico:", err);
      setError(
        err.response?.data?.error ||
        err.message ||
        "Error al registrar el médico. Por favor, intenta nuevamente."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white z-10">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <UserIcon className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Registrar Nuevo Médico</h2>
              <p className="text-sm text-gray-500">Completa todos los campos requeridos</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors"
          >
            <XMarkIcon className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Messages */}
        {error && (
          <div className="mx-6 mt-4 p-4 bg-red-50 border border-red-200 rounded-xl">
            <p className="text-red-700">{error}</p>
          </div>
        )}
        {success && (
          <div className="mx-6 mt-4 p-4 bg-green-50 border border-green-200 rounded-xl">
            <p className="text-green-700">{success}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Información Personal */}
          <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Información Personal</h3>
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
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Edad
                </label>
                <input
                  type="number"
                  name="usuario_edad"
                  value={formData.usuario_edad}
                  onChange={handleInputChange}
                  min="18"
                  max="100"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Género
                </label>
                <select
                  name="usuario_genero"
                  value={formData.usuario_genero}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Seleccionar...</option>
                  <option value="Masculino">Masculino</option>
                  <option value="Femenino">Femenino</option>
                  <option value="Otro">Otro</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de Identificación *
                </label>
                <select
                  name="identificacion_id"
                  value={formData.identificacion_id}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value={1}>CC - Cédula de Ciudadanía</option>
                  <option value={2}>CE - Cédula de Extranjería</option>
                  <option value={3}>TI - Tarjeta de Identidad</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Número de Identificación *
                </label>
                <input
                  type="number"
                  name="usuario_identificacion"
                  value={formData.usuario_identificacion}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Dirección
                </label>
                <input
                  type="text"
                  name="usuario_direccion"
                  value={formData.usuario_direccion}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ciudad
                </label>
                <input
                  type="text"
                  name="usuario_ciudad"
                  value={formData.usuario_ciudad}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Información de Contacto */}
          <div className="bg-green-50 rounded-xl p-4 border border-green-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Información de Contacto</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Correo Electrónico *
                </label>
                <input
                  type="email"
                  name="usuario_correo"
                  value={formData.usuario_correo}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contraseña *
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="usuario_contrasena"
                    value={formData.usuario_contrasena}
                    onChange={handleInputChange}
                    required
                    minLength={6}
                    className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? (
                      <EyeSlashIcon className="w-5 h-5" />
                    ) : (
                      <EyeIcon className="w-5 h-5" />
                    )}
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">Mínimo 6 caracteres</p>
              </div>
            </div>
          </div>

          {/* Información Profesional */}
          <div className="bg-purple-50 rounded-xl p-4 border border-purple-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Información Profesional</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Especialidad *
                </label>
                <select
                  name="especialidad_id"
                  value={formData.especialidad_id}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Seleccionar especialidad...</option>
                  {specialties.map((specialty) => (
                    <option key={specialty.especialidad_id} value={specialty.especialidad_id}>
                      {specialty.especialidad_nombre}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <BuildingOfficeIcon className="w-4 h-4 inline mr-1" />
                  Consultorio
                </label>
                <input
                  type="text"
                  name="medico_consultorio"
                  value={formData.medico_consultorio}
                  onChange={handleInputChange}
                  placeholder="Ej: Consultorio 101, Piso 2"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Botones */}
          <div className="flex items-center justify-end space-x-4 pt-4 border-t border-gray-200 sticky bottom-0 bg-white">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-6 py-3 text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 disabled:opacity-50 transition-colors font-medium"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Registrando...</span>
                </>
              ) : (
                <>
                  <CheckIcon className="w-5 h-5" />
                  <span>Registrar Médico</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegisterDoctorForm;

