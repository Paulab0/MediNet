import { useEffect, useState } from "react";
import appointmentService from "../../../servicios/servicioCita";
import userService from "../../../servicios/servicioUsuario";
import patientService from "../../../servicios/servicioPaciente";
import doctorService from "../../../servicios/servicioMedico";

const StatCard = ({ title, value, subtitle, icon, gradient }) => {
  const IconComponent = icon;
  return (
    <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 p-6 border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-xl ${gradient}`}>
          <IconComponent className="w-6 h-6 text-white" />
        </div>
        <div className="text-right">
          <div className="text-3xl font-bold text-gray-800">{value}</div>
          <div className="text-sm font-medium text-gray-500 mt-1">{title}</div>
        </div>
      </div>
      {subtitle && (
        <div className="text-xs text-gray-400 mt-2 pt-2 border-t border-gray-100">
          {subtitle}
        </div>
      )}
    </div>
  );
};

const AdminDashboardPage = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    users: 0,
    doctors: 0,
    patients: 0,
    appointments: 0,
  });

  useEffect(() => {
    const loadStats = async () => {
      try {
        const [users, doctors, patients, appointments] = await Promise.all([
          userService.getUsers(),
          doctorService.getDoctors(),
          patientService.getPatients(),
          appointmentService.getAppointments(),
        ]);

        setStats({
          users: Array.isArray(users) ? users.length : users?.data?.length || 0,
          doctors:
            Array.isArray(doctors) ? doctors.length : doctors?.data?.length || 0,
          patients:
            Array.isArray(patients)
              ? patients.length
              : patients?.data?.length || 0,
          appointments:
            Array.isArray(appointments)
              ? appointments.length
              : appointments?.data?.length || 0,
        });
      } catch {
        // Error silencioso - los KPIs se mantienen en 0
      } finally {
        setLoading(false);
      }
    };
    loadStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Cargando estadísticas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-2xl shadow-xl p-8 text-white">
        <h2 className="text-3xl font-bold mb-2">Bienvenido al Panel de Control</h2>
        <p className="text-blue-100 text-lg">
          Aquí puedes gestionar todos los aspectos de MediNet
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Usuarios"
          value={stats.users}
          subtitle="Total registrados"
          gradient="bg-gradient-to-br from-blue-500 to-blue-600"
          icon={({ className }) => (
            <svg
              className={className}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
              />
            </svg>
          )}
        />
        <StatCard
          title="Médicos"
          value={stats.doctors}
          subtitle="Profesionales activos"
          gradient="bg-gradient-to-br from-green-500 to-green-600"
          icon={({ className }) => (
            <svg
              className={className}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
          )}
        />
        <StatCard
          title="Pacientes"
          value={stats.patients}
          subtitle="En el sistema"
          gradient="bg-gradient-to-br from-purple-500 to-purple-600"
          icon={({ className }) => (
            <svg
              className={className}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
          )}
        />
        <StatCard
          title="Citas"
          value={stats.appointments}
          subtitle="Programadas"
          gradient="bg-gradient-to-br from-orange-500 to-orange-600"
          icon={({ className }) => (
            <svg
              className={className}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          )}
        />
      </div>
    </div>
  );
};

export default AdminDashboardPage;


