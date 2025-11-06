import { useState, useEffect } from "react";
import {
  CalendarIcon,
  ClipboardDocumentListIcon,
  UserIcon,
  MapPinIcon,
  DocumentArrowDownIcon,
} from "@heroicons/react/24/outline";
import historialService from "../../../servicios/servicioHistorial";
import { useAuth } from "../../../contextos/AuthContext";

const MyMedicalHistoryPage = () => {
  const { user } = useAuth();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("all"); // all, recent, by-doctor

  useEffect(() => {
    if (user?.paciente_id) {
      loadHistory();
    }
  }, [user?.paciente_id]);

  const loadHistory = async () => {
    if (!user?.paciente_id) {
      setError("No se encontró tu información de paciente");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const data = await historialService.getMyHistory(user.paciente_id);
      setHistory(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error cargando historial:", err);
      setError(err.response?.data?.error || err.message || "Error al cargar tu historial médico");
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      await historialService.exportMedicalHistory(user.paciente_id);
    } catch (err) {
      console.error("Error exportando historial:", err);
      alert("Error al exportar el historial. Por favor, intenta nuevamente.");
    }
  };

  const getEstadoBadge = (estado) => {
    const badges = {
      Estable: "bg-green-100 text-green-800 border-green-200",
      Mejorando: "bg-blue-100 text-blue-800 border-blue-200",
      Empeorando: "bg-yellow-100 text-yellow-800 border-yellow-200",
      Crítico: "bg-red-100 text-red-800 border-red-200",
    };
    const badgeClass = badges[estado] || "bg-gray-100 text-gray-800 border-gray-200";
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${badgeClass}`}>
        {estado}
      </span>
    );
  };

  const filteredHistory = history.filter((record) => {
    const fecha = new Date(record.historial_fecha);
    const hoy = new Date();
    const hace30Dias = new Date();
    hace30Dias.setDate(hoy.getDate() - 30);

    switch (filter) {
      case "recent":
        return fecha >= hace30Dias;
      default:
        return true;
    }
  });

  // Agrupar por médico
  const historyByDoctor = filteredHistory.reduce((acc, record) => {
    const doctorKey = `${record.medico_nombre} ${record.medico_apellido}`;
    if (!acc[doctorKey]) {
      acc[doctorKey] = {
        doctor: {
          nombre: record.medico_nombre,
          apellido: record.medico_apellido,
          especialidad: record.especialidad_nombre,
          consultorio: record.medico_consultorio,
        },
        records: [],
      };
    }
    acc[doctorKey].records.push(record);
    return acc;
  }, {});

  if (!user?.paciente_id) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 text-center">
          <p className="text-yellow-800">
            No se encontró tu información de paciente. Por favor, inicia sesión nuevamente.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Mi Historial Médico</h1>
          <p className="text-gray-600">Consulta tus registros médicos</p>
        </div>
        {history.length > 0 && (
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg"
          >
            <DocumentArrowDownIcon className="w-5 h-5" />
            <span>Exportar PDF</span>
          </button>
        )}
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setFilter("all")}
            className={`px-4 py-2 rounded-xl font-medium transition-colors ${
              filter === "all"
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Todos
          </button>
          <button
            onClick={() => setFilter("recent")}
            className={`px-4 py-2 rounded-xl font-medium transition-colors ${
              filter === "recent"
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Últimos 30 días
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* Lista de Historial */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">Cargando historial...</span>
          </div>
        ) : filteredHistory.length === 0 ? (
          <div className="text-center py-12">
            <ClipboardDocumentListIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 text-lg">
              No tienes registros de historial médico {filter !== "all" && "en este período"}
            </p>
            <p className="text-gray-500 text-sm mt-2">
              {filter === "all" &&
                "Tu historial médico se creará cuando un médico registre información de tus consultas"}
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(historyByDoctor).map(([doctorKey, doctorData]) => (
              <div key={doctorKey} className="border border-gray-200 rounded-xl p-6">
                {/* Información del Médico */}
                <div className="mb-6 pb-4 border-b border-gray-200">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center">
                      <UserIcon className="w-8 h-8 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        Dr. {doctorData.doctor.nombre} {doctorData.doctor.apellido}
                      </h3>
                      {doctorData.doctor.especialidad && (
                        <p className="text-sm text-blue-600 font-medium">
                          {doctorData.doctor.especialidad}
                        </p>
                      )}
                      {doctorData.doctor.consultorio && (
                        <div className="flex items-center gap-1 mt-1 text-xs text-gray-600">
                          <MapPinIcon className="w-4 h-4" />
                          <span>{doctorData.doctor.consultorio}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Registros del Médico */}
                <div className="space-y-4">
                  {doctorData.records.map((record) => (
                    <div
                      key={record.historial_id}
                      className="bg-gray-50 rounded-xl p-5 border border-gray-100"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <CalendarIcon className="w-5 h-5 text-gray-400" />
                          <div>
                            <p className="font-semibold text-gray-900">
                              {new Date(record.historial_fecha).toLocaleDateString("es-ES", {
                                weekday: "long",
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              })}
                            </p>
                            <p className="text-sm text-gray-500">{record.historial_tipo}</p>
                          </div>
                        </div>
                        {getEstadoBadge(record.historial_estado_paciente)}
                      </div>

                      {record.historial_diagnostico && (
                        <div className="mb-3">
                          <p className="text-sm font-medium text-gray-700 mb-1">Diagnóstico:</p>
                          <p className="text-sm text-gray-600 bg-white p-3 rounded-lg border border-gray-200">
                            {record.historial_diagnostico}
                          </p>
                        </div>
                      )}

                      {record.historial_tratamiento && (
                        <div className="mb-3">
                          <p className="text-sm font-medium text-gray-700 mb-1">Tratamiento:</p>
                          <p className="text-sm text-gray-600 bg-white p-3 rounded-lg border border-gray-200">
                            {record.historial_tratamiento}
                          </p>
                        </div>
                      )}

                      {record.historial_medicamentos && (
                        <div className="mb-3">
                          <p className="text-sm font-medium text-gray-700 mb-1">Medicamentos:</p>
                          <p className="text-sm text-gray-600 bg-white p-3 rounded-lg border border-gray-200">
                            {record.historial_medicamentos}
                          </p>
                        </div>
                      )}

                      {record.historial_observaciones && (
                        <div className="mb-3">
                          <p className="text-sm font-medium text-gray-700 mb-1">Observaciones:</p>
                          <p className="text-sm text-gray-600 bg-white p-3 rounded-lg border border-gray-200">
                            {record.historial_observaciones}
                          </p>
                        </div>
                      )}

                      {record.historial_proxima_cita && (
                        <div className="mt-3 pt-3 border-t border-gray-200">
                          <p className="text-sm text-gray-600">
                            <span className="font-medium">Próxima cita:</span>{" "}
                            {new Date(record.historial_proxima_cita).toLocaleDateString("es-ES", {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyMedicalHistoryPage;

