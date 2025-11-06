import { useState, useEffect } from "react";
import {
  ClockIcon,
  CalendarDaysIcon,
  GlobeAltIcon,
  BellIcon,
  CheckCircleIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";
import configuracionService from "../../../servicios/servicioConfiguracion";

const SettingsPage = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    horario_inicio: "08:00",
    horario_fin: "17:00",
    dias_laborales: ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes"],
    zona_horaria: "America/Bogota",
    recordatorio_24h_antes: true,
    recordatorio_1h_antes: true,
  });

  const diasSemana = [
    "Lunes",
    "Martes",
    "Miércoles",
    "Jueves",
    "Viernes",
    "Sábado",
    "Domingo",
  ];

  const zonasHorarias = [
    { value: "America/Bogota", label: "Bogotá (UTC-5)" },
    { value: "America/Mexico_City", label: "Ciudad de México (UTC-6)" },
    { value: "America/Argentina/Buenos_Aires", label: "Buenos Aires (UTC-3)" },
    { value: "America/Santiago", label: "Santiago (UTC-3)" },
    { value: "America/Lima", label: "Lima (UTC-5)" },
    { value: "America/Caracas", label: "Caracas (UTC-4)" },
  ];

  useEffect(() => {
    loadHorarios();
  }, []);

  const loadHorarios = async () => {
    setLoading(true);
    try {
      const data = await configuracionService.getHorarios();
      setFormData({
        horario_inicio: data.horario_inicio || "08:00",
        horario_fin: data.horario_fin || "17:00",
        dias_laborales: data.dias_laborales || ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes"],
        zona_horaria: data.zona_horaria || "America/Bogota",
        recordatorio_24h_antes: data.recordatorio_24h_antes !== undefined ? data.recordatorio_24h_antes : true,
        recordatorio_1h_antes: data.recordatorio_1h_antes !== undefined ? data.recordatorio_1h_antes : true,
      });
    } catch (err) {
      console.error("Error cargando horarios:", err);
      setError("Error al cargar la configuración de horarios");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    setError(null);
    setSuccess(false);
  };

  const toggleDiaLaboral = (dia) => {
    setFormData((prev) => {
      const dias = prev.dias_laborales.includes(dia)
        ? prev.dias_laborales.filter((d) => d !== dia)
        : [...prev.dias_laborales, dia];
      return { ...prev, dias_laborales: dias };
    });
    setError(null);
    setSuccess(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      await configuracionService.setHorarios(formData);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err.response?.data?.error || "Error al guardar la configuración");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 rounded-t-2xl">
          <h1 className="text-2xl font-bold text-white mb-2">
            Configuración de Horarios
          </h1>
          <p className="text-blue-100">
            Gestiona los horarios de atención, días laborales y recordatorios del sistema
          </p>
        </div>

        <div className="p-6">
          {success && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-2">
              <CheckCircleIcon className="w-5 h-5 text-green-600" />
              <span className="text-green-700 font-medium">
                Configuración guardada exitosamente
              </span>
            </div>
          )}

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2">
              <XCircleIcon className="w-5 h-5 text-red-600" />
              <span className="text-red-700">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Horarios de Atención */}
            <div className="border-b border-gray-200 pb-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <ClockIcon className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    Horarios de Atención
                  </h2>
                  <p className="text-sm text-gray-600">
                    Define el horario de atención del sistema
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Hora de Inicio
                  </label>
                  <input
                    type="time"
                    name="horario_inicio"
                    value={formData.horario_inicio}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Hora de Fin
                  </label>
                  <input
                    type="time"
                    name="horario_fin"
                    value={formData.horario_fin}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Días Laborales */}
            <div className="border-b border-gray-200 pb-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <CalendarDaysIcon className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    Días Laborales
                  </h2>
                  <p className="text-sm text-gray-600">
                    Selecciona los días de la semana en que se atiende
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
                {diasSemana.map((dia) => (
                  <button
                    key={dia}
                    type="button"
                    onClick={() => toggleDiaLaboral(dia)}
                    className={`px-4 py-3 rounded-xl border-2 transition-all ${
                      formData.dias_laborales.includes(dia)
                        ? "bg-blue-600 border-blue-600 text-white shadow-md"
                        : "bg-white border-gray-300 text-gray-700 hover:border-blue-400"
                    }`}
                  >
                    {dia}
                  </button>
                ))}
              </div>
            </div>

            {/* Zona Horaria */}
            <div className="border-b border-gray-200 pb-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <GlobeAltIcon className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    Zona Horaria
                  </h2>
                  <p className="text-sm text-gray-600">
                    Configura la zona horaria del sistema
                  </p>
                </div>
              </div>

              <div className="mt-4">
                <select
                  name="zona_horaria"
                  value={formData.zona_horaria}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {zonasHorarias.map((zona) => (
                    <option key={zona.value} value={zona.value}>
                      {zona.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Recordatorios */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                  <BellIcon className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    Recordatorios Automáticos
                  </h2>
                  <p className="text-sm text-gray-600">
                    Configura los recordatorios de citas
                  </p>
                </div>
              </div>

              <div className="space-y-4 mt-4">
                <label className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 cursor-pointer transition-colors">
                  <div>
                    <span className="font-medium text-gray-900">
                      Recordatorio 24 horas antes
                    </span>
                    <p className="text-sm text-gray-600">
                      Enviar recordatorio 24 horas antes de la cita
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    name="recordatorio_24h_antes"
                    checked={formData.recordatorio_24h_antes}
                    onChange={handleChange}
                    className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                </label>

                <label className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 cursor-pointer transition-colors">
                  <div>
                    <span className="font-medium text-gray-900">
                      Recordatorio 1 hora antes
                    </span>
                    <p className="text-sm text-gray-600">
                      Enviar recordatorio 1 hora antes de la cita
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    name="recordatorio_1h_antes"
                    checked={formData.recordatorio_1h_antes}
                    onChange={handleChange}
                    className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                </label>
              </div>
            </div>

            {/* Botones */}
            <div className="flex items-center justify-end gap-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={loadHorarios}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center gap-2"
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Guardando...
                  </>
                ) : (
                  "Guardar Configuración"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;


