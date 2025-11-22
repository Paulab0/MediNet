import { useState, useEffect } from "react";
import {
  XMarkIcon,
  CalendarIcon,
  ClockIcon,
  UserIcon,
  CheckIcon,
} from "@heroicons/react/24/outline";
import disponibilidadService from "../../../servicios/servicioDisponibilidad";
import appointmentService from "../../../servicios/servicioCita";

const EditAppointmentModal = ({ isOpen, onClose, appointment, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [formData, setFormData] = useState({
    cita_tipo: "Consulta",
    cita_observaciones: "",
  });

  useEffect(() => {
    if (isOpen && appointment) {
      // Inicializar formulario con datos de la cita
      setSelectedDate(appointment.cita_fecha || "");
      setSelectedTime(appointment.cita_hora?.substring(0, 5) || appointment.cita_hora || "");
      setFormData({
        cita_tipo: appointment.cita_tipo || "Consulta",
        cita_observaciones: appointment.cita_observaciones || "",
      });
      setError(null);
      setSuccess(null);
      setAvailableSlots([]);
    }
  }, [isOpen, appointment]);

  useEffect(() => {
    if (selectedDate && appointment?.medico_id) {
      loadAvailableSlots(selectedDate);
    } else {
      setAvailableSlots([]);
      setSelectedTime(appointment?.cita_hora?.substring(0, 5) || appointment?.cita_hora || "");
    }
  }, [selectedDate, appointment?.medico_id]);

  const loadAvailableSlots = async (fecha) => {
    try {
      setLoadingSlots(true);
      setError(null);
      const slots = await disponibilidadService.getAvailableByMedico(
        appointment.medico_id,
        fecha
      );
      setAvailableSlots(Array.isArray(slots) ? slots : []);
      
      // Si la hora actual de la cita está disponible, mantenerla seleccionada
      const currentTime = appointment.cita_hora?.substring(0, 5) || appointment.cita_hora;
      if (currentTime && fecha === appointment.cita_fecha) {
        const isCurrentTimeAvailable = slots.some(
          (slot) => (slot.disponibilidad_hora?.substring(0, 5) || slot.disponibilidad_hora) === currentTime
        );
        if (isCurrentTimeAvailable) {
          setSelectedTime(currentTime);
        }
      }
    } catch (err) {
      console.error("Error cargando horarios disponibles:", err);
      setError("Error al cargar horarios disponibles");
      setAvailableSlots([]);
    } finally {
      setLoadingSlots(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedDate || !selectedTime) {
      setError("Por favor selecciona fecha y hora");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Formatear hora para que tenga el formato correcto (HH:MM:SS)
      const horaFormateada = selectedTime.length === 5 ? `${selectedTime}:00` : selectedTime;

      const appointmentData = {
        cita_fecha: selectedDate,
        cita_hora: horaFormateada,
        cita_tipo: formData.cita_tipo,
        cita_observaciones: formData.cita_observaciones || null,
      };

      const result = await appointmentService.updateAppointment(
        appointment.cita_id,
        appointmentData
      );

      if (result.success) {
        setSuccess("¡Cita actualizada exitosamente!");
        setTimeout(() => {
          if (onSuccess) onSuccess();
          onClose();
        }, 1500);
      }
    } catch (err) {
      console.error("Error actualizando cita:", err);
      setError(
        err.response?.data?.error ||
        err.message ||
        "Error al actualizar la cita. Por favor, intenta nuevamente."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  if (!isOpen || !appointment) return null;

  // Obtener fecha mínima (hoy)
  const minDate = new Date().toISOString().split("T")[0];

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto relative">
        {/* Logo MediNet en la parte superior */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-4 rounded-t-2xl">
          <div className="flex items-center justify-center">
            <div className="text-center">
              <h1 className="text-4xl font-black text-white drop-shadow-lg">
                MediNet
              </h1>
              <p className="text-xs text-blue-100 font-medium tracking-widest mt-1">
                SISTEMA MÉDICO
              </p>
            </div>
          </div>
        </div>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <CalendarIcon className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Editar Cita</h2>
              <p className="text-sm text-gray-500">
                Dr. {appointment.medico_nombre} {appointment.medico_apellido}
              </p>
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
          {/* Información del Médico */}
          <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
            <div className="flex items-center gap-4">
              {appointment.medico_foto_perfil ? (
                <img
                  src={appointment.medico_foto_perfil}
                  alt={appointment.medico_nombre}
                  className="w-16 h-16 rounded-full object-cover"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-blue-200 flex items-center justify-center">
                  <UserIcon className="w-8 h-8 text-blue-600" />
                </div>
              )}
              <div>
                <h3 className="font-semibold text-gray-900">
                  Dr. {appointment.medico_nombre} {appointment.medico_apellido}
                </h3>
                <p className="text-sm text-blue-600 font-medium">
                  {appointment.especialidad_nombre || "Sin especialidad"}
                </p>
                {appointment.medico_consultorio && (
                  <p className="text-xs text-gray-600 mt-1">
                    {appointment.medico_consultorio}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Selección de Fecha */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fecha de la cita *
            </label>
            <div className="relative">
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                min={minDate}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 pl-10"
              />
              <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            </div>
            {selectedDate && (
              <p className="text-xs text-gray-500 mt-1">
                {new Date(selectedDate).toLocaleDateString("es-ES", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            )}
          </div>

          {/* Selección de Hora */}
          {selectedDate && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Hora disponible *
              </label>
              {loadingSlots ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <span className="ml-3 text-gray-600">Cargando horarios...</span>
                </div>
              ) : availableSlots.length === 0 ? (
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
                  <p className="text-yellow-700 text-sm">
                    No hay horarios disponibles para esta fecha. Por favor, selecciona otra fecha.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-4 gap-2 max-h-48 overflow-y-auto p-2 border border-gray-300 rounded-xl">
                  {availableSlots.map((slot) => {
                    const hora = slot.disponibilidad_hora?.substring(0, 5) || slot.disponibilidad_hora;
                    const isSelected = selectedTime === hora;
                    return (
                      <button
                        key={slot.disponibilidad_id}
                        type="button"
                        onClick={() => setSelectedTime(hora)}
                        className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                          isSelected
                            ? "bg-blue-600 text-white border-2 border-blue-700"
                            : "bg-white text-gray-700 border border-gray-300 hover:bg-blue-50 hover:border-blue-300"
                        }`}
                      >
                        {hora}
                      </button>
                    );
                  })}
                </div>
              )}
              {selectedTime && (
                <p className="text-xs text-gray-500 mt-2">
                  Hora seleccionada: <span className="font-medium">{selectedTime}</span>
                </p>
              )}
            </div>
          )}

          {/* Tipo de Cita */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipo de cita *
            </label>
            <select
              name="cita_tipo"
              value={formData.cita_tipo}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="Consulta">Consulta General</option>
              <option value="Control">Control</option>
              <option value="Seguimiento">Seguimiento</option>
              <option value="Urgencia">Urgencia</option>
              <option value="Otro">Otro</option>
            </select>
          </div>

          {/* Observaciones */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Observaciones (opcional)
            </label>
            <textarea
              name="cita_observaciones"
              value={formData.cita_observaciones}
              onChange={handleInputChange}
              rows={3}
              placeholder="Describe brevemente el motivo de tu consulta..."
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>

          {/* Botones */}
          <div className="flex items-center justify-end space-x-4 pt-4 border-t border-gray-200">
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
              disabled={loading || !selectedDate || !selectedTime}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Actualizando...</span>
                </>
              ) : (
                <>
                  <CheckIcon className="w-5 h-5" />
                  <span>Guardar Cambios</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditAppointmentModal;

