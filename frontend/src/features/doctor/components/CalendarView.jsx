import { useState, useEffect } from "react";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ClockIcon,
  CalendarIcon,
  UserIcon,
  MapPinIcon,
  CheckIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import appointmentService from "../../../services/appointmentService";
import { useAuth } from "../../../contexts/AuthContext";

const CalendarView = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(null);
  const [updatingStatus, setUpdatingStatus] = useState({});
  const { user } = useAuth();

  const months = [
    "Enero",
    "Febrero",
    "Marzo",
    "Abril",
    "Mayo",
    "Junio",
    "Julio",
    "Agosto",
    "Septiembre",
    "Octubre",
    "Noviembre",
    "Diciembre",
  ];

  const daysOfWeek = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

  useEffect(() => {
    loadAppointments();
  }, [currentDate, user]);

  const loadAppointments = async () => {
    try {
      setLoading(true);

      let data = [];

      // Si hay medico_id, cargar citas específicas del médico
      if (user?.medico_id) {
        console.log(
          "🏥 [CalendarView] Cargando citas del médico ID:",
          user.medico_id
        );
        data = await appointmentService.getDoctorAppointments(
          user.medico_id,
          "Este mes"
        );
      } else {
        console.log("📊 [CalendarView] Cargando todas las citas");
        data = await appointmentService.getAppointments();
      }

      console.log("📊 [CalendarView] Citas cargadas:", data);

      // Log detallado de la primera cita para depurar
      if (data.length > 0) {
        console.log("🔍 [CalendarView] Primera cita detallada:", {
          cita_id: data[0].cita_id,
          paciente_nombre: data[0].paciente_nombre,
          paciente_apellido: data[0].paciente_apellido,
          cita_fecha: data[0].cita_fecha,
          cita_hora: data[0].cita_hora,
          cita_estado: data[0].cita_estado,
          estado_calculado: data[0].estado_calculado,
        });
      }

      setAppointments(data);
    } catch (error) {
      console.error("Error cargando citas:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (cita_id, newStatus) => {
    try {
      console.log(
        `🔍 [CalendarView] Actualizando estado de cita ${cita_id} a: ${newStatus}`
      );

      // Marcar como actualizando
      setUpdatingStatus((prev) => ({ ...prev, [cita_id]: true }));

      // Llamar al servicio
      await appointmentService.updateAppointmentStatus(cita_id, newStatus);

      // Actualizar el estado local
      setAppointments((prev) =>
        prev.map((appointment) =>
          appointment.cita_id === cita_id
            ? { ...appointment, cita_estado: newStatus }
            : appointment
        )
      );

      console.log(`✅ [CalendarView] Estado actualizado exitosamente`);
      alert(`Cita marcada como ${newStatus.toLowerCase()}`);
    } catch (error) {
      console.error(`❌ [CalendarView] Error actualizando estado:`, error);
      alert(
        `Error al actualizar el estado: ${
          error.message || error.error || "Error desconocido"
        }`
      );
    } finally {
      // Quitar el estado de actualizando
      setUpdatingStatus((prev) => ({ ...prev, [cita_id]: false }));
    }
  };

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];

    // Días del mes anterior
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      const prevDate = new Date(year, month, -i);
      days.push({
        date: prevDate,
        isCurrentMonth: false,
        isToday: false,
        appointments: [],
      });
    }

    // Días del mes actual
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const isToday = date.toDateString() === new Date().toDateString();

      // Filtrar citas para este día
      const dayAppointments = appointments.filter((appointment) => {
        const appointmentDate = new Date(appointment.cita_fecha);
        return appointmentDate.toDateString() === date.toDateString();
      });

      days.push({
        date,
        isCurrentMonth: true,
        isToday,
        appointments: dayAppointments,
      });
    }

    // Días del mes siguiente para completar la cuadrícula
    const remainingDays = 42 - days.length;
    for (let day = 1; day <= remainingDays; day++) {
      const nextDate = new Date(year, month + 1, day);
      days.push({
        date: nextDate,
        isCurrentMonth: false,
        isToday: false,
        appointments: [],
      });
    }

    return days;
  };

  const navigateMonth = (direction) => {
    setCurrentDate((prevDate) => {
      const newDate = new Date(prevDate);
      newDate.setMonth(prevDate.getMonth() + direction);
      return newDate;
    });
  };

  const getAppointmentsForDate = (date) => {
    return appointments.filter((appointment) => {
      const appointmentDate = new Date(appointment.cita_fecha);
      return appointmentDate.toDateString() === date.toDateString();
    });
  };

  const formatTime = (timeString) => {
    if (!timeString) return "";
    const [hours, minutes] = timeString.split(":");
    return `${hours}:${minutes}`;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Completada":
        return "bg-green-100 text-green-800";
      case "Pendiente":
        return "bg-yellow-100 text-yellow-800";
      case "Cancelada":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const days = getDaysInMonth(currentDate);
  const selectedDateAppointments = selectedDate
    ? getAppointmentsForDate(selectedDate)
    : [];

  return (
    <div className="p-8 space-y-6">
      {/* Header del Calendario */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">
          Calendario de Citas
        </h2>
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigateMonth(-1)}
            className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center hover:bg-gray-200 transition-colors"
          >
            <ChevronLeftIcon className="w-5 h-5" />
          </button>
          <h3 className="text-xl font-semibold text-gray-900 min-w-[200px] text-center">
            {months[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h3>
          <button
            onClick={() => navigateMonth(1)}
            className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center hover:bg-gray-200 transition-colors"
          >
            <ChevronRightIcon className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendario */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            {/* Días de la semana */}
            <div className="grid grid-cols-7 bg-gray-50 border-b border-gray-200">
              {daysOfWeek.map((day) => (
                <div
                  key={day}
                  className="p-4 text-center text-sm font-medium text-gray-600"
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Días del mes */}
            <div className="grid grid-cols-7">
              {days.map((day, index) => (
                <div
                  key={index}
                  className={`min-h-[120px] p-2 border-r border-b border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors ${
                    !day.isCurrentMonth ? "bg-gray-50 text-gray-400" : ""
                  } ${day.isToday ? "bg-blue-50" : ""}`}
                  onClick={() => setSelectedDate(day.date)}
                >
                  <div className="flex flex-col h-full">
                    <div
                      className={`text-sm font-medium mb-1 ${
                        day.isToday ? "text-blue-600" : "text-gray-900"
                      }`}
                    >
                      {day.date.getDate()}
                    </div>
                    <div className="flex-1 space-y-1">
                      {day.appointments.slice(0, 2).map((appointment, idx) => (
                        <div
                          key={idx}
                          className={`text-xs p-1 rounded truncate ${getStatusColor(
                            appointment.cita_estado
                          )}`}
                        >
                          {formatTime(appointment.cita_hora)} -{" "}
                          {appointment.paciente_nombre}{" "}
                          {appointment.paciente_apellido}
                        </div>
                      ))}
                      {day.appointments.length > 2 && (
                        <div className="text-xs text-gray-500">
                          +{day.appointments.length - 2} más
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Panel de Citas del Día Seleccionado */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {selectedDate
                ? `Citas del ${selectedDate.getDate()} de ${
                    months[selectedDate.getMonth()]
                  }`
                : "Selecciona una fecha"}
            </h3>

            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-gray-500 mt-2">Cargando citas...</p>
              </div>
            ) : selectedDateAppointments.length > 0 ? (
              <div className="space-y-3">
                {selectedDateAppointments.map((appointment, index) => (
                  <div
                    key={index}
                    className="p-4 border border-gray-200 rounded-xl hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start space-x-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <ClockIcon className="w-5 h-5 text-blue-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium text-gray-900 truncate">
                            {appointment.paciente_nombre}{" "}
                            {appointment.paciente_apellido}
                          </h4>
                          <span
                            className={`px-2 py-1 text-xs rounded-full ${getStatusColor(
                              appointment.cita_estado
                            )}`}
                          >
                            {appointment.cita_estado}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          {formatTime(appointment.cita_hora)}
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                          {appointment.cita_tipo || "Consulta general"}
                        </p>
                        {appointment.cita_observaciones && (
                          <p className="text-xs text-gray-500 mt-2 line-clamp-2">
                            {appointment.cita_observaciones}
                          </p>
                        )}

                        {/* Botones de acción para cambiar estado */}
                        {appointment.cita_estado === "Pendiente" && (
                          <div className="flex items-center space-x-2 mt-3">
                            <button
                              onClick={() =>
                                handleStatusUpdate(
                                  appointment.cita_id,
                                  "Completada"
                                )
                              }
                              disabled={updatingStatus[appointment.cita_id]}
                              className="flex items-center space-x-1 px-3 py-1.5 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors text-xs font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {updatingStatus[appointment.cita_id] ? (
                                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-green-700"></div>
                              ) : (
                                <CheckIcon className="w-3 h-3" />
                              )}
                              <span>Completada</span>
                            </button>
                            <button
                              onClick={() =>
                                handleStatusUpdate(
                                  appointment.cita_id,
                                  "Cancelada"
                                )
                              }
                              disabled={updatingStatus[appointment.cita_id]}
                              className="flex items-center space-x-1 px-3 py-1.5 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-xs font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {updatingStatus[appointment.cita_id] ? (
                                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-red-700"></div>
                              ) : (
                                <XMarkIcon className="w-3 h-3" />
                              )}
                              <span>Cancelada</span>
                            </button>
                          </div>
                        )}

                        {/* Botón para volver a pendiente si está completada o cancelada */}
                        {(appointment.cita_estado === "Completada" ||
                          appointment.cita_estado === "Cancelada") && (
                          <div className="flex items-center space-x-2 mt-3">
                            <button
                              onClick={() =>
                                handleStatusUpdate(
                                  appointment.cita_id,
                                  "Pendiente"
                                )
                              }
                              disabled={updatingStatus[appointment.cita_id]}
                              className="flex items-center space-x-1 px-3 py-1.5 bg-yellow-100 text-yellow-700 rounded-lg hover:bg-yellow-200 transition-colors text-xs font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {updatingStatus[appointment.cita_id] ? (
                                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-yellow-700"></div>
                              ) : (
                                <ClockIcon className="w-3 h-3" />
                              )}
                              <span>Marcar Pendiente</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : selectedDate ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ClockIcon className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-500">
                  No hay citas programadas para este día
                </p>
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CalendarIcon className="w-8 h-8 text-blue-600" />
                </div>
                <p className="text-gray-500">
                  Haz clic en una fecha para ver las citas
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalendarView;
