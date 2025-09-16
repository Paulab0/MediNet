import { useState, useEffect } from "react";
import {
  UserIcon,
  CalendarIcon,
  ClockIcon,
  MapPinIcon,
  DocumentTextIcon,
  XMarkIcon,
  CheckCircleIcon,
  PlusIcon,
} from "@heroicons/react/24/outline";
import patientService from "../../../services/patientService";
import { useAuth } from "../../../contexts/AuthContext";

const AppointmentForm = ({ isOpen, onClose, onSubmit, onAddPatient }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    paciente_id: "",
    cita_fecha: "",
    cita_hora: "",
    cita_tipo: "",
    cita_observaciones: "",
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [loading, setLoading] = useState(false);
  const [patients, setPatients] = useState([]);
  const [loadingPatients, setLoadingPatients] = useState(false);

  // Cargar pacientes cuando se abre el modal
  useEffect(() => {
    if (isOpen) {
      loadPatients();
    }
  }, [isOpen]);

  const loadPatients = async () => {
    try {
      setLoadingPatients(true);
      // Obtener solo los pacientes del médico actual
      const patientsData = await patientService.getPatientsByDoctor(
        user.medico_id
      );
      setPatients(patientsData);
    } catch (error) {
      console.error("Error cargando pacientes:", error);
      setPatients([]);
    } finally {
      setLoadingPatients(false);
    }
  };

  const appointmentTypes = [
    "Consulta General",
    "Seguimiento",
    "Urgencia",
    "Examen",
    "Cirugía",
    "Terapia",
  ];

  const timeSlots = [
    "08:00",
    "08:30",
    "09:00",
    "09:30",
    "10:00",
    "10:30",
    "11:00",
    "11:30",
    "12:00",
    "12:30",
    "14:00",
    "14:30",
    "15:00",
    "15:30",
    "16:00",
    "16:30",
    "17:00",
    "17:30",
  ];

  const validateField = (field, value) => {
    let errorMsg = "";

    switch (field) {
      case "paciente_id":
        if (!value) {
          errorMsg = "Debe seleccionar un paciente";
        }
        break;

      case "cita_fecha":
        if (!value.trim()) {
          errorMsg = "La fecha de la cita es requerida";
        } else {
          const selectedDate = new Date(value);
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          if (selectedDate < today) {
            errorMsg = "La fecha no puede ser anterior a hoy";
          }
        }
        break;

      case "cita_hora":
        if (!value.trim()) {
          errorMsg = "La hora de la cita es requerida";
        }
        break;

      case "cita_tipo":
        if (!value.trim()) {
          errorMsg = "Selecciona el tipo de cita";
        }
        break;

      default:
        break;
    }

    return errorMsg;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (touched[name]) {
      const errorMsg = validateField(name, value);
      setErrors((prev) => ({ ...prev, [name]: errorMsg }));
    }
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));

    const errorMsg = validateField(name, formData[name]);
    setErrors((prev) => ({ ...prev, [name]: errorMsg }));
  };

  const handleFocus = (e) => {
    const { name } = e.target;
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

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

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      // Aquí iría la lógica para enviar la cita al backend
      await onSubmit(formData);

      // Limpiar formulario
      setFormData({
        paciente_id: "",
        cita_fecha: "",
        cita_hora: "",
        cita_tipo: "",
        cita_observaciones: "",
      });

      setErrors({});
      setTouched({});

      onClose();
    } catch (error) {
      console.error("Error al crear la cita:", error);
    } finally {
      setLoading(false);
    }
  };

  const getInputBorderClass = (fieldName) => {
    if (!touched[fieldName]) {
      return "border-gray-300";
    }
    if (errors[fieldName]) {
      return "border-red-500 focus:border-red-500 focus:ring-red-500";
    }
    return "border-green-500 focus:border-green-500 focus:ring-green-500";
  };

  const getStatusIcon = (fieldName) => {
    if (!touched[fieldName]) return null;

    if (errors[fieldName]) {
      return (
        <XMarkIcon className="h-5 w-5 text-red-500 absolute right-3 top-1/2 transform -translate-y-1/2" />
      );
    }

    if (formData[fieldName] && !errors[fieldName]) {
      return (
        <CheckCircleIcon className="h-5 w-5 text-green-500 absolute right-3 top-1/2 transform -translate-y-1/2" />
      );
    }

    return null;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-blue-100 p-6 rounded-t-3xl">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">
              Agendar Nueva Cita
            </h2>
            <button
              onClick={onClose}
              className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-gray-600 hover:text-gray-800 transition-colors"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Formulario */}
        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Información del Paciente */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Seleccionar Paciente *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <UserIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <select
                    name="paciente_id"
                    value={formData.paciente_id}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    onFocus={handleFocus}
                    className={`w-full pl-10 pr-10 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-offset-0 transition-all duration-200 ${getInputBorderClass(
                      "paciente_id"
                    )}`}
                    required
                  >
                    <option value="">Seleccionar paciente...</option>
                    {loadingPatients ? (
                      <option disabled>Cargando pacientes...</option>
                    ) : patients.length > 0 ? (
                      patients.map((patient) => (
                        <option
                          key={patient.paciente_id}
                          value={patient.paciente_id}
                        >
                          {patient.usuario_nombre} {patient.usuario_apellido} -{" "}
                          {patient.usuario_identificacion}
                        </option>
                      ))
                    ) : (
                      <option disabled>No hay pacientes registrados</option>
                    )}
                  </select>
                  {getStatusIcon("paciente_id")}

                  {errors.paciente_id && touched.paciente_id && (
                    <p className="text-red-500 text-sm mt-1 flex items-center">
                      <XMarkIcon className="h-4 w-4 mr-1" />
                      {errors.paciente_id}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-end">
                <button
                  type="button"
                  onClick={onAddPatient}
                  className="w-full flex items-center justify-center px-4 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors"
                >
                  <PlusIcon className="h-5 w-5 mr-2" />
                  Agregar Nuevo Paciente
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de Cita *
                </label>
                <div className="relative">
                  <select
                    name="cita_tipo"
                    value={formData.cita_tipo}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    onFocus={handleFocus}
                    className={`w-full px-4 pr-10 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-offset-0 transition-all duration-200 ${getInputBorderClass(
                      "cita_tipo"
                    )}`}
                    required
                  >
                    <option value="">Seleccionar tipo</option>
                    {appointmentTypes.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                  {getStatusIcon("cita_tipo")}

                  {errors.cita_tipo && touched.cita_tipo && (
                    <p className="text-red-500 text-sm mt-1 flex items-center">
                      <XMarkIcon className="h-4 w-4 mr-1" />
                      {errors.cita_tipo}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Fecha y Hora */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fecha de la Cita *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <CalendarIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="date"
                    name="cita_fecha"
                    value={formData.cita_fecha}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    onFocus={handleFocus}
                    className={`w-full pl-10 pr-10 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-offset-0 transition-all duration-200 ${getInputBorderClass(
                      "cita_fecha"
                    )}`}
                    required
                  />
                  {getStatusIcon("cita_fecha")}

                  {errors.cita_fecha && touched.cita_fecha && (
                    <p className="text-red-500 text-sm mt-1 flex items-center">
                      <XMarkIcon className="h-4 w-4 mr-1" />
                      {errors.cita_fecha}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hora de la Cita *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <ClockIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <select
                    name="cita_hora"
                    value={formData.cita_hora}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    onFocus={handleFocus}
                    className={`w-full pl-10 pr-10 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-offset-0 transition-all duration-200 ${getInputBorderClass(
                      "cita_hora"
                    )}`}
                    required
                  >
                    <option value="">Seleccionar hora</option>
                    {timeSlots.map((time) => (
                      <option key={time} value={time}>
                        {time}
                      </option>
                    ))}
                  </select>
                  {getStatusIcon("cita_hora")}

                  {errors.cita_hora && touched.cita_hora && (
                    <p className="text-red-500 text-sm mt-1 flex items-center">
                      <XMarkIcon className="h-4 w-4 mr-1" />
                      {errors.cita_hora}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Observaciones */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Observaciones de la Cita
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <DocumentTextIcon className="h-5 w-5 text-gray-400" />
                </div>
                <textarea
                  name="cita_observaciones"
                  value={formData.cita_observaciones}
                  onChange={handleChange}
                  rows="3"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="Observaciones, síntomas, etc."
                />
              </div>
            </div>

            {/* Botones */}
            <div className="flex items-center justify-end space-x-4 pt-4">
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
                {loading ? "Agendando..." : "Agendar Cita"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AppointmentForm;
