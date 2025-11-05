import { useState, useEffect } from "react";
import {
  UserGroupIcon,
  CalendarIcon,
  ClockIcon,
  PhoneIcon,
  EnvelopeIcon,
  DocumentTextIcon,
  PlusIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import historialService from "../../../servicios/servicioHistorial";
import { useAuth } from "../../../contextos/AuthContext";

const PatientsView = () => {
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [patientHistory, setPatientHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showAddRecordModal, setShowAddRecordModal] = useState(false);
  const [newRecord, setNewRecord] = useState({
    historial_tipo: "Consulta",
    historial_diagnostico: "",
    historial_tratamiento: "",
    historial_observaciones: "",
    historial_medicamentos: "",
    historial_proxima_cita: "",
    historial_estado_paciente: "Estable",
  });
  const { user } = useAuth();

  useEffect(() => {
    if (user?.medico_id) {
      loadPatients();
    }
  }, [user]);

  const loadPatients = async () => {
    try {
      setLoading(true);
      console.log(
        "🔍 [PatientsView] Cargando pacientes del médico:",
        user.medico_id
      );

      const patientsData = await historialService.getPatientsByDoctor(
        user.medico_id
      );
      setPatients(patientsData);

      console.log("📊 [PatientsView] Pacientes cargados:", patientsData);
    } catch (error) {
      console.error("❌ [PatientsView] Error cargando pacientes:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadPatientHistory = async (paciente_id) => {
    try {
      console.log(
        "🔍 [PatientsView] Cargando historial del paciente:",
        paciente_id
      );

      const historyData = await historialService.getPatientHistory(
        user.medico_id,
        paciente_id
      );
      setPatientHistory(historyData);

      console.log("📊 [PatientsView] Historial cargado:", historyData);
    } catch (error) {
      console.error("❌ [PatientsView] Error cargando historial:", error);
    }
  };

  const handleViewHistory = async (patient) => {
    setSelectedPatient(patient);
    await loadPatientHistory(patient.paciente_id);
    setShowHistoryModal(true);
  };

  const handleAddRecord = () => {
    setNewRecord({
      historial_tipo: "Consulta",
      historial_diagnostico: "",
      historial_tratamiento: "",
      historial_observaciones: "",
      historial_medicamentos: "",
      historial_proxima_cita: "",
      historial_estado_paciente: "Estable",
    });
    setShowAddRecordModal(true);
  };

  const handleSubmitRecord = async () => {
    try {
      console.log("🔍 [PatientsView] Creando nuevo registro:", newRecord);

      await historialService.createHistoryRecord(
        user.medico_id,
        selectedPatient.paciente_id,
        newRecord
      );

      // Recargar historial
      await loadPatientHistory(selectedPatient.paciente_id);

      setShowAddRecordModal(false);
      alert("Registro de historial creado exitosamente");
    } catch (error) {
      console.error("❌ [PatientsView] Error creando registro:", error);
      alert(
        `Error al crear el registro: ${
          error.message || error.error || "Error desconocido"
        }`
      );
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "No programada";
    return new Date(dateString).toLocaleDateString("es-ES");
  };

  const getEstadoColor = (estado) => {
    switch (estado) {
      case "Estable":
        return "bg-green-100 text-green-800";
      case "Mejorando":
        return "bg-blue-100 text-blue-800";
      case "Empeorando":
        return "bg-yellow-100 text-yellow-800";
      case "Crítico":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getTipoColor = (tipo) => {
    switch (tipo) {
      case "Consulta":
        return "bg-blue-100 text-blue-800";
      case "Seguimiento":
        return "bg-green-100 text-green-800";
      case "Control":
        return "bg-purple-100 text-purple-800";
      case "Emergencia":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <p className="ml-4 text-gray-600">Cargando pacientes...</p>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      {/* Header Moderno */}
      <div className="bg-gradient-to-r from-blue-50 to-emerald-50 rounded-2xl p-6 border border-blue-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
              <UserGroupIcon className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Base de Datos Médica
              </h1>
              <p className="text-gray-600 text-lg">
                Gestión integral del historial clínico de tus pacientes
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="bg-white/80 backdrop-blur-sm rounded-xl px-4 py-3 border border-blue-200">
              <div className="text-2xl font-bold text-blue-900">
                {patients.length}
              </div>
              <div className="text-sm text-blue-600 font-medium">
                Pacientes Activos
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Lista de Pacientes Moderna */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="bg-gradient-to-r from-gray-50 to-blue-50 px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                <UserGroupIcon className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  Registro de Pacientes
                </h2>
                <p className="text-sm text-gray-600">
                  Historial clínico y datos médicos
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-gray-500">Sistema Activo</span>
            </div>
          </div>
        </div>

        {patients.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
              <UserGroupIcon className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No hay pacientes registrados
            </h3>
            <p className="text-gray-500 mb-6">
              Comienza agregando tu primer paciente al sistema
            </p>
            <div className="w-16 h-1 bg-blue-200 rounded-full mx-auto"></div>
          </div>
        ) : (
          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {patients.map((patient) => (
                <div
                  key={patient.paciente_id}
                  className="group relative bg-gradient-to-br from-white to-gray-50 rounded-2xl p-6 border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all duration-300"
                >
                  {/* Indicador de estado */}
                  <div className="absolute top-4 right-4">
                    <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse"></div>
                  </div>

                  <div className="space-y-4">
                    {/* Información principal del paciente */}
                    <div className="flex items-start space-x-4">
                      <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-emerald-100 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        <UserGroupIcon className="w-8 h-8 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-900 mb-1">
                          {patient.paciente_nombre} {patient.paciente_apellido}
                        </h3>
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <span className="flex items-center space-x-1">
                            <CalendarIcon className="w-4 h-4 text-blue-500" />
                            <span className="font-medium">
                              {patient.usuario_edad} años
                            </span>
                          </span>
                          <span className="flex items-center space-x-1">
                            <DocumentTextIcon className="w-4 h-4 text-emerald-500" />
                            <span className="font-medium">
                              {patient.total_consultas} consultas
                            </span>
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Información de contacto */}
                    <div className="bg-gray-50 rounded-xl p-4">
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <PhoneIcon className="w-4 h-4 text-gray-500" />
                        <span className="font-medium">
                          {patient.usuario_telefono || "Teléfono no disponible"}
                        </span>
                      </div>
                    </div>

                    {/* Fechas importantes */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-blue-50 rounded-xl p-3">
                        <div className="text-xs text-blue-600 font-medium mb-1">
                          Última Consulta
                        </div>
                        <div className="text-sm font-semibold text-blue-900">
                          {formatDate(patient.ultima_consulta)}
                        </div>
                      </div>
                      <div className="bg-emerald-50 rounded-xl p-3">
                        <div className="text-xs text-emerald-600 font-medium mb-1">
                          Próxima Cita
                        </div>
                        <div className="text-sm font-semibold text-emerald-900">
                          {formatDate(patient.proxima_cita)}
                        </div>
                      </div>
                    </div>

                    {/* Botón de acción */}
                    <button
                      onClick={() => handleViewHistory(patient)}
                      className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-sm hover:shadow-md"
                    >
                      <EyeIcon className="w-5 h-5" />
                      <span className="font-medium">Ver Historial Médico</span>
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Modal de Historial Moderno */}
      {showHistoryModal && selectedPatient && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-5xl max-h-[90vh] overflow-y-auto shadow-2xl">
            {/* Header del Modal */}
            <div className="bg-gradient-to-r from-blue-50 to-emerald-50 px-6 py-4 border-b border-gray-200 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                    <DocumentTextIcon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">
                      Historial Médico
                    </h2>
                    <p className="text-gray-600">
                      {selectedPatient.paciente_nombre}{" "}
                      {selectedPatient.paciente_apellido} •{" "}
                      {selectedPatient.usuario_edad} años •{" "}
                      {selectedPatient.usuario_genero}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={handleAddRecord}
                    className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-xl hover:from-emerald-700 hover:to-emerald-800 transition-all duration-200 shadow-sm"
                  >
                    <PlusIcon className="w-4 h-4" />
                    <span className="font-medium">Nuevo Registro</span>
                  </button>
                  <button
                    onClick={() => setShowHistoryModal(false)}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors border border-gray-300"
                  >
                    Cerrar
                  </button>
                </div>
              </div>
            </div>

            <div className="p-6">
              {/* Lista de Registros de Historial */}
              <div className="space-y-6">
                {patientHistory.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
                      <DocumentTextIcon className="w-10 h-10 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      No hay registros de historial
                    </h3>
                    <p className="text-gray-500 mb-6">
                      Comienza agregando el primer registro médico
                    </p>
                    <div className="w-16 h-1 bg-blue-200 rounded-full mx-auto"></div>
                  </div>
                ) : (
                  patientHistory.map((record) => (
                    <div
                      key={record.historial_id}
                      className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-6 border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all duration-300"
                    >
                      {/* Header del registro */}
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <span
                            className={`px-4 py-2 rounded-xl text-sm font-medium ${getTipoColor(
                              record.historial_tipo
                            )}`}
                          >
                            {record.historial_tipo}
                          </span>
                          <span
                            className={`px-4 py-2 rounded-xl text-sm font-medium ${getEstadoColor(
                              record.historial_estado_paciente
                            )}`}
                          >
                            {record.historial_estado_paciente}
                          </span>
                        </div>
                        <div className="text-sm text-gray-500 font-medium">
                          {formatDate(record.historial_fecha)}
                        </div>
                      </div>

                      {/* Contenido del registro */}
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {record.historial_diagnostico && (
                          <div className="bg-red-50 rounded-xl p-4 border border-red-200">
                            <div className="flex items-center space-x-2 mb-2">
                              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                              <h4 className="font-semibold text-red-900">
                                Diagnóstico
                              </h4>
                            </div>
                            <p className="text-sm text-red-800">
                              {record.historial_diagnostico}
                            </p>
                          </div>
                        )}

                        {record.historial_tratamiento && (
                          <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                            <div className="flex items-center space-x-2 mb-2">
                              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                              <h4 className="font-semibold text-blue-900">
                                Tratamiento
                              </h4>
                            </div>
                            <p className="text-sm text-blue-800">
                              {record.historial_tratamiento}
                            </p>
                          </div>
                        )}

                        {record.historial_medicamentos && (
                          <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-200">
                            <div className="flex items-center space-x-2 mb-2">
                              <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                              <h4 className="font-semibold text-emerald-900">
                                Medicamentos
                              </h4>
                            </div>
                            <p className="text-sm text-emerald-800">
                              {record.historial_medicamentos}
                            </p>
                          </div>
                        )}

                        {record.historial_observaciones && (
                          <div className="lg:col-span-2 bg-gray-50 rounded-xl p-4 border border-gray-200">
                            <div className="flex items-center space-x-2 mb-2">
                              <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
                              <h4 className="font-semibold text-gray-900">
                                Observaciones
                              </h4>
                            </div>
                            <p className="text-sm text-gray-700">
                              {record.historial_observaciones}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal para Agregar Registro */}
      {showAddRecordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              Nuevo Registro de Historial
            </h3>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tipo de Consulta
                  </label>
                  <select
                    value={newRecord.historial_tipo}
                    onChange={(e) =>
                      setNewRecord({
                        ...newRecord,
                        historial_tipo: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Consulta">Consulta</option>
                    <option value="Seguimiento">Seguimiento</option>
                    <option value="Control">Control</option>
                    <option value="Emergencia">Emergencia</option>
                    <option value="Otro">Otro</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Estado del Paciente
                  </label>
                  <select
                    value={newRecord.historial_estado_paciente}
                    onChange={(e) =>
                      setNewRecord({
                        ...newRecord,
                        historial_estado_paciente: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Estable">Estable</option>
                    <option value="Mejorando">Mejorando</option>
                    <option value="Empeorando">Empeorando</option>
                    <option value="Crítico">Crítico</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Diagnóstico
                </label>
                <textarea
                  value={newRecord.historial_diagnostico}
                  onChange={(e) =>
                    setNewRecord({
                      ...newRecord,
                      historial_diagnostico: e.target.value,
                    })
                  }
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Describe el diagnóstico..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tratamiento
                </label>
                <textarea
                  value={newRecord.historial_tratamiento}
                  onChange={(e) =>
                    setNewRecord({
                      ...newRecord,
                      historial_tratamiento: e.target.value,
                    })
                  }
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Describe el tratamiento indicado..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Medicamentos
                </label>
                <textarea
                  value={newRecord.historial_medicamentos}
                  onChange={(e) =>
                    setNewRecord({
                      ...newRecord,
                      historial_medicamentos: e.target.value,
                    })
                  }
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Lista de medicamentos recetados..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Observaciones
                </label>
                <textarea
                  value={newRecord.historial_observaciones}
                  onChange={(e) =>
                    setNewRecord({
                      ...newRecord,
                      historial_observaciones: e.target.value,
                    })
                  }
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Observaciones adicionales..."
                />
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowAddRecordModal(false)}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-xl hover:bg-gray-400 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSubmitRecord}
                className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
              >
                Guardar Registro
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientsView;
