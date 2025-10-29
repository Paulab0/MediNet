import { useEffect, useState } from "react";
import appointmentService from "../../../services/appointmentService";
import userService from "../../../services/userService";
import patientService from "../../../services/patientService";
import doctorService from "../../../services/doctorService";

const StatCard = ({ title, value, subtitle }) => (
  <div className="bg-white rounded-lg border border-gray-200 p-4">
    <div className="text-sm text-gray-500">{title}</div>
    <div className="text-2xl font-semibold text-gray-800 mt-1">{value}</div>
    {subtitle && <div className="text-xs text-gray-400 mt-1">{subtitle}</div>}
  </div>
);

const AdminDashboardPage = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ users: 0, doctors: 0, patients: 0, appointments: 0 });

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
          doctors: Array.isArray(doctors) ? doctors.length : doctors?.data?.length || 0,
          patients: Array.isArray(patients) ? patients.length : patients?.data?.length || 0,
          appointments: Array.isArray(appointments) ? appointments.length : appointments?.data?.length || 0,
        });
      } catch {
        // fallback silencioso
      } finally {
        setLoading(false);
      }
    };
    loadStats();
  }, []);

  if (loading) {
    return <div className="text-gray-600">Cargando KPIs...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Usuarios" value={stats.users} />
        <StatCard title="Médicos" value={stats.doctors} />
        <StatCard title="Pacientes" value={stats.patients} />
        <StatCard title="Citas" value={stats.appointments} />
      </div>
    </div>
  );
};

export default AdminDashboardPage;


