import { useState } from "react";
import {
  UserIcon,
  AtSymbolIcon,
  PhoneIcon,
  MapPinIcon,
  CalendarIcon,
  DocumentTextIcon,
  XMarkIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
} from "@heroicons/react/24/outline";
import patientService from "../../../services/patientService";
import { useAuth } from "../../../contexts/AuthContext";

const AddPatientForm = ({ isOpen, onClose, onPatientAdded }) => {
  const [formData, setFormData] = useState({
    usuario_nombre: "",
    usuario_apellido: "",
    usuario_edad: "",
    usuario_genero: "",
    usuario_identificacion: "",
    usuario_direccion: "",
    usuario_ciudad: "",
    usuario_correo: "",
    usuario_telefono: "",
    usuario_contrasena: "",
    identificacion_id: 1, // CC por defecto
    procedimiento: "",
    observaciones: "",
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const { user } = useAuth();

  // Regex para validaciones
  const regex = {
    nombre: /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]{2,50}$/,
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    telefono: /^[0-9]{10}$/,
    identificacion: /^[0-9]{6,12}$/,
    edad: /^(1[8-9]|[2-9][0-9]|1[0-2][0-9])$/,
  };

  const validateField = (name, value) => {
    let error = "";

    switch (name) {
      case "usuario_nombre":
      case "usuario_apellido":
        if (!value.trim()) {
          error = "Este campo es obligatorio";
        } else if (!regex.nombre.test(value)) {
          error = "Solo se permiten letras y espacios (2-50 caracteres)";
        }
        break;
      case "usuario_correo":
        if (!value.trim()) {
          error = "Este campo es obligatorio";
        } else if (!regex.email.test(value)) {
          error = "Formato de email inválido";
        }
        break;
      case "usuario_telefono":
        if (!value.trim()) {
          error = "Este campo es obligatorio";
        } else if (!regex.telefono.test(value)) {
          error = "Debe tener 10 dígitos";
        }
        break;
      case "usuario_identificacion":
        if (!value.trim()) {
          error = "Este campo es obligatorio";
        } else if (!regex.identificacion.test(value)) {
          error = "Debe tener entre 6 y 12 dígitos";
        }
        break;
      case "usuario_edad":
        if (!value.trim()) {
          error = "Este campo es obligatorio";
        } else if (!regex.edad.test(value)) {
          error = "Debe ser mayor de 17 años";
        }
        break;
      case "usuario_genero":
        if (!value) {
          error = "Este campo es obligatorio";
        }
        break;
      case "usuario_direccion":
      case "usuario_ciudad":
        if (!value.trim()) {
          error = "Este campo es obligatorio";
        }
        break;
      case "procedimiento":
        if (!value.trim()) {
          error = "Este campo es obligatorio";
        }
        break;
    }

    return error;
  };

  const validateForm = () => {
    const newErrors = {};
    Object.keys(formData).forEach((key) => {
      if (key !== "observaciones") {
        const error = validateField(key, formData[key]);
        if (error) {
          newErrors[key] = error;
        }
      }
    });
    return newErrors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Validar en tiempo real
    if (touched[name]) {
      const error = validateField(name, value);
      setErrors((prev) => ({ ...prev, [name]: error }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    const error = validateField(name, value);
    setErrors((prev) => ({ ...prev, [name]: error }));
  };

  const handleFocus = (e) => {
    const { name } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
  };

  const getInputBorderClass = (fieldName) => {
    if (!touched[fieldName]) return "border-gray-300 focus:border-blue-500";
    if (errors[fieldName]) return "border-red-500 focus:border-red-500";
    return "border-green-500 focus:border-green-500";
  };

  const getStatusIcon = (fieldName) => {
    if (!touched[fieldName]) return null;
    if (errors[fieldName]) {
      return <ExclamationCircleIcon className="w-5 h-5 text-red-500" />;
    }
    return <CheckCircleIcon className="w-5 h-5 text-green-500" />;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setTouched({});
    const formErrors = validateForm();
    setErrors(formErrors);

    if (Object.keys(formErrors).length > 0) {
      return;
    }

    setLoading(true);
    try {
      // Crear el usuario primero usando el servicio de usuarios
      const userData = {
        usuario_nombre: formData.usuario_nombre,
        usuario_apellido: formData.usuario_apellido,
        usuario_edad: parseInt(formData.usuario_edad),
        usuario_genero: formData.usuario_genero,
        usuario_identificacion: formData.usuario_identificacion,
        usuario_direccion: formData.usuario_direccion,
        usuario_ciudad: formData.usuario_ciudad,
        usuario_correo: formData.usuario_correo,
        usuario_telefono: formData.usuario_telefono,
        usuario_contrasena: formData.usuario_contrasena,
        rol_id: 3, // Paciente
        identificacion_id: formData.identificacion_id,
      };

      // Crear usuario primero usando el endpoint de registro
      const userResponse = await fetch(
        "http://localhost:3000/api/auth/register",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(userData),
        }
      );

      if (!userResponse.ok) {
        const errorData = await userResponse.json();
        throw new Error(errorData.error || "Error al crear el usuario");
      }

      const newUser = await userResponse.json();

      // Crear paciente que referencia al usuario y al médico actual
      const patientData = {
        usuario_id: newUser.userId,
        medico_id: user.medico_id, // Asociar al médico actual
        paciente_estado: 1,
      };

      const newPatient = await patientService.createPatient(patientData);

      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onClose();
        onPatientAdded?.(newPatient);
        // Reset form
        setFormData({
          usuario_nombre: "",
          usuario_apellido: "",
          usuario_edad: "",
          usuario_genero: "",
          usuario_identificacion: "",
          usuario_direccion: "",
          usuario_ciudad: "",
          usuario_correo: "",
          usuario_telefono: "",
          usuario_contrasena: "",
          identificacion_id: 1,
          procedimiento: "",
          observaciones: "",
        });
        setErrors({});
        setTouched({});
      }, 2000);
    } catch (error) {
      console.error("Error creando paciente:", error);
      setErrors({ submit: error.message || "Error al crear el paciente" });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="bg-blue-100 p-6 rounded-t-3xl">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">
              Agregar Nuevo Paciente
            </h2>
            <button
              onClick={onClose}
              className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-gray-600 hover:text-gray-800 transition-colors"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6">
          {success && (
            <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded-xl">
              <div className="flex items-center">
                <CheckCircleIcon className="w-5 h-5 mr-2" />
                <span className="font-medium">
                  ¡Paciente agregado exitosamente!
                </span>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Información Personal */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    name="usuario_nombre"
                    value={formData.usuario_nombre}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    onFocus={handleFocus}
                    className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 ${getInputBorderClass(
                      "usuario_nombre"
                    )}`}
                    placeholder="Nombre del paciente"
                  />
                  <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    {getStatusIcon("usuario_nombre")}
                  </div>
                </div>
                {errors.usuario_nombre && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.usuario_nombre}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Apellido *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    name="usuario_apellido"
                    value={formData.usuario_apellido}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    onFocus={handleFocus}
                    className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 ${getInputBorderClass(
                      "usuario_apellido"
                    )}`}
                    placeholder="Apellido del paciente"
                  />
                  <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    {getStatusIcon("usuario_apellido")}
                  </div>
                </div>
                {errors.usuario_apellido && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.usuario_apellido}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Edad *
                </label>
                <div className="relative">
                  <input
                    type="number"
                    name="usuario_edad"
                    value={formData.usuario_edad}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    onFocus={handleFocus}
                    className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 ${getInputBorderClass(
                      "usuario_edad"
                    )}`}
                    placeholder="Edad"
                    min="18"
                    max="129"
                  />
                  <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    {getStatusIcon("usuario_edad")}
                  </div>
                </div>
                {errors.usuario_edad && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.usuario_edad}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Género *
                </label>
                <select
                  name="usuario_genero"
                  value={formData.usuario_genero}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  onFocus={handleFocus}
                  className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 ${getInputBorderClass(
                    "usuario_genero"
                  )}`}
                >
                  <option value="">Seleccionar género</option>
                  <option value="Masculino">Masculino</option>
                  <option value="Femenino">Femenino</option>
                  <option value="Otro">Otro</option>
                </select>
                {errors.usuario_genero && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.usuario_genero}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Identificación *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    name="usuario_identificacion"
                    value={formData.usuario_identificacion}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    onFocus={handleFocus}
                    className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 ${getInputBorderClass(
                      "usuario_identificacion"
                    )}`}
                    placeholder="Número de identificación"
                  />
                  <DocumentTextIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    {getStatusIcon("usuario_identificacion")}
                  </div>
                </div>
                {errors.usuario_identificacion && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.usuario_identificacion}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Teléfono *
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    name="usuario_telefono"
                    value={formData.usuario_telefono}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    onFocus={handleFocus}
                    className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 ${getInputBorderClass(
                      "usuario_telefono"
                    )}`}
                    placeholder="Número de teléfono"
                  />
                  <PhoneIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    {getStatusIcon("usuario_telefono")}
                  </div>
                </div>
                {errors.usuario_telefono && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.usuario_telefono}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email *
                </label>
                <div className="relative">
                  <input
                    type="email"
                    name="usuario_correo"
                    value={formData.usuario_correo}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    onFocus={handleFocus}
                    className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 ${getInputBorderClass(
                      "usuario_correo"
                    )}`}
                    placeholder="Correo electrónico"
                  />
                  <AtSymbolIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    {getStatusIcon("usuario_correo")}
                  </div>
                </div>
                {errors.usuario_correo && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.usuario_correo}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ciudad *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    name="usuario_ciudad"
                    value={formData.usuario_ciudad}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    onFocus={handleFocus}
                    className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 ${getInputBorderClass(
                      "usuario_ciudad"
                    )}`}
                    placeholder="Ciudad"
                  />
                  <MapPinIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    {getStatusIcon("usuario_ciudad")}
                  </div>
                </div>
                {errors.usuario_ciudad && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.usuario_ciudad}
                  </p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Dirección *
              </label>
              <div className="relative">
                <input
                  type="text"
                  name="usuario_direccion"
                  value={formData.usuario_direccion}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  onFocus={handleFocus}
                  className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 ${getInputBorderClass(
                    "usuario_direccion"
                  )}`}
                  placeholder="Dirección completa"
                />
                <MapPinIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  {getStatusIcon("usuario_direccion")}
                </div>
              </div>
              {errors.usuario_direccion && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.usuario_direccion}
                </p>
              )}
            </div>

            {/* Información Médica */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Información Médica
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Procedimiento a Realizar *
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      name="procedimiento"
                      value={formData.procedimiento}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      onFocus={handleFocus}
                      className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 ${getInputBorderClass(
                        "procedimiento"
                      )}`}
                      placeholder="Ej: Consulta general, Control, Urgencia"
                    />
                    <DocumentTextIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      {getStatusIcon("procedimiento")}
                    </div>
                  </div>
                  {errors.procedimiento && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.procedimiento}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contraseña Temporal *
                  </label>
                  <div className="relative">
                    <input
                      type="password"
                      name="usuario_contrasena"
                      value={formData.usuario_contrasena}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      onFocus={handleFocus}
                      className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 ${getInputBorderClass(
                        "usuario_contrasena"
                      )}`}
                      placeholder="Contraseña temporal"
                    />
                    <DocumentTextIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      {getStatusIcon("usuario_contrasena")}
                    </div>
                  </div>
                  {errors.usuario_contrasena && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.usuario_contrasena}
                    </p>
                  )}
                </div>
              </div>

              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Observaciones Médicas
                </label>
                <textarea
                  name="observaciones"
                  value={formData.observaciones}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Observaciones adicionales sobre el paciente..."
                />
              </div>
            </div>

            {errors.submit && (
              <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded-xl">
                <div className="flex items-center">
                  <ExclamationCircleIcon className="w-5 h-5 mr-2" />
                  <span>{errors.submit}</span>
                </div>
              </div>
            )}

            <div className="flex justify-end space-x-4 pt-6">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={
                  loading || Object.keys(errors).some((key) => errors[key])
                }
                className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:bg-blue-400 transition-colors"
              >
                {loading ? "Agregando..." : "Agregar Paciente"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddPatientForm;
