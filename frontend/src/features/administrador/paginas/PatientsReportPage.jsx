import { useState, useEffect } from "react";
import {
  UserGroupIcon,
  CalendarIcon,
  FunnelIcon,
  DocumentArrowDownIcon,
  UserIcon,
  PhoneIcon,
  EnvelopeIcon,
  MapPinIcon,
} from "@heroicons/react/24/outline";
import patientService from "../../../servicios/servicioPaciente";
import doctorService from "../../../servicios/servicioMedico";

const PatientsReportPage = () => {
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    medico_id: "",
    fecha_desde: "",
    fecha_hasta: "",
    ordenar_por: "nombre",
  });

  useEffect(() => {
    loadDoctors();
    loadPatients();
  }, []);

  useEffect(() => {
    loadPatients();
  }, [filters]);

  const loadDoctors = async () => {
    try {
      const data = await doctorService.getDoctors();
      setDoctors(Array.isArray(data) ? data : data?.data || []);
    } catch (err) {
      console.error("Error cargando médicos:", err);
    }
  };

  const loadPatients = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await patientService.getPatientsWithAttendances(filters);
      setPatients(Array.isArray(data) ? data : data?.data || []);
    } catch (err) {
      console.error("Error cargando pacientes:", err);
      setError(err.response?.data?.error || err.message || "Error al cargar los pacientes");
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const stats = {
    total: patients.length,
    total_atenciones: patients.reduce((sum, p) => sum + (parseInt(p.cantidad_atenciones) || 0), 0),
    promedio_atenciones: patients.length > 0 
      ? (patients.reduce((sum, p) => sum + (parseInt(p.cantidad_atenciones) || 0), 0) / patients.length).toFixed(1)
      : 0,
    pacientes_con_atenciones: patients.filter((p) => parseInt(p.cantidad_atenciones) > 0).length,
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Reporte de Pacientes Atendidos</h1>
          <p className="text-gray-600">Listado de pacientes y cantidad de atenciones</p>
        </div>
        <button
          onClick={() => {
            // Exportar a CSV
            const csvContent = [
              ["Nombre", "Apellido", "Identificación", "Correo", "Teléfono", "Cantidad de Atenciones", "Última Atención"],
              ...patients.map((p) => [
                p.usuario_nombre || "",
                p.usuario_apellido || "",
                p.usuario_identificacion || "",
                p.usuario_correo || "",
                p.usuario_telefono || "",
                p.cantidad_atenciones || 0,
                p.ultima_atencion || "N/A",
              ]),
            ]
              .map((row) => row.map((cell) => `"${cell}"`).join(","))
              .join("\n");

            const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
            const link = document.createElement("a");
            link.href = URL.createObjectURL(blob);
            link.download = `reporte_pacientes_${new Date().toISOString().split("T")[0]}.csv`;
            link.click();
          }}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors text-sm font-medium"
        >
          <DocumentArrowDownIcon className="w-5 h-5" />
          <span>Exportar CSV</span>
        </button>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Pacientes</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <UserGroupIcon className="w-10 h-10 text-blue-600" />
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Atenciones</p>
              <p className="text-2xl font-bold text-green-600">{stats.total_atenciones}</p>
            </div>
            <CalendarIcon className="w-10 h-10 text-green-600" />
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Promedio Atenciones</p>
              <p className="text-2xl font-bold text-purple-600">{stats.promedio_atenciones}</p>
            </div>
            <CalendarIcon className="w-10 h-10 text-purple-600" />
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Con Atenciones</p>
              <p className="text-2xl font-bold text-orange-600">{stats.pacientes_con_atenciones}</p>
            </div>
            <UserIcon className="w-10 h-10 text-orange-600" />
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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ordenar Por
            </label>
            <select
              name="ordenar_por"
              value={filters.ordenar_por}
              onChange={handleFilterChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="nombre">Nombre</option>
              <option value="atenciones">Cantidad de Atenciones</option>
            </select>
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* Tabla de Pacientes */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">Cargando pacientes...</span>
          </div>
        ) : patients.length === 0 ? (
          <div className="text-center py-12">
            <UserGroupIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 text-lg">No se encontraron pacientes</p>
            <p className="text-gray-500 text-sm mt-2">
              Ajusta los filtros para ver más resultados
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Paciente</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Identificación</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Contacto</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Ubicación</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Cantidad Atenciones</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Última Atención</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {patients.map((patient) => (
                  <tr key={patient.paciente_id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {patient.usuario_foto_perfil ? (
                          <img
                            src={patient.usuario_foto_perfil}
                            alt={patient.usuario_nombre}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                            <UserIcon className="w-6 h-6 text-blue-600" />
                          </div>
                        )}
                        <div>
                          <p className="font-medium text-gray-900">
                            {patient.usuario_nombre || "Sin nombre"} {patient.usuario_apellido || ""}
                          </p>
                          {patient.usuario_edad && (
                            <p className="text-xs text-gray-500">
                              {patient.usuario_edad} años • {patient.usuario_genero || "No especificado"}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {patient.usuario_identificacion || "N/A"}
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        {patient.usuario_correo && (
                          <div className="flex items-center gap-1 text-xs text-gray-600">
                            <EnvelopeIcon className="w-3 h-3" />
                            <span>{patient.usuario_correo}</span>
                          </div>
                        )}
                        {patient.usuario_telefono && (
                          <div className="flex items-center gap-1 text-xs text-gray-600">
                            <PhoneIcon className="w-3 h-3" />
                            <span>{patient.usuario_telefono}</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {patient.usuario_ciudad ? (
                        <div className="flex items-center gap-1">
                          <MapPinIcon className="w-4 h-4 text-gray-400" />
                          <span>{patient.usuario_ciudad}</span>
                        </div>
                      ) : (
                        <span className="text-gray-400">No especificado</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            parseInt(patient.cantidad_atenciones) > 0
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {patient.cantidad_atenciones || 0} atenciones
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {patient.ultima_atencion ? (
                        new Date(patient.ultima_atencion).toLocaleDateString("es-ES", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })
                      ) : (
                        <span className="text-gray-400">Sin atenciones</span>
                      )}
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

export default PatientsReportPage;

