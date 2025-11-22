import { useState, useEffect } from "react";
import {
  XMarkIcon,
  UserIcon,
  ClipboardDocumentCheckIcon,
  CheckIcon,
} from "@heroicons/react/24/outline";
import historialService from "../../../servicios/servicioHistorial";
import appointmentService from "../../../servicios/servicioCita";
import { useAuth } from "../../../contextos/AuthContext";

const MedicalHistoryForm = ({ isOpen, onClose, patient, appointment = null, onSuccess }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [formData, setFormData] = useState({
    historial_tipo: appointment?.cita_tipo || "Consulta",
    historial_diagnostico: "",
    historial_tratamiento: "",
    historial_observaciones: "",
    historial_medicamentos: "",
    historial_proxima_cita: "",
    historial_estado_paciente: "Estable",
  });

  useEffect(() => {
    if (isOpen && appointment) {
      // Pre-llenar con datos de la cita si existe
      setFormData((prev) => ({
        ...prev,
        historial_tipo: appointment.cita_tipo || "Consulta",
        historial_observaciones: appointment.cita_observaciones || "",
      }));
    }
  }, [isOpen, appointment]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!user?.medico_id) {
      setError("No se encontró tu información de médico");
      return;
    }

    if (!patient?.paciente_id) {
      setError("No se encontró información del paciente");
      return;
    }

    if (!formData.historial_diagnostico.trim()) {
      setError("El diagnóstico es obligatorio");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const result = await historialService.createHistoryRecord(
        user.medico_id,
        patient.paciente_id,
        {
          ...formData,
          historial_proxima_cita: formData.historial_proxima_cita || null,
        }
      );

      if (result.success) {
        setSuccess("Historial médico registrado exitosamente");
        
        // Si hay una cita asociada, marcarla como completada
        if (appointment?.cita_id) {
          try {
            await appointmentService.updateAppointmentStatus(appointment.cita_id, "Completada");
          } catch (err) {
            console.warn("No se pudo actualizar el estado de la cita:", err);
          }
        }

        setTimeout(() => {
          if (onSuccess) onSuccess();
          onClose();
        }, 1500);
      }
    } catch (err) {
      console.error("Error registrando historial:", err);
      setError(
        err.response?.data?.error ||
        err.message ||
        "Error al registrar el historial médico. Por favor, intenta nuevamente."
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
    <div className="fixed inset-0 bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto relative">
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
        <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white z-10">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <ClipboardDocumentCheckIcon className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Registrar Historial Médico</h2>
              {patient && (
                <p className="text-sm text-gray-500">
                  {patient.paciente_nombre} {patient.paciente_apellido}
                </p>
              )}
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
          {/* Información del Paciente */}
          {patient && (
            <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
              <div className="flex items-center gap-4">
                {patient.usuario_foto_perfil ? (
                  <img
                    src={patient.usuario_foto_perfil}
                    alt={patient.paciente_nombre}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-blue-200 flex items-center justify-center">
                    <UserIcon className="w-8 h-8 text-blue-600" />
                  </div>
                )}
                <div>
                  <h3 className="font-semibold text-gray-900">
                    {patient.paciente_nombre} {patient.paciente_apellido}
                  </h3>
                  {patient.usuario_edad && (
                    <p className="text-sm text-gray-600">
                      Edad: {patient.usuario_edad} años
                    </p>
                  )}
                  {patient.usuario_genero && (
                    <p className="text-sm text-gray-600">
                      Género: {patient.usuario_genero}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Tipo de Consulta */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipo de Consulta *
            </label>
            <select
              name="historial_tipo"
              value={formData.historial_tipo}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="Consulta">Consulta General</option>
              <option value="Seguimiento">Seguimiento</option>
              <option value="Control">Control</option>
              <option value="Emergencia">Emergencia</option>
              <option value="Otro">Otro</option>
            </select>
          </div>

          {/* Diagnóstico */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Diagnóstico *
            </label>
            <textarea
              name="historial_diagnostico"
              value={formData.historial_diagnostico}
              onChange={handleInputChange}
              rows={4}
              placeholder="Describe el diagnóstico del paciente..."
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>

          {/* Tratamiento */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tratamiento
            </label>
            <textarea
              name="historial_tratamiento"
              value={formData.historial_tratamiento}
              onChange={handleInputChange}
              rows={4}
              placeholder="Describe el tratamiento indicado..."
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>

          {/* Medicamentos */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Medicamentos Recetados
            </label>
            <textarea
              name="historial_medicamentos"
              value={formData.historial_medicamentos}
              onChange={handleInputChange}
              rows={3}
              placeholder="Lista los medicamentos recetados (dosis, frecuencia, duración)..."
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>

          {/* Observaciones */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Observaciones
            </label>
            <textarea
              name="historial_observaciones"
              value={formData.historial_observaciones}
              onChange={handleInputChange}
              rows={3}
              placeholder="Observaciones adicionales sobre la consulta..."
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>

          {/* Estado del Paciente */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Estado del Paciente *
            </label>
            <select
              name="historial_estado_paciente"
              value={formData.historial_estado_paciente}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="Estable">Estable</option>
              <option value="Mejorando">Mejorando</option>
              <option value="Empeorando">Empeorando</option>
              <option value="Crítico">Crítico</option>
            </select>
          </div>

          {/* Próxima Cita */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Próxima Cita (opcional)
            </label>
            <input
              type="date"
              name="historial_proxima_cita"
              value={formData.historial_proxima_cita}
              onChange={handleInputChange}
              min={new Date().toISOString().split("T")[0]}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
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
                  <span>Guardando...</span>
                </>
              ) : (
                <>
                  <CheckIcon className="w-5 h-5" />
                  <span>Guardar Historial</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MedicalHistoryForm;

