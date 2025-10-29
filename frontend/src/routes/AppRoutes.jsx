import { Route, Routes, Navigate } from "react-router-dom";
import HomePage from "../features/home/components/HomePage";
import Login from "../features/auth/components/LoginForm";
import RegisterPage from "../features/auth/pages/RegisterPage";
import DashboardPage from "../features/doctor/pages/DashboardPage";
import ProtectedRoute from "../components/ProtectedRoute";
import RoleRedirect from "../components/RoleRedirect";
import AdminLayout from "../features/admin/components/AdminLayout";
import AdminDashboardPage from "../features/admin/pages/AdminDashboardPage";
import UsersPage from "../features/admin/pages/UsersPage";
import DoctorsPage from "../features/admin/pages/DoctorsPage";
import PatientsPage from "../features/admin/pages/PatientsPage";
import AppointmentsPage from "../features/admin/pages/AppointmentsPage";

const AppRoutes = () => {
  return (
    <Routes>
      {/* Ruta principal - Home */}
      <Route path="/" element={<HomePage />} />

      {/* Rutas públicas */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Ruta de redirección por rol */}
      <Route path="/dashboard" element={<RoleRedirect />} />

      {/* Rutas protegidas por rol */}
      <Route
        path="/doctor/dashboard"
        element={
          <ProtectedRoute requiredRole={2}>
            <DashboardPage />
          </ProtectedRoute>
        }
      />

      {/* Rutas para administrador */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute requiredRole={1}>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route path="dashboard" element={<AdminDashboardPage />} />
        <Route path="users" element={<UsersPage />} />
        <Route path="doctors" element={<DoctorsPage />} />
        <Route path="patients" element={<PatientsPage />} />
        <Route path="appointments" element={<AppointmentsPage />} />
      </Route>

      {/* Rutas para paciente (placeholder) */}
      <Route
        path="/patient/dashboard"
        element={
          <ProtectedRoute requiredRole={3}>
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
              <div className="text-center">
                <h1 className="text-3xl font-bold text-gray-900 mb-4">
                  Dashboard Paciente
                </h1>
                <p className="text-gray-600">Panel de paciente en desarrollo</p>
              </div>
            </div>
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

export default AppRoutes;
