import { Route, Routes, Navigate } from "react-router-dom";
import HomePage from "../features/inicio/componentes/HomePage";
import Login from "../features/autenticacion/componentes/LoginForm";
import RegisterPage from "../features/autenticacion/paginas/RegisterPage";
import ForgotPasswordPage from "../features/autenticacion/componentes/ForgotPasswordPage";
import ResetPasswordPage from "../features/autenticacion/componentes/ResetPasswordPage";
import ConfirmLoginPage from "../features/autenticacion/componentes/ConfirmLoginPage";
import DashboardPage from "../features/doctor/paginas/DashboardPage";
import ProtectedRoute from "../componentes/ProtectedRoute";
import RoleRedirect from "../componentes/RoleRedirect";
import AdminLayout from "../features/administrador/componentes/AdminLayout";
import AdminDashboardPage from "../features/administrador/paginas/AdminDashboardPage";
import UsersPage from "../features/administrador/paginas/UsersPage";
import DoctorsPage from "../features/administrador/paginas/DoctorsPage";
import PatientsPage from "../features/administrador/paginas/PatientsPage";
import AppointmentsPage from "../features/administrador/paginas/AppointmentsPage";
import AppointmentsReportPage from "../features/administrador/paginas/AppointmentsReportPage";
import PatientsReportPage from "../features/administrador/paginas/PatientsReportPage";
import StatisticsPage from "../features/administrador/paginas/StatisticsPage";
import ProfilePage from "../features/usuario/paginas/ProfilePage";
import SearchDoctorsPage from "../features/paciente/paginas/SearchDoctorsPage";
import MyAppointmentsPage from "../features/paciente/paginas/MyAppointmentsPage";
import MyMedicalHistoryPage from "../features/paciente/paginas/MyMedicalHistoryPage";
import SettingsPage from "../features/administrador/paginas/SettingsPage";

const AppRoutes = () => {
  return (
    <Routes>
      {/* Ruta principal - Home */}
      <Route path="/" element={<HomePage />} />

      {/* Rutas públicas */}
      <Route path="/iniciar-sesion" element={<Login />} />
      <Route path="/confirmar-login" element={<ConfirmLoginPage />} />
      <Route path="/registro" element={<RegisterPage />} />
      <Route path="/recuperar-contrasena" element={<ForgotPasswordPage />} />
      <Route path="/recuperar-contrasena/reset" element={<ResetPasswordPage />} />

      {/* Ruta de redirección por rol */}
      <Route path="/panel" element={<RoleRedirect />} />

      {/* Rutas protegidas por rol */}
      <Route
        path="/medico/panel"
        element={
          <ProtectedRoute requiredRole={2}>
            <DashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/medico/perfil"
        element={
          <ProtectedRoute requiredRole={2}>
            <ProfilePage />
          </ProtectedRoute>
        }
      />

      {/* Rutas para administrador */}
      <Route
        path="/administrador"
        element={
          <ProtectedRoute requiredRole={1}>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route path="panel" element={<AdminDashboardPage />} />
        <Route path="usuarios" element={<UsersPage />} />
        <Route path="medicos" element={<DoctorsPage />} />
        <Route path="pacientes" element={<PatientsPage />} />
        <Route path="citas" element={<AppointmentsPage />} />
        <Route path="reportes/citas" element={<AppointmentsReportPage />} />
        <Route path="reportes/pacientes" element={<PatientsReportPage />} />
        <Route path="estadisticas" element={<StatisticsPage />} />
        <Route path="perfil" element={<ProfilePage />} />
        <Route path="configuracion" element={<SettingsPage />} />
      </Route>

      {/* Ruta de perfil para todos los usuarios autenticados */}
      <Route
        path="/perfil"
        element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        }
      />

      {/* Rutas para paciente (placeholder) */}
      <Route
        path="/paciente/panel"
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
      <Route
        path="/paciente/perfil"
        element={
          <ProtectedRoute requiredRole={3}>
            <ProfilePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/paciente/buscar-medicos"
        element={
          <ProtectedRoute requiredRole={3}>
            <SearchDoctorsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/paciente/mis-citas"
        element={
          <ProtectedRoute requiredRole={3}>
            <MyAppointmentsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/paciente/mi-historial"
        element={
          <ProtectedRoute requiredRole={3}>
            <MyMedicalHistoryPage />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

export default AppRoutes;
