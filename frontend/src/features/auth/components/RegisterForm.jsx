import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import authService from "../../../services/authService";
import { useAuth } from "../../../contexts/AuthContext";
import {
  UserIcon,
  AtSymbolIcon,
  PhoneIcon,
  LockClosedIcon,
  ExclamationCircleIcon,
  CheckCircleIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";

const RegisterForm = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
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
    usuario_confirmar_contrasena: "",
    rol_id: "2", // Por defecto médico
    identificacion_id: "1", // Por defecto CC
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const regex = {
    name: /^[A-Za-zÁÉÍÓÚáéíóúÑñÜü ]{3,40}$/,
    email: /^[\w-.]+@([\w-]+\.)+[\w-]{2,}$/,
    phone: /^[0-9]{10}$/, // Formato colombiano sin guiones
    password:
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,15}$/,
    identification: /^[0-9]{8,12}$/,
    address: /^[A-Za-zÁÉÍÓÚáéíóúÑñÜü0-9\s,.-]{5,100}$/,
  };

  // Validar un campo específico
  const validateField = (field, value) => {
    let errorMsg = "";

    switch (field) {
      case "usuario_nombre":
        if (!value.trim()) {
          errorMsg = "El nombre es requerido";
        } else if (!regex.name.test(value)) {
          errorMsg = "Nombre inválido (Mínimo 3 letras, solo letras)";
        }
        break;

      case "usuario_apellido":
        if (!value.trim()) {
          errorMsg = "El apellido es requerido";
        } else if (!regex.name.test(value)) {
          errorMsg = "Apellido inválido (Mínimo 3 letras, solo letras)";
        }
        break;

      case "usuario_edad":
        if (!value.trim()) {
          errorMsg = "La edad es requerida";
        } else if (
          isNaN(value) ||
          parseInt(value) < 1 ||
          parseInt(value) > 120
        ) {
          errorMsg = "La edad debe estar entre 1 y 120 años";
        }
        break;

      case "usuario_genero":
        if (!value.trim()) {
          errorMsg = "Selecciona tu género";
        }
        break;

      case "usuario_identificacion":
        if (!value.trim()) {
          errorMsg = "El número de identificación es requerido";
        } else if (!regex.identification.test(value)) {
          errorMsg = "Identificación inválida (8-12 dígitos)";
        }
        break;

      case "usuario_direccion":
        if (!value.trim()) {
          errorMsg = "La dirección es requerida";
        } else if (!regex.address.test(value)) {
          errorMsg = "Dirección inválida (Mínimo 5 caracteres)";
        }
        break;

      case "usuario_ciudad":
        if (!value.trim()) {
          errorMsg = "La ciudad es requerida";
        } else if (!regex.name.test(value)) {
          errorMsg = "Ciudad inválida (Mínimo 3 letras)";
        }
        break;

      case "usuario_correo":
        if (!value.trim()) {
          errorMsg = "El correo es requerido";
        } else if (!regex.email.test(value)) {
          errorMsg = "Correo inválido (ejemplo: usuario@dominio.com)";
        }
        break;

      case "usuario_telefono":
        if (!value.trim()) {
          errorMsg = "El teléfono es requerido";
        } else if (!regex.phone.test(value)) {
          errorMsg = "Teléfono inválido (10 dígitos, ejemplo: 3001234567)";
        }
        break;

      case "usuario_contrasena":
        if (!value.trim()) {
          errorMsg = "La contraseña es requerida";
        } else if (value.length < 8) {
          errorMsg = "La contraseña debe tener al menos 8 caracteres";
        } else if (!regex.password.test(value)) {
          errorMsg =
            "Debe incluir mayúscula, minúscula, número y símbolo (@$!%*?&)";
        }
        break;

      case "usuario_confirmar_contrasena":
        if (!value.trim()) {
          errorMsg = "Confirma tu contraseña";
        } else if (value !== formData.usuario_contrasena) {
          errorMsg = "Las contraseñas no coinciden";
        }
        break;

      case "identificacion_id":
        if (!value.trim()) {
          errorMsg = "Selecciona el tipo de identificación";
        }
        break;

      case "rol_id":
        if (!value.trim()) {
          errorMsg = "Selecciona el tipo de usuario";
        }
        break;

      default:
        break;
    }

    return errorMsg;
  };

  // Validar todos los campos
  const validateForm = () => {
    const newErrors = {};

    Object.keys(formData).forEach((field) => {
      const errorMsg = validateField(field, formData[field]);
      if (errorMsg) {
        newErrors[field] = errorMsg;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Manejar cambios en los campos
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({ ...prev, [name]: value }));

    // Solo validar si el campo ha sido tocado
    if (touched[name]) {
      const errorMsg = validateField(name, value);
      setErrors((prev) => ({ ...prev, [name]: errorMsg }));
    }
  };

  // Manejar cuando un campo pierde el foco
  const handleBlur = (e) => {
    const { name } = e.target;

    setTouched((prev) => ({ ...prev, [name]: true }));

    const errorMsg = validateField(name, formData[name]);
    setErrors((prev) => ({ ...prev, [name]: errorMsg }));
  };

  // Limpiar errores cuando se cambia un campo
  const handleFocus = (e) => {
    const { name } = e.target;
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  // Validar contraseña en tiempo real
  useEffect(() => {
    if (
      touched.usuario_confirmar_contrasena &&
      formData.usuario_confirmar_contrasena
    ) {
      const errorMsg = validateField(
        "usuario_confirmar_contrasena",
        formData.usuario_confirmar_contrasena
      );
      setErrors((prev) => ({
        ...prev,
        usuario_confirmar_contrasena: errorMsg,
      }));
    }
  }, [
    formData.usuario_contrasena,
    formData.usuario_confirmar_contrasena,
    touched.usuario_confirmar_contrasena,
  ]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Marcar todos los campos como tocados
    const allTouched = {};
    Object.keys(formData).forEach((field) => {
      allTouched[field] = true;
    });
    setTouched(allTouched);

    // Validar formulario
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      // Remover campos que no se envían al backend
      const { usuario_confirmar_contrasena, ...userDataToSend } = formData;

      // Convertir campos numéricos
      userDataToSend.usuario_edad = parseInt(userDataToSend.usuario_edad);
      userDataToSend.rol_id = parseInt(userDataToSend.rol_id);
      userDataToSend.identificacion_id = parseInt(
        userDataToSend.identificacion_id
      );

      const result = await authService.register(userDataToSend);
      console.log("✅ Registro exitoso:", result);
      setSuccess("Usuario registrado exitosamente");

      // Hacer login automático después del registro exitoso
      try {
        await login(formData.usuario_correo, formData.usuario_contrasena);
        // Redirigir según el rol
        if (result.medico_id) {
          navigate("/doctor/dashboard");
        } else {
          navigate("/patient/dashboard");
        }
      } catch (loginError) {
        console.error("Error en login automático:", loginError);
        setError(
          "Registro exitoso, pero error en login automático. Por favor, inicia sesión manualmente."
        );
      }

      // Limpiar formulario
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
        usuario_confirmar_contrasena: "",
        rol_id: "2",
        identificacion_id: "1",
      });

      // Limpiar estados de validación
      setErrors({});
      setTouched({});
    } catch (err) {
      setError(err.error || "Error al registrar usuario");
    } finally {
      setLoading(false);
    }
  };

  // Función para obtener la clase del borde del input
  const getInputBorderClass = (fieldName) => {
    if (!touched[fieldName]) {
      return "border-gray-300";
    }
    if (errors[fieldName]) {
      return "border-red-500 focus:border-red-500 focus:ring-red-500";
    }
    return "border-green-500 focus:border-green-500 focus:ring-green-500";
  };

  // Función para mostrar el icono de estado
  const getStatusIcon = (fieldName) => {
    if (!touched[fieldName]) return null;

    if (errors[fieldName]) {
      return (
        <ExclamationCircleIcon className="h-5 w-5 text-red-500 absolute right-3 top-1/2 transform -translate-y-1/2" />
      );
    }

    if (formData[fieldName] && !errors[fieldName]) {
      return (
        <CheckCircleIcon className="h-5 w-5 text-green-500 absolute right-3 top-1/2 transform -translate-y-1/2" />
      );
    }

    return null;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-600 to-blue-800 p-6">
      <div className="bg-white/90 rounded-3xl shadow-2xl overflow-hidden w-full max-w-4xl max-h-screen overflow-y-auto">
        {/* Header */}
        <div className="bg-blue-100 p-6 text-center">
          <h2 className="text-3xl font-bold text-gray-800">
            REGISTRO DE USUARIO
          </h2>
          <p className="text-gray-600 mt-2">
            Completa el formulario para crear tu cuenta
          </p>
        </div>

        {/* Formulario */}
        <div className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Información Personal */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <UserIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    name="usuario_nombre"
                    value={formData.usuario_nombre}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    onFocus={handleFocus}
                    className={`w-full pl-10 pr-10 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-offset-0 transition-all duration-200 ${getInputBorderClass(
                      "usuario_nombre"
                    )}`}
                    placeholder="Ingresa tu nombre"
                    required
                  />
                  {getStatusIcon("usuario_nombre")}

                  {errors.usuario_nombre && touched.usuario_nombre && (
                    <p className="text-red-500 text-sm mt-1 flex items-center">
                      <ExclamationCircleIcon className="h-4 w-4 mr-1" />
                      {errors.usuario_nombre}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Apellido *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <UserIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    name="usuario_apellido"
                    value={formData.usuario_apellido}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    onFocus={handleFocus}
                    className={`w-full pl-10 pr-10 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-offset-0 transition-all duration-200 ${getInputBorderClass(
                      "usuario_apellido"
                    )}`}
                    placeholder="Ingresa tu apellido"
                    required
                  />
                  {getStatusIcon("usuario_apellido")}

                  {errors.usuario_apellido && touched.usuario_apellido && (
                    <p className="text-red-500 text-sm mt-1 flex items-center">
                      <ExclamationCircleIcon className="h-4 w-4 mr-1" />
                      {errors.usuario_apellido}
                    </p>
                  )}
                </div>
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
                    min="1"
                    max="120"
                    className={`w-full px-4 pr-10 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-offset-0 transition-all duration-200 ${getInputBorderClass(
                      "usuario_edad"
                    )}`}
                    placeholder="Tu edad"
                    required
                  />
                  {getStatusIcon("usuario_edad")}

                  {errors.usuario_edad && touched.usuario_edad && (
                    <p className="text-red-500 text-sm mt-1 flex items-center">
                      <ExclamationCircleIcon className="h-4 w-4 mr-1" />
                      {errors.usuario_edad}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Género *
                </label>
                <div className="relative">
                  <select
                    name="usuario_genero"
                    value={formData.usuario_genero}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    onFocus={handleFocus}
                    className={`w-full px-4 pr-10 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-offset-0 transition-all duration-200 ${getInputBorderClass(
                      "usuario_genero"
                    )}`}
                    required
                  >
                    <option value="">Seleccionar género</option>
                    <option value="Masculino">Masculino</option>
                    <option value="Femenino">Femenino</option>
                    <option value="Otro">Otro</option>
                  </select>
                  {getStatusIcon("usuario_genero")}

                  {errors.usuario_genero && touched.usuario_genero && (
                    <p className="text-red-500 text-sm mt-1 flex items-center">
                      <ExclamationCircleIcon className="h-4 w-4 mr-1" />
                      {errors.usuario_genero}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Información de Identificación */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de Identificación *
                </label>
                <div className="relative">
                  <select
                    name="identificacion_id"
                    value={formData.identificacion_id}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    onFocus={handleFocus}
                    className={`w-full px-4 pr-10 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-offset-0 transition-all duration-200 ${getInputBorderClass(
                      "identificacion_id"
                    )}`}
                    required
                  >
                    <option value="1">Cédula de Ciudadanía (CC)</option>
                    <option value="2">Cédula de Extranjería (CE)</option>
                    <option value="3">Tarjeta de Identidad (TI)</option>
                  </select>
                  {getStatusIcon("identificacion_id")}

                  {errors.identificacion_id && touched.identificacion_id && (
                    <p className="text-red-500 text-sm mt-1 flex items-center">
                      <ExclamationCircleIcon className="h-4 w-4 mr-1" />
                      {errors.identificacion_id}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Número de Identificación *
                </label>
                <div className="relative">
                  <input
                    type="number"
                    name="usuario_identificacion"
                    value={formData.usuario_identificacion}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    onFocus={handleFocus}
                    className={`w-full px-4 pr-10 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-offset-0 transition-all duration-200 ${getInputBorderClass(
                      "usuario_identificacion"
                    )}`}
                    placeholder="12345678"
                    required
                  />
                  {getStatusIcon("usuario_identificacion")}

                  {errors.usuario_identificacion &&
                    touched.usuario_identificacion && (
                      <p className="text-red-500 text-sm mt-1 flex items-center">
                        <ExclamationCircleIcon className="h-4 w-4 mr-1" />
                        {errors.usuario_identificacion}
                      </p>
                    )}
                </div>
              </div>
            </div>

            {/* Información de Contacto */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Correo Electrónico *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <AtSymbolIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="email"
                    name="usuario_correo"
                    value={formData.usuario_correo}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    onFocus={handleFocus}
                    className={`w-full pl-10 pr-10 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-offset-0 transition-all duration-200 ${getInputBorderClass(
                      "usuario_correo"
                    )}`}
                    placeholder="usuario@dominio.com"
                    required
                  />
                  {getStatusIcon("usuario_correo")}

                  {errors.usuario_correo && touched.usuario_correo && (
                    <p className="text-red-500 text-sm mt-1 flex items-center">
                      <ExclamationCircleIcon className="h-4 w-4 mr-1" />
                      {errors.usuario_correo}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Teléfono *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <PhoneIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="tel"
                    name="usuario_telefono"
                    value={formData.usuario_telefono}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    onFocus={handleFocus}
                    className={`w-full pl-10 pr-10 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-offset-0 transition-all duration-200 ${getInputBorderClass(
                      "usuario_telefono"
                    )}`}
                    placeholder="3001234567"
                    required
                  />
                  {getStatusIcon("usuario_telefono")}

                  {errors.usuario_telefono && touched.usuario_telefono && (
                    <p className="text-red-500 text-sm mt-1 flex items-center">
                      <ExclamationCircleIcon className="h-4 w-4 mr-1" />
                      {errors.usuario_telefono}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Información de Ubicación */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                    className={`w-full px-4 pr-10 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-offset-0 transition-all duration-200 ${getInputBorderClass(
                      "usuario_direccion"
                    )}`}
                    placeholder="Calle 123 # 45-67"
                    required
                  />
                  {getStatusIcon("usuario_direccion")}

                  {errors.usuario_direccion && touched.usuario_direccion && (
                    <p className="text-red-500 text-sm mt-1 flex items-center">
                      <ExclamationCircleIcon className="h-4 w-4 mr-1" />
                      {errors.usuario_direccion}
                    </p>
                  )}
                </div>
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
                    className={`w-full px-4 pr-10 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-offset-0 transition-all duration-200 ${getInputBorderClass(
                      "usuario_ciudad"
                    )}`}
                    placeholder="Bogotá"
                    required
                  />
                  {getStatusIcon("usuario_ciudad")}

                  {errors.usuario_ciudad && touched.usuario_ciudad && (
                    <p className="text-red-500 text-sm mt-1 flex items-center">
                      <ExclamationCircleIcon className="h-4 w-4 mr-1" />
                      {errors.usuario_ciudad}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Información de Seguridad */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contraseña *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <LockClosedIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="password"
                    name="usuario_contrasena"
                    value={formData.usuario_contrasena}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    onFocus={handleFocus}
                    className={`w-full pl-10 pr-10 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-offset-0 transition-all duration-200 ${getInputBorderClass(
                      "usuario_contrasena"
                    )}`}
                    placeholder="Mínimo 8 caracteres"
                    required
                  />
                  {getStatusIcon("usuario_contrasena")}

                  {errors.usuario_contrasena && touched.usuario_contrasena && (
                    <p className="text-red-500 text-sm mt-1 flex items-center">
                      <ExclamationCircleIcon className="h-4 w-4 mr-1" />
                      {errors.usuario_contrasena}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirmar Contraseña *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <LockClosedIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="password"
                    name="usuario_confirmar_contrasena"
                    value={formData.usuario_confirmar_contrasena}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    onFocus={handleFocus}
                    className={`w-full pl-10 pr-10 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-offset-0 transition-all duration-200 ${getInputBorderClass(
                      "usuario_confirmar_contrasena"
                    )}`}
                    placeholder="Repite tu contraseña"
                    required
                  />
                  {getStatusIcon("usuario_confirmar_contrasena")}

                  {errors.usuario_confirmar_contrasena &&
                    touched.usuario_confirmar_contrasena && (
                      <p className="text-red-500 text-sm mt-1 flex items-center">
                        <ExclamationCircleIcon className="h-4 w-4 mr-1" />
                        {errors.usuario_confirmar_contrasena}
                      </p>
                    )}
                </div>
              </div>
            </div>


            {/* Mensajes de Error y Éxito */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                <div className="flex">
                  <ExclamationCircleIcon className="h-5 w-5 text-red-400 mr-2" />
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              </div>
            )}

            {success && (
              <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                <div className="flex">
                  <CheckCircleIcon className="h-5 w-5 text-green-400 mr-2" />
                  <p className="text-sm text-green-600">{success}</p>
                </div>
              </div>
            )}

            {/* Botón de Envío */}
            <button
              type="submit"
              disabled={
                loading || Object.keys(errors).some((key) => errors[key])
              }
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white py-3 rounded-xl font-semibold shadow-md transition duration-200"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <ArrowPathIcon className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" />
                  Registrando...
                </div>
              ) : (
                "Crear Cuenta"
              )}
            </button>

            {/* Enlace al Login */}
            <div className="text-center">
              <p className="text-gray-600">
                ¿Ya tienes una cuenta?{" "}
                <a
                  href="/login"
                  className="text-blue-600 hover:underline font-medium"
                >
                  Inicia sesión aquí
                </a>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RegisterForm;
