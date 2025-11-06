import { useState, useEffect } from "react";
import {
  CalendarIcon,
  ClockIcon,
  UserIcon,
  FunnelIcon,
  DocumentArrowDownIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationCircleIcon,
} from "@heroicons/react/24/outline";
import appointmentService from "../../../servicios/servicioCita";
import doctorService from "../../../servicios/servicioMedico";

const AppointmentsReportPage = () => {
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    estado: "all", // all, pasadas, proximas, canceladas
    medico_id: "",
    fecha_desde: "",
    fecha_hasta: "",
  });

  useEffect(() => {
    loadDoctors();
    loadAppointments();
  }, []);

  useEffect(() => {
    loadAppointments();
  }, [filters]);

  const loadDoctors = async () => {
    try {
      const data = await doctorService.getDoctors();
      setDoctors(Array.isArray(data) ? data : data?.data || []);
    } catch (err) {
      console.error("Error cargando médicos:", err);
    }
  };

  const loadAppointments = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await appointmentService.getAppointments();
      let filtered = Array.isArray(data) ? data : [];

      // Aplicar filtros
      if (filters.estado !== "all") {
        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0);

        filtered = filtered.filter((apt) => {
          const fecha = new Date(apt.cita_fecha);
          const estadoCalculado = apt.estado_calculado || apt.cita_estado;

          switch (filters.estado) {
            case "pasadas":
              return (
                estadoCalculado === "Completada" ||
                (fecha < hoy && estadoCalculado !== "Cancelada")
              );
            case "proximas":
              return (
                estadoCalculado !== "Cancelada" &&
                estadoCalculado !== "Completada" &&
                estadoCalculado !== "No asistió" &&
                fecha >= hoy
              );
            case "canceladas":
              return estadoCalculado === "Cancelada" || estadoCalculado === "No asistió";
            default:
              return true;
          }
        });
      }

      if (filters.medico_id) {
        filtered = filtered.filter((apt) => apt.medico_id === parseInt(filters.medico_id));
      }

      if (filters.fecha_desde) {
        filtered = filtered.filter(
          (apt) => new Date(apt.cita_fecha) >= new Date(filters.fecha_desde)
        );
      }

      if (filters.fecha_hasta) {
        filtered = filtered.filter(
          (apt) => new Date(apt.cita_fecha) <= new Date(filters.fecha_hasta)
        );
      }

      setAppointments(filtered);
    } catch (err) {
      console.error("Error cargando citas:", err);
      setError(err.response?.data?.error || err.message || "Error al cargar las citas");
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleExport = async (formato = "pdf") => {
    try {
      const params = {
        fecha_desde: filters.fecha_desde || null,
        fecha_hasta: filters.fecha_hasta || null,
        formato,
      };

      if (filters.medico_id) {
        params.medico_id = filters.medico_id;
      }

      await appointmentService.exportAppointmentsReport(
        params.medico_id,
        params.fecha_desde,
        params.fecha_hasta,
        formato
      );
    } catch (err) {
      console.error("Error exportando reporte:", err);
      alert("Error al exportar el reporte. Por favor, intenta nuevamente.");
    }
  };

  const getStatusBadge = (estado) => {
    const estadoCalculado = estado?.estado_calculado || estado?.cita_estado || estado;
    const badges = {
      Programada: "bg-blue-100 text-blue-800 border-blue-200",
      Confirmada: "bg-green-100 text-green-800 border-green-200",
      Completada: "bg-gray-100 text-gray-800 border-gray-200",
      Cancelada: "bg-red-100 text-red-800 border-red-200",
      "No asistió": "bg-yellow-100 text-yellow-800 border-yellow-200",
    };
    const badgeClass = badges[estadoCalculado] || "bg-gray-100 text-gray-800 border-gray-200";
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${badgeClass}`}>
        {estadoCalculado}
      </span>
    );
  };

  const getStatusIcon = (estado) => {
    const estadoCalculado = estado?.estado_calculado || estado?.cita_estado || estado;
    if (estadoCalculado === "Completada") {
      return <CheckCircleIcon className="w-5 h-5 text-green-600" />;
    } else if (estadoCalculado === "Cancelada" || estadoCalculado === "No asistió") {
      return <XCircleIcon className="w-5 h-5 text-red-600" />;
    } else {
      return <ExclamationCircleIcon className="w-5 h-5 text-blue-600" />;
    }
  };

  const stats = {
    total: appointments.length,
    pasadas: appointments.filter(
      (apt) =>
        apt.estado_calculado === "Completada" ||
        (new Date(apt.cita_fecha) < new Date() && apt.estado_calculado !== "Cancelada")
    ).length,
    proximas: appointments.filter(
      (apt) =>
        apt.estado_calculado !== "Cancelada" &&
        apt.estado_calculado !== "Completada" &&
        apt.estado_calculado !== "No asistió" &&
        new Date(apt.cita_fecha) >= new Date()
    ).length,
    canceladas: appointments.filter(
      (apt) => apt.estado_calculado === "Cancelada" || apt.estado_calculado === "No asistió"
    ).length,
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Reporte de Citas</h1>
          <p className="text-gray-600">Consulta y exporta información de citas médicas</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => handleExport("pdf")}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors text-sm font-medium"
          >
            <DocumentArrowDownIcon className="w-5 h-5" />
            <span>Exportar PDF</span>
          </button>
          <button
            onClick={() => handleExport("csv")}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors text-sm font-medium"
          >
            <DocumentArrowDownIcon className="w-5 h-5" />
            <span>Exportar CSV</span>
          </button>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Citas</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <CalendarIcon className="w-10 h-10 text-blue-600" />
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Próximas</p>
              <p className="text-2xl font-bold text-blue-600">{stats.proximas}</p>
            </div>
            <ClockIcon className="w-10 h-10 text-blue-600" />
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pasadas</p>
              <p className="text-2xl font-bold text-gray-600">{stats.pasadas}</p>
            </div>
            <CheckCircleIcon className="w-10 h-10 text-gray-600" />
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Canceladas</p>
              <p className="text-2xl font-bold text-red-600">{stats.canceladas}</p>
            </div>
            <XCircleIcon className="w-10 h-10 text-red-600" />
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <FunnelIcon className="w-5 h-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">Filtros</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Estado
            </label>
            <select
              name="estado"
              value={filters.estado}
              onChange={handleFilterChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Todas</option>
              <option value="proximas">Próximas</option>
              <option value="pasadas">Pasadas</option>
              <option value="canceladas">Canceladas</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Médico
            </label>
            <select
              name="medico_id"
              value={filters.medico_id}
              onChange={handleFilterChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todos los médicos</option>
              {doctors.map((doctor) => (
                <option key={doctor.medico_id} value={doctor.medico_id}>
                  Dr. {doctor.usuario_nombre} {doctor.usuario_apellido}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fecha Desde
            </label>
            <input
              type="date"
              name="fecha_desde"
              value={filters.fecha_desde}
              onChange={handleFilterChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fecha Hasta
            </label>
            <input
              type="date"
              name="fecha_hasta"
              value={filters.fecha_hasta}
              onChange={handleFilterChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* Tabla de Citas */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">Cargando citas...</span>
          </div>
        ) : appointments.length === 0 ? (
          <div className="text-center py-12">
            <CalendarIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 text-lg">No se encontraron citas</p>
            <p className="text-gray-500 text-sm mt-2">
              Ajusta los filtros para ver más resultados
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">ID</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Fecha</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Hora</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Paciente</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Médico</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Especialidad</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Tipo</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {appointments.map((appointment) => (
                  <tr key={appointment.cita_id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm text-gray-900">{appointment.cita_id}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {new Date(appointment.cita_fecha).toLocaleDateString("es-ES", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {appointment.cita_hora?.substring(0, 5) || appointment.cita_hora}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <UserIcon className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-900">
                          {appointment.paciente_nombre || "Paciente"}{" "}
                          {appointment.paciente_apellido || ""}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      Dr. {appointment.medico_nombre || "Médico"}{" "}
                      {appointment.medico_apellido || ""}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {appointment.especialidad_nombre || "Sin especialidad"}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {appointment.cita_tipo || "Consulta general"}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(appointment)}
                        {getStatusBadge(appointment)}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AppointmentsReportPage;

