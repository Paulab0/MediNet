import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  HomeIcon,
  ClockIcon,
  CalendarIcon,
  EnvelopeIcon,
  BellIcon,
  UserIcon,
  PlusIcon,
  ChevronDownIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  UserGroupIcon,
  ClipboardDocumentListIcon,
  ArrowRightOnRectangleIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  Bars3Icon,
} from "@heroicons/react/24/outline";
import AppointmentForm from "./AppointmentForm";
import AddPatientForm from "./AddPatientForm";
import CalendarView from "./CalendarView";
import NotificationsView from "./NotificationsView";
import EditProfileForm from "./EditProfileForm";
import PatientsView from "./PatientsView";
import appointmentService from "../../../services/appointmentService";
import { useAuth } from "../../../contexts/AuthContext";

const DoctorDashboard = () => {
  const [selectedPeriod, setSelectedPeriod] = useState("Esta semana");
  const [currentMonth, setCurrentMonth] = useState("Ago");
  const [isAppointmentFormOpen, setIsAppointmentFormOpen] = useState(false);
  const [isAddPatientFormOpen, setIsAddPatientFormOpen] = useState(false);
  const [isEditProfileFormOpen, setIsEditProfileFormOpen] = useState(false);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentView, setCurrentView] = useState("dashboard");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [hasAnimated, setHasAnimated] = useState(false);
  const [stats, setStats] = useState({
    totalPatients: 0,
    totalAppointments: 0,
    completedAppointments: 0,
    pendingAppointments: 0,
  });

  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // Estadísticas del dashboard
  const weeklyStats = [
    {
      title: "Total Pacientes",
      value: stats.totalPatients.toString(),
      icon: UserGroupIcon,
      color: "bg-blue-500",
      bgColor: "bg-blue-100",
    },
    {
      title: "Total Citas",
      value: stats.totalAppointments.toString(),
      icon: CalendarIcon,
      color: "bg-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      title: "Citas Completadas",
      value: stats.completedAppointments.toString(),
      icon: CheckCircleIcon,
      color: "bg-green-500",
      bgColor: "bg-green-100",
    },
    {
      title: "Citas Pendientes",
      value: stats.pendingAppointments.toString(),
      icon: ClockIcon,
      color: "bg-orange-500",
      bgColor: "bg-orange-100",
    },
  ];

  // Función para cargar datos del dashboard
  const loadDashboardData = async () => {
    try {
      setLoading(true);

      // Si hay medico_id, obtener citas específicas del médico
      if (user?.medico_id) {
        const doctorStats = await appointmentService.getDoctorGeneralStats(
          user.medico_id
        );
        setStats({
          totalPatients: doctorStats.total_pacientes || 0,
          totalAppointments: doctorStats.total_citas || 0,
          completedAppointments: doctorStats.citas_completadas || 0,
          pendingAppointments: doctorStats.citas_pendientes || 0,
        });

        // Cargar citas del médico para el período seleccionado
        await loadDoctorAppointments(selectedPeriod);
      } else {
        // Si no hay medico_id, cargar todas las citas
        const appointmentsData = await appointmentService.getAppointments();
        setAppointments(appointmentsData);

        // Calcular estadísticas básicas de las citas cargadas
        const total = appointmentsData.length;
        const completed = appointmentsData.filter(
          (apt) => apt.cita_estado === "Completada"
        ).length;
        const pending = appointmentsData.filter(
          (apt) => apt.cita_estado === "Pendiente"
        ).length;

        setStats({
          totalPatients:
            appointmentsData.length > 0
              ? new Set(appointmentsData.map((apt) => apt.paciente_id)).size
              : 0,
          totalAppointments: total,
          completedAppointments: completed,
          pendingAppointments: pending,
        });
      }
    } catch (error) {
      console.error(
        "❌ [Dashboard] Error cargando datos del dashboard:",
        error
      );

      // En caso de error, mostrar datos de ejemplo
      setStats({
        totalPatients: 1,
        totalAppointments: 2,
        completedAppointments: 1,
        pendingAppointments: 1,
      });
    } finally {
      setLoading(false);
    }
  };

  // Función para cargar citas del médico filtradas por período
  const loadDoctorAppointments = async (periodo = selectedPeriod) => {
    try {
      console.log("🔍 Cargando citas del médico para período:", periodo);

      if (!user?.medico_id) {
        console.warn("No se encontró ID del médico");
        return;
      }

      // Obtener citas del médico con filtro de período
      const appointmentsData = await appointmentService.getDoctorAppointments(
        user.medico_id,
        periodo
      );

      console.log("📊 Citas del médico recibidas:", appointmentsData);
      setAppointments(appointmentsData);
    } catch (error) {
      console.error("❌ Error cargando citas del médico:", error);
      setAppointments([]);
    }
  };

  // Función para cargar estadísticas semanales
  const loadWeeklyStats = async (periodo = selectedPeriod) => {
    try {
      console.log("🔍 Cargando estadísticas semanales...");
      console.log("👤 Usuario:", user);
      console.log("📅 Período:", periodo);

      if (!user?.medico_id) {
        console.warn(
          "No se encontró ID del médico, usando estadísticas generales"
        );
        // Si no hay medico_id, usar estadísticas generales (sin filtro)
        const generalStats = await appointmentService.getAppointmentStats();
        console.log("📊 Estadísticas generales:", generalStats);
        setStats({
          totalPatients: generalStats.total_pacientes || 0,
          totalAppointments: generalStats.total_citas || 0,
          completedAppointments: generalStats.citas_completadas || 0,
          pendingAppointments: generalStats.citas_pendientes || 0,
        });
        return;
      }

      // Usar estadísticas específicas del médico para el período seleccionado
      console.log("🏥 Obteniendo estadísticas del médico ID:", user.medico_id);
      const weeklyStatsData = await appointmentService.getDoctorWeeklyStats(
        user.medico_id,
        periodo
      );
      console.log("📊 Estadísticas semanales recibidas:", weeklyStatsData);

      setStats({
        totalPatients: weeklyStatsData.total_pacientes || 0,
        totalAppointments: weeklyStatsData.total_citas || 0,
        completedAppointments: weeklyStatsData.citas_completadas || 0,
        pendingAppointments: weeklyStatsData.citas_pendientes || 0,
      });
    } catch (error) {
      console.error("❌ Error cargando estadísticas semanales:", error);

      // En caso de error, mostrar datos de ejemplo
      setStats({
        totalPatients: 1,
        totalAppointments: 2,
        completedAppointments: 1,
        pendingAppointments: 1,
      });
    }
  };

  // Cargar datos reales del dashboard
  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user]);

  // Efecto para la animación inicial del logo
  useEffect(() => {
    const timer = setTimeout(() => {
      setHasAnimated(true);
    }, 1000); // Animación después de 1 segundo

    return () => clearTimeout(timer);
  }, []);

  // Cargar estadísticas semanales cuando cambie el período o el usuario
  useEffect(() => {
    if (user) {
      loadWeeklyStats(selectedPeriod);
    }
  }, [selectedPeriod, user]);

  // Función para actualizar reportes (se puede llamar desde otros componentes)
  const refreshReports = () => {
    if (user?.medico_id) {
      loadDashboardData();
      loadWeeklyStats(selectedPeriod);
    }
  };

  // Función para actualizar citas cuando cambie el período
  const handlePeriodChange = (newPeriod) => {
    setSelectedPeriod(newPeriod);
    if (user?.medico_id) {
      loadDoctorAppointments(newPeriod);
    }
  };

  const upcomingAppointments = appointments.slice(0, 4).map((apt) => ({
    name: `${apt.paciente_nombre || "Paciente"} ${apt.paciente_apellido || ""}`,
    type: "Consulta",
    time: apt.cita_hora?.substring(0, 5) || "00:00",
    isHighlighted: apt.cita_estado === "Pendiente",
  }));

  const getStatusIcon = (status) => {
    if (status === "completed") {
      return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
    }
    return <ExclamationCircleIcon className="h-5 w-5 text-orange-500" />;
  };

  const getStatusColor = (status) => {
    if (status === "completed") {
      return "bg-green-100 text-green-800";
    }
    return "bg-orange-100 text-orange-800";
  };

  const handleCreateAppointment = async (appointmentData) => {
    try {
      console.log("Datos del usuario:", user);
      console.log("Datos de la cita recibidos:", appointmentData);

      // Validar que tenemos los datos necesarios
      if (!user?.medico_id) {
        throw new Error(
          "No se pudo obtener el ID del médico. Por favor, inicia sesión nuevamente."
        );
      }

      if (!appointmentData.paciente_id) {
        throw new Error("Debe seleccionar un paciente");
      }

      if (!appointmentData.cita_fecha) {
        throw new Error("Debe seleccionar una fecha");
      }

      if (!appointmentData.cita_hora) {
        throw new Error("Debe seleccionar una hora");
      }

      if (!appointmentData.cita_tipo) {
        throw new Error("Debe seleccionar un tipo de cita");
      }

      const citaData = {
        medico_id: user.medico_id,
        paciente_id: appointmentData.paciente_id,
        cita_fecha: appointmentData.cita_fecha,
        cita_hora: appointmentData.cita_hora,
        cita_tipo: appointmentData.cita_tipo,
        cita_observaciones: appointmentData.cita_observaciones || null,
        cita_estado: 1, // Pendiente
      };

      console.log("Datos finales de la cita:", citaData);

      await appointmentService.createAppointment(citaData);

      // Recargar las citas y reportes
      refreshReports();
    } catch (error) {
      console.error("Error creando cita:", error);
      throw error;
    }
  };

  const handlePatientAdded = (newPatient) => {
    console.log("Nuevo paciente agregado:", newPatient);
    // Actualizar los reportes cuando se agrega un nuevo paciente
    refreshReports();
  };

  const handleAddPatientClick = () => {
    setIsAddPatientFormOpen(true);
  };

  // Opciones de navegación del sidebar
  const navigationOptions = [
    {
      id: "dashboard",
      name: "Panel Principal",
      icon: HomeIcon,
      description: "Resumen y estadísticas",
    },
    {
      id: "calendar",
      name: "Agenda Médica",
      icon: CalendarIcon,
      description: "Calendario de citas",
    },
    {
      id: "patients",
      name: "Pacientes",
      icon: UserGroupIcon,
      description: "Registro de pacientes",
    },
    {
      id: "notifications",
      name: "Notificaciones",
      icon: BellIcon,
      description: "Alertas y recordatorios",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Contenido Principal */}
      <div
        className={`flex-1 flex flex-col transition-all duration-300 ${
          isSidebarOpen ? "mr-80" : "mr-0"
        }`}
      >
        {/* Header */}
        <header className="bg-gradient-to-r from-blue-50 to-blue-100 shadow-sm px-8 py-4 border-b border-blue-200">
          <div className="flex items-center justify-between">
            {/* Sección Izquierda - Perfil del Usuario */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setIsEditProfileFormOpen(true)}
                  className="w-12 h-12 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white hover:shadow-md transition-all duration-200 border border-blue-200"
                  title="Editar Perfil"
                >
                  <UserIcon className="w-6 h-6 text-blue-600" />
                </button>
                <div>
                  <p className="text-lg font-semibold text-gray-900">
                    Dr. {user?.usuario_nombre || "Médico"}{" "}
                    {user?.usuario_apellido || ""}
                  </p>
                  <p className="text-sm text-gray-600">
                    {user?.especialidad_nombre || "Médico General"}
                  </p>
                </div>
              </div>
            </div>

            {/* Sección Central - Logo MEDINET clickeable */}
            <div className="flex-1 flex justify-center">
              <button
                onClick={() => setCurrentView("dashboard")}
                className="relative group cursor-pointer"
                title="Ir al Dashboard"
              >
                <h1
                  className={`text-4xl font-black bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 bg-clip-text text-transparent group-hover:animate-bounce transition-all duration-300 ${
                    hasAnimated ? "animate-none" : "animate-pulse"
                  }`}
                >
                  MEDINET
                </h1>
                <div className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 rounded-full transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 ease-out"></div>
                <p className="text-xs text-gray-600 text-center mt-2 font-medium tracking-widest opacity-80 group-hover:opacity-100 transition-opacity duration-300">
                  SISTEMA MÉDICO
                </p>
                {/* Efecto de brillo sutil */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-20 transition-opacity duration-500 rounded-lg"></div>
              </button>
            </div>

            {/* Sección Derecha - Controles */}
            <div className="flex items-center space-x-3">
              {/* Notificaciones */}
              <button
                onClick={() => setCurrentView("notifications")}
                className="w-10 h-10 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center text-gray-600 hover:bg-white hover:shadow-md transition-all duration-200 border border-blue-200"
                title="Notificaciones"
              >
                <BellIcon className="w-5 h-5" />
              </button>

              {/* Botón de toggle del sidebar */}
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="p-2 rounded-lg bg-white/80 backdrop-blur-sm hover:bg-white transition-all duration-200 hover:shadow-md border border-blue-200"
                title={isSidebarOpen ? "Ocultar menú" : "Mostrar menú"}
              >
                <Bars3Icon className="w-5 h-5 text-gray-600" />
              </button>

              {/* Logout */}
              <button
                onClick={handleLogout}
                className="w-10 h-10 bg-red-100/80 backdrop-blur-sm rounded-full flex items-center justify-center text-red-600 hover:bg-red-100 hover:shadow-md transition-all duration-200 border border-red-200"
                title="Cerrar Sesión"
              >
                <ArrowRightOnRectangleIcon className="w-5 h-5" />
              </button>
            </div>
          </div>
        </header>

        {/* Contenido del Dashboard */}
        <main className="flex-1">
          {currentView === "dashboard" && (
            <div className="p-8 space-y-8">
              {/* Header Médico con Estado del Día */}
              <div className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-emerald-50 rounded-2xl p-8 shadow-lg border border-blue-100">
                <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-200/20 to-emerald-200/20 rounded-full -translate-y-32 translate-x-32"></div>
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-emerald-200/20 to-blue-200/20 rounded-full translate-y-24 -translate-x-24"></div>

                <div className="relative z-10 flex items-center justify-between">
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse"></div>
                      <span className="text-sm font-medium text-emerald-700">
                        Sistema Activo
                      </span>
                    </div>
                    <h1 className="text-4xl font-bold text-gray-900">
                      Bienvenido, Dr. {user?.usuario_nombre || "Médico"}
                    </h1>
                    <p className="text-lg text-gray-600">
                      {new Date().toLocaleDateString("es-ES", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                    <div className="flex items-center space-x-6 text-sm text-gray-500">
                      <span className="flex items-center space-x-2">
                        <ClockIcon className="w-4 h-4" />
                        <span>Horario: 8:00 AM - 6:00 PM</span>
                      </span>
                      <span className="flex items-center space-x-2">
                        <UserIcon className="w-4 h-4" />
                        <span>Consultorio 1</span>
                      </span>
                    </div>
                  </div>

                  <div className="text-right space-y-2">
                    <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-emerald-500 rounded-2xl flex items-center justify-center shadow-lg">
                      <svg
                        className="w-10 h-10 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                    <p className="text-xs font-medium text-gray-500">
                      Estado del Sistema
                    </p>
                    <p className="text-sm font-semibold text-emerald-600">
                      Operativo
                    </p>
                  </div>
                </div>
              </div>

              {/* Acciones Rápidas */}
              <div className="bg-white rounded-3xl p-6 shadow-sm">
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  Acciones Rápidas
                </h2>
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => setIsAppointmentFormOpen(true)}
                    className="flex items-center space-x-3 px-6 py-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all duration-200 hover:shadow-lg hover:scale-105"
                  >
                    <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                      <PlusIcon className="w-5 h-5" />
                    </div>
                    <div className="text-left">
                      <p className="font-semibold">Agendar Cita</p>
                      <p className="text-sm text-blue-100">
                        Programar nueva consulta
                      </p>
                    </div>
                  </button>

                  <button
                    onClick={() => setIsAddPatientFormOpen(true)}
                    className="flex items-center space-x-3 px-6 py-4 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-all duration-200 hover:shadow-lg hover:scale-105"
                  >
                    <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                      <UserGroupIcon className="w-5 h-5" />
                    </div>
                    <div className="text-left">
                      <p className="font-semibold">Agregar Paciente</p>
                      <p className="text-sm text-green-100">
                        Registrar nuevo paciente
                      </p>
                    </div>
                  </button>
                </div>
              </div>

              {/* Citas del Día Actual */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="bg-gradient-to-r from-blue-50 to-emerald-50 px-6 py-4 border-b border-gray-100">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                        <CalendarIcon className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-gray-900">
                          Citas de Hoy
                        </h2>
                        <p className="text-sm text-gray-600">
                          {new Date().toLocaleDateString("es-ES", {
                            weekday: "long",
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                      <span className="text-sm text-gray-500">En vivo</span>
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  {loading ? (
                    <div className="flex items-center justify-center py-12">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                      <p className="ml-3 text-gray-600">
                        Cargando citas del día...
                      </p>
                    </div>
                  ) : (
                    (() => {
                      const today = new Date();
                      const todayAppointments = appointments.filter(
                        (appointment) => {
                          const appointmentDate = new Date(
                            appointment.cita_fecha
                          );
                          return (
                            appointmentDate.toDateString() ===
                            today.toDateString()
                          );
                        }
                      );

                      return todayAppointments.length === 0 ? (
                        <div className="text-center py-12">
                          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <CalendarIcon className="w-10 h-10 text-gray-400" />
                          </div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            No hay citas programadas para hoy
                          </h3>
                          <p className="text-gray-500 mb-6">
                            Tu agenda está libre para el día de hoy
                          </p>
                          <button
                            onClick={() => setIsAppointmentFormOpen(true)}
                            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors shadow-sm"
                          >
                            <PlusIcon className="w-5 h-5 mr-2" />
                            Programar Cita para Hoy
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {todayAppointments.map((appointment, index) => (
                            <div
                              key={appointment.cita_id}
                              className="group relative bg-gradient-to-r from-gray-50 to-white rounded-xl p-6 border border-gray-100 hover:border-blue-200 hover:shadow-md transition-all duration-300"
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-4">
                                  <div className="relative">
                                    <div className="w-14 h-14 bg-gradient-to-br from-blue-100 to-emerald-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                      <UserIcon className="w-7 h-7 text-blue-600" />
                                    </div>
                                    {appointment.cita_estado ===
                                      "Pendiente" && (
                                      <div className="absolute -top-1 -right-1 w-4 h-4 bg-orange-500 rounded-full border-2 border-white animate-pulse"></div>
                                    )}
                                  </div>

                                  <div className="space-y-1">
                                    <h3 className="text-lg font-semibold text-gray-900">
                                      {appointment.paciente_nombre ||
                                        "Paciente"}{" "}
                                      {appointment.paciente_apellido || ""}
                                    </h3>
                                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                                      <span className="flex items-center space-x-1">
                                        <ClockIcon className="w-4 h-4" />
                                        <span>
                                          {appointment.cita_hora?.substring(
                                            0,
                                            5
                                          ) || "00:00"}
                                        </span>
                                      </span>
                                      <span className="flex items-center space-x-1">
                                        <CalendarIcon className="w-4 h-4" />
                                        <span>
                                          {appointment.cita_tipo ||
                                            "Consulta general"}
                                        </span>
                                      </span>
                                    </div>
                                  </div>
                                </div>

                                <div className="flex items-center space-x-4">
                                  <div className="text-right">
                                    <div
                                      className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                                        appointment.cita_estado === "Completada"
                                          ? "bg-emerald-100 text-emerald-700"
                                          : appointment.cita_estado ===
                                            "Pendiente"
                                          ? "bg-orange-100 text-orange-700"
                                          : "bg-red-100 text-red-700"
                                      }`}
                                    >
                                      <div
                                        className={`w-2 h-2 rounded-full mr-2 ${
                                          appointment.cita_estado ===
                                          "Completada"
                                            ? "bg-emerald-500"
                                            : appointment.cita_estado ===
                                              "Pendiente"
                                            ? "bg-orange-500"
                                            : "bg-red-500"
                                        }`}
                                      ></div>
                                      {appointment.cita_estado}
                                    </div>
                                  </div>

                                  <button
                                    onClick={() => setCurrentView("calendar")}
                                    className="p-2 text-gray-400 hover:text-blue-600 transition-colors group-hover:bg-blue-50 rounded-lg"
                                    title="Ver en calendario"
                                  >
                                    <svg
                                      className="w-5 h-5"
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
                            </div>
                          ))}
                        </div>
                      );
                    })()
                  )}
                </div>
              </div>

              {/* Calendario Compacto y Métricas */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Calendario Compacto */}
                <div className="lg:col-span-2">
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="bg-gradient-to-r from-blue-50 to-emerald-50 px-6 py-4 border-b border-gray-100">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                            <CalendarIcon className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <h2 className="text-xl font-bold text-gray-900">
                              Calendario de Citas
                            </h2>
                            <p className="text-sm text-gray-600">
                              Vista rápida del mes actual
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => setCurrentView("calendar")}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                        >
                          Ver Calendario Completo
                        </button>
                      </div>
                    </div>

                    <div className="p-6">
                      {(() => {
                        const today = new Date();
                        const currentMonth = today.getMonth();
                        const currentYear = today.getFullYear();
                        const firstDay = new Date(currentYear, currentMonth, 1);
                        const lastDay = new Date(
                          currentYear,
                          currentMonth + 1,
                          0
                        );
                        const daysInMonth = lastDay.getDate();
                        const startingDayOfWeek = firstDay.getDay();

                        const days = [];

                        // Días del mes anterior
                        for (let i = startingDayOfWeek - 1; i >= 0; i--) {
                          const prevDate = new Date(
                            currentYear,
                            currentMonth,
                            -i
                          );
                          days.push({
                            date: prevDate,
                            isCurrentMonth: false,
                            isToday: false,
                            appointments: [],
                          });
                        }

                        // Días del mes actual
                        for (let day = 1; day <= daysInMonth; day++) {
                          const date = new Date(currentYear, currentMonth, day);
                          const isToday =
                            date.toDateString() === today.toDateString();

                          // Filtrar citas para este día
                          const dayAppointments = appointments.filter(
                            (appointment) => {
                              const appointmentDate = new Date(
                                appointment.cita_fecha
                              );
                              return (
                                appointmentDate.toDateString() ===
                                date.toDateString()
                              );
                            }
                          );

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
                          const nextDate = new Date(
                            currentYear,
                            currentMonth + 1,
                            day
                          );
                          days.push({
                            date: nextDate,
                            isCurrentMonth: false,
                            isToday: false,
                            appointments: [],
                          });
                        }

                        const daysOfWeek = [
                          "Dom",
                          "Lun",
                          "Mar",
                          "Mié",
                          "Jue",
                          "Vie",
                          "Sáb",
                        ];
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

                        return (
                          <div>
                            <div className="text-center mb-4">
                              <h3 className="text-lg font-semibold text-gray-900">
                                {months[currentMonth]} {currentYear}
                              </h3>
                            </div>

                            {/* Días de la semana */}
                            <div className="grid grid-cols-7 gap-1 mb-2">
                              {daysOfWeek.map((day) => (
                                <div
                                  key={day}
                                  className="p-2 text-center text-xs font-medium text-gray-500"
                                >
                                  {day}
                                </div>
                              ))}
                            </div>

                            {/* Días del mes */}
                            <div className="grid grid-cols-7 gap-1">
                              {days.map((day, index) => (
                                <div
                                  key={index}
                                  className={`min-h-[60px] p-2 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors ${
                                    !day.isCurrentMonth
                                      ? "bg-gray-50 text-gray-400"
                                      : ""
                                  } ${
                                    day.isToday
                                      ? "bg-blue-100 border-blue-300"
                                      : ""
                                  }`}
                                  onClick={() => setCurrentView("calendar")}
                                >
                                  <div className="flex flex-col h-full">
                                    <div
                                      className={`text-sm font-medium mb-1 ${
                                        day.isToday
                                          ? "text-blue-600"
                                          : "text-gray-900"
                                      }`}
                                    >
                                      {day.date.getDate()}
                                    </div>
                                    <div className="flex-1 space-y-1">
                                      {day.appointments
                                        .slice(0, 2)
                                        .map((appointment, idx) => (
                                          <div
                                            key={idx}
                                            className={`text-xs p-1 rounded truncate ${
                                              appointment.cita_estado ===
                                              "Completada"
                                                ? "bg-green-100 text-green-800"
                                                : appointment.cita_estado ===
                                                  "Pendiente"
                                                ? "bg-orange-100 text-orange-800"
                                                : "bg-red-100 text-red-800"
                                            }`}
                                          >
                                            {appointment.cita_hora?.substring(
                                              0,
                                              5
                                            ) || "00:00"}
                                          </div>
                                        ))}
                                      {day.appointments.length > 2 && (
                                        <div className="text-xs text-gray-500">
                                          +{day.appointments.length - 2}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                </div>

                {/* Métricas Resumidas */}
                <div className="space-y-4">
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Resumen del Período
                    </h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">
                          Total Pacientes
                        </span>
                        <span className="text-2xl font-bold text-blue-600">
                          {stats.totalPatients}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">
                          Citas Programadas
                        </span>
                        <span className="text-2xl font-bold text-emerald-600">
                          {stats.totalAppointments}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">
                          Completadas
                        </span>
                        <span className="text-2xl font-bold text-green-600">
                          {stats.completedAppointments}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">
                          Pendientes
                        </span>
                        <span className="text-2xl font-bold text-orange-600">
                          {stats.pendingAppointments}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Filtros
                    </h3>
                    <div className="space-y-3">
                      <select
                        value={selectedPeriod}
                        onChange={(e) => handlePeriodChange(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-sm"
                      >
                        <option value="Esta semana">Esta semana</option>
                        <option value="Semana pasada">Semana pasada</option>
                        <option value="Este mes">Este mes</option>
                      </select>
                      <div className="flex items-center space-x-2 bg-emerald-50 px-3 py-2 rounded-lg border border-emerald-200">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                        <span className="text-sm text-emerald-700 font-medium">
                          Sistema Activo
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {currentView === "calendar" && <CalendarView />}

          {currentView === "patients" && <PatientsView />}

          {currentView === "notifications" && <NotificationsView />}
        </main>
      </div>

      {/* Formulario de Citas */}
      <AppointmentForm
        isOpen={isAppointmentFormOpen}
        onClose={() => setIsAppointmentFormOpen(false)}
        onSubmit={handleCreateAppointment}
        onAddPatient={handleAddPatientClick}
      />

      {/* Formulario de Agregar Paciente */}
      <AddPatientForm
        isOpen={isAddPatientFormOpen}
        onClose={() => setIsAddPatientFormOpen(false)}
        onPatientAdded={handlePatientAdded}
      />

      {/* Formulario de Editar Perfil */}
      <EditProfileForm
        isOpen={isEditProfileFormOpen}
        onClose={() => setIsEditProfileFormOpen(false)}
      />

      {/* Sidebar Deslizable Derecho */}
      <div
        className={`fixed top-0 right-0 h-full w-80 bg-gradient-to-b from-blue-50 to-blue-100 shadow-2xl transform transition-transform duration-300 ease-in-out z-40 border-l border-blue-200 ${
          isSidebarOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header del Sidebar */}
        <div className="p-6 border-b border-blue-200 bg-white/50 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center shadow-sm">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                  />
                </svg>
              </div>
              <div>
                <h2 className="text-lg font-bold text-blue-900">MEDINET</h2>
                <p className="text-xs text-blue-600 font-medium">
                  Sistema Médico
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="p-2 rounded-lg hover:bg-blue-100 transition-colors"
            >
              <ChevronRightIcon className="w-5 h-5 text-blue-600" />
            </button>
          </div>
        </div>

        {/* Navegación del Sidebar */}
        <nav className="p-4 space-y-2">
          {navigationOptions.map((option) => (
            <button
              key={option.id}
              onClick={() => {
                setCurrentView(option.id);
                setIsSidebarOpen(false);
              }}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-all duration-200 ${
                currentView === option.id
                  ? "bg-blue-200 text-blue-800 border-l-4 border-blue-600 shadow-sm"
                  : "text-blue-700 hover:bg-blue-100 hover:text-blue-900"
              }`}
            >
              <option.icon
                className={`w-5 h-5 flex-shrink-0 ${
                  currentView === option.id ? "text-blue-700" : "text-blue-600"
                }`}
              />
              <div className="flex-1 min-w-0">
                <p className="font-medium">{option.name}</p>
                <p
                  className={`text-xs truncate ${
                    currentView === option.id
                      ? "text-blue-600"
                      : "text-blue-500"
                  }`}
                >
                  {option.description}
                </p>
              </div>
            </button>
          ))}
        </nav>

        {/* Perfil del Doctor en el Sidebar */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-blue-200 bg-white/50 backdrop-blur-sm">
          <div className="flex items-center space-x-3 p-3 bg-white/80 rounded-lg shadow-sm border border-blue-100">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-sm">
              <UserIcon className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-blue-900 truncate">
                Dr. {user?.usuario_nombre || "Médico"}{" "}
                {user?.usuario_apellido || ""}
              </p>
              <p className="text-xs text-blue-600 font-medium">
                {user?.especialidad_nombre || "Médico General"}
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 text-blue-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all duration-200"
              title="Cerrar Sesión"
            >
              <ArrowRightOnRectangleIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Overlay para cerrar sidebar en móvil */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-25 z-30 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default DoctorDashboard;
