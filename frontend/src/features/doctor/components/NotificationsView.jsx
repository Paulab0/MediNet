import { useState, useEffect } from "react";
import {
  BellIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  CalendarIcon,
  UserIcon,
  MapPinIcon,
  CheckIcon,
  XMarkIcon,
  UserGroupIcon,
} from "@heroicons/react/24/outline";
import appointmentService from "../../../services/appointmentService";
import { useAuth } from "../../../contexts/AuthContext";

const NotificationsView = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("pending"); // pending, confirmed, completed, all
  const [confirmingAppointment, setConfirmingAppointment] = useState(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (user?.medico_id) {
      loadNotifications();
    }
  }, [user]);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      console.log(
        "🔍 [NotificationsView] Cargando notificaciones del médico:",
        user.medico_id
      );

      // Obtener citas del médico para diferentes períodos
      const [todayAppointments, weekAppointments, allAppointments] =
        await Promise.all([
          appointmentService.getDoctorAppointments(user.medico_id, "Hoy"),
          appointmentService.getDoctorAppointments(
            user.medico_id,
            "Esta semana"
          ),
          appointmentService.getDoctorAppointments(user.medico_id, "Este mes"),
        ]);

      console.log("📊 [NotificationsView] Citas cargadas:", {
        hoy: todayAppointments.length,
        semana: weekAppointments.length,
        mes: allAppointments.length,
      });

      // Generar notificaciones basadas en las citas
      const generatedNotifications = generateNotifications(allAppointments);
      setNotifications(generatedNotifications);
    } catch (error) {
      console.error(
        "❌ [NotificationsView] Error cargando notificaciones:",
        error
      );
    } finally {
      setLoading(false);
    }
  };

  const generateNotifications = (appointments) => {
    const now = new Date();
    const notifications = [];

    console.log(
      "🔍 [NotificationsView] Generando notificaciones para",
      appointments.length,
      "citas"
    );

    appointments.forEach((appointment) => {
      const appointmentDate = new Date(appointment.cita_fecha);
      const appointmentDateTime = new Date(
        `${appointment.cita_fecha}T${appointment.cita_hora}`
      );
      const timeDiff = appointmentDateTime.getTime() - now.getTime();
      const hoursUntilAppointment = timeDiff / (1000 * 60 * 60);
      const minutesUntilAppointment = timeDiff / (1000 * 60);

      // Obtener nombre completo del paciente
      const patientName = `${appointment.paciente_nombre || "Paciente"} ${
        appointment.paciente_apellido || ""
      }`.trim();

      // Solo procesar citas pendientes o confirmadas de hoy
      if (
        appointment.cita_estado === "Pendiente" ||
        appointment.cita_estado === "Confirmada"
      ) {
        // Cita que está por comenzar (en los próximos 30 minutos)
        if (minutesUntilAppointment >= 0 && minutesUntilAppointment <= 30) {
          notifications.push({
            id: `pending-${appointment.cita_id}`,
            type: "pending",
            title: "Cita por Comenzar",
            message: `El paciente ${patientName} tiene cita en ${Math.round(
              minutesUntilAppointment
            )} minutos`,
            time: appointmentDateTime,
            appointment: appointment,
            priority: "high",
            read: false,
            status: "pending_confirmation",
            minutesUntil: Math.round(minutesUntilAppointment),
          });
        }

        // Cita que ya debería haber comenzado (hace menos de 30 minutos)
        else if (
          minutesUntilAppointment < 0 &&
          minutesUntilAppointment >= -30
        ) {
          notifications.push({
            id: `overdue-${appointment.cita_id}`,
            type: "overdue",
            title: "Cita en Progreso",
            message: `El paciente ${patientName} tenía cita hace ${Math.round(
              Math.abs(minutesUntilAppointment)
            )} minutos`,
            time: appointmentDateTime,
            appointment: appointment,
            priority: "urgent",
            read: false,
            status: "waiting_confirmation",
            minutesOverdue: Math.round(Math.abs(minutesUntilAppointment)),
          });
        }
      }

      // Citas completadas recientemente (últimas 2 horas)
      if (
        appointment.cita_estado === "Completada" &&
        minutesUntilAppointment >= -120 &&
        minutesUntilAppointment <= 0
      ) {
        notifications.push({
          id: `completed-${appointment.cita_id}`,
          type: "completed",
          title: "Cita Completada",
          message: `La cita con ${patientName} ha sido completada exitosamente`,
          time: appointmentDateTime,
          appointment: appointment,
          priority: "low",
          read: false,
          status: "completed",
        });
      }
    });

    console.log(
      "📊 [NotificationsView] Notificaciones generadas:",
      notifications.length
    );

    // Ordenar por prioridad y tiempo
    return notifications.sort((a, b) => {
      const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 };
      if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      }
      return b.time - a.time;
    });
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case "upcoming":
      case "soon":
        return <ClockIcon className="w-5 h-5" />;
      case "today":
        return <CalendarIcon className="w-5 h-5" />;
      case "overdue":
        return <ExclamationTriangleIcon className="w-5 h-5" />;
      case "completed":
        return <CheckCircleIcon className="w-5 h-5" />;
      case "cancelled":
        return <XCircleIcon className="w-5 h-5" />;
      default:
        return <BellIcon className="w-5 h-5" />;
    }
  };

  const getNotificationColor = (type, priority) => {
    if (priority === "urgent") {
      return "bg-red-100 text-red-800 border-red-200";
    }
    switch (type) {
      case "upcoming":
      case "soon":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "today":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "overdue":
        return "bg-red-100 text-red-800 border-red-200";
      case "completed":
        return "bg-green-100 text-green-800 border-green-200";
      case "cancelled":
        return "bg-orange-100 text-orange-800 border-orange-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const formatTime = (date) => {
    return date.toLocaleString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const markAsRead = (notificationId) => {
    setNotifications((prev) =>
      prev.map((notification) =>
        notification.id === notificationId
          ? { ...notification, read: true }
          : notification
      )
    );
  };

  const handleConfirmArrival = async (appointmentId) => {
    try {
      setUpdatingStatus(true);
      console.log(
        "🔍 [NotificationsView] Confirmando llegada para cita:",
        appointmentId
      );

      // Aquí deberías llamar a tu API para actualizar el estado de la cita
      // Por ahora simulamos la actualización
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Actualizar la notificación localmente
      setNotifications((prev) =>
        prev.map((notification) =>
          notification.appointment.cita_id === appointmentId
            ? {
                ...notification,
                type: "confirmed",
                title: "Paciente Confirmado",
                message: `El paciente ${notification.appointment.paciente_nombre} ha llegado`,
                status: "confirmed",
                priority: "medium",
              }
            : notification
        )
      );

      console.log("✅ [NotificationsView] Llegada confirmada exitosamente");
    } catch (error) {
      console.error("❌ [NotificationsView] Error confirmando llegada:", error);
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleMarkCompleted = async (appointmentId) => {
    try {
      setUpdatingStatus(true);
      console.log(
        "🔍 [NotificationsView] Marcando como completada la cita:",
        appointmentId
      );

      // Aquí deberías llamar a tu API para marcar la cita como completada
      // Por ahora simulamos la actualización
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Actualizar la notificación localmente
      setNotifications((prev) =>
        prev.map((notification) =>
          notification.appointment.cita_id === appointmentId
            ? {
                ...notification,
                type: "completed",
                title: "Cita Completada",
                message: `La cita con ${notification.appointment.paciente_nombre} ha sido completada`,
                status: "completed",
                priority: "low",
              }
            : notification
        )
      );

      console.log("✅ [NotificationsView] Cita marcada como completada");
    } catch (error) {
      console.error(
        "❌ [NotificationsView] Error marcando como completada:",
        error
      );
    } finally {
      setUpdatingStatus(false);
    }
  };

  const filteredNotifications = notifications.filter((notification) => {
    if (filter === "all") return true;
    return notification.type === filter;
  });

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="p-8 space-y-6">
      {/* Header Moderno */}
      <div className="bg-gradient-to-r from-blue-50 to-emerald-50 rounded-2xl p-6 border border-blue-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
              <BellIcon className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Sistema de Recordatorios
              </h1>
              <p className="text-gray-600 text-lg">
                Confirmación de llegada y gestión de citas médicas
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="bg-white/80 backdrop-blur-sm rounded-xl px-4 py-3 border border-blue-200">
              <div className="text-2xl font-bold text-blue-900">
                {
                  notifications.filter(
                    (n) => n.type === "pending" || n.type === "overdue"
                  ).length
                }
              </div>
              <div className="text-sm text-blue-600 font-medium">
                Citas Pendientes
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex items-center justify-between">
        <div className="flex space-x-3">
          {[
            {
              key: "pending",
              label: "Pendientes",
              count: notifications.filter(
                (n) => n.type === "pending" || n.type === "overdue"
              ).length,
            },
            {
              key: "confirmed",
              label: "Confirmadas",
              count: notifications.filter((n) => n.type === "confirmed").length,
            },
            {
              key: "completed",
              label: "Completadas",
              count: notifications.filter((n) => n.type === "completed").length,
            },
            { key: "all", label: "Todas", count: notifications.length },
          ].map((filterOption) => (
            <button
              key={filterOption.key}
              onClick={() => setFilter(filterOption.key)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                filter === filterOption.key
                  ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-md"
                  : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-200 hover:border-blue-300"
              }`}
            >
              <span>{filterOption.label}</span>
              <span
                className={`px-2 py-1 rounded-full text-xs ${
                  filter === filterOption.key
                    ? "bg-white/20 text-white"
                    : "bg-gray-100 text-gray-600"
                }`}
              >
                {filterOption.count}
              </span>
            </button>
          ))}
        </div>

        <button
          onClick={loadNotifications}
          className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-xl hover:from-emerald-700 hover:to-emerald-800 transition-all duration-200 shadow-sm"
        >
          <BellIcon className="w-4 h-4" />
          <span className="font-medium">Actualizar</span>
        </button>
      </div>

      {/* Lista de Notificaciones */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-500 mt-4 text-lg">
              Cargando recordatorios...
            </p>
          </div>
        ) : filteredNotifications.length > 0 ? (
          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`group relative bg-gradient-to-br from-white to-gray-50 rounded-2xl p-6 border transition-all duration-300 ${
                    notification.type === "pending" ||
                    notification.type === "overdue"
                      ? "border-orange-200 hover:border-orange-300 hover:shadow-lg"
                      : notification.type === "confirmed"
                      ? "border-blue-200 hover:border-blue-300 hover:shadow-lg"
                      : "border-green-200 hover:border-green-300 hover:shadow-lg"
                  }`}
                >
                  {/* Indicador de estado */}
                  <div className="absolute top-4 right-4">
                    <div
                      className={`w-3 h-3 rounded-full ${
                        notification.type === "pending" ||
                        notification.type === "overdue"
                          ? "bg-orange-500 animate-pulse"
                          : notification.type === "confirmed"
                          ? "bg-blue-500"
                          : "bg-green-500"
                      }`}
                    ></div>
                  </div>

                  <div className="space-y-4">
                    {/* Header de la notificación */}
                    <div className="flex items-start space-x-4">
                      <div
                        className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                          notification.type === "pending" ||
                          notification.type === "overdue"
                            ? "bg-gradient-to-br from-orange-100 to-orange-200"
                            : notification.type === "confirmed"
                            ? "bg-gradient-to-br from-blue-100 to-blue-200"
                            : "bg-gradient-to-br from-green-100 to-green-200"
                        }`}
                      >
                        {notification.type === "pending" ||
                        notification.type === "overdue" ? (
                          <ClockIcon className="w-6 h-6 text-orange-600" />
                        ) : notification.type === "confirmed" ? (
                          <UserGroupIcon className="w-6 h-6 text-blue-600" />
                        ) : (
                          <CheckCircleIcon className="w-6 h-6 text-green-600" />
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-gray-900 mb-1">
                          {notification.title}
                        </h3>
                        <p className="text-gray-600">{notification.message}</p>
                      </div>
                    </div>

                    {/* Información del paciente */}
                    <div className="bg-gray-50 rounded-xl p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <UserIcon className="w-4 h-4 text-blue-600" />
                          </div>
                          <div>
                            <div className="font-semibold text-gray-900">
                              {notification.appointment.paciente_nombre}{" "}
                              {notification.appointment.paciente_apellido}
                            </div>
                            <div className="text-sm text-gray-500">
                              {formatTime(notification.time)}
                            </div>
                          </div>
                        </div>
                        {notification.minutesUntil !== undefined && (
                          <div className="text-right">
                            <div className="text-2xl font-bold text-orange-600">
                              {notification.minutesUntil}
                            </div>
                            <div className="text-xs text-orange-600">
                              minutos
                            </div>
                          </div>
                        )}
                        {notification.minutesOverdue !== undefined && (
                          <div className="text-right">
                            <div className="text-2xl font-bold text-red-600">
                              +{notification.minutesOverdue}
                            </div>
                            <div className="text-xs text-red-600">minutos</div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Botones de acción */}
                    {notification.type === "pending" ||
                    notification.type === "overdue" ? (
                      <div className="flex space-x-3">
                        <button
                          onClick={() =>
                            handleConfirmArrival(
                              notification.appointment.cita_id
                            )
                          }
                          disabled={updatingStatus}
                          className="flex-1 flex items-center justify-center space-x-2 px-4 py-3 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-xl hover:from-emerald-700 hover:to-emerald-800 transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-50"
                        >
                          <CheckIcon className="w-5 h-5" />
                          <span className="font-medium">Confirmar Llegada</span>
                        </button>
                        <button
                          onClick={() =>
                            handleMarkCompleted(
                              notification.appointment.cita_id
                            )
                          }
                          disabled={updatingStatus}
                          className="flex-1 flex items-center justify-center space-x-2 px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-50"
                        >
                          <CheckCircleIcon className="w-5 h-5" />
                          <span className="font-medium">Marcar Completada</span>
                        </button>
                      </div>
                    ) : notification.type === "confirmed" ? (
                      <div className="flex space-x-3">
                        <button
                          onClick={() =>
                            handleMarkCompleted(
                              notification.appointment.cita_id
                            )
                          }
                          disabled={updatingStatus}
                          className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-50"
                        >
                          <CheckCircleIcon className="w-5 h-5" />
                          <span className="font-medium">Marcar Completada</span>
                        </button>
                      </div>
                    ) : (
                      <div className="text-center py-2">
                        <div className="inline-flex items-center space-x-2 px-4 py-2 bg-green-100 text-green-800 rounded-xl">
                          <CheckCircleIcon className="w-5 h-5" />
                          <span className="font-medium">Cita Completada</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="p-12 text-center">
            <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
              <BellIcon className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No hay recordatorios
            </h3>
            <p className="text-gray-500 mb-6">
              {filter === "all"
                ? "No tienes citas programadas en este momento"
                : `No hay citas de tipo "${filter}"`}
            </p>
            <div className="w-16 h-1 bg-blue-200 rounded-full mx-auto"></div>
          </div>
        )}
      </div>

      {/* Estadísticas del Sistema de Recordatorios */}
      {notifications.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl p-6 border border-orange-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center">
                  <ClockIcon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-orange-900">
                    Pendientes
                  </h3>
                  <p className="text-sm text-orange-600">
                    Requieren confirmación
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-orange-900">
                  {
                    notifications.filter(
                      (n) => n.type === "pending" || n.type === "overdue"
                    ).length
                  }
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6 border border-blue-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
                  <UserGroupIcon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-blue-900">
                    Confirmadas
                  </h3>
                  <p className="text-sm text-blue-600">Pacientes llegaron</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-blue-900">
                  {notifications.filter((n) => n.type === "confirmed").length}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-6 border border-green-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center">
                  <CheckCircleIcon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-green-900">
                    Completadas
                  </h3>
                  <p className="text-sm text-green-600">Citas finalizadas</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-green-900">
                  {notifications.filter((n) => n.type === "completed").length}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gray-500 rounded-xl flex items-center justify-center">
                  <BellIcon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Total</h3>
                  <p className="text-sm text-gray-600">Recordatorios</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-gray-900">
                  {notifications.length}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationsView;
