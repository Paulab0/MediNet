import { Route, Routes, Navigate } from "react-router-dom";
import Login from "../features/auth/components/LoginForm";
import RegisterPage from "../features/auth/pages/RegisterPage";
import DashboardPage from "../features/doctor/pages/DashboardPage";
import ProtectedRoute from "../components/ProtectedRoute";
import RoleRedirect from "../components/RoleRedirect";

const AppRoutes = () => {
  return (
    <Routes>
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

      {/* Rutas para administrador (placeholder) */}
      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute requiredRole={1}>
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
              <div className="text-center">
                <h1 className="text-3xl font-bold text-gray-900 mb-4">
                  Dashboard Administrador
                </h1>
                <p className="text-gray-600">
                  Panel de administración en desarrollo
                </p>
              </div>
            </div>
          </ProtectedRoute>
        }
      />

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

      <Route path="*" element={<Navigate to="/login" />} />
    </Routes>
  );
};

export default AppRoutes;
