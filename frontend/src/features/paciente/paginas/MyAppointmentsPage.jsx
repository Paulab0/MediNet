import { useState, useEffect } from "react";
import {
  CalendarIcon,
  ClockIcon,
  UserIcon,
  MapPinIcon,
  PencilIcon,
  TrashIcon,
  CheckCircleIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";
import appointmentService from "../../../servicios/servicioCita";
import { useAuth } from "../../../contextos/AuthContext";
import EditAppointmentModal from "../componentes/EditAppointmentModal";

const MyAppointmentsPage = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [filter, setFilter] = useState("all"); // all, upcoming, past, cancelled

  useEffect(() => {
    if (user?.paciente_id) {
      loadAppointments();
    }
  }, [user?.paciente_id]);

  const loadAppointments = async () => {
    if (!user?.paciente_id) {
      setError("No se encontró tu información de paciente");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const data = await appointmentService.getByPaciente(user.paciente_id);
      setAppointments(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error cargando citas:", err);
      setError(err.response?.data?.error || err.message || "Error al cargar tus citas");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (appointmentId) => {
    if (!window.confirm("¿Estás seguro de que deseas cancelar esta cita?")) {
      return;
    }

    try {
      setError(null);
      await appointmentService.deleteAppointment(appointmentId);
      await loadAppointments();
      alert("Cita cancelada exitosamente");
    } catch (err) {
      console.error("Error cancelando cita:", err);
      setError(err.response?.data?.error || err.message || "Error al cancelar la cita");
    }
  };

  const handleEdit = (appointment) => {
    setSelectedAppointment(appointment);
    setIsEditModalOpen(true);
  };

  const handleEditSuccess = () => {
    loadAppointments();
    setIsEditModalOpen(false);
    setSelectedAppointment(null);
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

  const filteredAppointments = appointments.filter((appointment) => {
    const estado = appointment.estado_calculado || appointment.cita_estado;
    const fecha = new Date(appointment.cita_fecha);
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    switch (filter) {
      case "upcoming":
        return (
          estado !== "Cancelada" &&
          estado !== "Completada" &&
          estado !== "No asistió" &&
          fecha >= hoy
        );
      case "past":
        return estado === "Completada" || (fecha < hoy && estado !== "Cancelada");
      case "cancelled":
        return estado === "Cancelada" || estado === "No asistió";
      default:
        return true;
    }
  });

  const canEdit = (appointment) => {
    const estado = appointment.estado_calculado || appointment.cita_estado;
    const fecha = new Date(appointment.cita_fecha);
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    return (
      estado !== "Cancelada" &&
      estado !== "Completada" &&
      estado !== "No asistió" &&
      fecha >= hoy
    );
  };

  const canCancel = (appointment) => {
    const estado = appointment.estado_calculado || appointment.cita_estado;
    const fecha = new Date(appointment.cita_fecha);
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    return (
      estado !== "Cancelada" &&
      estado !== "Completada" &&
      estado !== "No asistió" &&
      fecha >= hoy
    );
  };

  if (!user?.paciente_id) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 text-center">
          <p className="text-yellow-800">No se encontró tu información de paciente. Por favor, inicia sesión nuevamente.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Mis Citas</h1>
        <p className="text-gray-600">Gestiona tus citas médicas</p>
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
            Todas
          </button>
          <button
            onClick={() => setFilter("upcoming")}
            className={`px-4 py-2 rounded-xl font-medium transition-colors ${
              filter === "upcoming"
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Próximas
          </button>
          <button
            onClick={() => setFilter("past")}
            className={`px-4 py-2 rounded-xl font-medium transition-colors ${
              filter === "past"
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Pasadas
          </button>
          <button
            onClick={() => setFilter("cancelled")}
            className={`px-4 py-2 rounded-xl font-medium transition-colors ${
              filter === "cancelled"
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Canceladas
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* Lista de citas */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">Cargando citas...</span>
          </div>
        ) : filteredAppointments.length === 0 ? (
          <div className="text-center py-12">
            <CalendarIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 text-lg">No tienes citas {filter !== "all" && `en esta categoría`}</p>
            <p className="text-gray-500 text-sm mt-2">
              {filter === "all" && "Agenda tu primera cita desde la búsqueda de médicos"}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredAppointments.map((appointment) => (
              <div
                key={appointment.cita_id}
                className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-all"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    {/* Foto del médico */}
                    {appointment.medico_foto_perfil ? (
                      <img
                        src={appointment.medico_foto_perfil}
                        alt={appointment.medico_nombre}
                        className="w-16 h-16 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center">
                        <UserIcon className="w-8 h-8 text-blue-600" />
                      </div>
                    )}

                    {/* Información de la cita */}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          Dr. {appointment.medico_nombre} {appointment.medico_apellido}
                        </h3>
                        {getStatusBadge(appointment)}
                      </div>

                      <p className="text-sm text-blue-600 font-medium mb-3">
                        {appointment.especialidad_nombre || "Sin especialidad"}
                      </p>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <CalendarIcon className="w-4 h-4 text-gray-400" />
                          <span>
                            {new Date(appointment.cita_fecha).toLocaleDateString("es-ES", {
                              weekday: "long",
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <ClockIcon className="w-4 h-4 text-gray-400" />
                          <span>
                            {appointment.cita_hora?.substring(0, 5) || appointment.cita_hora}
                          </span>
                        </div>
                        {appointment.medico_consultorio && (
                          <div className="flex items-center gap-2">
                            <MapPinIcon className="w-4 h-4 text-gray-400" />
                            <span>{appointment.medico_consultorio}</span>
                          </div>
                        )}
                        {appointment.cita_tipo && (
                          <div className="flex items-center gap-2">
                            <span className="font-medium">Tipo:</span>
                            <span>{appointment.cita_tipo}</span>
                          </div>
                        )}
                      </div>

                      {appointment.cita_observaciones && (
                        <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                          <p className="text-sm text-gray-700">
                            <span className="font-medium">Observaciones:</span>{" "}
                            {appointment.cita_observaciones}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Acciones */}
                  <div className="flex items-center gap-2 ml-4">
                    {canEdit(appointment) && (
                      <button
                        onClick={() => handleEdit(appointment)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Editar cita"
                      >
                        <PencilIcon className="w-5 h-5" />
                      </button>
                    )}
                    {canCancel(appointment) && (
                      <button
                        onClick={() => handleCancel(appointment.cita_id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Cancelar cita"
                      >
                        <TrashIcon className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal de edición */}
      <EditAppointmentModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedAppointment(null);
        }}
        appointment={selectedAppointment}
        onSuccess={handleEditSuccess}
      />
    </div>
  );
};

export default MyAppointmentsPage;

