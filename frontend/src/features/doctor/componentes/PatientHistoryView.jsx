import { useState, useEffect } from "react";
import {
  XMarkIcon,
  CalendarIcon,
  ClipboardDocumentListIcon,
  PencilIcon,
  TrashIcon,
  UserIcon,
} from "@heroicons/react/24/outline";
import historialService from "../../../servicios/servicioHistorial";
import { useAuth } from "../../../contextos/AuthContext";
import EditMedicalHistoryForm from "./EditMedicalHistoryForm";

const PatientHistoryView = ({ isOpen, onClose, patient, onHistoryUpdated }) => {
  const { user } = useAuth();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isEditFormOpen, setIsEditFormOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);

  useEffect(() => {
    if (isOpen && patient?.paciente_id && user?.medico_id) {
      loadHistory();
    }
  }, [isOpen, patient?.paciente_id, user?.medico_id]);

  const loadHistory = async () => {
    if (!user?.medico_id || !patient?.paciente_id) return;

    setLoading(true);
    setError(null);
    try {
      const data = await historialService.getPatientHistory(
        user.medico_id,
        patient.paciente_id
      );
      setHistory(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error cargando historial:", err);
      setError(err.response?.data?.error || err.message || "Error al cargar el historial");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (historial_id) => {
    if (!window.confirm("¿Estás seguro de que deseas eliminar este registro?")) {
      return;
    }

    try {
      setError(null);
      await historialService.deleteHistoryRecord(historial_id);
      await loadHistory();
      if (onHistoryUpdated) onHistoryUpdated();
    } catch (err) {
      console.error("Error eliminando registro:", err);
      setError(err.response?.data?.error || err.message || "Error al eliminar el registro");
    }
  };

  const handleEdit = (record) => {
    setSelectedRecord(record);
    setIsEditFormOpen(true);
  };

  const handleEditSuccess = () => {
    loadHistory();
    setIsEditFormOpen(false);
    setSelectedRecord(null);
    if (onHistoryUpdated) onHistoryUpdated();
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

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-xl max-w-5xl w-full max-h-[90vh] overflow-y-auto relative">
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
                <ClipboardDocumentListIcon className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Historial Médico</h2>
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

          {/* Error */}
          {error && (
            <div className="mx-6 mt-4 p-4 bg-red-50 border border-red-200 rounded-xl">
              <p className="text-red-700">{error}</p>
            </div>
          )}

          {/* Información del Paciente */}
          {patient && (
            <div className="mx-6 mt-4 bg-blue-50 rounded-xl p-4 border border-blue-200">
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
                    <p className="text-sm text-gray-600">Edad: {patient.usuario_edad} años</p>
                  )}
                  {patient.usuario_genero && (
                    <p className="text-sm text-gray-600">Género: {patient.usuario_genero}</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Lista de Historial */}
          <div className="p-6">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                <span className="ml-3 text-gray-600">Cargando historial...</span>
              </div>
            ) : history.length === 0 ? (
              <div className="text-center py-12">
                <ClipboardDocumentListIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600 text-lg">No hay registros de historial médico</p>
                <p className="text-gray-500 text-sm mt-2">
                  El historial se creará cuando registres la primera consulta
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {history.map((record) => (
                  <div
                    key={record.historial_id}
                    className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-all"
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
                          <p className="text-sm text-gray-500">
                            {record.historial_tipo}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {getEstadoBadge(record.historial_estado_paciente)}
                        <button
                          onClick={() => handleEdit(record)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Editar registro"
                        >
                          <PencilIcon className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(record.historial_id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Eliminar registro"
                        >
                          <TrashIcon className="w-5 h-5" />
                        </button>
                      </div>
                    </div>

                    {record.historial_diagnostico && (
                      <div className="mb-3">
                        <p className="text-sm font-medium text-gray-700 mb-1">Diagnóstico:</p>
                        <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                          {record.historial_diagnostico}
                        </p>
                      </div>
                    )}

                    {record.historial_tratamiento && (
                      <div className="mb-3">
                        <p className="text-sm font-medium text-gray-700 mb-1">Tratamiento:</p>
                        <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                          {record.historial_tratamiento}
                        </p>
                      </div>
                    )}

                    {record.historial_medicamentos && (
                      <div className="mb-3">
                        <p className="text-sm font-medium text-gray-700 mb-1">Medicamentos:</p>
                        <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                          {record.historial_medicamentos}
                        </p>
                      </div>
                    )}

                    {record.historial_observaciones && (
                      <div className="mb-3">
                        <p className="text-sm font-medium text-gray-700 mb-1">Observaciones:</p>
                        <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
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
            )}
          </div>
        </div>
      </div>

      {/* Modal de Edición */}
      {isEditFormOpen && selectedRecord && (
        <EditMedicalHistoryForm
          isOpen={isEditFormOpen}
          onClose={() => {
            setIsEditFormOpen(false);
            setSelectedRecord(null);
          }}
          patient={patient}
          record={selectedRecord}
          onSuccess={handleEditSuccess}
        />
      )}
    </>
  );
};


export default PatientHistoryView;

