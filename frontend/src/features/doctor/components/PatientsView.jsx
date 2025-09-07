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
import historialService from "../../../services/historialService";
import { useAuth } from "../../../contexts/AuthContext";

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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
            <UserGroupIcon className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Mis Pacientes</h1>
            <p className="text-gray-600">
              Gestiona el historial médico de tus pacientes
            </p>
          </div>
        </div>
        <div className="text-sm text-gray-500">
          Total: {patients.length} pacientes
        </div>
      </div>

      {/* Lista de Pacientes */}
      <div className="bg-white rounded-3xl shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Lista de Pacientes
          </h2>
        </div>

        {patients.length === 0 ? (
          <div className="p-8 text-center">
            <UserGroupIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No tienes pacientes registrados</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {patients.map((patient) => (
              <div
                key={patient.paciente_id}
                className="p-6 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <UserGroupIcon className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {patient.paciente_nombre} {patient.paciente_apellido}
                      </h3>
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <span className="flex items-center space-x-1">
                          <CalendarIcon className="w-4 h-4" />
                          <span>{patient.usuario_edad} años</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <PhoneIcon className="w-4 h-4" />
                          <span>
                            {patient.usuario_telefono || "No disponible"}
                          </span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <DocumentTextIcon className="w-4 h-4" />
                          <span>{patient.total_consultas} consultas</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <div className="text-right text-sm">
                      <p className="text-gray-600">
                        Última consulta: {formatDate(patient.ultima_consulta)}
                      </p>
                      <p className="text-gray-600">
                        Próxima cita: {formatDate(patient.proxima_cita)}
                      </p>
                    </div>
                    <button
                      onClick={() => handleViewHistory(patient)}
                      className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
                    >
                      <EyeIcon className="w-4 h-4" />
                      <span>Ver Historial</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal de Historial */}
      {showHistoryModal && selectedPatient && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-3xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  Historial de {selectedPatient.paciente_nombre}{" "}
                  {selectedPatient.paciente_apellido}
                </h2>
                <p className="text-gray-600">
                  {selectedPatient.usuario_edad} años •{" "}
                  {selectedPatient.usuario_genero}
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <button
                  onClick={handleAddRecord}
                  className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors"
                >
                  <PlusIcon className="w-4 h-4" />
                  <span>Nuevo Registro</span>
                </button>
                <button
                  onClick={() => setShowHistoryModal(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-xl hover:bg-gray-400 transition-colors"
                >
                  Cerrar
                </button>
              </div>
            </div>

            {/* Lista de Registros de Historial */}
            <div className="space-y-4">
              {patientHistory.length === 0 ? (
                <div className="text-center py-8">
                  <DocumentTextIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No hay registros de historial</p>
                </div>
              ) : (
                patientHistory.map((record) => (
                  <div
                    key={record.historial_id}
                    className="border border-gray-200 rounded-xl p-4"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${getTipoColor(
                            record.historial_tipo
                          )}`}
                        >
                          {record.historial_tipo}
                        </span>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${getEstadoColor(
                            record.historial_estado_paciente
                          )}`}
                        >
                          {record.historial_estado_paciente}
                        </span>
                        <span className="text-sm text-gray-600">
                          {formatDate(record.historial_fecha)}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      {record.historial_diagnostico && (
                        <div>
                          <h4 className="font-medium text-gray-900 mb-1">
                            Diagnóstico
                          </h4>
                          <p className="text-sm text-gray-600">
                            {record.historial_diagnostico}
                          </p>
                        </div>
                      )}

                      {record.historial_tratamiento && (
                        <div>
                          <h4 className="font-medium text-gray-900 mb-1">
                            Tratamiento
                          </h4>
                          <p className="text-sm text-gray-600">
                            {record.historial_tratamiento}
                          </p>
                        </div>
                      )}

                      {record.historial_medicamentos && (
                        <div>
                          <h4 className="font-medium text-gray-900 mb-1">
                            Medicamentos
                          </h4>
                          <p className="text-sm text-gray-600">
                            {record.historial_medicamentos}
                          </p>
                        </div>
                      )}

                      {record.historial_observaciones && (
                        <div className="lg:col-span-2">
                          <h4 className="font-medium text-gray-900 mb-1">
                            Observaciones
                          </h4>
                          <p className="text-sm text-gray-600">
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
